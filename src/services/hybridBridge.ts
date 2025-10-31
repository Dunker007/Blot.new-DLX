import { LLMMessage, LLMResponse } from './llm';

export interface LocalProviderConfig {
  name: string;
  endpoint: string;
  status: 'checking' | 'connected' | 'disconnected' | 'error';
  lastCheck?: Date;
  latency?: number;
  consecutiveFailures?: number;
  lastSuccessful?: Date;
  availableModels?: string[];
}

export interface HybridModeConfig {
  enabled: boolean;
  preferLocal: boolean;
  localProviders: LocalProviderConfig[];
  fallbackToCloud: boolean;
  maxLatency: number;
  maxRetries: number;
  retryDelay: number;
  connectionPoolSize: number;
}

export class HybridBridgeService {
  private config: HybridModeConfig = {
    enabled: false,
    preferLocal: true,
    localProviders: [],
    fallbackToCloud: true,
    maxLatency: 5000,
    maxRetries: 3,
    retryDelay: 1000,
    connectionPoolSize: 5,
  };

  private healthCheckInterval?: number;
  private requestQueue: Array<{
    resolve: (value: LLMResponse | null) => void;
    reject: (error: Error) => void;
    messages: LLMMessage[];
    model: string;
    onStream?: (chunk: string) => void;
  }> = [];
  private activeRequests = 0;

  async initialize(localEndpoints: string[] = []): Promise<void> {
    const defaultEndpoints = [
      'http://localhost:1234',
      'http://localhost:11434',
      'http://127.0.0.1:1234',
      'http://127.0.0.1:11434',
    ];

    const endpoints = [...new Set([...localEndpoints, ...defaultEndpoints])];

    this.config.localProviders = endpoints.map(endpoint => ({
      name: this.getProviderName(endpoint),
      endpoint,
      status: 'checking' as const,
      consecutiveFailures: 0,
      availableModels: [],
    }));

    await this.checkAllProviders();

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = window.setInterval(() => {
      this.checkAllProviders();
    }, 30000);
  }

  private getProviderName(endpoint: string): string {
    if (endpoint.includes('1234')) return 'LM Studio';
    if (endpoint.includes('11434')) return 'Ollama';
    return 'Local Provider';
  }

  async checkAllProviders(): Promise<void> {
    const checks = this.config.localProviders.map(provider =>
      this.checkProvider(provider)
    );

    await Promise.allSettled(checks);

    const anyConnected = this.config.localProviders.some(
      p => p.status === 'connected'
    );

    if (anyConnected && !this.config.enabled) {
      console.log('Local providers detected - hybrid mode auto-enabled');
      this.config.enabled = true;
    }
  }

