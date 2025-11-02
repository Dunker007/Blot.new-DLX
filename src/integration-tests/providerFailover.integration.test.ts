import { describe, it, expect, beforeEach, vi } from 'vitest';
import { llmService } from '../services/llm';
import { LLMMessage } from '../services/llm';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Provider Failover Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use primary provider when available', async () => {
    // Arrange: Set up multiple providers with priorities
    const primaryProvider = {
      id: 'primary-provider',
      name: 'Primary Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    const secondaryProvider = {
      id: 'secondary-provider',
      name: 'Secondary Provider',
      type: 'cloud' as const,
      endpoint_url: 'https://api.secondary.com',
      is_active: true,
      priority: 2,
      api_key: 'test-key',
    };

    const primaryModel = {
      id: 'primary-model',
      provider_id: 'primary-provider',
      model_name: 'primary-model-v1',
      display_name: 'Primary Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setProviders([primaryProvider, secondaryProvider]);
    llmService.setModels([primaryModel]);

    // Mock successful response from primary provider
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Response from primary' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    });

    const messages: LLMMessage[] = [{ role: 'user', content: 'Test message' }];

    // Act
    const response = await llmService.sendMessage(messages, 'primary-model', undefined, {
      useCache: false,
      trackUsage: false,
    });

    // Assert: Primary provider was used
    expect(response.content).toBe('Response from primary');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as any).mock.calls[0][0]).toBe('http://localhost:1234/v1/chat/completions');
  });

  it('should handle provider unavailability gracefully', async () => {
    // Arrange: Set up provider that will fail
    const unavailableProvider = {
      id: 'unavailable-provider',
      name: 'Unavailable Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:9999',
      is_active: false, // Provider is inactive
      priority: 1,
      api_key: null,
    };

    const unavailableModel = {
      id: 'unavailable-model',
      provider_id: 'unavailable-provider',
      model_name: 'unavailable-model-v1',
      display_name: 'Unavailable Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setProviders([unavailableProvider]);
    llmService.setModels([unavailableModel]);

    const messages: LLMMessage[] = [{ role: 'user', content: 'Test message' }];

    // Act & Assert: Should throw error when provider is not available
    await expect(
      llmService.sendMessage(messages, 'unavailable-model', undefined, {
        useCache: false,
        trackUsage: false,
      })
    ).rejects.toThrow('Provider not available');
  });

  it('should handle API errors from provider', async () => {
    // Arrange
    const provider = {
      id: 'error-provider',
      name: 'Error Provider',
      type: 'cloud' as const,
      endpoint_url: 'https://api.error.com',
      is_active: true,
      priority: 1,
      api_key: 'test-key',
    };

    const model = {
      id: 'error-model',
      provider_id: 'error-provider',
      model_name: 'error-model-v1',
      display_name: 'Error Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'low' as const,
    };

    llmService.setProviders([provider]);
    llmService.setModels([model]);

    // Mock API error (500 Internal Server Error)
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const messages: LLMMessage[] = [{ role: 'user', content: 'Test message' }];

    // Act & Assert: Should throw error
    await expect(
      llmService.sendMessage(messages, 'error-model', undefined, {
        useCache: false,
        trackUsage: false,
      })
    ).rejects.toThrow('API error: Internal Server Error');
  });

  it('should handle network timeout', async () => {
    // Arrange
    const provider = {
      id: 'timeout-provider',
      name: 'Timeout Provider',
      type: 'cloud' as const,
      endpoint_url: 'https://api.timeout.com',
      is_active: true,
      priority: 1,
      api_key: 'test-key',
    };

    const model = {
      id: 'timeout-model',
      provider_id: 'timeout-provider',
      model_name: 'timeout-model-v1',
      display_name: 'Timeout Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'low' as const,
    };

    llmService.setProviders([provider]);
    llmService.setModels([model]);

    // Mock network timeout
    (global.fetch as any).mockRejectedValueOnce(new Error('Network timeout'));

    const messages: LLMMessage[] = [{ role: 'user', content: 'Test message' }];

    // Act & Assert: Should throw error
    await expect(
      llmService.sendMessage(messages, 'timeout-model', undefined, {
        useCache: false,
        trackUsage: false,
      })
    ).rejects.toThrow('Network timeout');
  });

  it('should handle model not found error', async () => {
    // Arrange
    const provider = {
      id: 'test-provider',
      name: 'Test Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    llmService.setProviders([provider]);
    llmService.setModels([]); // No models available

    const messages: LLMMessage[] = [{ role: 'user', content: 'Test message' }];

    // Act & Assert: Should throw error when model not found
    await expect(
      llmService.sendMessage(messages, 'non-existent-model', undefined, {
        useCache: false,
        trackUsage: false,
      })
    ).rejects.toThrow('Model not found');
  });

  it('should respect provider priority order', async () => {
    // Arrange: Set up providers with different priorities
    const lowPriorityProvider = {
      id: 'low-priority',
      name: 'Low Priority Provider',
      type: 'cloud' as const,
      endpoint_url: 'https://api.low.com',
      is_active: true,
      priority: 3,
      api_key: 'low-key',
    };

    const mediumPriorityProvider = {
      id: 'medium-priority',
      name: 'Medium Priority Provider',
      type: 'cloud' as const,
      endpoint_url: 'https://api.medium.com',
      is_active: true,
      priority: 2,
      api_key: 'medium-key',
    };

    const highPriorityProvider = {
      id: 'high-priority',
      name: 'High Priority Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    // Set providers in random order
    llmService.setProviders([lowPriorityProvider, highPriorityProvider, mediumPriorityProvider]);

    const highPriorityModel = {
      id: 'high-priority-model',
      provider_id: 'high-priority',
      model_name: 'high-priority-v1',
      display_name: 'High Priority Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setModels([highPriorityModel]);

    // Mock successful response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'High priority response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    });

    const messages: LLMMessage[] = [{ role: 'user', content: 'Test message' }];

    // Act
    const response = await llmService.sendMessage(messages, 'high-priority-model', undefined, {
      useCache: false,
      trackUsage: false,
    });

    // Assert: High priority provider was used (localhost:1234)
    expect(response.content).toBe('High priority response');
    expect((global.fetch as any).mock.calls[0][0]).toBe('http://localhost:1234/v1/chat/completions');
  });

  it('should handle streaming responses correctly', async () => {
    // Arrange
    const provider = {
      id: 'streaming-provider',
      name: 'Streaming Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    const model = {
      id: 'streaming-model',
      provider_id: 'streaming-provider',
      model_name: 'streaming-model-v1',
      display_name: 'Streaming Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setProviders([provider]);
    llmService.setModels([model]);

    // Mock streaming response
    const mockStream = new ReadableStream({
      start(controller) {
        const chunks = [
          'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":"!"}}]}\n\n',
          'data: [DONE]\n\n',
        ];

        chunks.forEach(chunk => {
          controller.enqueue(new TextEncoder().encode(chunk));
        });
        controller.close();
      },
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    });

    const messages: LLMMessage[] = [{ role: 'user', content: 'Test streaming' }];
    const streamedChunks: string[] = [];

    // Act
    const response = await llmService.sendMessage(
      messages,
      'streaming-model',
      chunk => {
        if (!chunk.done) {
          streamedChunks.push(chunk.content);
        }
      },
      {
        useCache: false,
        trackUsage: false,
      }
    );

    // Assert: All chunks received
    expect(streamedChunks).toEqual(['Hello', ' world', '!']);
    expect(response.content).toBe('Hello world!');
  });
});

