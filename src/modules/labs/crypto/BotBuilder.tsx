/**
 * Bot Builder Component
 * 3Commas-style visual flow builder for trading bots
 */

import React, { useState } from 'react';
import { Plus, Play, Square, Settings, Trash2 } from 'lucide-react';
import { TradingBot } from '../../../types/crypto';

const BotBuilder: React.FC = () => {
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null);

  const handleCreateBot = () => {
    const newBot: TradingBot = {
      id: `bot-${Date.now()}`,
      name: 'New Trading Bot',
      type: 'dca',
      status: 'stopped',
      strategy: {
        exchange: 'binance',
        pair: 'BTC/USDT',
        type: 'dca',
        config: {},
        riskManagement: {},
      },
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalProfitPercent: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        currentDrawdown: 0,
        roi: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBots([...bots, newBot]);
    setSelectedBot(newBot);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trading Bots</h2>
          <p className="text-gray-400">Create and manage automated trading strategies</p>
        </div>
        <button
          onClick={handleCreateBot}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Bot
        </button>
      </div>

      {/* Bots List */}
      {bots.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <Bot className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Bots Yet</h3>
          <p className="text-gray-400 mb-6">Create your first trading bot to automate your strategies</p>
          <button
            onClick={handleCreateBot}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              isSelected={selectedBot?.id === bot.id}
              onSelect={() => setSelectedBot(bot)}
              onDelete={() => {
                setBots(bots.filter(b => b.id !== bot.id));
                if (selectedBot?.id === bot.id) {
                  setSelectedBot(null);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Bot Editor */}
      {selectedBot && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Bot Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Bot Name</label>
              <input
                type="text"
                value={selectedBot.name}
                onChange={(e) => {
                  const updated = { ...selectedBot, name: e.target.value };
                  setSelectedBot(updated);
                  setBots(bots.map(b => b.id === updated.id ? updated : b));
                }}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Exchange</label>
                <select
                  value={selectedBot.strategy.exchange}
                  onChange={(e) => {
                    const updated = {
                      ...selectedBot,
                      strategy: { ...selectedBot.strategy, exchange: e.target.value },
                    };
                    setSelectedBot(updated);
                    setBots(bots.map(b => b.id === updated.id ? updated : b));
                  }}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="binance">Binance</option>
                  <option value="coinbase">Coinbase</option>
                  <option value="kraken">Kraken</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Trading Pair</label>
                <input
                  type="text"
                  value={selectedBot.strategy.pair}
                  onChange={(e) => {
                    const updated = {
                      ...selectedBot,
                      strategy: { ...selectedBot.strategy, pair: e.target.value },
                    };
                    setSelectedBot(updated);
                    setBots(bots.map(b => b.id === updated.id ? updated : b));
                  }}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="BTC/USDT"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const updated = { ...selectedBot, status: 'active' as const };
                  setSelectedBot(updated);
                  setBots(bots.map(b => b.id === updated.id ? updated : b));
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
              <button
                onClick={() => {
                  const updated = { ...selectedBot, status: 'stopped' as const };
                  setSelectedBot(updated);
                  setBots(bots.map(b => b.id === updated.id ? updated : b));
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BotCard: React.FC<{
  bot: TradingBot;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ bot, isSelected, onSelect, onDelete }) => {
  const statusColors = {
    active: 'bg-green-600/20 text-green-400 border-green-500/30',
    paused: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    stopped: 'bg-gray-600/20 text-gray-400 border-gray-500/30',
    paper: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-slate-800/50 border rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white">{bot.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Type:</span>
          <span className="text-xs text-white capitalize">{bot.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Pair:</span>
          <span className="text-xs text-white">{bot.strategy.pair}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[bot.status]}`}>
            {bot.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BotBuilder;

