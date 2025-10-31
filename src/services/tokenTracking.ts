import { supabase } from '../lib/supabase';
import { TokenUsageLog, ProviderConfig, TokenBudget } from '../types';

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
  metadata?: Record<string, any>;
}

export class TokenTrackingService {
  async logTokenUsage(options: TokenTrackingOptions): Promise<TokenUsageLog | null> {
    const totalTokens = options.promptTokens + options.completionTokens;

    const providerConfig = await this.getProviderConfig(options.providerId);
    const estimatedCost = this.calculateCost(
      options.promptTokens,
      options.completionTokens,
      providerConfig
    );

    const logEntry = {
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
      metadata: options.metadata || {},
    };

    const { data, error } = await supabase
      .from('token_usage_logs')
      .insert([logEntry])
      .select()
      .single();

    if (error) {
      console.error('Failed to log token usage:', error);
      return null;
    }

    if (options.projectId) {
      await this.updateBudgetUsage(options.projectId, totalTokens, estimatedCost);
    }

    return data;
  }

  async getProviderConfig(providerId: string): Promise<ProviderConfig | null> {
    const { data, error } = await supabase
      .from('provider_configs')
      .select('*')
      .eq('provider_id', providerId)
      .maybeSingle();

    if (error) {
      console.error('Failed to get provider config:', error);
      return null;
    }

    return data;
  }

  calculateCost(
    promptTokens: number,
    completionTokens: number,
    config: ProviderConfig | null
  ): number {
    if (!config || config.is_free) {
      return 0;
    }

    const inputCost = (promptTokens / 1_000_000) * config.cost_per_input_token;
    const outputCost = (completionTokens / 1_000_000) * config.cost_per_output_token;

    return inputCost + outputCost;
  }

  async updateBudgetUsage(
    projectId: string,
    tokensUsed: number,
    costSpent: number
  ): Promise<void> {
    const { data: budgets } = await supabase
      .from('token_budgets')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (budgets && budgets.length > 0) {
      for (const budget of budgets) {
        const newTokensUsed = budget.tokens_used + tokensUsed;
        const newCostSpent = budget.cost_spent + costSpent;

        await supabase
          .from('token_budgets')
          .update({
            tokens_used: newTokensUsed,
            cost_spent: newCostSpent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', budget.id);

        if (this.shouldSendAlert(budget, newTokensUsed, newCostSpent)) {
          console.warn(`Budget alert: Project ${projectId} has exceeded ${budget.alert_threshold}% of budget`);
        }
      }
    }
  }

  private shouldSendAlert(
    budget: TokenBudget,
    newTokensUsed: number,
    newCostSpent: number
  ): boolean {
    const tokenPercentage = (newTokensUsed / budget.token_limit) * 100;
    const costPercentage = (newCostSpent / budget.cost_limit) * 100;

    return tokenPercentage >= budget.alert_threshold ||
           costPercentage >= budget.alert_threshold;
  }

  async getUsageStats(options: {
    conversationId?: string;
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalTokens: number;
    totalCost: number;
    requestCount: number;
    avgResponseTime: number;
  }> {
    let query = supabase
      .from('token_usage_logs')
      .select('*');

    if (options.conversationId) {
      query = query.eq('conversation_id', options.conversationId);
    }

    if (options.projectId) {
      query = query.eq('project_id', options.projectId);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to get usage stats:', error);
      return {
        totalTokens: 0,
        totalCost: 0,
        requestCount: 0,
        avgResponseTime: 0,
      };
    }

    const totalTokens = data.reduce((sum, log) => sum + log.total_tokens, 0);
    const totalCost = data.reduce((sum, log) => sum + log.estimated_cost, 0);
    const totalResponseTime = data.reduce((sum, log) => sum + log.response_time_ms, 0);

    return {
      totalTokens,
      totalCost,
      requestCount: data.length,
      avgResponseTime: data.length > 0 ? totalResponseTime / data.length : 0,
    };
  }

  async getBudgetStatus(projectId?: string): Promise<TokenBudget[]> {
    let query = supabase
      .from('token_budgets')
      .select('*')
      .eq('is_active', true);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get budget status:', error);
      return [];
    }

    return data || [];
  }

  async checkBudgetAvailable(projectId: string): Promise<boolean> {
    const budgets = await this.getBudgetStatus(projectId);

    for (const budget of budgets) {
      if (budget.tokens_used >= budget.token_limit) {
        return false;
      }

      if (budget.cost_spent >= budget.cost_limit) {
        return false;
      }
    }

    return true;
  }

  async getTopProviders(limit: number = 5): Promise<Array<{
    provider_id: string;
    provider_name: string;
    request_count: number;
    total_tokens: number;
    total_cost: number;
  }>> {
    const { data: logs } = await supabase
      .from('token_usage_logs')
      .select('provider_id, total_tokens, estimated_cost');

    if (!logs) return [];

    const { data: providers } = await supabase
      .from('llm_providers')
      .select('id, name');

    if (!providers) return [];

    const providerMap = new Map(providers.map(p => [p.id, p.name]));

    const aggregated = logs.reduce((acc, log) => {
      const existing = acc.get(log.provider_id);
      if (existing) {
        existing.request_count++;
        existing.total_tokens += log.total_tokens;
        existing.total_cost += log.estimated_cost;
      } else {
        acc.set(log.provider_id, {
          provider_id: log.provider_id,
          provider_name: providerMap.get(log.provider_id) || 'Unknown',
          request_count: 1,
          total_tokens: log.total_tokens,
          total_cost: log.estimated_cost,
        });
      }
      return acc;
    }, new Map());

    return Array.from(aggregated.values())
      .sort((a, b) => b.request_count - a.request_count)
      .slice(0, limit);
  }
}

export const tokenTrackingService = new TokenTrackingService();
