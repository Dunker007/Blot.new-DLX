/**
 * Labs Hub - Central navigation for all specialized labs
 * Ported from DLX-Ultra-2 concept
 */

import React, { useState } from 'react';
import { LABS, getLabsByCategory } from './labsConfig';
import { Lab, LabId } from './types';
import { FlaskConical, Sparkles, Search, Settings, ArrowRight, Lock } from 'lucide-react';

const LabsHub: React.FC<{ onSelectLab: (labId: LabId) => void }> = ({ onSelectLab }) => {
  const [selectedCategory, setSelectedCategory] = useState<Lab['category'] | 'all'>('all');

  const categories: Array<{ id: Lab['category'] | 'all'; name: string; icon: any }> = [
    { id: 'all', name: 'All Labs', icon: FlaskConical },
    { id: 'ai', name: 'AI Labs', icon: Sparkles },
    { id: 'development', name: 'Development', icon: Settings },
    { id: 'research', name: 'Research', icon: Search },
    { id: 'system', name: 'System', icon: Settings },
  ];

  const displayedLabs =
    selectedCategory === 'all' ? LABS : getLabsByCategory(selectedCategory);

  const getStatusBadge = (status: Lab['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>;
      case 'preview':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Preview</span>;
      case 'coming-soon':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Coming Soon</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="w-10 h-10 text-cyan-400" />
            <h1 className="text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">
              Labs Hub
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Specialized AI-powered tools and interfaces for advanced workflows. Each lab is designed for
            specific tasks and can be enabled via Feature Flags.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedLabs.map((lab) => {
            const isAvailable = lab.status === 'active' || lab.status === 'preview';
            return (
              <div
                key={lab.id}
                className={`bg-slate-800/50 border rounded-lg p-6 transition-all duration-300 ${
                  isAvailable
                    ? 'border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer'
                    : 'border-slate-700 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (isAvailable) {
                    onSelectLab(lab.id);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{lab.icon}</div>
                  {getStatusBadge(lab.status)}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{lab.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{lab.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase">{lab.category}</span>
                  {isAvailable ? (
                    <ArrowRight className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-slate-800/30 border border-cyan-500/20 rounded-lg">
          <p className="text-sm text-gray-400">
            <strong className="text-cyan-400">Tip:</strong> Enable labs via Feature Flags in Settings. Labs marked
            as "Preview" are in beta and may have limited functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabsHub;

