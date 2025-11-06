/**
 * Portfolio Tracker Component
 * Kubera-style portfolio tracking with real-time values
 */

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, PieChart, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, PlusCircle } from 'lucide-react';
import { Portfolio, Holding, Transaction } from '../../../types/crypto';
import { portfolioService } from '../../../services/crypto/portfolioService';
import { cryptoApiService } from '../../../services/crypto/cryptoApiService';

const PortfolioTracker: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      refreshPortfolio();
      const interval = setInterval(refreshPortfolio, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedPortfolio]);

  const loadPortfolios = () => {
    const allPortfolios = portfolioService.getPortfolios();
    setPortfolios(allPortfolios);
    if (allPortfolios.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(allPortfolios[0]);
    }
    setLoading(false);
  };

  const refreshPortfolio = async () => {
    if (!selectedPortfolio) return;
    const updated = await portfolioService.recalculatePortfolio(selectedPortfolio.id);
    if (updated) {
      setSelectedPortfolio(updated);
      loadPortfolios();
    }
  };

  const handleCreatePortfolio = () => {
    const name = prompt('Enter portfolio name:');
    if (name) {
      const newPortfolio = portfolioService.createPortfolio(name);
      setPortfolios([...portfolios, newPortfolio]);
      setSelectedPortfolio(newPortfolio);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Portfolios Yet</h3>
          <p className="text-gray-400 mb-6">Create your first portfolio to start tracking your crypto holdings</p>
          <button
            onClick={handleCreatePortfolio}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Selector */}
      <div className="flex items-center justify-between">
        <select
          value={selectedPortfolio?.id || ''}
          onChange={(e) => {
            const portfolio = portfolios.find(p => p.id === e.target.value);
            setSelectedPortfolio(portfolio || null);
          }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          {portfolios.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={handleCreatePortfolio}
          className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Portfolio
        </button>
      </div>

      {selectedPortfolio && (
        <>
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Value */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Value</h3>
                <DollarSign className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {formatCurrency(selectedPortfolio.totalValue)}
              </p>
            </div>

            {/* Total Return */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Return</h3>
                {selectedPortfolio.totalReturn >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className={`text-2xl font-bold mb-1 ${
                selectedPortfolio.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(selectedPortfolio.totalReturn)}
              </p>
              <p className={`text-sm ${
                selectedPortfolio.totalReturnPercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPercent(selectedPortfolio.totalReturnPercent)}
              </p>
            </div>

            {/* Total Cost */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Cost</h3>
                <PieChart className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {formatCurrency(selectedPortfolio.totalCost)}
              </p>
            </div>
          </div>

          {/* Holdings List */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Holdings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Asset</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Value</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Return</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {selectedPortfolio.holdings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No holdings yet. Add transactions to track your portfolio.
                      </td>
                    </tr>
                  ) : (
                    selectedPortfolio.holdings.map((holding) => (
                      <HoldingRow key={holding.coinId} holding={holding} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const HoldingRow: React.FC<{ holding: Holding }> = ({ holding }) => {
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
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-white">{holding.name}</div>
          <div className="text-sm text-gray-400">{holding.symbol.toUpperCase()}</div>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-white font-medium">
        {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
      </td>
      <td className="px-4 py-3 text-right text-white">
        {formatCurrency(holding.currentPrice)}
      </td>
      <td className="px-4 py-3 text-right text-white font-medium">
        {formatCurrency(holding.currentValue)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className={`flex items-center justify-end gap-1 ${
          holding.return >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {holding.return >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span className="font-medium">{formatPercent(holding.returnPercent)}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-gray-400">
        {holding.allocation.toFixed(2)}%
      </td>
    </tr>
  );
};

export default PortfolioTracker;

