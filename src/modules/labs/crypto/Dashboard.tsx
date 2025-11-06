/**
 * Crypto Lab Dashboard
 * Main hub - Kubera-style overview
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MarketData } from '../../../types/crypto';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const Dashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      const data = await cryptoApiService.getMarketData();
      setMarketData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load market data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-800/50 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-800/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Market Cap */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Market Cap</h3>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {marketData ? formatCurrency(marketData.totalMarketCap) : '—'}
          </p>
          {marketData && marketData.marketCapChange24h !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${
              marketData.marketCapChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {marketData.marketCapChange24h >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {formatPercent(marketData.marketCapChange24h)}
            </div>
          )}
        </div>

        {/* Total Volume */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">24h Volume</h3>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {marketData ? formatCurrency(marketData.totalVolume) : '—'}
          </p>
        </div>

        {/* BTC Dominance */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">BTC Dominance</h3>
            <BarChart3 className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {marketData ? `${marketData.btcDominance.toFixed(2)}%` : '—'}
          </p>
        </div>

        {/* Active Cryptocurrencies */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Active Coins</h3>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {marketData ? marketData.activeCryptocurrencies.toLocaleString() : '—'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Market Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Market Trend</span>
              <span className={`font-semibold ${
                marketData && marketData.marketCapChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {marketData && marketData.marketCapChange24h >= 0 ? (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Bullish
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    Bearish
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">ETH Dominance</span>
              <span className="text-white font-semibold">
                {marketData ? `${marketData.ethDominance.toFixed(2)}%` : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg text-cyan-400 transition-colors">
              View Portfolio
            </button>
            <button className="w-full text-left px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors">
              Explore Markets
            </button>
            <button className="w-full text-left px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors">
              Research Tools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

