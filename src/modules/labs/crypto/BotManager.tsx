/**
 * Bot Manager Component
 * Active bots dashboard and management
 */

import React, { useState } from 'react';
import { Play, Square, Pause, Trash2, BarChart3 } from 'lucide-react';
import { TradingBot } from '../../../types/crypto';

const BotManager: React.FC = () => {
  const [bots, setBots] = useState<TradingBot[]>([]);

  const handleStart = (botId: string) => {
    setBots(bots.map(b => b.id === botId ? { ...b, status: 'active' } : b));
  };

  const handleStop = (botId: string) => {
    setBots(bots.map(b => b.id === botId ? { ...b, status: 'stopped' } : b));
  };

  const handlePause = (botId: string) => {
    setBots(bots.map(b => b.id === botId ? { ...b, status: 'paused' } : b));
  };

  const handleDelete = (botId: string) => {
    if (confirm('Are you sure you want to delete this bot?')) {
      setBots(bots.filter(b => b.id !== botId));
    }
  };

  if (bots.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Bots</h3>
          <p className="text-gray-400 mb-6">Create bots in the Bot Builder to start trading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-white">Active Bots</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map((bot) => (
          <BotCard
            key={bot.id}
            bot={bot}
            onStart={() => handleStart(bot.id)}
            onStop={() => handleStop(bot.id)}
            onPause={() => handlePause(bot.id)}
            onDelete={() => handleDelete(bot.id)}
          />
        ))}
      </div>
    </div>
  );
};

const BotCard: React.FC<{
  bot: TradingBot;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onDelete: () => void;
}> = ({ bot, onStart, onStop, onPause, onDelete }) => {
  const statusColors = {
    active: 'bg-green-600/20 text-green-400 border-green-500/30',
    paused: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    stopped: 'bg-gray-600/20 text-gray-400 border-gray-500/30',
    paper: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white mb-1">{bot.name}</h3>
          <p className="text-sm text-gray-400 capitalize">{bot.type} Bot</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded border ${statusColors[bot.status]}`}>
          {bot.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Pair</span>
          <span className="text-white">{bot.strategy.pair}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Trades</span>
          <span className="text-white">{bot.performance.totalTrades}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Win Rate</span>
          <span className="text-green-400">{bot.performance.winRate.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Profit</span>
          <span className={`${bot.performance.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {bot.performance.totalProfit >= 0 ? '+' : ''}
            {bot.performance.totalProfitPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {bot.status === 'stopped' && (
          <button
            onClick={onStart}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-1"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        )}
        {bot.status === 'active' && (
          <button
            onClick={onPause}
            className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-1"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        {(bot.status === 'active' || bot.status === 'paused') && (
          <button
            onClick={onStop}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-1"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BotManager;

