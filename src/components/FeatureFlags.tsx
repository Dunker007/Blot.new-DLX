import React, { useState, useEffect } from 'react';
import { featureFlagService, FeatureFlags, FeatureFlagState } from '../services/featureFlagService';
import { Settings, RefreshCw, Info } from 'lucide-react';

const FeatureFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFlags(featureFlagService.getFlags());
  }, []);

  const handleFlagChange = (key: string, state: FeatureFlagState) => {
    featureFlagService.setFlag(key, state);
    setFlags({ ...featureFlagService.getFlags() });
  };

  const handleReset = () => {
    if (confirm('Reset all feature flags to defaults? This cannot be undone.')) {
      featureFlagService.resetToDefaults();
      setFlags({ ...featureFlagService.getFlags() });
    }
  };

  const allStates: FeatureFlagState[] = ['active', 'preview', 'labs', 'comingSoon', 'inactive', 'disabled'];

  const getStateColor = (state: FeatureFlagState): string => {
    switch (state) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'preview':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'labs':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'comingSoon':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'disabled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const filteredFlags = Object.entries(flags).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group flags by category
  const groupedFlags: Record<string, Array<[string, FeatureFlagState]>> = {
    'Core Features': [],
    'Development Tools': [],
    'Multimodal AI': [],
    'AI Tools': [],
    'Command Center': [],
    'Lab System': [],
    'Advanced': [],
  };

  filteredFlags.forEach(([key, state]) => {
    if (key.includes('Command') || key.includes('workspace') || key.includes('projects')) {
      groupedFlags['Core Features'].push([key, state]);
    } else if (key.includes('monaco') || key.includes('code') || key.includes('editor')) {
      groupedFlags['Development Tools'].push([key, state]);
    } else if (key.includes('audio') || key.includes('image') || key.includes('video')) {
      groupedFlags['Multimodal AI'].push([key, state]);
    } else if (key.includes('mind') || key.includes('agent') || key.includes('story')) {
      groupedFlags['AI Tools'].push([key, state]);
    } else if (key.includes('idea') || key.includes('task') || key.includes('knowledge') || key.includes('crypto')) {
      groupedFlags['Command Center'].push([key, state]);
    } else if (key.includes('lab') || key.includes('aura') || key.includes('forge') || key.includes('weave') || key.includes('signal') || key.includes('creator') || key.includes('matrix')) {
      groupedFlags['Lab System'].push([key, state]);
    } else {
      groupedFlags['Advanced'].push([key, state]);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-bold text-white">Feature Flags</h1>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
          <p className="text-slate-400 mb-4">
            Control the visibility and availability of features across DLX Studios Ultimate.
            Changes are saved locally and take effect immediately.
          </p>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">State Meanings:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${getStateColor('active')}`}>active</span>
              <span className="text-slate-400">Available to all users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${getStateColor('preview')}`}>preview</span>
              <span className="text-slate-400">Early access / beta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${getStateColor('labs')}`}>labs</span>
              <span className="text-slate-400">Experimental features</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${getStateColor('comingSoon')}`}>comingSoon</span>
              <span className="text-slate-400">In development</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${getStateColor('inactive')}`}>inactive</span>
              <span className="text-slate-400">Disabled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded border ${getStateColor('disabled')}`}>disabled</span>
              <span className="text-slate-400">Not available</span>
            </div>
          </div>
        </div>

        {/* Feature Flags Table */}
        <div className="space-y-6">
          {Object.entries(groupedFlags).map(([category, categoryFlags]) => {
            if (categoryFlags.length === 0) return null;

            return (
              <div key={category} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-6 py-3 bg-slate-700/50 border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white">{category}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Feature
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Current State
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                      {categoryFlags.map(([key, state]) => (
                        <tr key={key} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{key}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStateColor(state)}`}>
                              {state}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={state}
                              onChange={(e) => handleFlagChange(key, e.target.value as FeatureFlagState)}
                              className="bg-slate-700 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-slate-600"
                            >
                              {allStates.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeatureFlagsPage;

