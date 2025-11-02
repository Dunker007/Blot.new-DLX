/**
 * Streamlined Business Model Generator
 *
 * Simplified premium feature that generates business models using direct AI calls.
 * No complex multi-agent workflows - fast and efficient.
 */
import { storage } from '../lib/storage';
import { llmService } from './llm';

export interface BusinessModelInput {
  industry: string;
  targetMarket: string;
  uniqueValue: string;
  initialBudget: number;
  timeframe: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  niche?: string;
  targetAudience?: string;
  budget?: string;
  timeline?: string;
  preferredModels?: string[];
}

export interface BusinessModel {
  id: string;
  title?: string;
  description?: string;
  confidence?: number;
  executiveSummary: string;
  valueProposition: string;
  targetCustomers: string[];
  revenueStreams: RevenueStream[];
  marketAnalysis: MarketAnalysis;
  competitiveAnalysis: CompetitiveAnalysis;
  implementationPlan: ImplementationPlan;
  financialProjections: FinancialProjections;
  riskAssessment: RiskAssessment;
  generatedAt: Date;
}

interface RevenueStream {
  name: string;
  description: string;
  projectedRevenue: number;
  timeToRealize: string;
  confidence: 'high' | 'medium' | 'low';
}

interface MarketAnalysis {
  marketSize: string;
  growthRate: string;
  trends: string[];
  opportunities: string[];
}

interface CompetitiveAnalysis {
  competitors: string[];
  advantages: string[];
  threats: string[];
  differentiation: string;
}

interface ImplementationPlan {
  phases: Phase[];
  timeline: string;
  resources: string[];
  milestones: string[];
}

interface Phase {
  name: string;
  duration: string;
  tasks: string[];
  budget: number;
}

export interface FinancialProjections {
  yearOne: number;
  yearTwo: number;
  yearThree: number;
  breakEvenPoint: string;
  roi: number;
  month1?: number;
  month3?: number;
  month6?: number;
  month12?: number;
}

interface RiskAssessment {
  risks: Risk[];
  mitigation: string[];
}

interface Risk {
  risk: string;
  impact: 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
}

class BusinessModelGeneratorService {
  async generateBusinessModel(
    input: BusinessModelInput,
    onProgress?: (step: string, progress: number) => void
  ): Promise<BusinessModel> {
    const startTime = Date.now();

    try {
      if (onProgress) onProgress('Analyzing market opportunity...', 10);

      // Generate comprehensive business model in one efficient call
      const businessModelPrompt = this.createBusinessModelPrompt(input);

      if (onProgress) onProgress('Generating business model...', 30);

      const response = await llmService.sendMessage(
        [
          {
            role: 'system',
            content:
              'You are a world-class business consultant specializing in creating comprehensive, actionable business models. Provide detailed, practical, and realistic business plans with specific numbers and actionable steps.',
          },
          {
            role: 'user',
            content: businessModelPrompt,
          },
        ],
        'gpt-4'
      );

      if (onProgress) onProgress('Processing analysis...', 70);

      // Parse and structure the response
      const businessModel = this.parseBusinessModelResponse(response.content, input);

      if (onProgress) onProgress('Finalizing business model...', 90);

      // Save to storage
      await storage.insert('business_models', {
        ...businessModel,
        input_data: input,
        generation_time_ms: Date.now() - startTime,
      });

      if (onProgress) onProgress('Complete!', 100);

      return businessModel;
    } catch (error) {
      console.error('Business model generation failed:', error);
      throw new Error(`Failed to generate business model: ${error}`);
    }
  }

