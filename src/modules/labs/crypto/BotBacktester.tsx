/**
 * Bot Backtester Component
 * Historical strategy testing and optimization
 */

import React, { useState } from 'react';
import { Play, BarChart3, TrendingUp, Settings } from 'lucide-react';
import { TradingBot } from '../../../types/crypto';

const BotBacktester: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [results, setResults] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const handleBacktest = async () => {
    if (!selectedBot) {
      alert('Please select a bot strategy first');
      return;
    }

    setRunning(true);
    // TODO: Implement actual backtesting logic
    setTimeout(() => {
      setResults({
        totalTrades: 45,
        winningTrades: 28,
        losingTrades: 17,
        winRate: 62.2,
        totalProfit: 1250,
        totalProfitPercent: 12.5,
        profitFactor: 1.85,
        sharpeRatio: 1.42,
        maxDrawdown: 8.3,
        roi: 12.5,
      });
      setRunning(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Strategy Backtester</h2>

      {/* Configuration */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Backtest Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Initial Capital</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>
        <button
          onClick={handleBacktest}
          disabled={running}
          className="mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
        >
          {running ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Running Backtest...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run Backtest
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Total Profit</div>
              <div className="text-2xl font-bold text-green-400">
                ${results.totalProfit.toLocaleString()}
              </div>
              <div className="text-sm text-green-400 mt-1">
                +{results.totalProfitPercent.toFixed(2)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-white">
                {results.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {results.winningTrades}W / {results.losingTrades}L
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-white">
                {results.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {results.sharpeRatio >= 1 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
              <div className="text-2xl font-bold text-red-400">
                -{results.maxDrawdown.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Risk Level
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Total Trades</div>
                <div className="text-xl font-bold text-white">{results.totalTrades}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Profit Factor</div>
                <div className="text-xl font-bold text-white">{results.profitFactor.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">ROI</div>
                <div className="text-xl font-bold text-green-400">+{results.roi.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Final Value</div>
                <div className="text-xl font-bold text-white">
                  ${(initialCapital + results.totalProfit).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotBacktester;

