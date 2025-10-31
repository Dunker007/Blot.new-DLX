import { LLMMessage, LLMResponse } from './llm';

export interface LocalProviderConfig {
  name: string;
  endpoint: string;
  status: 'checking' | 'connected' | 'disconnected' | 'error';
  lastCheck?: Date;
  latency?: number;
}

export interface HybridModeConfig {
  enabled: boolean;
  preferLocal: boolean;
  localProviders: LocalProviderConfig[];
  fallbackToCloud: boolean;
  maxLatency: number;
}

export class HybridBridgeService {
  private config: HybridModeConfig = {
    enabled: false,
    preferLocal: true,
    localProviders: [],
    fallbackToCloud: true,
    maxLatency: 5000,
  };

  private healthCheckInterval?: number;

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
        console.log(`✓ ${provider.name} connected (${provider.latency}ms)`);
      } else {
        provider.status = 'disconnected';
        provider.lastCheck = new Date();
      }
    } catch (error) {
      provider.status = 'disconnected';
      provider.lastCheck = new Date();
      console.log(`✗ ${provider.name} not available`);
    }
  }

  async sendToLocalProvider(
    messages: LLMMessage[],
    model: string = 'local-model',
    onStream?: (chunk: string) => void
  ): Promise<LLMResponse | null> {
    const availableProvider = this.getAvailableLocalProvider();

    if (!availableProvider) {
      console.warn('No local providers available');
      return null;
    }

    try {
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
      });

      if (!response.ok) {
        throw new Error(`Local provider error: ${response.statusText}`);
      }

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
      console.error('Local provider request failed:', error);
      availableProvider.status = 'error';
      return null;
    }
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
      .filter(p => p.status === 'connected')
      .sort((a, b) => (a.latency || 999) - (b.latency || 999));

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
