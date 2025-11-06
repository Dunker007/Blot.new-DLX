/**
 * Holdings Component
 * Kubera-style holdings list view with detailed asset information
 */

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { Portfolio, Holding } from '../../../types/crypto';
import { portfolioService } from '../../../services/crypto/portfolioService';

const Holdings: React.FC<{ portfolioId?: string }> = ({ portfolioId }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'allocation' | 'name'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      refreshPortfolio();
    }
  }, [selectedPortfolio]);

  const loadPortfolios = () => {
    const allPortfolios = portfolioService.getPortfolios();
    setPortfolios(allPortfolios);
    if (portfolioId) {
      const portfolio = allPortfolios.find(p => p.id === portfolioId);
      if (portfolio) setSelectedPortfolio(portfolio);
    } else if (allPortfolios.length > 0) {
      setSelectedPortfolio(allPortfolios[0]);
    }
  };

  const refreshPortfolio = async () => {
    if (!selectedPortfolio) return;
    const updated = await portfolioService.recalculatePortfolio(selectedPortfolio.id);
    if (updated) {
      setSelectedPortfolio(updated);
      loadPortfolios();
    }
  };

  const filteredAndSortedHoldings = () => {
    if (!selectedPortfolio) return [];

    let holdings = [...selectedPortfolio.holdings];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      holdings = holdings.filter(
        h => 
          h.name.toLowerCase().includes(query) ||
          h.symbol.toLowerCase().includes(query)
      );
    }

    // Sort
    holdings.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'value':
          comparison = a.currentValue - b.currentValue;
          break;
        case 'change':
          comparison = a.returnPercent - b.returnPercent;
          break;
        case 'allocation':
          comparison = a.allocation - b.allocation;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return holdings;
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

  if (!selectedPortfolio) {
    return (
      <div className="p-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <PieChart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Portfolio Selected</h3>
          <p className="text-gray-400">Select a portfolio to view holdings</p>
        </div>
      </div>
    );
  }

  const holdings = filteredAndSortedHoldings();

  return (
    <div className="p-6 space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search holdings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="value">Sort by Value</option>
            <option value="change">Sort by Change</option>
            <option value="allocation">Sort by Allocation</option>
            <option value="name">Sort by Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Asset</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Cost Basis</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Return</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    {searchQuery ? 'No holdings match your search' : 'No holdings yet'}
                  </td>
                </tr>
              ) : (
                holdings.map((holding) => (
                  <HoldingRow key={holding.coinId} holding={holding} formatCurrency={formatCurrency} formatPercent={formatPercent} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Holdings</div>
          <div className="text-2xl font-bold text-white">{holdings.length}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(holdings.reduce((sum, h) => sum + h.currentValue, 0))}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Return</div>
          <div className={`text-2xl font-bold ${
            holdings.reduce((sum, h) => sum + h.return, 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {formatCurrency(holdings.reduce((sum, h) => sum + h.return, 0))}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Avg Return</div>
          <div className={`text-2xl font-bold ${
            holdings.length > 0 && holdings.reduce((sum, h) => sum + h.returnPercent, 0) / holdings.length >= 0 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {holdings.length > 0 
              ? formatPercent(holdings.reduce((sum, h) => sum + h.returnPercent, 0) / holdings.length)
              : '0%'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const HoldingRow: React.FC<{
  holding: Holding;
  formatCurrency: (v: number) => string;
  formatPercent: (v: number) => string;
}> = ({ holding, formatCurrency, formatPercent }) => {
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
      <td className="px-4 py-3 text-right text-gray-400">
        {formatCurrency(holding.costBasis)}
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
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-16 bg-slate-700 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full"
              style={{ width: `${Math.min(holding.allocation, 100)}%` }}
            />
          </div>
          <span className="text-gray-400 text-sm w-12 text-right">{holding.allocation.toFixed(1)}%</span>
        </div>
      </td>
    </tr>
  );
};

export default Holdings;

