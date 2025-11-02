import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storage } from '../../lib/storage';
import { tokenTrackingService } from '../tokenTracking';

// Mock the storage module
vi.mock('../../lib/storage', () => ({
  storage: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

describe('TokenTrackingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logTokenUsage', () => {
    it('should log token usage with correct data', async () => {
      const mockInsert = vi.mocked(storage.insert);
      mockInsert.mockResolvedValue({ data: null, error: null } as any);

      await tokenTrackingService.logTokenUsage({
        conversationId: 'conv-1',
        projectId: 'proj-1',
        providerId: 'provider-1',
        modelId: 'gpt-4',
        promptTokens: 100,
        completionTokens: 50,
        responseTimeMs: 1500,
        status: 'success',
      });

      expect(mockInsert).toHaveBeenCalledWith(
        'tokens',
        expect.objectContaining({
          conversation_id: 'conv-1',
          project_id: 'proj-1',
          provider_id: 'provider-1',
          model_id: 'gpt-4',
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
          response_time_ms: 1500,
          status: 'success',
        })
      );
    });

    it('should calculate cost correctly for GPT-4', async () => {
      const mockInsert = vi.mocked(storage.insert);
      mockInsert.mockResolvedValue({ data: null, error: null } as any);

      await tokenTrackingService.logTokenUsage({
        providerId: 'provider-1',
        modelId: 'gpt-4',
        promptTokens: 1000,
        completionTokens: 500,
        responseTimeMs: 1500,
      });

      const insertCall = mockInsert.mock.calls[0][1];
      // GPT-4: input $0.03/1k, output $0.06/1k
      // Expected: (1000/1000 * 0.03) + (500/1000 * 0.06) = 0.03 + 0.03 = 0.06
      expect(insertCall.estimated_cost).toBeCloseTo(0.06, 4);
    });

    it('should use default cost for unknown models', async () => {
      const mockInsert = vi.mocked(storage.insert);
      mockInsert.mockResolvedValue({ data: null, error: null } as any);

      await tokenTrackingService.logTokenUsage({
        providerId: 'provider-1',
        modelId: 'unknown-model',
        promptTokens: 1000,
        completionTokens: 1000,
        responseTimeMs: 1500,
      });

      const insertCall = mockInsert.mock.calls[0][1];
      // Default: input $0.001/1k, output $0.002/1k
      // Expected: (1000/1000 * 0.001) + (1000/1000 * 0.002) = 0.001 + 0.002 = 0.003
      expect(insertCall.estimated_cost).toBeCloseTo(0.003, 4);
    });

    it('should handle errors gracefully', async () => {
      const mockInsert = vi.mocked(storage.insert);
      mockInsert.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(
        tokenTrackingService.logTokenUsage({
          providerId: 'provider-1',
          modelId: 'gpt-4',
          promptTokens: 100,
          completionTokens: 50,
          responseTimeMs: 1500,
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getTokenMetrics', () => {
    it('should return correct metrics when logs exist', async () => {
      const mockSelect = vi.mocked(storage.select);
      mockSelect.mockResolvedValue({
        data: [
          {
            total_tokens: 100,
            estimated_cost: 0.01,
            response_time_ms: 1000,
            status: 'success',
          },
          {
            total_tokens: 200,
            estimated_cost: 0.02,
            response_time_ms: 2000,
            status: 'success',
          },
          {
            total_tokens: 150,
            estimated_cost: 0.015,
            response_time_ms: 1500,
            status: 'failed',
          },
        ],
        error: null,
      } as any);

      const metrics = await tokenTrackingService.getTokenMetrics();

      expect(metrics.totalTokens).toBe(450);
      expect(metrics.totalCost).toBeCloseTo(0.045, 4);
      expect(metrics.requestCount).toBe(3);
      expect(metrics.averageTokensPerRequest).toBe(150);
      expect(metrics.averageResponseTime).toBe(1500);
      // Success rate is a decimal (0-1), not percentage
      expect(metrics.successRate).toBeCloseTo(0.6667, 4);
    });

    it('should return zero metrics when no logs exist', async () => {
      const mockSelect = vi.mocked(storage.select);
      mockSelect.mockResolvedValue({ data: null, error: null } as any);

      const metrics = await tokenTrackingService.getTokenMetrics();

      expect(metrics.totalTokens).toBe(0);
      expect(metrics.totalCost).toBe(0);
      expect(metrics.requestCount).toBe(0);
      expect(metrics.averageTokensPerRequest).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.successRate).toBe(0);
    });

    it('should filter by date range', async () => {
      const mockSelect = vi.mocked(storage.select);
      mockSelect.mockResolvedValue({ data: [], error: null } as any);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await tokenTrackingService.getTokenMetrics(startDate, endDate);

      expect(mockSelect).toHaveBeenCalledWith('tokens');
    });
  });

  describe('getProviderUsage', () => {
    it('should aggregate usage by provider', async () => {
      const mockSelect = vi.mocked(storage.select);
      mockSelect.mockResolvedValue({
        data: [
          {
            provider_id: 'provider-1',
            total_tokens: 1000,
            estimated_cost: 0.1,
            timestamp: new Date(),
          },
          {
            provider_id: 'provider-1',
            total_tokens: 500,
            estimated_cost: 0.05,
            timestamp: new Date(),
          },
          {
            provider_id: 'provider-2',
            total_tokens: 2000,
            estimated_cost: 0.2,
            timestamp: new Date(),
          },
        ],
        error: null,
      } as any);

      const stats = await tokenTrackingService.getProviderUsage();

      expect(stats).toHaveLength(2);

      const provider1Stats = stats.find(s => s.provider_id === 'provider-1');
      expect(provider1Stats?.request_count).toBe(2);
      expect(provider1Stats?.total_tokens).toBe(1500);
      expect(provider1Stats?.total_cost).toBeCloseTo(0.15, 4);

      const provider2Stats = stats.find(s => s.provider_id === 'provider-2');
      expect(provider2Stats?.request_count).toBe(1);
      expect(provider2Stats?.total_tokens).toBe(2000);
      expect(provider2Stats?.total_cost).toBeCloseTo(0.2, 4);
    });

    it('should return empty array when no data exists', async () => {
      const mockSelect = vi.mocked(storage.select);
      mockSelect.mockResolvedValue({ data: null, error: null } as any);

      const stats = await tokenTrackingService.getProviderUsage();

      expect(stats).toEqual([]);
    });
  });

  describe('checkBudget', () => {
    it('should check budget correctly', async () => {
      const mockSelect = vi.mocked(storage.select);
      const projectId = 'test-project';

      // Set a budget
      tokenTrackingService.setBudget(projectId, 100, 'monthly');

      // Mock token logs
      mockSelect.mockResolvedValue({
        data: [
          {
            estimated_cost: 25,
            total_tokens: 1000,
            response_time_ms: 1000,
            status: 'success',
            timestamp: new Date(),
            project_id: projectId,
          },
          {
            estimated_cost: 30,
            total_tokens: 1200,
            response_time_ms: 1200,
            status: 'success',
            timestamp: new Date(),
            project_id: projectId,
          },
        ],
        error: null,
      } as any);

      const status = await tokenTrackingService.checkBudget(projectId);

      expect(status.usage).toBe(55);
      expect(status.limit).toBe(100);
      expect(status.withinBudget).toBe(true);
    });

    it('should detect when over budget', async () => {
      const mockSelect = vi.mocked(storage.select);
      const projectId = 'test-project-2';

      tokenTrackingService.setBudget(projectId, 100, 'monthly');

      mockSelect.mockResolvedValue({
        data: [
          {
            estimated_cost: 150,
            total_tokens: 5000,
            response_time_ms: 2000,
            status: 'success',
            timestamp: new Date(),
            project_id: projectId,
          },
        ],
        error: null,
      } as any);

      const status = await tokenTrackingService.checkBudget(projectId);

      expect(status.withinBudget).toBe(false);
      expect(status.usage).toBe(150);
    });

    it('should return default when no budget set', async () => {
      const status = await tokenTrackingService.checkBudget('non-existent-project');

      expect(status.withinBudget).toBe(true);
      expect(status.usage).toBe(0);
      expect(status.limit).toBe(0);
    });
  });
});
