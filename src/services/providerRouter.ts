import { supabase } from '../lib/supabase';
import { EnhancedLLMProvider, EnhancedModel, ProviderConfig } from '../types';
import { tokenTrackingService } from './tokenTracking';

export interface RouterOptions {
  useCase?: 'coding' | 'analysis' | 'creative' | 'general';
  maxCost?: number;
  preferLocal?: boolean;
  requireFree?: boolean;
  minContextWindow?: number;
}

export interface RoutingResult {
  provider: EnhancedLLMProvider;
  model: EnhancedModel;
  config: ProviderConfig | null;
  reason: string;
}

export class ProviderRouterService {
  async selectBestProvider(options: RouterOptions = {}): Promise<RoutingResult | null> {
    const providers = await this.getAvailableProviders();
    const models = await this.getAvailableModels();

    if (providers.length === 0 || models.length === 0) {
      console.error('No providers or models available');
      return null;
    }

    let candidates = models.filter(model => {
      if (options.useCase && model.use_case !== options.useCase && model.use_case !== 'general') {
        return false;
      }

      if (options.minContextWindow && model.context_window < options.minContextWindow) {
        return false;
      }

      if (options.preferLocal && !model.is_local) {
        return false;
      }

      if (options.requireFree && model.cost_tier !== 'free') {
        return false;
      }

      return true;
    });

    if (candidates.length === 0) {
      candidates = models;
    }

    for (const model of candidates) {
      const provider = providers.find(p => p.id === model.provider_id);
      if (!provider || !provider.is_active || provider.health_status === 'down') {
        continue;
      }

      const config = await tokenTrackingService.getProviderConfig(provider.id);

      if (options.maxCost && config && !config.is_free) {
        const estimatedCost = this.estimateRequestCost(config);
        if (estimatedCost > options.maxCost) {
          continue;
        }
      }

      return {
        provider,
        model,
        config,
        reason: this.generateSelectionReason(provider, model, options),
      };
    }

    const fallbackModel = candidates[0];
    const fallbackProvider = providers.find(p => p.id === fallbackModel.provider_id);

    if (!fallbackProvider) {
      return null;
    }

    const config = await tokenTrackingService.getProviderConfig(fallbackProvider.id);

    return {
      provider: fallbackProvider,
      model: fallbackModel,
      config,
      reason: 'Fallback selection - first available provider',
    };
  }

  async getAvailableProviders(): Promise<EnhancedLLMProvider[]> {
    const { data, error } = await supabase
      .from('llm_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Failed to get providers:', error);
      return [];
    }

    return (data || []) as EnhancedLLMProvider[];
  }

  async getAvailableModels(): Promise<EnhancedModel[]> {
    const providers = await this.getAvailableProviders();
    const providerIds = providers.map(p => p.id);

    if (providerIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('models')
      .select('*')
      .in('provider_id', providerIds)
      .eq('is_available', true);

    if (error) {
      console.error('Failed to get models:', error);
      return [];
    }

    return (data || []) as EnhancedModel[];
  }

  async checkProviderHealth(providerId: string): Promise<boolean> {
    try {
      const { data: provider } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (!provider) {
        return false;
      }

      const response = await fetch(`${provider.endpoint_url}/v1/models`, {
        method: 'GET',
        headers: provider.api_key ? {
          'Authorization': `Bearer ${provider.api_key}`,
        } : {},
        signal: AbortSignal.timeout(5000),
      });

      const isHealthy = response.ok;

      await supabase
        .from('llm_providers')
        .update({
          health_status: isHealthy ? 'healthy' : 'down',
          last_health_check: new Date().toISOString(),
        })
        .eq('id', providerId);

      return isHealthy;
    } catch (error) {
      console.error('Health check failed:', error);

      await supabase
        .from('llm_providers')
        .update({
          health_status: 'down',
          last_health_check: new Date().toISOString(),
        })
        .eq('id', providerId);

      return false;
    }
  }

  async performHealthChecks(): Promise<void> {
    const providers = await this.getAvailableProviders();

    await Promise.all(
      providers.map(provider => this.checkProviderHealth(provider.id))
    );
  }

  private estimateRequestCost(config: ProviderConfig, avgTokens: number = 1000): number {
    const inputTokens = avgTokens * 0.4;
    const outputTokens = avgTokens * 0.6;

    return tokenTrackingService.calculateCost(inputTokens, outputTokens, config);
  }

  private generateSelectionReason(
    provider: EnhancedLLMProvider,
    model: EnhancedModel,
    options: RouterOptions
  ): string {
    const reasons: string[] = [];

    if (options.preferLocal && model.is_local) {
      reasons.push('local model preferred');
    }

    if (options.requireFree && model.cost_tier === 'free') {
      reasons.push('free model required');
    }

    if (options.useCase && model.use_case === options.useCase) {
      reasons.push(`optimized for ${options.useCase}`);
    }

    if (provider.priority === 1) {
      reasons.push('highest priority');
    }

    if (model.is_local) {
      reasons.push('no API costs');
    }

    if (reasons.length === 0) {
      return `Selected ${model.display_name} on ${provider.name}`;
    }

    return `Selected ${model.display_name}: ${reasons.join(', ')}`;
  }

  async getProviderStats(): Promise<{
    total: number;
    healthy: number;
    degraded: number;
    down: number;
    local: number;
    cloud: number;
  }> {
    const { data } = await supabase
      .from('llm_providers')
      .select('health_status, provider_type');

    if (!data) {
      return { total: 0, healthy: 0, degraded: 0, down: 0, local: 0, cloud: 0 };
    }

    return data.reduce((acc, provider) => {
      acc.total++;

      if (provider.health_status === 'healthy') acc.healthy++;
      if (provider.health_status === 'degraded') acc.degraded++;
      if (provider.health_status === 'down') acc.down++;

      if (provider.provider_type === 'local') acc.local++;
      if (provider.provider_type === 'cloud') acc.cloud++;

      return acc;
    }, { total: 0, healthy: 0, degraded: 0, down: 0, local: 0, cloud: 0 });
  }
}

export const providerRouter = new ProviderRouterService();
