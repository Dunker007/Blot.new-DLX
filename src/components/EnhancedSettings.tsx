import { useState } from 'react';

import { Activity, BarChart3, Brain, Globe, Key, Network, Server, Settings as SettingsIcon } from 'lucide-react';

import EnvironmentSettings from './EnvironmentSettings';
import GeminiSettings from './GeminiSettings';
import LuxRigSettings from './LuxRigSettings';
import ModelPerformanceDashboard from './ModelPerformanceDashboard';
import ModelRecommendations from './ModelRecommendations';
import Settings from './Settings';
import SpaceshipDNSManager from './SpaceshipDNSManager';
import TokenAnalytics from './TokenAnalytics';

type TabType = 'luxrig' | 'dns' | 'providers' | 'recommendations' | 'performance' | 'analytics' | 'environment' | 'gemini';

export default function EnhancedSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('luxrig');

  const tabs = [
    { id: 'luxrig' as TabType, label: 'LuxRig', icon: Server },
    { id: 'dns' as TabType, label: 'DNS Manager', icon: Network },
    { id: 'gemini' as TabType, label: 'Gemini API', icon: Key },
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

      <div className="bg-[#0f0f1a] border border-[rgba(0,255,255,0.3)] rounded-lg overflow-hidden">
        <div className="flex border-b border-[rgba(0,255,255,0.2)] overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[rgba(0,255,255,0.15)] text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-cyan-300 hover:bg-[rgba(0,255,255,0.05)]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3">
          {activeTab === 'luxrig' && <LuxRigSettings />}
          {activeTab === 'dns' && <SpaceshipDNSManager />}
          {activeTab === 'gemini' && <GeminiSettings />}
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
