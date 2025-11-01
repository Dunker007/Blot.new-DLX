import { storage } from '../lib/storage';
import { llmService } from './llm';
import { lmStudioService } from './lmStudio';
import type { Message, LLMProvider, Model } from '../types';

interface SimpleMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SimpleResponse {
  content: string;
  model?: string;
  tokens?: number;
}

interface TaskComplexity {
  level: 'simple' | 'moderate' | 'complex' | 'expert';
  estimatedTokens: number;
  confidence: number;
}

interface ModelStrategy {
  modelId: string;
  providerId: string;
  reason: string;
  estimatedCost: number;
}

class MultiModelOrchestratorService {
  private readonly luxrigBridgeUrl = 'http://localhost:3002';

  // Check if LuxRig bridge is available
  async checkLuxrigAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.luxrigBridgeUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Simple task analysis based on content
  analyzeTaskComplexity(messages: SimpleMessage[]): TaskComplexity {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toLowerCase();
    
    // Simple keyword-based analysis
    const complexKeywords = [
      'analyze', 'compare', 'research', 'detailed', 'comprehensive'
    ];
    
    const expertKeywords = [
      'algorithm', 'optimization', 'machine learning', 'advanced'
    ];

    const estimatedTokens = content.length * 0.75;

    if (expertKeywords.some(keyword => content.includes(keyword))) {
      return { level: 'expert', estimatedTokens: Math.max(estimatedTokens, 2000), confidence: 0.8 };
    }

    if (complexKeywords.some(keyword => content.includes(keyword))) {
      return { level: 'complex', estimatedTokens: Math.max(estimatedTokens, 1000), confidence: 0.7 };
    }

    if (estimatedTokens > 800) {
      return { level: 'moderate', estimatedTokens, confidence: 0.6 };
    }

    return { level: 'simple', estimatedTokens: Math.max(estimatedTokens, 300), confidence: 0.9 };
  }

  // Fast model selection
  async selectOptimalStrategy(
    messages: SimpleMessage[],
    complexity: TaskComplexity
  ): Promise<ModelStrategy | null> {
    // Try to get models from storage
    const { data: models } = await storage.select('models');
    
    if (!models || models.length === 0) {
      // Return default strategy
      return {
        modelId: 'gpt-3.5-turbo',
        providerId: 'openai',
        reason: 'Default configuration',
        estimatedCost: 0.01
      };
    }

    const availableModels = (models as Model[]).filter(m => m.is_available);
    
    if (availableModels.length === 0) {
      return null;
    }

    let selectedModel: Model;

    // Simple selection logic
    switch (complexity.level) {
      case 'simple':
        // Use first available model (simplest approach)
        selectedModel = availableModels[0];
        break;
        
      case 'moderate':
        // Use model with good context window
        selectedModel = availableModels
          .filter(m => m.context_window >= 8000)[0] || availableModels[0];
        break;
        
      case 'complex':
      case 'expert':
        // Use model with largest context window
        selectedModel = availableModels
          .sort((a, b) => b.context_window - a.context_window)[0];
        break;
        
      default:
        selectedModel = availableModels[0];
    }

    return {
      modelId: selectedModel.model_name,
      providerId: selectedModel.provider_id,
      reason: `Selected for ${complexity.level} task`,
      estimatedCost: this.estimateCost(complexity.estimatedTokens)
    };
  }

  // Route to LuxRig bridge for cost optimization
  async routeToLuxrig(messages: SimpleMessage[]): Promise<SimpleResponse> {
    try {
      const response = await fetch(`${this.luxrigBridgeUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error(`LuxRig bridge error: ${response.status}`);
      }

      const result = await response.json();
      const message = result.choices?.[0]?.message?.content || 'No response';
      
      return {
        content: message,
        model: result.luxrig_metadata?.routed_to === 'local' ? 'luxrig-local' : 'luxrig-fallback',
        tokens: result.usage?.total_tokens || 0
      };
    } catch (error) {
      console.warn('❌ LuxRig routing failed:', error);
      throw error;
    }
  }

  // Main orchestration method
  async orchestrate(
    messages: SimpleMessage[],
    onStream?: (chunk: { content: string; done: boolean }) => void
  ): Promise<SimpleResponse> {
    try {
      // Check all options in parallel for faster response
      const [lmStudioAvailable, luxrigAvailable] = await Promise.all([
        lmStudioService.isAvailable(),
        this.checkLuxrigAvailability()
      ]);

      // 1. Try direct LM Studio connection for immediate cost savings
      if (lmStudioAvailable) {
        const lastMessage = messages[messages.length - 1];
        const complexity = lmStudioService.analyzeComplexity(lastMessage.content);
        
        // Route simple and medium tasks to LM Studio
        if (complexity === 'simple' || complexity === 'medium') {
          try {
            console.log(`🏠 Routing ${complexity} task to LuxRig LM Studio...`);
            const result = await lmStudioService.chat(messages);
            
            console.log(`💰 Cost savings: ${result.cost_savings}`);
            
            return {
              content: result.content,
              model: result.model,
              tokens: result.tokens
            };
          } catch (error) {
            console.warn('⚠️ LM Studio failed, falling back to cloud...', error);
          }
        } else {
          console.log(`☁️ Complex task detected, using cloud APIs for better results...`);
        }
      }

      // 2. Try LuxRig bridge as secondary option
      if (luxrigAvailable) {
        try {
          console.log('🌉 Routing to LuxRig bridge...');
          return await this.routeToLuxrig(messages);
        } catch (error) {
          console.warn('⚠️ LuxRig bridge failed, falling back to cloud...', error);
        }
      }

      // 3. Fallback to original logic with parallel strategy analysis
      const [complexity, strategyResult] = await Promise.all([
        Promise.resolve(this.analyzeTaskComplexity(messages)),
        this.selectOptimalStrategy(messages, this.analyzeTaskComplexity(messages))
      ]);
      
      const strategy = strategyResult;
      if (!strategy) {
        throw new Error('No suitable model strategy found');
      }

      // 4. Execute with selected model
      const response = await llmService.sendMessage(
        messages,
        strategy.modelId,
        onStream
      );

      return {
        content: response.content,
        model: strategy.modelId,
        tokens: response.tokens || 0
      };
      
    } catch (error) {
      console.error('Orchestration failed:', error);
      throw error;
    }
  }

  // Simple cost estimation
  private estimateCost(estimatedTokens: number): number {
    // Simple flat rate estimation
    return (estimatedTokens / 1000) * 0.002; // $0.002 per 1K tokens
  }

  // Utility: Convert Message[] to SimpleMessage[]
  convertMessages(messages: Message[]): SimpleMessage[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const { data: models } = await storage.select('models');
      return !!(models && models.length > 0);
    } catch {
      return false;
    }
  }
}

export const multiModelOrchestratorService = new MultiModelOrchestratorService();