/**
 * Arbitrage Finder Component
 * Cross-exchange arbitrage opportunities
 */

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { ArbitrageOpportunity } from '../../../types/crypto';

const ArbitrageFinder: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOpportunities();
    const interval = setInterval(loadOpportunities, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    // TODO: Integrate with actual exchange APIs
    // Mock data for now
    setTimeout(() => {
      setOpportunities([
        {
          exchange1: 'Binance',
          exchange2: 'Coinbase',
          pair: 'BTC/USDT',
          price1: 45000,
          price2: 45150,
          difference: 150,
          differencePercent: 0.33,
          estimatedProfit: 150,
          risk: 'low',
          executionTime: 2,
        },
        {
          exchange1: 'Kraken',
          exchange2: 'Binance',
          pair: 'ETH/USDT',
          price1: 2800,
          price2: 2820,
          difference: 20,
          differencePercent: 0.71,
          estimatedProfit: 20,
          risk: 'medium',
          executionTime: 3,
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Arbitrage Finder</h2>
        <button
          onClick={loadOpportunities}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-lg"></div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <Zap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No arbitrage opportunities found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp, index) => (
            <ArbitrageCard key={index} opportunity={opp} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}
    </div>
  );
};

const ArbitrageCard: React.FC<{
  opportunity: ArbitrageOpportunity;
  formatCurrency: (v: number) => string;
}> = ({ opportunity, formatCurrency }) => {
  const riskColors = {
    low: 'bg-green-600/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-600/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{opportunity.pair}</h3>
          <p className="text-sm text-gray-400">
            {opportunity.exchange1} → {opportunity.exchange2}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded border ${riskColors[opportunity.risk]}`}>
          {opportunity.risk.toUpperCase()} RISK
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Price Difference</div>
          <div className="text-lg font-bold text-green-400">
            {formatCurrency(opportunity.difference)}
          </div>
          <div className="text-xs text-green-400">
            {opportunity.differencePercent.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Estimated Profit</div>
          <div className="text-lg font-bold text-white">
            {formatCurrency(opportunity.estimatedProfit)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Execution Time</div>
          <div className="text-lg font-bold text-white">
            {opportunity.executionTime}s
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Prices</div>
          <div className="text-sm text-white">
            {formatCurrency(opportunity.price1)} / {formatCurrency(opportunity.price2)}
          </div>
        </div>
      </div>

      <button className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors">
        Execute Arbitrage
      </button>
    </div>
  );
};

export default ArbitrageFinder;

