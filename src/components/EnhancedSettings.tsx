import { useState } from 'react';

import { Activity, BarChart3, Brain, Globe, Server, Settings as SettingsIcon } from 'lucide-react';

import EnvironmentSettings from './EnvironmentSettings';
import ModelPerformanceDashboard from './ModelPerformanceDashboard';
import ModelRecommendations from './ModelRecommendations';
import Settings from './Settings';
import TokenAnalytics from './TokenAnalytics';

type TabType = 'providers' | 'recommendations' | 'performance' | 'analytics' | 'environment';

export default function EnhancedSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('providers');

  const tabs = [
    { id: 'providers' as TabType, label: 'Providers & Models', icon: Server },
    { id: 'recommendations' as TabType, label: 'AI Recommendations', icon: Brain },
    { id: 'performance' as TabType, label: 'Performance', icon: Activity },
    { id: 'analytics' as TabType, label: 'Token Analytics', icon: BarChart3 },
    { id: 'environment' as TabType, label: 'Environment', icon: Globe },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon size={32} className="text-cyan-400" />
        <div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-slate-400 text-lg">Configure your DLX Studios workspace</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-800">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'providers' && <Settings />}
          {activeTab === 'recommendations' && <ModelRecommendations />}
          {activeTab === 'performance' && <ModelPerformanceDashboard />}
          {activeTab === 'analytics' && <TokenAnalytics />}
          {activeTab === 'environment' && <EnvironmentSettings />}
        </div>
      </div>
    </div>
  );
}
