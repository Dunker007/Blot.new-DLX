/**
 * Exit Strategies Component
 * DCA out, take-profit, stop-loss configurations
 */

import React, { useState } from 'react';
import { Target, TrendingDown, TrendingUp, Settings } from 'lucide-react';

interface ExitStrategy {
  id: string;
  name: string;
  type: 'dca-out' | 'take-profit' | 'stop-loss' | 'trailing-stop';
  config: Record<string, any>;
}

const ExitStrategies: React.FC = () => {
  const [strategies, setStrategies] = useState<ExitStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<ExitStrategy | null>(null);
  const [strategyType, setStrategyType] = useState<ExitStrategy['type']>('take-profit');

  const handleCreateStrategy = () => {
    const newStrategy: ExitStrategy = {
      id: `strategy-${Date.now()}`,
      name: `${strategyType.replace('-', ' ')} Strategy`,
      type: strategyType,
      config: {},
    };
    setStrategies([...strategies, newStrategy]);
    setSelectedStrategy(newStrategy);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Exit Strategies</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Builder */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Exit Strategy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Type</label>
              <select
                value={strategyType}
                onChange={(e) => setStrategyType(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="take-profit">Take Profit</option>
                <option value="stop-loss">Stop Loss</option>
                <option value="dca-out">DCA Out</option>
                <option value="trailing-stop">Trailing Stop</option>
              </select>
            </div>
            <button
              onClick={handleCreateStrategy}
              className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Strategy
            </button>
          </div>
        </div>

        {/* Strategy Templates */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Strategy Templates</h3>
          <div className="space-y-3">
            <StrategyTemplate
              name="Conservative Take Profit"
              description="Take profit at 10%, 20%, 30% gains"
              type="take-profit"
            />
            <StrategyTemplate
              name="Aggressive Stop Loss"
              description="Stop loss at -5% to limit downside"
              type="stop-loss"
            />
            <StrategyTemplate
              name="DCA Out Strategy"
              description="Sell in increments as price rises"
              type="dca-out"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StrategyTemplate: React.FC<{
  name: string;
  description: string;
  type: ExitStrategy['type'];
}> = ({ name, description, type }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white mb-1">{name}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <Settings className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

export default ExitStrategies;

