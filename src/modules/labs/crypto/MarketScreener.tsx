/**
 * Market Screener Component
 * CoinMarketCap-style advanced filtering and screening
 */

import React, { useState, useEffect } from 'react';
import { Filter, Search, Download } from 'lucide-react';
import { Coin } from '../../../types/crypto';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const MarketScreener: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [minMarketCap, setMinMarketCap] = useState(0);
  const [maxMarketCap, setMaxMarketCap] = useState(Infinity);
  const [minVolume, setMinVolume] = useState(0);
  const [minPriceChange, setMinPriceChange] = useState(-100);
  const [maxPriceChange, setMaxPriceChange] = useState(100);

  useEffect(() => {
    loadCoins();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [coins, searchQuery, minMarketCap, maxMarketCap, minVolume, minPriceChange, maxPriceChange]);

  const loadCoins = async () => {
    try {
      setLoading(true);
      const data = await cryptoApiService.getTopCoins(500);
      setCoins(data);
    } catch (error) {
      console.error('Failed to load coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...coins];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        coin => 
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
    }

    // Market cap filter
    filtered = filtered.filter(coin => 
      coin.market_cap >= minMarketCap && coin.market_cap <= maxMarketCap
    );

    // Volume filter
    filtered = filtered.filter(coin => coin.total_volume >= minVolume);

    // Price change filter
    filtered = filtered.filter(coin => 
      coin.price_change_percentage_24h >= minPriceChange &&
      coin.price_change_percentage_24h <= maxPriceChange
    );

    setFilteredCoins(filtered);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-800/50 rounded-lg"></div>
          <div className="h-96 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Coin name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Min Market Cap</label>
            <input
              type="number"
              value={minMarketCap || ''}
              onChange={(e) => setMinMarketCap(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Max Market Cap</label>
            <input
              type="number"
              value={maxMarketCap === Infinity ? '' : maxMarketCap}
              onChange={(e) => setMaxMarketCap(Number(e.target.value) || Infinity)}
              placeholder="No limit"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Min 24h Volume</label>
            <input
              type="number"
              value={minVolume || ''}
              onChange={(e) => setMinVolume(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Min 24h Change (%)</label>
            <input
              type="number"
              value={minPriceChange}
              onChange={(e) => setMinPriceChange(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Max 24h Change (%)</label>
            <input
              type="number"
              value={maxPriceChange}
              onChange={(e) => setMaxPriceChange(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Showing {filteredCoins.length} of {coins.length} coins
          </span>
          <button className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 rounded-lg transition-colors inline-flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Results
          </button>
        </div>
      </div>

      {/* Results Table */}
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
              {filteredCoins.slice(0, 100).map((coin) => (
                <tr key={coin.id} className="hover:bg-slate-800/50 transition-colors">
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
                    ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {formatCurrency(coin.market_cap)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {formatCurrency(coin.total_volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketScreener;

