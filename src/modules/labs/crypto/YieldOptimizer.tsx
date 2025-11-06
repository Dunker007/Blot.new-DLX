/**
 * Yield Optimizer Component
 * DeFi yield opportunities and optimization
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Shield, AlertTriangle, Zap } from 'lucide-react';
import { YieldOpportunity } from '../../../types/crypto';

const YieldOptimizer: React.FC = () => {
  const [opportunities, setOpportunities] = useState<YieldOpportunity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    // TODO: Integrate with DeFi protocols
    setTimeout(() => {
      setOpportunities([
        {
          protocol: 'Aave',
          asset: 'USDC',
          apy: 8.5,
          tvl: 2500000000,
          risk: 'low',
          description: 'Lending USDC on Aave with low risk',
        },
        {
          protocol: 'Uniswap V3',
          asset: 'ETH/USDC',
          apy: 24.3,
          tvl: 500000000,
          risk: 'medium',
          description: 'Liquidity provision for ETH/USDC pair',
          impermanentLossRisk: 15,
        },
        {
          protocol: 'Compound',
          asset: 'ETH',
          apy: 6.2,
          tvl: 1800000000,
          risk: 'low',
          description: 'Lending ETH on Compound',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const riskColors = {
    low: 'bg-green-600/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-600/20 text-red-400 border-red-500/30',
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
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-white">Yield Optimizer</h2>

      <div className="space-y-4">
        {opportunities.map((opp, index) => (
          <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {opp.protocol} - {opp.asset}
                </h3>
                <p className="text-sm text-gray-400">{opp.description}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded border ${riskColors[opp.risk]}`}>
                {opp.risk.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">APY</div>
                <div className="text-2xl font-bold text-green-400">
                  {opp.apy.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Total Value Locked</div>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(opp.tvl)}
                </div>
              </div>
              {opp.impermanentLossRisk && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">IL Risk</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {opp.impermanentLossRisk}%
                  </div>
                </div>
              )}
            </div>

            <button className="mt-4 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors">
              Optimize Position
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YieldOptimizer;

