/**
 * Risk Indicators Component
 * ITC-style bubble risk detection and macro indicators
 */

import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { RiskIndicator } from '../../../types/crypto';

const RiskIndicators: React.FC = () => {
  const [indicators, setIndicators] = useState<RiskIndicator[]>([
    {
      name: 'Short-Term Bubble Risk',
      value: 65,
      level: 'high',
      description: 'Current market conditions suggest elevated short-term bubble risk based on price action and sentiment.',
      recommendation: 'Consider reducing exposure or setting stop-losses. Wait for pullback before adding positions.',
    },
    {
      name: 'Macro Recession Risk',
      value: 35,
      level: 'medium',
      description: 'Global economic indicators show moderate recession risk. Crypto markets may face headwinds.',
      recommendation: 'Maintain defensive positioning. Consider stablecoins or cash reserves.',
    },
    {
      name: 'US Inflation Impact',
      value: 42,
      level: 'medium',
      description: 'Current inflation levels suggest moderate impact on crypto markets. Real yields are negative.',
      recommendation: 'Inflation hedge assets (BTC) may outperform. Monitor Fed policy changes.',
    },
    {
      name: 'Risk-On vs Risk-Off',
      value: 72,
      level: 'high',
      description: 'Markets are in strong risk-on mode. High correlation with traditional risk assets.',
      recommendation: 'Be cautious of sudden risk-off events. Diversify across uncorrelated assets.',
    },
    {
      name: 'Market Sentiment',
      value: 78,
      level: 'high',
      description: 'Extreme greed detected in market sentiment indicators. Historically precedes corrections.',
      recommendation: 'Consider taking profits. Avoid FOMO buying at current levels.',
    },
    {
      name: 'Liquidity Conditions',
      value: 55,
      level: 'medium',
      description: 'Market liquidity is moderate. Large orders may cause significant price impact.',
      recommendation: 'Use limit orders and avoid market orders for large positions.',
    },
  ]);

  const getLevelColor = (level: RiskIndicator['level']) => {
    switch (level) {
      case 'low':
        return 'text-green-400 border-green-500/30 bg-green-600/20';
      case 'medium':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-600/20';
      case 'high':
        return 'text-orange-400 border-orange-500/30 bg-orange-600/20';
      case 'critical':
        return 'text-red-400 border-red-500/30 bg-red-600/20';
    }
  };

  const getLevelIcon = (level: RiskIndicator['level']) => {
    switch (level) {
      case 'low':
        return <Shield className="w-5 h-5 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Monitor these risk indicators to make informed decisions about market exposure and position sizing.
        </p>

        <div className="space-y-4">
          {indicators.map((indicator) => (
            <div
              key={indicator.name}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getLevelIcon(indicator.level)}
                  <div>
                    <h4 className="font-semibold text-white">{indicator.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">{indicator.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-3 py-1 rounded border ${getLevelColor(indicator.level)}`}>
                    {indicator.level.toUpperCase()}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{indicator.value}</div>
                    <div className="text-xs text-gray-400">Risk Score</div>
                  </div>
                </div>
              </div>

              {/* Risk Bar */}
              <div className="mb-3">
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      indicator.level === 'low' ? 'bg-green-500' :
                      indicator.level === 'medium' ? 'bg-yellow-500' :
                      indicator.level === 'high' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${indicator.value}%` }}
                  />
                </div>
              </div>

              {indicator.recommendation && (
                <div className="mt-3 p-3 bg-cyan-600/10 border border-cyan-500/20 rounded-lg">
                  <p className="text-sm text-cyan-300">
                    <strong>Recommendation:</strong> {indicator.recommendation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risk Management Tips */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Management Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h4 className="text-white font-medium mb-2">Position Sizing</h4>
            <p>Never risk more than 1-2% of your portfolio on a single trade. Use stop-losses to limit downside.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Diversification</h4>
            <p>Spread risk across different assets, strategies, and timeframes. Avoid over-concentration.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Risk-Reward Ratio</h4>
            <p>Only take trades with at least 2:1 risk-reward ratio. Cut losses quickly, let winners run.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Market Conditions</h4>
            <p>Reduce position sizes during high-risk periods. Increase exposure when risk indicators improve.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskIndicators;

