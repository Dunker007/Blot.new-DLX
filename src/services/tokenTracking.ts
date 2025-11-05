import { storage } from '../lib/storage';

export interface TokenTrackingOptions {
  conversationId?: string;
  projectId?: string;
  providerId: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  responseTimeMs: number;
  status?: 'success' | 'failed' | 'cached' | 'rate_limited';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

interface TokenUsageLog {
  id?: number;
  timestamp: Date;
  conversation_id?: string;
  project_id?: string;
  provider_id: string;
  model_id: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  response_time_ms: number;
  status: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
}

interface TokenMetrics {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  averageTokensPerRequest: number;
  averageResponseTime: number;
  successRate: number;
}

interface ProviderUsageStats {
  provider_id: string;
  provider_name: string;
  request_count: number;
  total_tokens: number;
  total_cost: number;
  avg_response_time: number;
  error_rate: number;
  success_count: number;
  error_count: number;
}

class TokenTrackingService {
  private readonly COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  };

  async logTokenUsage(options: TokenTrackingOptions): Promise<void> {
    const totalTokens = options.promptTokens + options.completionTokens;
    const estimatedCost = this.calculateCost(
      options.modelId,
      options.promptTokens,
      options.completionTokens
    );

    const log: TokenUsageLog = {
      timestamp: new Date(),
      conversation_id: options.conversationId,
      project_id: options.projectId,
      provider_id: options.providerId,
      model_id: options.modelId,
      prompt_tokens: options.promptTokens,
      completion_tokens: options.completionTokens,
      total_tokens: totalTokens,
      estimated_cost: estimatedCost,
      response_time_ms: options.responseTimeMs,
      status: options.status || 'success',
      error_message: options.errorMessage,
      metadata: options.metadata,
    };

    await storage.insert('tokens', log);
  }

  async getTokenUsage(conversationId: string): Promise<
    Array<{
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      estimatedCost: number;
      responseTimeMs: number;
      status: string;
    }>
  > {
    const { data: logs } = await storage.select('tokens');

    if (!logs || !Array.isArray(logs)) {
      return [];
    }

    return (logs as TokenUsageLog[])
      .filter(log => log.conversation_id === conversationId)
      .map(log => ({
        promptTokens: log.prompt_tokens,
        completionTokens: log.completion_tokens,
        totalTokens: log.total_tokens,
        estimatedCost: log.estimated_cost,
        responseTimeMs: log.response_time_ms,
        status: log.status,
      }));
  }

  private calculateCost(modelId: string, promptTokens: number, completionTokens: number): number {
    const costs = this.COST_PER_1K_TOKENS[modelId] || { input: 0.001, output: 0.002 };
    return (promptTokens / 1000) * costs.input + (completionTokens / 1000) * costs.output;
  }

  async getTokenMetrics(
    startDate?: Date,
    endDate?: Date,
    projectId?: string
  ): Promise<TokenMetrics> {
    const { data: logs } = await storage.select('tokens');

    if (!logs) {
      return {
        totalTokens: 0,
        totalCost: 0,
        requestCount: 0,
        averageTokensPerRequest: 0,
        averageResponseTime: 0,
        successRate: 0,
      };
    }

    // Single-pass filtering and aggregation for better performance
    let totalTokens = 0;
    let totalCost = 0;
    let totalResponseTime = 0;
    let successfulRequests = 0;
    let requestCount = 0;

    const startTime = startDate?.getTime();
    const endTime = endDate?.getTime();

    for (const log of logs as TokenUsageLog[]) {
      const logTime = new Date(log.timestamp).getTime();

      // Apply filters
      if (startTime && logTime < startTime) continue;
      if (endTime && logTime > endTime) continue;
      if (projectId && log.project_id !== projectId) continue;

      // Aggregate in same pass
      requestCount++;
      totalTokens += log.total_tokens;
      totalCost += log.estimated_cost;
      totalResponseTime += log.response_time_ms;
      if (log.status === 'success') successfulRequests++;
    }

    if (requestCount === 0) {
      return {
        totalTokens: 0,
        totalCost: 0,
        requestCount: 0,
        averageTokensPerRequest: 0,
        averageResponseTime: 0,
        successRate: 0,
      };
    }

    return {
      totalTokens,
      totalCost,
      requestCount,
      averageTokensPerRequest: totalTokens / requestCount,
      averageResponseTime: totalResponseTime / requestCount,
      successRate: successfulRequests / requestCount,
    };
  }

