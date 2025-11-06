/**
 * Social Sentiment Component
 * Twitter/Reddit sentiment analysis
 */

import React, { useState, useEffect } from 'react';
import { Twitter, MessageCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Coin } from '../../../types/crypto';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

interface SentimentData {
  coin: string;
  twitterSentiment: number;
  redditSentiment: number;
  socialVolume: number;
  influencerMentions: number;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
}

const SocialSentiment: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSentiment();
  }, [selectedCoin]);

  const loadSentiment = async () => {
    setLoading(true);
    // TODO: Integrate with actual social sentiment API
    // For now, return mock data
    setTimeout(() => {
      const mockSentiment: SentimentData = {
        coin: selectedCoin,
        twitterSentiment: 65 + Math.random() * 20 - 10,
        redditSentiment: 60 + Math.random() * 20 - 10,
        socialVolume: Math.floor(50000 + Math.random() * 100000),
        influencerMentions: Math.floor(100 + Math.random() * 200),
        overallSentiment: Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral',
      };
      setSentiment(mockSentiment);
      setLoading(false);
    }, 500);
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return 'text-green-400';
    if (sentiment >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 60) return 'Bullish';
    if (sentiment >= 40) return 'Neutral';
    return 'Bearish';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!sentiment) {
    return (
      <div className="p-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">Unable to load sentiment data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Coin Selector */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Select Coin</label>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="w-full md:w-64 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
        >
          <option value="bitcoin">Bitcoin (BTC)</option>
          <option value="ethereum">Ethereum (ETH)</option>
          <option value="solana">Solana (SOL)</option>
        </select>
      </div>

      {/* Overall Sentiment */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Overall Sentiment</h3>
        <div className="flex items-center justify-center">
          <div className={`text-6xl font-bold ${
            sentiment.overallSentiment === 'bullish' ? 'text-green-400' :
            sentiment.overallSentiment === 'bearish' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {sentiment.overallSentiment === 'bullish' ? '📈' :
             sentiment.overallSentiment === 'bearish' ? '📉' :
             '➡️'}
          </div>
          <div className="ml-4">
            <div className={`text-3xl font-bold capitalize ${
              sentiment.overallSentiment === 'bullish' ? 'text-green-400' :
              sentiment.overallSentiment === 'bearish' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {sentiment.overallSentiment}
            </div>
            <div className="text-sm text-gray-400">Market Sentiment</div>
          </div>
        </div>
      </div>

      {/* Platform Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Twitter className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Twitter/X Sentiment</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Sentiment Score</span>
                <span className={`text-lg font-bold ${getSentimentColor(sentiment.twitterSentiment)}`}>
                  {sentiment.twitterSentiment.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    sentiment.twitterSentiment >= 60 ? 'bg-green-500' :
                    sentiment.twitterSentiment >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${sentiment.twitterSentiment}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getSentimentLabel(sentiment.twitterSentiment)}
              </p>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Mentions (24h)</div>
              <div className="text-2xl font-bold text-white">
                {sentiment.influencerMentions.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Reddit Sentiment</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Sentiment Score</span>
                <span className={`text-lg font-bold ${getSentimentColor(sentiment.redditSentiment)}`}>
                  {sentiment.redditSentiment.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    sentiment.redditSentiment >= 60 ? 'bg-green-500' :
                    sentiment.redditSentiment >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${sentiment.redditSentiment}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getSentimentLabel(sentiment.redditSentiment)}
              </p>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Social Volume</div>
              <div className="text-2xl font-bold text-white">
                {sentiment.socialVolume.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Trends */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            <strong className="text-white">Twitter/X:</strong> {sentiment.twitterSentiment >= 60 
              ? 'Strong positive sentiment on Twitter/X. Community is bullish.'
              : sentiment.twitterSentiment >= 40
              ? 'Mixed sentiment on Twitter/X. Community is neutral.'
              : 'Negative sentiment on Twitter/X. Community is bearish.'}
          </p>
          <p>
            <strong className="text-white">Reddit:</strong> {sentiment.redditSentiment >= 60
              ? 'Strong positive sentiment on Reddit. Active discussion and engagement.'
              : sentiment.redditSentiment >= 40
              ? 'Mixed sentiment on Reddit. Moderate discussion levels.'
              : 'Negative sentiment on Reddit. Community concerns visible.'}
          </p>
          <p>
            <strong className="text-white">Overall:</strong> Social media sentiment is {sentiment.overallSentiment}.
            {sentiment.socialVolume > 100000 && ' High social volume indicates strong community interest.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialSentiment;

