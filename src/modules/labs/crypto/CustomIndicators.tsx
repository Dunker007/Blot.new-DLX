/**
 * Custom Indicators Workbench
 * ITC-style visual indicator builder
 */

import React, { useState } from 'react';
import { Plus, Save, Play, Trash2, Edit2, BarChart3 } from 'lucide-react';

interface Indicator {
  id: string;
  name: string;
  formula: string;
  description: string;
}

const CustomIndicators: React.FC = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [name, setName] = useState('');
  const [formula, setFormula] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name || !formula) {
      alert('Please provide a name and formula');
      return;
    }

    const newIndicator: Indicator = {
      id: selectedIndicator?.id || `indicator-${Date.now()}`,
      name,
      formula,
      description,
    };

    if (selectedIndicator) {
      setIndicators(indicators.map(i => i.id === selectedIndicator.id ? newIndicator : i));
    } else {
      setIndicators([...indicators, newIndicator]);
    }

    // Reset form
    setSelectedIndicator(null);
    setName('');
    setFormula('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this indicator?')) {
      setIndicators(indicators.filter(i => i.id !== id));
      if (selectedIndicator?.id === id) {
        setSelectedIndicator(null);
        setName('');
        setFormula('');
        setDescription('');
      }
    }
  };

  const handleEdit = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setName(indicator.name);
    setFormula(indicator.formula);
    setDescription(indicator.description);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Custom Indicators Workbench</h2>
        <button
          onClick={() => {
            setSelectedIndicator(null);
            setName('');
            setFormula('');
            setDescription('');
          }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Indicator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicator Builder */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Indicator</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Indicator Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Custom MVRV"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Formula</label>
              <textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., (market_cap / realized_cap) * 100"
                rows={4}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables like: market_cap, price, volume, active_addresses, etc.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this indicator measures..."
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {selectedIndicator ? 'Update Indicator' : 'Save Indicator'}
            </button>
          </div>
        </div>

        {/* Saved Indicators */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Saved Indicators</h3>
          <div className="space-y-3">
            {indicators.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No indicators saved yet</p>
              </div>
            ) : (
              indicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{indicator.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{indicator.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(indicator)}
                        className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(indicator.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded p-2 mt-2">
                    <code className="text-xs text-cyan-400 font-mono">{indicator.formula}</code>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How to Build Indicators</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Create custom indicators by combining multiple on-chain and market metrics.</p>
          <p><strong className="text-white">Available Variables:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>market_cap - Current market capitalization</li>
            <li>price - Current price</li>
            <li>volume - 24h trading volume</li>
            <li>active_addresses - Number of active addresses</li>
            <li>realized_cap - Realized market cap</li>
            <li>exchange_flows - Net exchange flows</li>
          </ul>
          <p className="mt-4"><strong className="text-white">Example Formulas:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>MVRV: (market_cap / realized_cap) * 100</li>
            <li>NVT: market_cap / volume</li>
            <li>Custom: (price * active_addresses) / volume</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomIndicators;

