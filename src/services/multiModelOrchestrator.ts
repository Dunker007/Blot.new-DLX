import { supabase } from '../lib/supabase';
import { LLMMessage, LLMResponse, llmService } from './llm';
import { Model, LLMProvider } from '../types';
import { contextManager } from './contextManager';

export interface TaskComplexity {
  level: 'simple' | 'moderate' | 'complex' | 'expert';
  score: number;
  factors: string[];
}

export interface ModelSelection {
  model: Model;
  provider: LLMProvider;
  reason: string;
  estimatedCost: number;
  estimatedTime: number;
}

export interface MultiModelStrategy {
  primary: ModelSelection;
  fallback?: ModelSelection;
  alternative?: ModelSelection;
}

export class MultiModelOrchestratorService {
  async analyzeTaskComplexity(userMessage: string): Promise<TaskComplexity> {
    let score = 0;
    const factors: string[] = [];

    const messageLength = userMessage.length;
    if (messageLength > 500) {
      score += 20;
      factors.push('Long, detailed request');
    }

    const complexKeywords = [
      'complex', 'advanced', 'architecture', 'optimize', 'refactor',
      'algorithm', 'system design', 'scalable', 'production',
      'enterprise', 'integration', 'migration', 'performance',
    ];

    const simpleKeywords = [
      'simple', 'basic', 'quick', 'small', 'fix', 'typo',
      'format', 'style', 'rename', 'comment',
    ];

    const lowerMessage = userMessage.toLowerCase();

    const complexMatches = complexKeywords.filter(k => lowerMessage.includes(k));
    if (complexMatches.length > 0) {
      score += complexMatches.length * 15;
      factors.push(`Complex keywords: ${complexMatches.join(', ')}`);
    }

    const simpleMatches = simpleKeywords.filter(k => lowerMessage.includes(k));
    if (simpleMatches.length > 0) {
      score -= simpleMatches.length * 10;
      factors.push(`Simple indicators: ${simpleMatches.join(', ')}`);
    }

    if (lowerMessage.includes('explain') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
      score += 10;
      factors.push('Requires explanation');
    }

    if (lowerMessage.includes('implement') || lowerMessage.includes('build') || lowerMessage.includes('create')) {
      score += 15;
      factors.push('Implementation required');
    }

    const codeBlockCount = (userMessage.match(/```/g) || []).length / 2;
    if (codeBlockCount > 0) {
      score += codeBlockCount * 10;
      factors.push(`${codeBlockCount} code block(s)`);
    }

    score = Math.max(0, Math.min(100, score));

    let level: TaskComplexity['level'];
    if (score < 25) level = 'simple';
    else if (score < 50) level = 'moderate';
    else if (score < 75) level = 'complex';
    else level = 'expert';

    return { level, score, factors };
  }

  async selectOptimalStrategy(
    messages: LLMMessage[],
    complexity: TaskComplexity
  ): Promise<MultiModelStrategy | null> {
    const { data: providers } = await supabase
      .from('llm_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    const { data: models } = await supabase
      .from('models')
      .select('*')
      .eq('is_available', true);

    if (!providers || !models || providers.length === 0 || models.length === 0) {
      return null;
    }

    const providerMap = new Map(providers.map(p => [p.id, p]));
    const availableModels = models.filter(m => providerMap.has(m.provider_id));

    let primaryModel: Model | undefined;
    let fallbackModel: Model | undefined;
    let alternativeModel: Model | undefined;

    switch (complexity.level) {
      case 'simple':
        primaryModel = availableModels.find(m =>
          m.use_case === 'general' && m.context_window < 16000
        ) || availableModels[0];
        fallbackModel = availableModels.find(m => m.id !== primaryModel?.id);
        break;

      case 'moderate':
        primaryModel = availableModels.find(m =>
          m.use_case === 'coding' || m.context_window >= 8000
        ) || availableModels[0];
        fallbackModel = availableModels.find(m =>
          m.id !== primaryModel?.id && m.context_window >= 4000
        );
        break;

      case 'complex':
        primaryModel = availableModels.find(m =>
          m.context_window >= 16000 && (m.use_case === 'coding' || m.use_case === 'analysis')
        ) || availableModels.sort((a, b) => b.context_window - a.context_window)[0];
        fallbackModel = availableModels.find(m =>
          m.id !== primaryModel?.id && m.context_window >= 8000
        );
        alternativeModel = availableModels.find(m =>
          m.id !== primaryModel?.id && m.id !== fallbackModel?.id
        );
        break;

      case 'expert':
        const expertModels = availableModels
          .filter(m => m.context_window >= 32000)
          .sort((a, b) => b.context_window - a.context_window);

        primaryModel = expertModels[0] || availableModels.sort((a, b) =>
          b.context_window - a.context_window
        )[0];

        fallbackModel = expertModels[1] || availableModels.find(m =>
          m.id !== primaryModel?.id && m.context_window >= 16000
        );

        alternativeModel = availableModels.find(m =>
          m.id !== primaryModel?.id && m.id !== fallbackModel?.id && m.context_window >= 8000
        );
        break;
    }

    if (!primaryModel) return null;

    const primaryProvider = providerMap.get(primaryModel.provider_id);
    if (!primaryProvider) return null;

    const strategy: MultiModelStrategy = {
      primary: {
        model: primaryModel,
        provider: primaryProvider,
        reason: `Best match for ${complexity.level} task`,
        estimatedCost: this.estimateCost(primaryModel, messages),
        estimatedTime: this.estimateResponseTime(primaryModel),
      },
    };

    if (fallbackModel) {
      const fallbackProvider = providerMap.get(fallbackModel.provider_id);
      if (fallbackProvider) {
        strategy.fallback = {
          model: fallbackModel,
          provider: fallbackProvider,
          reason: 'Fallback option if primary fails',
          estimatedCost: this.estimateCost(fallbackModel, messages),
          estimatedTime: this.estimateResponseTime(fallbackModel),
        };
      }
    }

    if (alternativeModel) {
      const alternativeProvider = providerMap.get(alternativeModel.provider_id);
      if (alternativeProvider) {
        strategy.alternative = {
          model: alternativeModel,
          provider: alternativeProvider,
          reason: 'Alternative approach',
          estimatedCost: this.estimateCost(alternativeModel, messages),
          estimatedTime: this.estimateResponseTime(alternativeModel),
        };
      }
    }

    return strategy;
  }

  async sendWithStrategy(
    messages: LLMMessage[],
    strategy: MultiModelStrategy,
    onStream?: (chunk: { content: string; done: boolean }) => void
  ): Promise<LLMResponse> {
    llmService.setProviders([strategy.primary.provider]);
    llmService.setModels([strategy.primary.model]);

    const optimizedMessages = this.optimizeMessagesForModel(messages, strategy.primary.model);

    try {
      const response = await llmService.sendMessage(
        optimizedMessages,
        strategy.primary.model.id,
        onStream,
        { trackUsage: true }
      );

      return response;
    } catch (error) {
      console.error('Primary model failed:', error);

      if (strategy.fallback) {
        console.log('Attempting fallback model...');
        llmService.setProviders([strategy.fallback.provider]);
        llmService.setModels([strategy.fallback.model]);

        const fallbackMessages = this.optimizeMessagesForModel(messages, strategy.fallback.model);

        try {
          return await llmService.sendMessage(
            fallbackMessages,
            strategy.fallback.model.id,
            onStream,
            { trackUsage: true }
          );
        } catch (fallbackError) {
          console.error('Fallback model also failed:', fallbackError);
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  private optimizeMessagesForModel(messages: LLMMessage[], model: Model): LLMMessage[] {
    const result = contextManager.optimizeContext(
      messages,
      model.context_window * 0.8,
      true
    );

    return result.optimizedMessages;
  }

  private estimateCost(model: Model, messages: LLMMessage[]): number {
    const tokens = contextManager.calculateContextUsage(messages);
    const isLocal = model.provider_id.includes('lm_studio') || model.provider_id.includes('ollama');

    if (isLocal) return 0;

    const estimatedOutputTokens = tokens * 0.5;
    const inputCost = (tokens / 1000) * 0.01;
    const outputCost = (estimatedOutputTokens / 1000) * 0.03;

    return inputCost + outputCost;
  }

  private estimateResponseTime(model: Model): number {
    if (model.performance_metrics?.avg_response_time) {
      return model.performance_metrics.avg_response_time;
    }

    const baseTime = 2000;
    const contextMultiplier = model.context_window / 8000;

    return baseTime * contextMultiplier;
  }

  async parallelQuery(
    messages: LLMMessage[],
    modelIds: string[]
  ): Promise<Map<string, LLMResponse>> {
    const results = new Map<string, LLMResponse>();

    const { data: models } = await supabase
      .from('models')
      .select('*, llm_providers!inner(*)')
      .in('id', modelIds)
      .eq('is_available', true)
      .eq('llm_providers.is_active', true);

    if (!models || models.length === 0) {
      return results;
    }

    const promises = models.map(async (model) => {
      const provider = model.llm_providers;
      llmService.setProviders([provider]);
      llmService.setModels([model]);

      const optimizedMessages = this.optimizeMessagesForModel(messages, model);

      try {
        const response = await llmService.sendMessage(
          optimizedMessages,
          model.id,
          undefined,
          { trackUsage: true }
        );
        return { modelId: model.id, response };
      } catch (error) {
        console.error(`Model ${model.id} failed:`, error);
        return null;
      }
    });

    const responses = await Promise.all(promises);

    responses.forEach(result => {
      if (result) {
        results.set(result.modelId, result.response);
      }
    });

    return results;
  }

  selectBestResponse(responses: Map<string, LLMResponse>): { modelId: string; response: LLMResponse } | null {
    if (responses.size === 0) return null;

    let best: { modelId: string; response: LLMResponse } | null = null;
    let highestScore = 0;

    for (const [modelId, response] of responses) {
      const score = this.scoreResponse(response);
      if (score > highestScore) {
        highestScore = score;
        best = { modelId, response };
      }
    }

    return best;
  }

  private scoreResponse(response: LLMResponse): number {
    let score = 50;

    const contentLength = response.content.length;
    if (contentLength > 100 && contentLength < 5000) {
      score += 20;
    }

    const codeBlocks = (response.content.match(/```/g) || []).length / 2;
    if (codeBlocks > 0) {
      score += 10;
    }

    if (response.content.includes('Error') || response.content.includes('I cannot')) {
      score -= 30;
    }

    const hasStructure =
      response.content.includes('\n\n') ||
      response.content.includes('1.') ||
      response.content.includes('-');

    if (hasStructure) {
      score += 10;
    }

    return score;
  }
}

export const multiModelOrchestrator = new MultiModelOrchestratorService();
