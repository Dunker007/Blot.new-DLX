import { supabase } from '../lib/supabase';
import { llmService, LLMMessage } from './llm';
import { advancedCache } from './advancedCache';


export interface CodeContext {
  language: string;
  filename?: string;
  cursorPosition?: {
    line: number;
    column: number;
  };
  selectedText?: string;
  surroundingCode?: {
    before: string;
    after: string;
  };
  projectContext?: {
    framework: string;
    dependencies: string[];
    patterns: string[];
  };
  userIntent?: 'completion' | 'generation' | 'refactoring' | 'documentation' | 'testing';
}

export interface CodeSuggestion {
  id: string;
  type: 'completion' | 'function' | 'class' | 'import' | 'refactor' | 'fix' | 'generation';
  code: string;
  description: string;
  confidence: number;
  reasoning?: string;
  alternatives?: Array<{
    code: string;
    description: string;
    confidence: number;
  }>;
  metadata?: {
    tokensUsed: number;
    model: string;
    executionTime: number;
  };
}

export interface CodeAnalysis {
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    line?: number;
    column?: number;
    severity: number;
    fixSuggestion?: string;
  }>;
  complexity: {
    cyclomatic: number;
    cognitive: number;
    maintainability: number;
  };
  patterns: Array<{
    name: string;
    confidence: number;
    location: { start: number; end: number };
  }>;
  dependencies: string[];
  suggestions: CodeSuggestion[];
}

export class AICodeGenerationEngine {
  private codePatterns = new Map<string, string[]>();

  constructor() {
    this.loadCodePatterns();
  }

  /**
   * Generate intelligent code completion
   */
  async generateCompletion(
    context: CodeContext,
    maxSuggestions: number = 3
  ): Promise<CodeSuggestion[]> {
    const cacheKey = `completion_${this.hashContext(context)}`;
    
    // Check cache first
    const cached = advancedCache.get<CodeSuggestion[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const startTime = Date.now();
      
      // Build context-aware prompt
      const prompt = this.buildCompletionPrompt(context);
      
      // Get AI suggestions
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(context),
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await llmService.sendMessage(
        messages,
        'default', // Will be routed by provider router
        undefined,
        { trackUsage: true }
      );

      const suggestions = this.parseAISuggestions(response.content, context);
      const executionTime = Date.now() - startTime;

      // Add metadata
      suggestions.forEach(suggestion => {
        suggestion.metadata = {
          tokensUsed: response.tokens || 0,
          model: response.model,
          executionTime,
        };
      });

      // Cache the results
      advancedCache.set(cacheKey, suggestions, {
        ttl: 5 * 60 * 1000, // 5 minutes
        tags: ['code_completion', context.language],
      });

      // Store in database for analysis
      await this.storeSuggestions(suggestions, context);

      return suggestions.slice(0, maxSuggestions);
    } catch (error) {
      console.error('Failed to generate code completion:', error);
      return [];
    }
  }

  /**
   * Generate complete functions or classes
   */
  async generateCode(
    description: string,
    context: CodeContext,
    options: {
      includeTests?: boolean;
      includeDocumentation?: boolean;
      style?: 'functional' | 'oop' | 'auto';
    } = {}
  ): Promise<CodeSuggestion[]> {
    const cacheKey = `generation_${this.hashString(description)}_${this.hashContext(context)}`;
    
    const cached = advancedCache.get<CodeSuggestion[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const prompt = this.buildGenerationPrompt(description, context, options);
      
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: this.getGenerationSystemPrompt(context),
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await llmService.sendMessage(messages, 'default');
      const suggestions = this.parseGeneratedCode(response.content, context, description);

      // Cache results
      advancedCache.set(cacheKey, suggestions, {
        ttl: 15 * 60 * 1000, // 15 minutes
        tags: ['code_generation', context.language, 'ai_generated'],
      });

      await this.storeSuggestions(suggestions, context);

      return suggestions;
    } catch (error) {
      console.error('Failed to generate code:', error);
      return [];
    }
  }

