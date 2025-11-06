/**
 * News Service
 * Aggregates crypto news from multiple sources
 */

import { NewsArticle } from '../../types/crypto';

const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data/v2/news/';

class NewsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 300000; // 5 minutes

  /**
   * Get latest crypto news
   */
  async getLatestNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      const cached = this.getCached(`news-${limit}`);
      if (cached) return cached;

      // TODO: Integrate with CryptoCompare or similar API
      // For now, return mock data structure
      const mockArticles: NewsArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Reaches New All-Time High',
          description: 'Bitcoin has surged past previous records, reaching new heights in the cryptocurrency market.',
          url: '#',
          source: 'CryptoNews',
          publishedAt: new Date().toISOString(),
          sentiment: 'positive',
          sentimentScore: 0.85,
          coins: ['BTC'],
          category: 'Market',
        },
      ];

      this.setCache(`news-${limit}`, mockArticles);
      return mockArticles;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return [];
    }
  }

  /**
   * Get news for specific coin
   */
  async getNewsForCoin(coinSymbol: string, limit: number = 10): Promise<NewsArticle[]> {
    try {
      const allNews = await this.getLatestNews(100);
      return allNews
        .filter(article => article.coins.includes(coinSymbol))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch news for coin:', error);
      return [];
    }
  }

  /**
   * Analyze sentiment of news article
   */
  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number }> {
    // TODO: Integrate with sentiment analysis API or use AI
    // Simplified mock implementation
    const positiveWords = ['surge', 'rally', 'bullish', 'gain', 'up', 'rise'];
    const negativeWords = ['crash', 'drop', 'bearish', 'loss', 'down', 'fall'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', score: 0.6 + (positiveCount * 0.1) };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', score: 0.4 - (negativeCount * 0.1) };
    }
    return { sentiment: 'neutral', score: 0.5 };
  }

  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export const newsService = new NewsService();

