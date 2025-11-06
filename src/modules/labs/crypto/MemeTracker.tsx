/**
 * Meme Tracker Component
 * Track trending meme coins with virality scores and sentiment
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Flame, AlertTriangle } from 'lucide-react';
import { MemeCoin } from '../../../types/crypto';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const MemeTracker: React.FC = () => {
  const [memeCoins, setMemeCoins] = useState<MemeCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemeCoins();
  }, []);

  const loadMemeCoins = async () => {
    // TODO: Integrate with actual meme coin data source
    // For now, use trending coins as a proxy
    try {
      const trending = await cryptoApiService.getTrendingCoins();
      const memeCoins: MemeCoin[] = trending.slice(0, 20).map((coin, index) => ({
        symbol: coin.symbol,
        name: coin.name,
        price: coin.current_price,
        marketCap: coin.market_cap,
        change24h: coin.price_change_percentage_24h,
        viralityScore: Math.random() * 100,
        socialMentions: Math.floor(Math.random() * 100000),
        sentiment: coin.price_change_percentage_24h >= 0 ? 'bullish' : 'bearish',
        pumpRisk: index < 5 ? 'high' : index < 10 ? 'medium' : 'low',
      }));
      setMemeCoins(memeCoins);
    } catch (error) {
      console.error('Failed to load meme coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPrice = (value: number) => {
    if (value >= 1) return value.toFixed(4);
    if (value >= 0.0001) return value.toFixed(6);
    return value.toFixed(8);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Trending Meme Coins</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Track viral meme coins. High virality scores indicate social media buzz. Pump risk indicates potential for sudden price movements.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Coin</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">24h Change</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Market Cap</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Virality</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Sentiment</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Pump Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {memeCoins.map((coin, index) => (
                <tr key={coin.symbol} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">{coin.name}</div>
                      <div className="text-sm text-gray-400">{coin.symbol.toUpperCase()}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-medium">
                    ${formatPrice(coin.price)}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {formatCurrency(coin.marketCap)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Flame className={`w-4 h-4 ${
                        coin.viralityScore > 70 ? 'text-orange-400' :
                        coin.viralityScore > 40 ? 'text-yellow-400' :
                        'text-gray-400'
                      }`} />
                      <span className="text-white">{coin.viralityScore.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      coin.sentiment === 'bullish' ? 'bg-green-600/20 text-green-400' :
                      coin.sentiment === 'bearish' ? 'bg-red-600/20 text-red-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {coin.sentiment}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {coin.pumpRisk === 'high' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      <span className={`text-xs ${
                        coin.pumpRisk === 'high' ? 'text-red-400' :
                        coin.pumpRisk === 'medium' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        {coin.pumpRisk.toUpperCase()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-orange-600/10 border border-orange-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-orange-400 font-semibold mb-1">High Risk Warning</h4>
            <p className="text-sm text-orange-300">
              Meme coins are highly volatile and speculative. Many experience pump-and-dump schemes.
              Only invest what you can afford to lose. Do your own research and never invest based solely on social media hype.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeTracker;