  /**
   * Analyze code for issues and improvements
   */
  async analyzeCode(
    code: string,
    context: CodeContext
  ): Promise<CodeAnalysis> {
    const cacheKey = `analysis_${this.hashString(code)}`;
    
    const cached = advancedCache.get<CodeAnalysis>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Perform static analysis first
      const staticAnalysis = this.performStaticAnalysis(code, context);
      
      // Get AI insights
      const aiAnalysis = await this.getAIAnalysis(code, context);
      
      // Combine results
      const analysis: CodeAnalysis = {
        issues: [...(staticAnalysis.issues || []), ...(aiAnalysis.issues || [])],
        complexity: staticAnalysis.complexity || { cyclomatic: 0, cognitive: 0, maintainability: 0 },
        patterns: [...(staticAnalysis.patterns || []), ...(aiAnalysis.patterns || [])],
        dependencies: staticAnalysis.dependencies || [],
        suggestions: aiAnalysis.suggestions || [],
      };

      // Cache analysis
      advancedCache.set(cacheKey, analysis, {
        ttl: 30 * 60 * 1000, // 30 minutes
        tags: ['code_analysis', context.language],
      });

      return analysis;
    } catch (error) {
      console.error('Failed to analyze code:', error);
      return {
        issues: [],
        complexity: { cyclomatic: 0, cognitive: 0, maintainability: 0 },
        patterns: [],
        dependencies: [],
        suggestions: [],
      };
    }
  }

  /**
   * Suggest refactoring improvements
   */
  async suggestRefactoring(
    code: string,
    context: CodeContext,
    goals: ('performance' | 'readability' | 'maintainability' | 'security')[] = []
  ): Promise<CodeSuggestion[]> {
    const analysis = await this.analyzeCode(code, context);
    
    const prompt = this.buildRefactoringPrompt(code, context, analysis, goals);
    
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: 'You are an expert code refactoring assistant. Provide clear, safe refactoring suggestions.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await llmService.sendMessage(messages, 'default');
    return this.parseRefactoringSuggestions(response.content, context);
  }

  /**
   * Generate unit tests for code
   */
  async generateTests(
    code: string,
    context: CodeContext,
    testFramework?: string
  ): Promise<CodeSuggestion[]> {
    const framework = testFramework || this.detectTestFramework(context);
    
    const prompt = this.buildTestPrompt(code, context, framework);
    
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `Generate comprehensive unit tests using ${framework}. Focus on edge cases and error handling.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await llmService.sendMessage(messages, 'default');
    return this.parseTestSuggestions(response.content, context, framework);
  }

  private buildCompletionPrompt(context: CodeContext): string {
    let prompt = `Complete the following ${context.language} code:\n\n`;
    
    if (context.surroundingCode?.before) {
      prompt += `Before cursor:\n\`\`\`${context.language}\n${context.surroundingCode.before}\n\`\`\`\n\n`;
    }
    
    if (context.selectedText) {
      prompt += `Selected text: "${context.selectedText}"\n\n`;
    }
    
    if (context.surroundingCode?.after) {
      prompt += `After cursor:\n\`\`\`${context.language}\n${context.surroundingCode.after}\n\`\`\`\n\n`;
    }

    if (context.projectContext) {
      prompt += `Project context:\n- Framework: ${context.projectContext.framework}\n`;
      prompt += `- Dependencies: ${context.projectContext.dependencies.join(', ')}\n`;
    }

    prompt += 'Provide 1-3 intelligent completions with explanations.';
    
    return prompt;
  }

  private buildGenerationPrompt(
    description: string,
    context: CodeContext,
    options: any
  ): string {
    let prompt = `Generate ${context.language} code for: ${description}\n\n`;
    
    prompt += 'Requirements:\n';
    prompt += `- Language: ${context.language}\n`;
    
    if (context.projectContext) {
      prompt += `- Framework: ${context.projectContext.framework}\n`;
      prompt += `- Follow patterns: ${context.projectContext.patterns.join(', ')}\n`;
    }
    
    if (options.includeTests) {
      prompt += '- Include unit tests\n';
    }
    
    if (options.includeDocumentation) {
      prompt += '- Include documentation comments\n';
    }
    
    if (options.style) {
      prompt += `- Style: ${options.style}\n`;
    }

    prompt += '\nProvide clean, well-commented, production-ready code.';
    
    return prompt;
  }

  private buildRefactoringPrompt(
    code: string,
    context: CodeContext,
    analysis: CodeAnalysis,
    goals: string[]
  ): string {
    let prompt = `Refactor this ${context.language} code:\n\n`;
    prompt += `\`\`\`${context.language}\n${code}\n\`\`\`\n\n`;
    
    if (goals.length > 0) {
      prompt += `Goals: ${goals.join(', ')}\n\n`;
    }
    
    if (analysis.issues.length > 0) {
      prompt += 'Issues to address:\n';
      analysis.issues.forEach(issue => {
        prompt += `- ${issue.message}\n`;
      });
      prompt += '\n';
    }
    
    prompt += 'Provide refactored code with explanations for changes.';
    
    return prompt;
  }

  private buildTestPrompt(code: string, context: CodeContext, framework: string): string {
    return `Generate comprehensive unit tests for this ${context.language} code using ${framework}:\n\n` +
           `\`\`\`${context.language}\n${code}\n\`\`\`\n\n` +
           'Include tests for:\n' +
           '- Normal operation\n' +
           '- Edge cases\n' +
           '- Error conditions\n' +
           '- Boundary values\n\n' +
           'Make tests readable and maintainable.';
  }

  private getSystemPrompt(context: CodeContext): string {
    return `You are an expert ${context.language} developer. Provide intelligent, context-aware code completions. ` +
           'Consider best practices, performance, and maintainability. ' +
           'Format your response as JSON with suggestions array containing code, description, and confidence (0-1).';
  }

  private getGenerationSystemPrompt(context: CodeContext): string {
    return `You are a senior ${context.language} developer. Generate clean, efficient, production-ready code. ` +
           'Follow language conventions and best practices. ' +
           'Include proper error handling and documentation.';
  }

  private parseAISuggestions(content: string, _context: CodeContext): CodeSuggestion[] {
    try {
      const parsed = JSON.parse(content);
      return (parsed.suggestions || [parsed]).map((suggestion: any, index: number) => ({
        id: `suggestion_${Date.now()}_${index}`,
        type: 'completion',
        code: suggestion.code || '',
        description: suggestion.description || 'AI-generated completion',
        confidence: suggestion.confidence || 0.8,
        reasoning: suggestion.reasoning,
        alternatives: suggestion.alternatives || [],
      }));
    } catch {
      // Fallback parsing for non-JSON responses
      return [{
        id: `suggestion_${Date.now()}`,
        type: 'completion',
        code: this.extractCodeFromText(content),
        description: 'AI-generated completion',
        confidence: 0.7,
      }];
    }
  }

  private parseGeneratedCode(content: string, context: CodeContext, description: string): CodeSuggestion[] {
    const codeBlocks = this.extractCodeBlocks(content, context.language);
    
    return codeBlocks.map((code, index) => ({
      id: `generated_${Date.now()}_${index}`,
      type: 'generation',
      code,
      description: description,
      confidence: 0.85,
    }));
  }

  private parseRefactoringSuggestions(content: string, context: CodeContext): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];
    const codeBlocks = this.extractCodeBlocks(content, context.language);
    
    codeBlocks.forEach((code, index) => {
      suggestions.push({
        id: `refactor_${Date.now()}_${index}`,
        type: 'refactor',
        code,
        description: 'Refactored code',
        confidence: 0.8,
      });
    });

    return suggestions;
  }

  private parseTestSuggestions(content: string, context: CodeContext, framework: string): CodeSuggestion[] {
    const codeBlocks = this.extractCodeBlocks(content, context.language);
    
    return codeBlocks.map((code, index) => ({
      id: `test_${Date.now()}_${index}`,
      type: 'function',
      code,
      description: `Unit tests using ${framework}`,
      confidence: 0.85,
    }));
  }

  private extractCodeBlocks(text: string, language: string): string[] {
    const regex = new RegExp(`\`\`\`(?:${language})?\n?(.*?)\n?\`\`\``, 'gs');
    const blocks: string[] = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }
    
    return blocks;
  }

  private extractCodeFromText(text: string): string {
    // Try to extract code from various formats
    const codeMatch = text.match(/```[\s\S]*?```/);
    if (codeMatch) {
      return codeMatch[0].replace(/```\w*\n?/g, '').replace(/\n```/g, '');
    }
    
    return text.trim();
  }

  private performStaticAnalysis(code: string, _context: CodeContext): Partial<CodeAnalysis> {
    // Basic static analysis - can be expanded
    const lines = code.split('\n');
    const issues: any[] = [];
    const dependencies: string[] = [];
    
    // Simple pattern detection
    lines.forEach((line, index) => {
      // Check for common issues
      if (line.includes('console.log')) {
        issues.push({
          type: 'warning',
          message: 'Console.log statement found',
          line: index + 1,
          severity: 1,
        });
      }
      
      // Extract imports/dependencies
      if (line.includes('import') || line.includes('require(')) {
        const dep = line.match(/['"]([^'"]+)['"]/)?.[1];
        if (dep) dependencies.push(dep);
      }
    });
    
    return {
      issues,
      complexity: this.calculateComplexity(code),
      patterns: [],
      dependencies,
    };
  }

  private async getAIAnalysis(code: string, context: CodeContext): Promise<Partial<CodeAnalysis>> {
    const prompt = `Analyze this ${context.language} code for issues and improvements:\n\n` +
                  `\`\`\`${context.language}\n${code}\n\`\`\`\n\n` +
                  'Respond with JSON containing issues array and suggestions array.';
    
    try {
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: 'You are a code analysis expert. Identify issues, patterns, and improvement opportunities.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await llmService.sendMessage(messages, 'default');
      const analysis = JSON.parse(response.content);
      
      return {
        issues: analysis.issues || [],
        patterns: analysis.patterns || [],
        suggestions: analysis.suggestions || [],
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      return { issues: [], patterns: [], suggestions: [] };
    }
  }

  private calculateComplexity(code: string): { cyclomatic: number; cognitive: number; maintainability: number } {
    // Simplified complexity calculation
    const cyclomaticComplexity = (code.match(/if|while|for|switch|catch/g) || []).length + 1;
    const cognitiveComplexity = cyclomaticComplexity * 1.2; // Simplified
    const maintainability = Math.max(0, 100 - cyclomaticComplexity * 2);
    
    return {
      cyclomatic: cyclomaticComplexity,
      cognitive: Math.round(cognitiveComplexity),
      maintainability: Math.round(maintainability),
    };
  }

  private detectTestFramework(context: CodeContext): string {
    const language = context.language.toLowerCase();
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        return 'Jest';
      case 'python':
        return 'pytest';
      case 'java':
        return 'JUnit';
      case 'go':
        return 'testing';
      default:
        return 'standard';
    }
  }

  private async storeSuggestions(suggestions: CodeSuggestion[], context: CodeContext): Promise<void> {
    try {
      const records = suggestions.map(suggestion => ({
        suggestion_type: suggestion.type,
        context_code: context.surroundingCode?.before || '',
        suggested_code: suggestion.code,
        confidence_score: suggestion.confidence,
        model_used: suggestion.metadata?.model || 'unknown',
        tokens_used: suggestion.metadata?.tokensUsed || 0,
        metadata: {
          context,
          description: suggestion.description,
          reasoning: suggestion.reasoning,
        },
      }));

      await supabase
        .from('ai_suggestions')
        .insert(records);
    } catch (error) {
      console.error('Failed to store suggestions:', error);
    }
  }

  private loadCodePatterns(): void {
    // Load common patterns for different languages
    this.codePatterns.set('javascript', [
      'async/await pattern',
      'promise chain',
      'module pattern',
      'class pattern',
    ]);
    
    this.codePatterns.set('typescript', [
      'interface pattern',
      'generic pattern',
      'decorator pattern',
      'type guard pattern',
    ]);
    
    this.codePatterns.set('python', [
      'class pattern',
      'decorator pattern',
      'context manager',
      'generator pattern',
    ]);
  }

  private hashContext(context: CodeContext): string {
    return this.hashString(JSON.stringify(context));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

export const aiCodeEngine = new AICodeGenerationEngine();