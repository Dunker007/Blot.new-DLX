/**
 * DCA Simulator Component
 * 3Commas-style Dollar-Cost Averaging strategy builder and backtester
 */

import React, { useState } from 'react';
import { Calculator, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { DCAStrategy } from '../../../types/crypto';
import { portfolioService } from '../../../services/crypto/portfolioService';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const DCA: React.FC = () => {
  const [coinId, setCoinId] = useState('bitcoin');
  const [coinSymbol, setCoinSymbol] = useState('BTC');
  const [amount, setAmount] = useState(100);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [strategy, setStrategy] = useState<DCAStrategy | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!coinId || !amount || !startDate) return;

    setLoading(true);
    try {
      const result = await portfolioService.calculateDCA({
        coinId,
        symbol: coinSymbol,
        amount,
        frequency,
        startDate,
        endDate: endDate || undefined,
        totalInvested: 0, // Will be calculated
      });
      setStrategy(result);
    } catch (error) {
      console.error('Failed to calculate DCA:', error);
      alert('Failed to calculate DCA strategy. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">DCA Strategy Calculator</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Coin</label>
            <input
              type="text"
              value={coinSymbol}
              onChange={async (e) => {
                const symbol = e.target.value.toUpperCase();
                setCoinSymbol(symbol);
                const coin = await cryptoApiService.getCoinBySymbol(symbol);
                if (coin) {
                  setCoinId(coin.id);
                }
              }}
              placeholder="BTC"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Amount per Purchase</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">End Date (optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Calculate Strategy
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {strategy && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Total Invested</h3>
              <DollarSign className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(strategy.totalInvested)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Total Coins</h3>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {strategy.totalCoins.toLocaleString(undefined, { maximumFractionDigits: 8 })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Average Price</h3>
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(strategy.averagePrice)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Current Value</h3>
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(strategy.currentValue)}
            </p>
            <p className={`text-sm mt-1 ${
              strategy.returnPercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatPercent(strategy.returnPercent)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DCA;

