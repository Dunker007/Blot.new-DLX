/**
 * Trending Component
 * Top gainers, losers, and trending coins
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Flame, Search } from 'lucide-react';
import { Coin } from '../../../types/crypto';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const Trending: React.FC = () => {
  const [topGainers, setTopGainers] = useState<Coin[]>([]);
  const [topLosers, setTopLosers] = useState<Coin[]>([]);
  const [trending, setTrending] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadTrendingData();
    const interval = setInterval(loadTrendingData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeframe]);

  const loadTrendingData = async () => {
    try {
      setLoading(true);
      const coins = await cryptoApiService.getTopCoins(250);
      
      // Get trending coins
      const trendingCoins = await cryptoApiService.getTrendingCoins();
      setTrending(trendingCoins.slice(0, 10));

      // Calculate gainers/losers based on timeframe
      const sorted = [...coins].sort((a, b) => {
        const changeA = timeframe === '24h' 
          ? a.price_change_percentage_24h 
          : timeframe === '7d' 
          ? (a.sparkline_in_7d?.price?.[0] && a.sparkline_in_7d?.price?.[a.sparkline_in_7d.price.length - 1]
            ? ((a.sparkline_in_7d.price[a.sparkline_in_7d.price.length - 1] - a.sparkline_in_7d.price[0]) / a.sparkline_in_7d.price[0]) * 100
            : 0)
          : 0;
        const changeB = timeframe === '24h'
          ? b.price_change_percentage_24h
          : timeframe === '7d'
          ? (b.sparkline_in_7d?.price?.[0] && b.sparkline_in_7d?.price?.[b.sparkline_in_7d.price.length - 1]
            ? ((b.sparkline_in_7d.price[b.sparkline_in_7d.price.length - 1] - b.sparkline_in_7d.price[0]) / b.sparkline_in_7d.price[0]) * 100
            : 0)
          : 0;
        return changeB - changeA;
      });

      setTopGainers(sorted.slice(0, 10));
      setTopLosers([...sorted].reverse().slice(0, 10));
    } catch (error) {
      console.error('Failed to load trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPrice = (value: number) => {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (value >= 1) return value.toFixed(2);
    if (value >= 0.01) return value.toFixed(4);
    return value.toFixed(8);
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
    <div className="p-6 space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Trending Coins</h2>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeframe === tf
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Trending Now</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {trending.map((coin) => (
            <TrendingCard key={coin.id} coin={coin} formatPrice={formatPrice} />
          ))}
        </div>
      </div>

      {/* Top Gainers */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Top Gainers ({timeframe})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Coin</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Change</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {topGainers.map((coin, index) => (
                <TrendingRow key={coin.id} coin={coin} rank={index + 1} formatCurrency={formatCurrency} formatPrice={formatPrice} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Losers */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Top Losers ({timeframe})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Coin</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Change</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {topLosers.map((coin, index) => (
                <TrendingRow key={coin.id} coin={coin} rank={index + 1} formatCurrency={formatCurrency} formatPrice={formatPrice} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TrendingCard: React.FC<{
  coin: Coin;
  formatPrice: (v: number) => string;
}> = ({ coin, formatPrice }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        {coin.image && (
          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
        )}
        <div>
          <div className="font-medium text-white text-sm">{coin.name}</div>
          <div className="text-xs text-gray-400">{coin.symbol.toUpperCase()}</div>
        </div>
      </div>
      <div className="text-lg font-bold text-white mb-1">
        ${formatPrice(coin.current_price)}
      </div>
      <div className={`text-sm font-medium ${
        coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
      }`}>
        {coin.price_change_percentage_24h >= 0 ? '+' : ''}
        {coin.price_change_percentage_24h.toFixed(2)}%
      </div>
    </div>
  );
};

const TrendingRow: React.FC<{
  coin: Coin;
  rank: number;
  formatCurrency: (v: number) => string;
  formatPrice: (v: number) => string;
}> = ({ coin, rank, formatCurrency, formatPrice }) => {
  const change = coin.price_change_percentage_24h;
  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3 text-gray-400">{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {coin.image && (
            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
          )}
          <div>
            <div className="font-medium text-white">{coin.name}</div>
            <div className="text-sm text-gray-400">{coin.symbol.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-white font-medium">
        ${formatPrice(coin.current_price)}
      </td>
      <td className={`px-4 py-3 text-right font-medium ${
        change >= 0 ? 'text-green-400' : 'text-red-400'
      }`}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </td>
      <td className="px-4 py-3 text-right text-gray-400">
        {formatCurrency(coin.market_cap)}
      </td>
    </tr>
  );
};

export default Trending;

