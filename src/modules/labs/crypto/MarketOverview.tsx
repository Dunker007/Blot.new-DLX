/**
 * Market Overview Component
 * CoinMarketCap-style rankings table
 */

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Coin } from '../../../types/crypto';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const MarketOverview: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'market_cap' | 'price_change_percentage_24h' | 'volume'>('market_cap');

  useEffect(() => {
    loadCoins();
    const interval = setInterval(loadCoins, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortCoins();
  }, [coins, searchQuery, sortBy]);

  const loadCoins = async () => {
    try {
      setLoading(true);
      const data = await cryptoApiService.getTopCoins(100);
      setCoins(data);
    } catch (error) {
      console.error('Failed to load coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCoins = () => {
    let filtered = [...coins];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        coin => 
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'market_cap':
          return b.market_cap - a.market_cap;
        case 'price_change_percentage_24h':
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        case 'volume':
          return b.total_volume - a.total_volume;
        default:
          return 0;
      }
    });

    setFilteredCoins(filtered);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPrice = (value: number) => {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (value >= 1) return value.toFixed(2);
    if (value >= 0.01) return value.toFixed(4);
    return value.toFixed(8);
  };

  if (loading && coins.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-800/50 rounded-lg"></div>
          <div className="h-96 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search coins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="market_cap">Market Cap</option>
          <option value="price_change_percentage_24h">24h Change</option>
          <option value="volume">Volume</option>
        </select>
      </div>

      {/* Market Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Coin</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">24h Change</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Market Cap</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredCoins.map((coin) => (
                <CoinRow key={coin.id} coin={coin} formatCurrency={formatCurrency} formatPrice={formatPrice} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CoinRow: React.FC<{ 
  coin: Coin; 
  formatCurrency: (v: number) => string;
  formatPrice: (v: number) => string;
}> = ({ coin, formatCurrency, formatPrice }) => {
  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3 text-gray-400">{coin.market_cap_rank}</td>
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
      <td className="px-4 py-3 text-right">
        <div className={`flex items-center justify-end gap-1 ${
          coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {coin.price_change_percentage_24h >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span className="font-medium">
            {coin.price_change_percentage_24h >= 0 ? '+' : ''}
            {coin.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-white">
        {formatCurrency(coin.market_cap)}
      </td>
      <td className="px-4 py-3 text-right text-gray-400">
        {formatCurrency(coin.total_volume)}
      </td>
    </tr>
  );
};

export default MarketOverview;

