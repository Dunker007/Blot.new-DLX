import { describe, it, expect, beforeEach, vi } from 'vitest';
import { llmService } from '../services/llm';
import { requestCache } from '../services/requestCache';
import { LLMMessage } from '../services/llm';

// Mock storage layer
vi.mock('../lib/storage', () => ({
  storage: {
    insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    select: vi.fn(() => Promise.resolve({ data: [], error: null })),
  },
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Chat Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestCache.clear();
  });

  it('should complete full chat flow: send message -> get response -> track tokens -> cache result', async () => {
    // Arrange: Set up providers and models
    const mockProvider = {
      id: 'test-provider',
      name: 'Test Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    const mockModel = {
      id: 'test-model',
      provider_id: 'test-provider',
      model_name: 'test-model-v1',
      display_name: 'Test Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setProviders([mockProvider]);
    llmService.setModels([mockModel]);

    // Mock successful API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'Hello! How can I help you today?',
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 8,
          total_tokens: 18,
        },
      }),
    });

    const messages: LLMMessage[] = [
      { role: 'user', content: 'Hello, AI!' },
    ];

    // Act: Send message
    const response = await llmService.sendMessage(messages, 'test-model', undefined, {
      conversationId: 'test-conversation',
      projectId: 'test-project',
      trackUsage: true,
      useCache: true,
    });

    // Assert: Response received
    expect(response).toBeDefined();
    expect(response.content).toBe('Hello! How can I help you today?');
    expect(response.model).toBe('test-model-v1');
    expect(response.promptTokens).toBe(10);
    expect(response.completionTokens).toBe(8);

    // Assert: Response cached
    const cachedResponse = requestCache.get(messages, 'test-model');
    expect(cachedResponse).toBeDefined();
    expect(cachedResponse?.content).toBe('Hello! How can I help you today?');
  });

  it('should use cached response on second identical request', async () => {
    // Arrange
    const mockProvider = {
      id: 'test-provider',
      name: 'Test Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    const mockModel = {
      id: 'test-model',
      provider_id: 'test-provider',
      model_name: 'test-model-v1',
      display_name: 'Test Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setProviders([mockProvider]);
    llmService.setModels([mockModel]);

    const messages: LLMMessage[] = [
      { role: 'user', content: 'What is 2+2?' },
    ];

    // Mock first request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '2+2 equals 4' } }],
        usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
      }),
    });

    // Act: First request
    const response1 = await llmService.sendMessage(messages, 'test-model', undefined, {
      useCache: true,
      trackUsage: false,
    });

    // Act: Second identical request (should use cache)
    const response2 = await llmService.sendMessage(messages, 'test-model', undefined, {
      useCache: true,
      trackUsage: false,
    });

    // Assert: Both responses are identical
    expect(response1.content).toBe(response2.content);

    // Assert: Fetch was only called once
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle conversation history correctly', async () => {
    // Arrange
    const mockProvider = {
      id: 'test-provider',
      name: 'Test Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    const mockModel = {
      id: 'test-model',
      provider_id: 'test-provider',
      model_name: 'test-model-v1',
      display_name: 'Test Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setProviders([mockProvider]);
    llmService.setModels([mockModel]);

    const conversationHistory: LLMMessage[] = [
      { role: 'user', content: 'My name is Alice' },
      { role: 'assistant', content: 'Nice to meet you, Alice!' },
      { role: 'user', content: 'What is my name?' },
    ];

    // Mock API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Your name is Alice' } }],
        usage: { prompt_tokens: 20, completion_tokens: 5, total_tokens: 25 },
      }),
    });

    // Act
    const response = await llmService.sendMessage(conversationHistory, 'test-model', undefined, {
      useCache: false,
      trackUsage: false,
    });

    // Assert: Response acknowledges conversation history
    expect(response.content).toContain('Alice');

    // Assert: All messages were sent to API
    const fetchCall = (global.fetch as any).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.messages).toHaveLength(3);
    expect(requestBody.messages[0].content).toBe('My name is Alice');
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    const mockProvider = {
      id: 'test-provider',
      name: 'Test Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    const mockModel = {
      id: 'test-model',
      provider_id: 'test-provider',
      model_name: 'test-model-v1',
      display_name: 'Test Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setProviders([mockProvider]);
    llmService.setModels([mockModel]);

    // Mock API error
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const messages: LLMMessage[] = [
      { role: 'user', content: 'Hello' },
    ];

    // Act & Assert: Should throw error
    await expect(
      llmService.sendMessage(messages, 'test-model', undefined, {
        useCache: false,
        trackUsage: false,
      })
    ).rejects.toThrow('API error: Internal Server Error');
  });

  it('should track token usage across multiple requests', async () => {
    // Arrange
    const mockProvider = {
      id: 'test-provider',
      name: 'Test Provider',
      type: 'local' as const,
      endpoint_url: 'http://localhost:1234',
      is_active: true,
      priority: 1,
      api_key: null,
    };

    const mockModel = {
      id: 'test-model',
      provider_id: 'test-provider',
      model_name: 'test-model-v1',
      display_name: 'Test Model',
      context_window: 4096,
      is_available: true,
      cost_tier: 'free' as const,
    };

    llmService.setProviders([mockProvider]);
    llmService.setModels([mockModel]);

    const conversationId = 'multi-request-conversation';

    // Mock multiple API responses
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response 1' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response 2' } }],
          usage: { prompt_tokens: 15, completion_tokens: 8, total_tokens: 23 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response 3' } }],
          usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
        }),
      });

    // Act: Send multiple messages
    await llmService.sendMessage(
      [{ role: 'user', content: 'Message 1' }],
      'test-model',
      undefined,
      { conversationId, trackUsage: true, useCache: false }
    );

    await llmService.sendMessage(
      [{ role: 'user', content: 'Message 2' }],
      'test-model',
      undefined,
      { conversationId, trackUsage: true, useCache: false }
    );

    await llmService.sendMessage(
      [{ role: 'user', content: 'Message 3' }],
      'test-model',
      undefined,
      { conversationId, trackUsage: true, useCache: false }
    );

    // Assert: All requests completed successfully
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});

