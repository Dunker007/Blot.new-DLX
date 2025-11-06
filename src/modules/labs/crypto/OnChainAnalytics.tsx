/**
 * On-Chain Analytics Component
 * ITC-style quantitative analysis with MVRV, NVT, and other metrics
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { OnChainMetric } from '../../../types/crypto';

const OnChainAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<OnChainMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');

  useEffect(() => {
    loadMetrics();
  }, [selectedCoin]);

  const loadMetrics = async () => {
    setLoading(true);
    // TODO: Integrate with actual on-chain data API (Glassnode, Blockchain.com, etc.)
    // For now, return mock data structure
    const mockMetrics: OnChainMetric[] = [
      {
        name: 'MVRV Z-Score',
        value: 2.5,
        change24h: 0.3,
        change7d: 1.2,
        description: 'Market Value to Realized Value ratio. Values > 3 indicate potential tops, < 0 indicate bottoms.',
      },
      {
        name: 'NVT Ratio',
        value: 45.2,
        change24h: -2.1,
        change7d: -5.3,
        description: 'Network Value to Transactions ratio. Lower values suggest undervaluation.',
      },
      {
        name: 'Active Addresses',
        value: 1250000,
        change24h: 2.5,
        change7d: 8.3,
        description: 'Number of unique addresses active in the network over the last 24 hours.',
      },
      {
        name: 'Exchange Netflow',
        value: -12500,
        change24h: -500,
        change7d: -3500,
        description: 'Net flow of coins to/from exchanges. Negative values indicate accumulation.',
      },
      {
        name: 'Whale Transactions',
        value: 245,
        change24h: 12,
        change7d: 45,
        description: 'Number of large transactions (>$1M) in the last 24 hours.',
      },
      {
        name: 'HODL Waves',
        value: 65.2,
        change24h: 1.2,
        change7d: 3.5,
        description: 'Percentage of supply held for more than 1 year.',
      },
    ];
    setMetrics(mockMetrics);
    setLoading(false);
  };

  const formatValue = (name: string, value: number) => {
    if (name.includes('Addresses') || name.includes('Transactions')) {
      return value.toLocaleString();
    }
    if (name.includes('Netflow') || name.includes('Flow')) {
      return `${value >= 0 ? '+' : ''}${value.toLocaleString()}`;
    }
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-800/50 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-800/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Coin Selector */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Select Coin</label>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="w-full md:w-64 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
        >
          <option value="bitcoin">Bitcoin (BTC)</option>
          <option value="ethereum">Ethereum (ETH)</option>
          <option value="solana">Solana (SOL)</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.name} metric={metric} formatValue={formatValue} />
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">About On-Chain Analytics</h3>
        <p className="text-gray-400 mb-4">
          On-chain analytics provide insights into blockchain network activity, investor behavior, and market cycles.
          These metrics help identify potential market tops, bottoms, and accumulation phases.
        </p>
        <div className="space-y-2 text-sm text-gray-400">
          <p><strong className="text-white">MVRV Z-Score:</strong> Compares market cap to realized cap. Extreme values indicate over/undervaluation.</p>
          <p><strong className="text-white">NVT Ratio:</strong> Network value relative to transaction volume. Similar to P/E ratio for stocks.</p>
          <p><strong className="text-white">Exchange Flows:</strong> Net movement of coins to/from exchanges. Outflows suggest accumulation.</p>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  metric: OnChainMetric;
  formatValue: (name: string, value: number) => string;
}> = ({ metric, formatValue }) => {
  const getIcon = () => {
    if (metric.name.includes('Addresses') || metric.name.includes('Transactions')) {
      return <Activity className="w-5 h-5 text-blue-400" />;
    }
    if (metric.name.includes('Flow') || metric.name.includes('Netflow')) {
      return <TrendingUp className="w-5 h-5 text-green-400" />;
    }
    return <BarChart3 className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-cyan-500/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{metric.name}</h3>
        {getIcon()}
      </div>
      <p className="text-2xl font-bold text-white mb-1">
        {formatValue(metric.name, metric.value)}
      </p>
      {metric.change24h !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">24h:</span>
          <span className={metric.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
            {metric.change24h >= 0 ? '+' : ''}{metric.change24h.toFixed(2)}%
          </span>
          {metric.change7d !== undefined && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">7d:</span>
              <span className={metric.change7d >= 0 ? 'text-green-400' : 'text-red-400'}>
                {metric.change7d >= 0 ? '+' : ''}{metric.change7d.toFixed(2)}%
              </span>
            </>
          )}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
    </div>
  );
};

export default OnChainAnalytics;

