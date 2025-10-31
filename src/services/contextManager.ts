import { LLMMessage } from './llm';

export interface ContextWindow {
  maxTokens: number;
  currentTokens: number;
  messages: LLMMessage[];
}

export interface ContextOptimizationResult {
  optimizedMessages: LLMMessage[];
  tokensRemoved: number;
  compressionRatio: number;
  strategy: string;
}

export class ContextManagerService {
  private readonly TOKENS_PER_CHAR = 0.25;

  estimateTokens(text: string): number {
    return Math.ceil(text.length * this.TOKENS_PER_CHAR);
  }

  calculateContextUsage(messages: LLMMessage[]): number {
    return messages.reduce((total, msg) => {
      return total + this.estimateTokens(msg.content);
    }, 0);
  }

  optimizeContext(
    messages: LLMMessage[],
    maxTokens: number,
    preserveSystemMessages: boolean = true
  ): ContextOptimizationResult {
    const currentTokens = this.calculateContextUsage(messages);

    if (currentTokens <= maxTokens) {
      return {
        optimizedMessages: messages,
        tokensRemoved: 0,
        compressionRatio: 1,
        strategy: 'no-optimization',
      };
    }

    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    let optimized: LLMMessage[];
    let strategy: string;

    const targetTokens = maxTokens - (preserveSystemMessages ? this.calculateContextUsage(systemMessages) : 0);

    if (conversationMessages.length > 20) {
      optimized = this.slidingWindowOptimization(conversationMessages, targetTokens);
      strategy = 'sliding-window';
    } else if (conversationMessages.length > 10) {
      optimized = this.selectiveRetention(conversationMessages, targetTokens);
      strategy = 'selective-retention';
    } else {
      optimized = this.truncateMessages(conversationMessages, targetTokens);
      strategy = 'truncation';
    }

    const finalMessages = preserveSystemMessages
      ? [...systemMessages, ...optimized]
      : optimized;

    const tokensRemoved = currentTokens - this.calculateContextUsage(finalMessages);
    const compressionRatio = this.calculateContextUsage(finalMessages) / currentTokens;

    return {
      optimizedMessages: finalMessages,
      tokensRemoved,
      compressionRatio,
      strategy,
    };
  }

  private slidingWindowOptimization(messages: LLMMessage[], targetTokens: number): LLMMessage[] {
    const recentMessages = messages.slice(-10);
    let currentTokens = this.calculateContextUsage(recentMessages);

    if (currentTokens <= targetTokens) {
      return recentMessages;
    }

    const result: LLMMessage[] = [];
    let tokens = 0;

    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msgTokens = this.estimateTokens(recentMessages[i].content);
      if (tokens + msgTokens <= targetTokens) {
        result.unshift(recentMessages[i]);
        tokens += msgTokens;
      } else {
        break;
      }
    }

    return result;
  }

  private selectiveRetention(messages: LLMMessage[], targetTokens: number): LLMMessage[] {
    const recentCount = Math.ceil(messages.length * 0.3);
    const recentMessages = messages.slice(-recentCount);

    const importantMessages = messages
      .slice(0, -recentCount)
      .filter(msg => this.isImportantMessage(msg));

    const combined = [...importantMessages, ...recentMessages];
    let currentTokens = this.calculateContextUsage(combined);

    if (currentTokens <= targetTokens) {
      return combined;
    }

    return this.slidingWindowOptimization(combined, targetTokens);
  }

  private isImportantMessage(message: LLMMessage): boolean {
    const importantKeywords = [
      'error', 'bug', 'fix', 'problem', 'issue',
      'important', 'critical', 'urgent',
      'requirement', 'must', 'need',
      'architecture', 'design', 'structure',
      'api', 'endpoint', 'database', 'schema',
    ];

    const content = message.content.toLowerCase();
    return importantKeywords.some(keyword => content.includes(keyword));
  }

  private truncateMessages(messages: LLMMessage[], targetTokens: number): LLMMessage[] {
    const result: LLMMessage[] = [];
    let tokens = 0;

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const msgTokens = this.estimateTokens(msg.content);

      if (tokens + msgTokens <= targetTokens) {
        result.unshift(msg);
        tokens += msgTokens;
      } else if (result.length === 0) {
        const availableChars = Math.floor(targetTokens / this.TOKENS_PER_CHAR);
        const truncatedContent = msg.content.slice(-availableChars) + '...';
        result.unshift({
          ...msg,
          content: truncatedContent,
        });
        break;
      } else {
        break;
      }
    }

    return result;
  }

  summarizeConversation(messages: LLMMessage[]): string {
    const conversationMessages = messages.filter(m => m.role !== 'system');

    if (conversationMessages.length === 0) {
      return 'Empty conversation';
    }

    const topics = this.extractTopics(conversationMessages);
    const keyPoints = this.extractKeyPoints(conversationMessages);

    let summary = 'Conversation Summary:\n\n';

    if (topics.length > 0) {
      summary += 'Topics Discussed:\n';
      topics.forEach((topic, idx) => {
        summary += `${idx + 1}. ${topic}\n`;
      });
      summary += '\n';
    }

    if (keyPoints.length > 0) {
      summary += 'Key Points:\n';
      keyPoints.forEach((point, idx) => {
        summary += `${idx + 1}. ${point}\n`;
      });
    }

    return summary;
  }

  private extractTopics(messages: LLMMessage[]): string[] {
    const topics = new Set<string>();
    const technicalTerms = [
      'api', 'database', 'frontend', 'backend', 'authentication',
      'deployment', 'testing', 'optimization', 'refactoring', 'bug',
      'feature', 'component', 'service', 'model', 'schema',
    ];

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      technicalTerms.forEach(term => {
        if (content.includes(term)) {
          topics.add(term.charAt(0).toUpperCase() + term.slice(1));
        }
      });
    });

    return Array.from(topics).slice(0, 5);
  }

  private extractKeyPoints(messages: LLMMessage[]): string[] {
    const keyPoints: string[] = [];
    const userMessages = messages.filter(m => m.role === 'user');

    userMessages.slice(0, 3).forEach(msg => {
      const firstSentence = msg.content.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length > 10 && firstSentence.length < 100) {
        keyPoints.push(firstSentence.trim());
      }
    });

    return keyPoints;
  }

  shouldCompressContext(currentTokens: number, maxTokens: number, threshold: number = 0.8): boolean {
    return currentTokens > maxTokens * threshold;
  }

  getContextStats(messages: LLMMessage[], maxTokens: number): {
    totalMessages: number;
    totalTokens: number;
    maxTokens: number;
    utilizationPercent: number;
    needsOptimization: boolean;
    systemMessages: number;
    userMessages: number;
    assistantMessages: number;
  } {
    const totalTokens = this.calculateContextUsage(messages);
    const systemMessages = messages.filter(m => m.role === 'system').length;
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;

    return {
      totalMessages: messages.length,
      totalTokens,
      maxTokens,
      utilizationPercent: (totalTokens / maxTokens) * 100,
      needsOptimization: this.shouldCompressContext(totalTokens, maxTokens),
      systemMessages,
      userMessages,
      assistantMessages,
    };
  }
}

export const contextManager = new ContextManagerService();
