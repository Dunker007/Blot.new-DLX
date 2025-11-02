import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LLMMessage } from '../llm';
import { requestCache } from '../requestCache';

describe('RequestCache', () => {
  beforeEach(() => {
    requestCache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('get and set', () => {
    it('should cache and retrieve responses', () => {
      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const modelId = 'gpt-4';
      const response = {
        content: 'Hi there!',
        model: 'gpt-4',
        tokens: 10,
      };

      requestCache.set(messages, modelId, response);
      const cached = requestCache.get(messages, modelId);

      expect(cached).toEqual(response);
    });

    it('should return null for cache miss', () => {
      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const modelId = 'gpt-4';

      const cached = requestCache.get(messages, modelId);

      expect(cached).toBeNull();
    });

    it('should differentiate between different messages', () => {
      const messages1: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const messages2: LLMMessage[] = [{ role: 'user', content: 'Goodbye' }];
      const modelId = 'gpt-4';
      const response1 = { content: 'Hi!', model: 'gpt-4', tokens: 5 };
      const response2 = { content: 'Bye!', model: 'gpt-4', tokens: 5 };

      requestCache.set(messages1, modelId, response1);
      requestCache.set(messages2, modelId, response2);

      expect(requestCache.get(messages1, modelId)).toEqual(response1);
      expect(requestCache.get(messages2, modelId)).toEqual(response2);
    });

    it('should differentiate between different models', () => {
      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const response1 = { content: 'GPT-4 response', model: 'gpt-4', tokens: 10 };
      const response2 = { content: 'GPT-3.5 response', model: 'gpt-3.5-turbo', tokens: 10 };

      requestCache.set(messages, 'gpt-4', response1);
      requestCache.set(messages, 'gpt-3.5-turbo', response2);

      expect(requestCache.get(messages, 'gpt-4')).toEqual(response1);
      expect(requestCache.get(messages, 'gpt-3.5-turbo')).toEqual(response2);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire cached items after TTL', () => {
      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const modelId = 'gpt-4';
      const response = { content: 'Hi!', model: 'gpt-4', tokens: 5 };

      requestCache.set(messages, modelId, response);

      // Should be cached immediately
      expect(requestCache.get(messages, modelId)).toEqual(response);

      // Fast forward past default TTL (60 minutes = 3600000ms)
      vi.advanceTimersByTime(3600001);

      // Should be expired
      expect(requestCache.get(messages, modelId)).toBeNull();
    });

    it('should respect updated TTL', () => {
      const messages: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const modelId = 'gpt-4';
      const response = { content: 'Hi!', model: 'gpt-4', tokens: 5 };

      // Set TTL to 1 minute
      requestCache.setTTL(1);
      requestCache.set(messages, modelId, response);

      // Should be cached
      expect(requestCache.get(messages, modelId)).toEqual(response);

      // Fast forward 30 seconds (still within TTL)
      vi.advanceTimersByTime(30000);
      expect(requestCache.get(messages, modelId)).toEqual(response);

      // Fast forward past custom TTL
      vi.advanceTimersByTime(30001);
      expect(requestCache.get(messages, modelId)).toBeNull();

      // Reset TTL back to default
      requestCache.setTTL(60);
    });
  });

  describe('clear', () => {
    it('should clear all cached items', () => {
      const messages1: LLMMessage[] = [{ role: 'user', content: 'Hello' }];
      const messages2: LLMMessage[] = [{ role: 'user', content: 'Goodbye' }];
      const response = { content: 'Response', model: 'gpt-4', tokens: 5 };

      requestCache.set(messages1, 'gpt-4', response);
      requestCache.set(messages2, 'gpt-4', response);

      expect(requestCache.get(messages1, 'gpt-4')).toEqual(response);
      expect(requestCache.get(messages2, 'gpt-4')).toEqual(response);

      requestCache.clear();

      expect(requestCache.get(messages1, 'gpt-4')).toBeNull();
      expect(requestCache.get(messages2, 'gpt-4')).toBeNull();
    });
  });

  describe('cache key generation', () => {
    it('should handle complex message arrays', () => {
      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'What is 2+2?' },
        { role: 'assistant', content: '4' },
        { role: 'user', content: 'What is 3+3?' },
      ];
      const modelId = 'gpt-4';
      const response = { content: '6', model: 'gpt-4', tokens: 5 };

      requestCache.set(messages, modelId, response);
      const cached = requestCache.get(messages, modelId);

      expect(cached).toEqual(response);
    });

    it('should be order-sensitive for messages', () => {
      const messages1: LLMMessage[] = [
        { role: 'user', content: 'A' },
        { role: 'user', content: 'B' },
      ];
      const messages2: LLMMessage[] = [
        { role: 'user', content: 'B' },
        { role: 'user', content: 'A' },
      ];
      const response1 = { content: 'Response 1', model: 'gpt-4', tokens: 5 };
      const response2 = { content: 'Response 2', model: 'gpt-4', tokens: 5 };

      requestCache.set(messages1, 'gpt-4', response1);
      requestCache.set(messages2, 'gpt-4', response2);

      expect(requestCache.get(messages1, 'gpt-4')).toEqual(response1);
      expect(requestCache.get(messages2, 'gpt-4')).toEqual(response2);
    });
  });

  describe('size limits', () => {
    it('should handle large number of cached items', () => {
      const modelId = 'gpt-4';
      const response = { content: 'Response', model: 'gpt-4', tokens: 5 };

      // Cache 1000 different messages
      for (let i = 0; i < 1000; i++) {
        const messages: LLMMessage[] = [{ role: 'user', content: `Message ${i}` }];
        requestCache.set(messages, modelId, response);
      }

      // Verify some random ones are still cached
      const testMessages: LLMMessage[] = [{ role: 'user', content: 'Message 500' }];
      expect(requestCache.get(testMessages, modelId)).toEqual(response);
    });
  });

  describe('edge cases', () => {
    it('should handle empty message arrays', () => {
      const messages: LLMMessage[] = [];
      const modelId = 'gpt-4';
      const response = { content: 'Response', model: 'gpt-4', tokens: 5 };

      requestCache.set(messages, modelId, response);
      expect(requestCache.get(messages, modelId)).toEqual(response);
    });

    it('should handle messages with special characters', () => {
      const messages: LLMMessage[] = [
        { role: 'user', content: 'Hello "world" with \n newlines and \t tabs' },
      ];
      const modelId = 'gpt-4';
      const response = { content: 'Response', model: 'gpt-4', tokens: 5 };

      requestCache.set(messages, modelId, response);
      expect(requestCache.get(messages, modelId)).toEqual(response);
    });

    it('should handle very long messages', () => {
      const longContent = 'A'.repeat(10000);
      const messages: LLMMessage[] = [{ role: 'user', content: longContent }];
      const modelId = 'gpt-4';
      const response = { content: 'Response', model: 'gpt-4', tokens: 5 };

      requestCache.set(messages, modelId, response);
      expect(requestCache.get(messages, modelId)).toEqual(response);
    });
  });
});