  private createBusinessModelPrompt(input: BusinessModelInput): string {
    return `
Create a comprehensive business model for the following:

**Industry:** ${input.industry}
**Target Market:** ${input.targetMarket}
**Unique Value Proposition:** ${input.uniqueValue}
**Initial Budget:** $${input.initialBudget.toLocaleString()}
**Timeline:** ${input.timeframe}
**Experience Level:** ${input.experience}

Please provide a detailed business model in JSON format with the following structure:

{
  "executiveSummary": "Brief 2-3 paragraph summary",
  "valueProposition": "Clear value proposition statement",
  "targetCustomers": ["customer segment 1", "customer segment 2"],
  "revenueStreams": [
    {
      "name": "Revenue stream name",
      "description": "How this generates revenue", 
      "projectedRevenue": 50000,
      "timeToRealize": "3-6 months",
      "confidence": "high"
    }
  ],
  "marketAnalysis": {
    "marketSize": "$X billion market size",
    "growthRate": "X% annual growth",
    "trends": ["trend 1", "trend 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  },
  "competitiveAnalysis": {
    "competitors": ["competitor 1", "competitor 2"],
    "advantages": ["advantage 1", "advantage 2"],
    "threats": ["threat 1", "threat 2"],
    "differentiation": "Key differentiator"
  },
  "implementationPlan": {
    "phases": [
      {
        "name": "Phase 1: Launch",
        "duration": "3 months",
        "tasks": ["task 1", "task 2"],
        "budget": 25000
      }
    ],
    "timeline": "12 months to full operation",
    "resources": ["resource 1", "resource 2"],
    "milestones": ["milestone 1", "milestone 2"]
  },
  "financialProjections": {
    "yearOne": 100000,
    "yearTwo": 250000,
    "yearThree": 500000,
    "breakEvenPoint": "Month 8",
    "roi": 300
  },
  "riskAssessment": {
    "risks": [
      {
        "risk": "Market competition",
        "impact": "high",
        "probability": "medium"
      }
    ],
    "mitigation": ["mitigation strategy 1", "mitigation strategy 2"]
  }
}

Make all numbers realistic and specific to the industry and budget provided.
`;
  }

  private parseBusinessModelResponse(response: string, input: BusinessModelInput): BusinessModel {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        id: `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        executiveSummary: parsed.executiveSummary || 'Executive summary not provided',
        valueProposition: parsed.valueProposition || input.uniqueValue,
        targetCustomers: parsed.targetCustomers || [input.targetMarket],
        revenueStreams: parsed.revenueStreams || [],
        marketAnalysis: parsed.marketAnalysis || {
          marketSize: 'Market size analysis pending',
          growthRate: 'Growth rate analysis pending',
          trends: [],
          opportunities: [],
        },
        competitiveAnalysis: parsed.competitiveAnalysis || {
          competitors: [],
          advantages: [],
          threats: [],
          differentiation: 'Differentiation analysis pending',
        },
        implementationPlan: parsed.implementationPlan || {
          phases: [],
          timeline: input.timeframe,
          resources: [],
          milestones: [],
        },
        financialProjections: parsed.financialProjections || {
          yearOne: 0,
          yearTwo: 0,
          yearThree: 0,
          breakEvenPoint: 'TBD',
          roi: 0,
        },
        riskAssessment: parsed.riskAssessment || {
          risks: [],
          mitigation: [],
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to parse business model response:', error);

      // Fallback: Create basic model from input
      return {
        id: `bm_${Date.now()}_fallback`,
        executiveSummary: `Business model for ${input.industry} targeting ${input.targetMarket}`,
        valueProposition: input.uniqueValue,
        targetCustomers: [input.targetMarket],
        revenueStreams: [],
        marketAnalysis: {
          marketSize: 'Analysis required',
          growthRate: 'Analysis required',
          trends: [],
          opportunities: [],
        },
        competitiveAnalysis: {
          competitors: [],
          advantages: [],
          threats: [],
          differentiation: input.uniqueValue,
        },
        implementationPlan: {
          phases: [],
          timeline: input.timeframe,
          resources: [],
          milestones: [],
        },
        financialProjections: {
          yearOne: 0,
          yearTwo: 0,
          yearThree: 0,
          breakEvenPoint: 'TBD',
          roi: 0,
        },
        riskAssessment: {
          risks: [],
          mitigation: [],
        },
        generatedAt: new Date(),
      };
    }
  }

  // Get saved business models
  async getBusinessModels(limit = 10): Promise<BusinessModel[]> {
    const { data } = await storage.select('business_models');
    if (!data) return [];

    return (data as any[])
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, limit);
  }

  // Simple premium check (in-memory for now)
  checkPremiumAccess(_userId: string): boolean {
    // For now, always allow access in streamlined version
    return true;
  }
}

export const businessModelGeneratorService = new BusinessModelGeneratorService();
