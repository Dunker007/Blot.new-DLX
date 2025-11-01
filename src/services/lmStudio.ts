/**
 * Direct LM Studio Service
 * 
 * Direct integration with LM Studio for immediate cost reduction
 * Bypasses bridge server complexity for faster implementation
 */

interface LMStudioModel {
  id: string;
  object: string;
  owned_by: string;
}

interface LMStudioResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

class LMStudioService {
  private readonly baseUrl = 'http://localhost:1234';

  // Check if LM Studio is available
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get available models
  async getModels(): Promise<LMStudioModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Failed to get LM Studio models:', error);
      return [];
    }
  }

  // Send chat completion request
  async chat(messages: Array<{role: string, content: string}>, options: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  } = {}): Promise<{
    content: string;
    tokens: number;
    model: string;
    cost_savings: string;
  }> {
    try {
      const models = await this.getModels();
      if (models.length === 0) {
        throw new Error('No models available in LM Studio');
      }

      const selectedModel = options.model || models[0].id;
      
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          max_tokens: options.max_tokens || 300,
          temperature: options.temperature || 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`LM Studio request failed: ${response.status}`);
      }

      const result: LMStudioResponse = await response.json();
      const content = result.choices?.[0]?.message?.content || 'No response';
      const tokens = result.usage?.total_tokens || 0;

      // Estimate cost savings (typical cloud API costs $0.002 per 1K tokens)
      const estimatedCloudCost = (tokens / 1000) * 0.002;
      const costSavings = `~$${estimatedCloudCost.toFixed(4)} saved`;

      return {
        content,
        tokens,
        model: `luxrig-${selectedModel}`,
        cost_savings: costSavings
      };

    } catch (error) {
      console.error('❌ LM Studio chat failed:', error);
      throw error;
    }
  }

  // Analyze task complexity for routing decisions
  analyzeComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
    const complexKeywords = ['analyze', 'research', 'detailed', 'comprehensive', 'strategy'];
    const simpleKeywords = ['hello', 'test', 'quick', 'simple', 'list'];
    
    const lower = prompt.toLowerCase();
    const complexCount = complexKeywords.filter(word => lower.includes(word)).length;
    const simpleCount = simpleKeywords.filter(word => lower.includes(word)).length;
    
    if (simpleCount > complexCount) return 'simple';
    if (complexCount > 2 || prompt.length > 500) return 'complex';
    return 'medium';
  }
}

export const lmStudioService = new LMStudioService();