/**
 * Bot Library Component
 * Pre-built bot templates and community marketplace
 */

import React, { useState } from 'react';
import { Copy, Star, TrendingUp, Download, Filter } from 'lucide-react';
import { TradingBot } from '../../../types/crypto';

interface BotTemplate {
  id: string;
  name: string;
  type: TradingBot['type'];
  description: string;
  rating: number;
  users: number;
  profit: number;
  risk: 'low' | 'medium' | 'high';
  tags: string[];
}

const BotLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<BotTemplate[]>([
    {
      id: 'dca-conservative',
      name: 'Conservative DCA Bot',
      type: 'dca',
      description: 'Dollar-cost averaging bot with conservative settings. Buys at regular intervals regardless of price.',
      rating: 4.8,
      users: 1250,
      profit: 12.5,
      risk: 'low',
      tags: ['DCA', 'Conservative', 'Beginner'],
    },
    {
      id: 'grid-btc',
      name: 'BTC Grid Trading Bot',
      type: 'grid',
      description: 'Grid trading bot optimized for Bitcoin. Places buy and sell orders at regular intervals.',
      rating: 4.6,
      users: 890,
      profit: 18.3,
      risk: 'medium',
      tags: ['Grid', 'BTC', 'Intermediate'],
    },
    {
      id: 'scalping-eth',
      name: 'ETH Scalping Bot',
      type: 'scalping',
      description: 'High-frequency scalping bot for Ethereum. Captures small price movements.',
      rating: 4.4,
      users: 450,
      profit: 25.7,
      risk: 'high',
      tags: ['Scalping', 'ETH', 'Advanced'],
    },
    {
      id: 'arbitrage-multi',
      name: 'Multi-Exchange Arbitrage',
      type: 'arbitrage',
      description: 'Arbitrage bot that finds price differences across multiple exchanges.',
      rating: 4.7,
      users: 320,
      profit: 15.2,
      risk: 'low',
      tags: ['Arbitrage', 'Multi-Exchange', 'Intermediate'],
    },
  ]);

  const [filter, setFilter] = useState<'all' | TradingBot['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(template => {
    if (filter !== 'all' && template.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleUseTemplate = (template: BotTemplate) => {
    // TODO: Navigate to BotBuilder with template pre-filled
    alert(`Using template: ${template.name}. This will open the Bot Builder with pre-configured settings.`);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Bot Library</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="all">All Types</option>
            <option value="dca">DCA</option>
            <option value="grid">Grid</option>
            <option value="scalping">Scalping</option>
            <option value="arbitrage">Arbitrage</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <BotTemplateCard
            key={template.id}
            template={template}
            onUse={handleUseTemplate}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">No bots match your filters</p>
        </div>
      )}
    </div>
  );
};

const BotTemplateCard: React.FC<{
  template: BotTemplate;
  onUse: (template: BotTemplate) => void;
}> = ({ template, onUse }) => {
  const riskColors = {
    low: 'bg-green-600/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-600/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
          <p className="text-sm text-gray-400 mb-3">{template.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-white font-medium">{template.rating}</span>
        </div>
        <span className="text-xs text-gray-500">•</span>
        <span className="text-xs text-gray-400">{template.users.toLocaleString()} users</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-gray-400">Avg Profit</div>
          <div className="text-lg font-bold text-green-400">+{template.profit}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Risk</div>
          <span className={`text-xs px-2 py-1 rounded border ${riskColors[template.risk]}`}>
            {template.risk.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {template.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-slate-700 rounded text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={() => onUse(template)}
        className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Use Template
      </button>
    </div>
  );
};

export default BotLibrary;

