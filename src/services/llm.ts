import { LLMProvider, Model } from '../types';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokens?: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export class LLMService {
  private providers: LLMProvider[] = [];
  private models: Map<string, Model> = new Map();

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
    onStream?: (chunk: StreamChunk) => void
  ): Promise<LLMResponse> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error('Model not found');
    }

    const provider = this.providers.find(p => p.id === model.provider_id);
    if (!provider || !provider.is_active) {
      throw new Error('Provider not available');
    }

    return this.sendToProvider(provider, model, messages, onStream);
  }

  private async sendToProvider(
    provider: LLMProvider,
    model: Model,
    messages: LLMMessage[],
    onStream?: (chunk: StreamChunk) => void
  ): Promise<LLMResponse> {
    const endpoint = `${provider.endpoint_url}/v1/chat/completions`;

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
    });

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
    };
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
