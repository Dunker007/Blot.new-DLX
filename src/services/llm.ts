import { LLMProvider, Model } from '../types';
import { tokenTrackingService } from './tokenTracking';
import { requestCache } from './requestCache';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokens?: number;
  promptTokens?: number;
  completionTokens?: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface SendMessageOptions {
  conversationId?: string;
  projectId?: string;
  trackUsage?: boolean;
  useCache?: boolean;
  signal?: AbortSignal;
}

export class LLMService {
  private providers: LLMProvider[] = [];
  private models: Map<string, Model> = new Map();
  private readonly DEFAULT_TIMEOUT = 60000; // 60 seconds

  setProviders(providers: LLMProvider[]) {
    this.providers = providers.sort((a, b) => a.priority - b.priority);
  }

  setModels(models: Model[]) {
    models.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  async sendMessage(
    messages: LLMMessage[],
    modelId: string,
    onStream?: (chunk: StreamChunk) => void,
    options?: SendMessageOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = this.models.get(modelId);

    if (!model) {
      throw new Error('Model not found');
    }

    const provider = this.providers.find(p => p.id === model.provider_id);
    if (!provider || !provider.is_active) {
      throw new Error('Provider not available');
    }

    if (options?.useCache !== false && !onStream) {
      const cached = requestCache.get(messages, modelId);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.sendToProvider(provider, model, messages, onStream, options?.signal);
      const responseTime = Date.now() - startTime;

      if (options?.useCache !== false && !onStream) {
        requestCache.set(messages, modelId, response);
      }

      if (options?.trackUsage !== false) {
        await tokenTrackingService.logTokenUsage({
          conversationId: options?.conversationId,
          projectId: options?.projectId,
          providerId: provider.id,
          modelId: model.id,
          promptTokens: response.promptTokens || 0,
          completionTokens: response.completionTokens || 0,
          responseTimeMs: responseTime,
          status: 'success',
        });
      }

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (options?.trackUsage !== false) {
        await tokenTrackingService.logTokenUsage({
          conversationId: options?.conversationId,
          projectId: options?.projectId,
          providerId: provider.id,
          modelId: model.id,
          promptTokens: 0,
          completionTokens: 0,
          responseTimeMs: responseTime,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      throw error;
    }
  }

  private async sendToProvider(
    provider: LLMProvider,
    model: Model,
    messages: LLMMessage[],
    onStream?: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<LLMResponse> {
    const endpoint = `${provider.endpoint_url}/v1/chat/completions`;

    // Create timeout controller if no signal provided
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);
    
    // Combine provided signal with timeout
    const combinedSignal = signal || controller.signal;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(provider.api_key && { 'Authorization': `Bearer ${provider.api_key}` }),
        },
        body: JSON.stringify({
          model: model.model_name,
          messages,
          stream: !!onStream,
          temperature: 0.7,
        }),
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      if (onStream && response.body) {
        return this.handleStreamResponse(response.body, model.model_name, onStream);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: model.model_name,
        tokens: data.usage?.total_tokens,
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout or cancelled');
      }
      throw error;
    }
  }

  private async handleStreamResponse(
    body: ReadableStream<Uint8Array>,
    modelName: string,
    onStream: (chunk: StreamChunk) => void
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
            if (data === '[DONE]') {
              onStream({ content: '', done: true });
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onStream({ content, done: false });
              }
            } catch (e) {
              console.error('Failed to parse stream chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      model: modelName,
    };
  }

  async testConnection(provider: LLMProvider): Promise<boolean> {
    try {
      const response = await fetch(`${provider.endpoint_url}/v1/models`, {
        method: 'GET',
        headers: provider.api_key ? {
          'Authorization': `Bearer ${provider.api_key}`,
        } : {},
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const llmService = new LLMService();