  private async checkProvider(provider: LocalProviderConfig): Promise<void> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${provider.endpoint}/v1/models`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeout);

      if (response.ok) {
        provider.status = 'connected';
        provider.latency = Date.now() - startTime;
        provider.lastCheck = new Date();
        provider.consecutiveFailures = 0;
        provider.lastSuccessful = new Date();

        try {
          const data = await response.json();
          provider.availableModels = data.data?.map((m: any) => m.id) || [];
        } catch {
          provider.availableModels = [];
        }

        console.log(`✓ ${provider.name} connected (${provider.latency}ms)`);
      } else {
        this.handleProviderFailure(provider);
      }
    } catch (error) {
      this.handleProviderFailure(provider);
      console.log(`✗ ${provider.name} not available`);
    }
  }

  private handleProviderFailure(provider: LocalProviderConfig): void {
    provider.status = 'disconnected';
    provider.lastCheck = new Date();
    provider.consecutiveFailures = (provider.consecutiveFailures || 0) + 1;
  }

  async sendToLocalProvider(
    messages: LLMMessage[],
    model: string = 'local-model',
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse | null> {
    if (this.activeRequests >= this.config.connectionPoolSize) {
      return this.queueRequest(messages, model, onStream);
    }

    return this.executeWithRetry(messages, model, onStream);
  }

  private async executeWithRetry(
    messages: LLMMessage[],
    model: string,
    onStream?: (chunk: string) => void,
    attempt: number = 0
  ): Promise<LLMResponse | null> {
    const availableProvider = this.getAvailableLocalProvider();

    if (!availableProvider) {
      console.warn('No local providers available');
      return null;
    }

    this.activeRequests++;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.maxLatency);

      const response = await fetch(`${availableProvider.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: !!onStream,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Local provider error: ${response.statusText}`);
      }

      availableProvider.consecutiveFailures = 0;
      availableProvider.lastSuccessful = new Date();

      if (onStream && response.body) {
        return this.handleLocalStream(response.body, onStream);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: data.model || model,
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        tokens: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error(`Local provider request failed (attempt ${attempt + 1}):`, error);
      this.handleProviderFailure(availableProvider);

      if (attempt < this.config.maxRetries - 1) {
        await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        return this.executeWithRetry(messages, model, onStream, attempt + 1);
      }

      return null;
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  private queueRequest(
    messages: LLMMessage[],
    model: string,
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse | null> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        resolve,
        reject,
        messages,
        model,
        onStream,
      });
    });
  }

  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0 || this.activeRequests >= this.config.connectionPoolSize) {
      return;
    }

    const request = this.requestQueue.shift();
    if (!request) return;

    try {
      const result = await this.executeWithRetry(request.messages, request.model, request.onStream);
      request.resolve(result);
    } catch (error) {
      request.reject(error as Error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleLocalStream(
    body: ReadableStream<Uint8Array>,
    onStream: (chunk: string) => void
  ): Promise<LLMResponse> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onStream(content);
              }
            } catch (e) {
              console.error('Failed to parse stream chunk');
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      model: 'local-model',
    };
  }

  private getAvailableLocalProvider(): LocalProviderConfig | null {
    const connected = this.config.localProviders
      .filter(p => p.status === 'connected' && (p.consecutiveFailures || 0) < 3)
      .sort((a, b) => {
        const aScore = (a.latency || 999) + (a.consecutiveFailures || 0) * 100;
        const bScore = (b.latency || 999) + (b.consecutiveFailures || 0) * 100;
        return aScore - bScore;
      });

    return connected[0] || null;
  }

  getStatus(): {
    enabled: boolean;
    hasLocalProviders: boolean;
    connectedProviders: number;
    providers: LocalProviderConfig[];
  } {
    return {
      enabled: this.config.enabled,
      hasLocalProviders: this.config.localProviders.length > 0,
      connectedProviders: this.config.localProviders.filter(
        p => p.status === 'connected'
      ).length,
      providers: [...this.config.localProviders],
    };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  setPreferLocal(prefer: boolean): void {
    this.config.preferLocal = prefer;
  }

  shouldUseLocal(): boolean {
    if (!this.config.enabled) return false;

    const hasConnectedProvider = this.config.localProviders.some(
      p => p.status === 'connected'
    );

    return this.config.preferLocal && hasConnectedProvider;
  }

  cleanup(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.requestQueue = [];
    this.activeRequests = 0;
  }

  getQueueSize(): number {
    return this.requestQueue.length;
  }

  getActiveRequests(): number {
    return this.activeRequests;
  }

  updateConfig(updates: Partial<HybridModeConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  async testLocalConnection(endpoint: string): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
    models?: string[];
  }> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${endpoint}/v1/models`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        success: true,
        latency,
        models: data.data?.map((m: any) => m.id) || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Connection timeout (>5s)',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Unknown error',
      };
    }
  }

  getRecommendedMode(): 'local' | 'cloud' | 'hybrid' {
    const connectedCount = this.config.localProviders.filter(
      p => p.status === 'connected'
    ).length;

    if (connectedCount === 0) return 'cloud';
    if (connectedCount > 0) return 'hybrid';

    return 'cloud';
  }
}

export const hybridBridge = new HybridBridgeService();
