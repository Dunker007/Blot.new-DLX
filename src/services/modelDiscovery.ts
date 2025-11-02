import { supabase } from '../lib/supabase';
import { LLMProvider, Model } from '../types';

export interface DiscoveredModel {
  id: string;
  model_name: string;
  display_name: string;
  context_window: number;
  type: 'llm' | 'vlm' | 'embeddings';
  publisher?: string;
  arch?: string;
  quantization?: string;
  state: 'loaded' | 'not-loaded' | 'available';
  max_context_length?: number;
}

export interface ModelDiscoveryResult {
  success: boolean;
  models: DiscoveredModel[];
  error?: string;
  provider: LLMProvider;
}

export interface ModelRecommendation {
  model: Model;
  score: number;
  reasons: string[];
  useCase: string;
}

export class ModelDiscoveryService {
  private modelCache: Map<string, { models: DiscoveredModel[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000;

  async discoverModels(provider: LLMProvider): Promise<ModelDiscoveryResult> {
    const cached = this.modelCache.get(provider.id);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return {
        success: true,
        models: cached.models,
        provider,
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${provider.endpoint_url}/v1/models`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(provider.api_key && { Authorization: `Bearer ${provider.api_key}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models = this.parseModelsResponse(data, provider);

      this.modelCache.set(provider.id, {
        models,
        timestamp: Date.now(),
      });

      return {
        success: true,
        models,
        provider,
      };
    } catch (error) {
      console.error(`Model discovery failed for ${provider.name}:`, error);
      return {
        success: false,
        models: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        provider,
      };
    }
  }

  private parseModelsResponse(data: any, provider: LLMProvider): DiscoveredModel[] {
    if (!data || !data.data) return [];

    return data.data.map((model: any) => {
      const modelName = model.id || model.model || 'unknown';
      const displayName = this.generateDisplayName(model);

      return {
        id: model.id || model.model,
        model_name: modelName,
        display_name: displayName,
        context_window: model.max_context_length || model.context_length || 4096,
        type: model.type || 'llm',
        publisher: model.publisher,
        arch: model.arch || model.architecture,
        quantization: model.quantization,
        state: model.state || (model.loaded ? 'loaded' : 'available'),
        max_context_length: model.max_context_length,
      };
    });
  }

  private generateDisplayName(model: any): string {
    if (model.display_name) return model.display_name;

    const id = model.id || model.model || 'Unknown Model';

    const parts = id.split('/');
    const name = parts[parts.length - 1];

    return name
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async syncModelAvailability(providerId: string): Promise<void> {
    const { data: provider } = await supabase
      .from('llm_providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (!provider) return;

    const result = await this.discoverModels(provider);
    if (!result.success) return;

    const { data: existingModels } = await supabase
      .from('models')
      .select('*')
      .eq('provider_id', providerId);

    if (!existingModels) return;

    const discoveredModelNames = new Set(result.models.map(m => m.model_name));

    for (const model of existingModels) {
      const isAvailable = discoveredModelNames.has(model.model_name);

      if (model.is_available !== isAvailable) {
        await supabase.from('models').update({ is_available: isAvailable }).eq('id', model.id);
      }
    }
  }

  async bulkImportModels(
    providerId: string,
    models: DiscoveredModel[]
  ): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    const { data: existingModels } = await supabase
      .from('models')
      .select('model_name')
      .eq('provider_id', providerId);

    const existingModelNames = new Set(existingModels?.map(m => m.model_name) || []);

    for (const model of models) {
      if (existingModelNames.has(model.model_name)) {
        skipped++;
        continue;
      }

      try {
        const { error } = await supabase.from('models').insert([
          {
            provider_id: providerId,
            model_name: model.model_name,
            display_name: model.display_name,
            context_window: model.context_window,
            use_case: this.inferUseCase(model),
            is_available: true,
            performance_metrics: {},
          },
        ]);

        if (error) {
          errors.push(`${model.model_name}: ${error.message}`);
        } else {
          imported++;
        }
      } catch (error) {
        errors.push(
          `${model.model_name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return { imported, skipped, errors };
  }

  private inferUseCase(model: DiscoveredModel): 'coding' | 'analysis' | 'creative' | 'general' {
    const name = model.model_name.toLowerCase();

    if (name.includes('code') || name.includes('coder') || name.includes('deepseek')) {
      return 'coding';
    }

    if (name.includes('analyst') || name.includes('researcher')) {
      return 'analysis';
    }

    if (name.includes('creative') || name.includes('writer') || name.includes('poet')) {
      return 'creative';
    }

    return 'general';
  }

  async getModelRecommendations(
    useCase?: 'coding' | 'analysis' | 'creative' | 'general',
    preferLocal?: boolean
  ): Promise<ModelRecommendation[]> {
    const { data: models } = await supabase
      .from('models')
      .select('*, llm_providers!inner(*)')
      .eq('is_available', true)
      .eq('llm_providers.is_active', true);

    if (!models || models.length === 0) return [];

    const { data: usageStats } = await supabase
      .from('token_usage_logs')
      .select('model_id, status, response_time_ms')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const modelStats = new Map<
      string,
      { successRate: number; avgResponseTime: number; totalCalls: number }
    >();

    if (usageStats) {
      const grouped = usageStats.reduce(
        (acc, log) => {
          if (!acc[log.model_id]) {
            acc[log.model_id] = { success: 0, total: 0, totalTime: 0 };
          }
          acc[log.model_id].total++;
          if (log.status === 'success') acc[log.model_id].success++;
          acc[log.model_id].totalTime += log.response_time_ms;
          return acc;
        },
        {} as Record<string, { success: number; total: number; totalTime: number }>
      );

      for (const [modelId, stats] of Object.entries(grouped)) {
        modelStats.set(modelId, {
          successRate: stats.success / stats.total,
          avgResponseTime: stats.totalTime / stats.total,
          totalCalls: stats.total,
        });
      }
    }

    const recommendations: ModelRecommendation[] = models.map(model => {
      let score = 50;
      const reasons: string[] = [];
      const provider = model.llm_providers;

      if (useCase && model.use_case === useCase) {
        score += 30;
        reasons.push(`Optimized for ${useCase}`);
      }

      const isLocal = provider.name === 'lm_studio' || provider.name === 'ollama';
      if (preferLocal && isLocal) {
        score += 20;
        reasons.push('Local model (no API costs)');
      } else if (!preferLocal && !isLocal) {
        score += 10;
        reasons.push('Cloud-based');
      }

      const stats = modelStats.get(model.id);
      if (stats) {
        if (stats.successRate > 0.95) {
          score += 15;
          reasons.push(`${(stats.successRate * 100).toFixed(0)}% success rate`);
        }
        if (stats.avgResponseTime < 3000) {
          score += 10;
          reasons.push('Fast response time');
        }
        if (stats.totalCalls > 10) {
          score += 5;
          reasons.push('Popular choice');
        }
      }

      if (model.context_window >= 32000) {
        score += 10;
        reasons.push('Large context window');
      }

      return {
        model: model as Model,
        score,
        reasons,
        useCase: model.use_case,
      };
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  clearCache(): void {
    this.modelCache.clear();
  }

  async getModelInsights(modelId: string): Promise<{
    totalUsage: number;
    successRate: number;
    avgResponseTime: number;
    avgTokensPerRequest: number;
    totalCost: number;
    lastUsed?: string;
  }> {
    const { data: logs } = await supabase
      .from('token_usage_logs')
      .select('*')
      .eq('model_id', modelId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (!logs || logs.length === 0) {
      return {
        totalUsage: 0,
        successRate: 0,
        avgResponseTime: 0,
        avgTokensPerRequest: 0,
        totalCost: 0,
      };
    }

    const successCount = logs.filter(l => l.status === 'success').length;
    const totalResponseTime = logs.reduce((sum, l) => sum + l.response_time_ms, 0);
    const totalTokens = logs.reduce((sum, l) => sum + l.total_tokens, 0);
    const totalCost = logs.reduce((sum, l) => sum + l.estimated_cost, 0);

    return {
      totalUsage: logs.length,
      successRate: successCount / logs.length,
      avgResponseTime: totalResponseTime / logs.length,
      avgTokensPerRequest: totalTokens / logs.length,
      totalCost,
      lastUsed: logs[0]?.created_at,
    };
  }
}

export const modelDiscoveryService = new ModelDiscoveryService();