  async getUsageStats(options?: {
    startDate?: Date;
    endDate?: Date;
    projectId?: string;
  }): Promise<TokenMetrics & { avgResponseTime: number }> {
    const metrics = await this.getTokenMetrics(
      options?.startDate,
      options?.endDate,
      options?.projectId
    );
    return {
      ...metrics,
      avgResponseTime: metrics.averageResponseTime,
    };
  }

  async getTopProviders(limit: number = 10): Promise<ProviderUsageStats[]> {
    const providers = await this.getProviderUsage();
    return providers.sort((a, b) => b.request_count - a.request_count).slice(0, limit);
  }

  async getProviderUsage(startDate?: Date, endDate?: Date): Promise<ProviderUsageStats[]> {
    const { data: logs } = await storage.select('tokens');

    if (!logs) return [];

    // Single-pass filtering and aggregation
    const providerStats = new Map<string, ProviderUsageStats>();
    const startTime = startDate?.getTime();
    const endTime = endDate?.getTime();

    for (const log of logs as TokenUsageLog[]) {
      const logTime = new Date(log.timestamp).getTime();

      // Apply date filters
      if (startTime && logTime < startTime) continue;
      if (endTime && logTime > endTime) continue;

      const providerId = log.provider_id;
      const existing = providerStats.get(providerId);
      const isSuccess = log.status === 'success';

      if (existing) {
        existing.request_count++;
        existing.total_tokens += log.total_tokens;
        existing.total_cost += log.estimated_cost;
        // Update rolling average response time
        existing.avg_response_time = 
          (existing.avg_response_time * (existing.request_count - 1) + log.response_time_ms) / 
          existing.request_count;
        if (isSuccess) {
          existing.success_count++;
        } else {
          existing.error_count++;
        }
        existing.error_rate = existing.error_count / existing.request_count;
      } else {
        providerStats.set(providerId, {
          provider_id: providerId,
          provider_name: providerId,
          request_count: 1,
          total_tokens: log.total_tokens,
          total_cost: log.estimated_cost,
          avg_response_time: log.response_time_ms,
          error_rate: isSuccess ? 0 : 1,
          success_count: isSuccess ? 1 : 0,
          error_count: isSuccess ? 0 : 1,
        });
      }
    }

    return Array.from(providerStats.values())
      .sort((a, b) => b.request_count - a.request_count)
      .slice(0, 10); // Top 10 providers
  }

  // Simple in-memory budget checking
  private budgets = new Map<string, { limit: number; spent: number; period: string }>();

  setBudget(projectId: string, limit: number, period: 'daily' | 'monthly' = 'monthly'): void {
    this.budgets.set(projectId, { limit, spent: 0, period });
  }

  async checkBudget(
    projectId: string
  ): Promise<{ withinBudget: boolean; usage: number; limit: number }> {
    const budget = this.budgets.get(projectId);
    if (!budget) {
      return { withinBudget: true, usage: 0, limit: 0 };
    }

    // Get current period spending
    const now = new Date();
    const startDate =
      budget.period === 'daily'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth(), 1);

    const metrics = await this.getTokenMetrics(startDate, now, projectId);

    return {
      withinBudget: metrics.totalCost <= budget.limit,
      usage: metrics.totalCost,
      limit: budget.limit,
    };
  }

  async getBudgetStatus(): Promise<any> {
    // Return budget status for all projects
    const budgetStatuses = [];
    for (const [projectId, budget] of this.budgets.entries()) {
      const status = await this.checkBudget(projectId);
      budgetStatuses.push({
        projectId,
        ...status,
        period: budget.period,
      });
    }
    return budgetStatuses;
  }
}

export const tokenTrackingService = new TokenTrackingService();
