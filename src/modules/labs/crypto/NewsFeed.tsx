/**
 * News Feed Component
 * Aggregated crypto news with sentiment analysis
 */

import React, { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { NewsArticle } from '../../../types/crypto';

const NewsFeed: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  useEffect(() => {
    // Mock news data - in production, this would fetch from a news API
    loadNews();
  }, []);

  const loadNews = async () => {
    // TODO: Integrate with actual news API (CryptoCompare, CoinTelegraph, etc.)
    // For now, return mock data
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
      {
        id: '2',
        title: 'Ethereum Upgrade Scheduled',
        description: 'The Ethereum network prepares for its next major upgrade, expected to improve scalability.',
        url: '#',
        source: 'CoinDesk',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        sentiment: 'neutral',
        sentimentScore: 0.1,
        coins: ['ETH'],
        category: 'Technology',
      },
    ];
    setArticles(mockArticles);
    setLoading(false);
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true;
    return article.sentiment === filter;
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'positive', 'negative', 'neutral'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              filter === f
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* News Articles */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <p className="text-gray-400">No news articles found.</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} formatTimeAgo={formatTimeAgo} />
          ))
        )}
      </div>
    </div>
  );
};

const NewsCard: React.FC<{ 
  article: NewsArticle; 
  formatTimeAgo: (date: string) => string;
}> = ({ article, formatTimeAgo }) => {
  const sentimentColor = 
    article.sentiment === 'positive' ? 'text-green-400' :
    article.sentiment === 'negative' ? 'text-red-400' :
    'text-gray-400';

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:bg-slate-800 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">{article.source}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(article.publishedAt)}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-gray-300">
              {article.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
          <p className="text-gray-400 mb-3">{article.description}</p>
          <div className="flex items-center gap-4">
            {article.coins.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Coins:</span>
                {article.coins.map(coin => (
                  <span key={coin} className="text-xs px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded">
                    {coin}
                  </span>
                ))}
              </div>
            )}
            <div className={`flex items-center gap-1 ${sentimentColor}`}>
              {article.sentiment === 'positive' ? (
                <TrendingUp className="w-4 h-4" />
              ) : article.sentiment === 'negative' ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span className="text-xs capitalize">{article.sentiment}</span>
            </div>
          </div>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default NewsFeed;

