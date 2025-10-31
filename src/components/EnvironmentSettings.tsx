import { useState, useEffect } from 'react';
import {
  Cloud,
  HardDrive,
  Layers,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';
import { environmentDetector, EnvironmentMode } from '../services/environmentDetector';
import { providerRouter } from '../services/providerRouter';
import HybridModePanel from './HybridModePanel';

export default function EnvironmentSettings() {
  const [currentMode, setCurrentMode] = useState<EnvironmentMode>('local');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [recommendation, setRecommendation] = useState({ recommended: 'local' as EnvironmentMode, reason: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEnvironmentSettings();
  }, []);

  const loadEnvironmentSettings = async () => {
    try {
      setLoading(true);

      const env = environmentDetector.detectEnvironment();
      const dbEnv = await environmentDetector.getCurrentEnvironment();
      const rec = await environmentDetector.getModeRecommendation();

      setCurrentMode(dbEnv?.environment_name || env.mode);
      setSyncEnabled(dbEnv?.sync_enabled || false);
      setRecommendation(rec);
    } catch (error) {
      console.error('Failed to load environment settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (mode: EnvironmentMode) => {
    try {
      setSaving(true);
      await environmentDetector.setEnvironmentMode(mode);
      setCurrentMode(mode);

      if (mode === 'cloud' || mode === 'hybrid') {
        await providerRouter.performHealthChecks();
      }

      alert(`Successfully switched to ${mode} mode`);
    } catch (error) {
      console.error('Failed to change mode:', error);
      alert('Failed to change environment mode');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToggle = async () => {
    try {
      setSaving(true);
      const newSyncState = !syncEnabled;
      await environmentDetector.enableSync(newSyncState);
      setSyncEnabled(newSyncState);

      if (newSyncState) {
        alert('Cloud sync enabled. Your projects will be synchronized automatically.');
      } else {
        alert('Cloud sync disabled. Projects will remain local only.');
      }
    } catch (error) {
      console.error('Failed to toggle sync:', error);
      alert('Failed to change sync settings');
    } finally {
      setSaving(false);
    }
  };

  const performHealthCheck = async () => {
    try {
      setSaving(true);
      await providerRouter.performHealthChecks();
      alert('Health check completed. Check provider status in the Providers tab.');
    } catch (error) {
      console.error('Health check failed:', error);
      alert('Health check failed');
    } finally {
      setSaving(false);
    }
  };

  const modeOptions = [
    {
      id: 'local' as EnvironmentMode,
      name: 'Local (DIY)',
      icon: HardDrive,
      description: 'Run everything locally using LM Studio, Ollama, or other local providers',
      features: ['Complete offline capability', 'No API costs', 'Full privacy control', 'Local model management'],
      color: 'green',
    },
    {
      id: 'cloud' as EnvironmentMode,
      name: 'Cloud (.new)',
      icon: Cloud,
      description: 'Use dlxstudios.ai cloud platform with managed infrastructure',
      features: ['Access to all cloud models', 'Team collaboration', 'Automatic backups', 'Usage-based billing'],
      color: 'cyan',
    },
    {
      id: 'hybrid' as EnvironmentMode,
      name: 'Hybrid',
      icon: Layers,
      description: 'Best of both worlds - local and cloud providers working together',
      features: ['Intelligent routing', 'Cost optimization', 'Fallback redundancy', 'Flexible deployment'],
      color: 'blue',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading environment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recommendation.recommended !== currentMode && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-400 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-400 mb-1">Recommendation</div>
            <p className="text-sm text-slate-300">{recommendation.reason}</p>
            <button
              onClick={() => handleModeChange(recommendation.recommended)}
              disabled={saving}
              className="mt-3 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Switch to {recommendation.recommended} mode
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Environment Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentMode === option.id;
            const colorClasses: Record<string, string> = {
              green: isActive ? 'border-green-500 bg-green-500/10' : 'border-slate-800',
              cyan: isActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800',
              blue: isActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800',
            };

            return (
              <button
                key={option.id}
                onClick={() => !isActive && handleModeChange(option.id)}
                disabled={saving || isActive}
                className={`relative bg-slate-900 border-2 ${colorClasses[option.color]} rounded-xl p-6 text-left transition-all hover:border-${option.color}-400 disabled:cursor-not-allowed`}
              >
                {isActive && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle size={20} className={`text-${option.color}-400`} />
                  </div>
                )}

                <Icon size={32} className={`text-${option.color}-400 mb-3`} />
                <h3 className="text-lg font-semibold mb-2">{option.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{option.description}</p>

                <div className="space-y-1">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle size={12} className={`text-${option.color}-400`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Synchronization</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Cloud Sync</h3>
              <p className="text-slate-400 text-sm">
                Automatically synchronize your projects, conversations, and settings with the cloud
              </p>
            </div>
            <button
              onClick={handleSyncToggle}
              disabled={saving || currentMode === 'local'}
              className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                syncEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  syncEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {currentMode === 'local' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-400">
              Cloud sync is not available in local mode. Switch to hybrid or cloud mode to enable.
            </div>
          )}

          {syncEnabled && (currentMode === 'cloud' || currentMode === 'hybrid') && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle size={16} className="text-green-400" />
                <span>Sync is active and running</span>
              </div>
              <div className="text-xs text-slate-500">
                Last sync: Just now
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Hybrid Mode (bolt.new + .diy)</h2>
        <HybridModePanel />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={performHealthCheck}
            disabled={saving}
            className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className="text-cyan-400" />
            <div className="text-left">
              <div className="font-semibold">Health Check</div>
              <div className="text-sm text-slate-400">Test all provider connections</div>
            </div>
          </button>

          <button
            className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
            onClick={() => alert('Export functionality will download all your data')}
          >
            <Download size={20} className="text-green-400" />
            <div className="text-left">
              <div className="font-semibold">Export Data</div>
              <div className="text-sm text-slate-400">Download all projects and settings</div>
            </div>
          </button>

          <button
            className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
            onClick={() => alert('Import functionality will restore your data')}
          >
            <Upload size={20} className="text-blue-400" />
            <div className="text-left">
              <div className="font-semibold">Import Data</div>
              <div className="text-sm text-slate-400">Restore from backup file</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
