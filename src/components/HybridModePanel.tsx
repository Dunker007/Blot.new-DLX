import { useState, useEffect } from 'react';
import {
  Zap,
  Cloud,
  HardDrive,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Info,
  Upload,
  Download,
  ArrowLeftRight,
  Save,
  Clock,
} from 'lucide-react';
import { hybridBridge, LocalProviderConfig } from '../services/hybridBridge';
import { projectSyncService, SyncResult } from '../services/projectSync';

export default function HybridModePanel() {
  const [status, setStatus] = useState(hybridBridge.getStatus());
  const [checking, setChecking] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await hybridBridge.initialize();
      setStatus(hybridBridge.getStatus());
    };

    initialize();

    const interval = setInterval(() => {
      setStatus(hybridBridge.getStatus());
    }, 3000);

    return () => {
      clearInterval(interval);
      hybridBridge.cleanup();
    };
  }, []);

  const handleRefresh = async () => {
    setChecking(true);
    await hybridBridge.checkAllProviders();
    setStatus(hybridBridge.getStatus());
    setTimeout(() => setChecking(false), 1000);
  };

  const toggleHybridMode = () => {
    hybridBridge.setEnabled(!status.enabled);
    setStatus(hybridBridge.getStatus());
  };

  const handleSync = async (direction: 'upload' | 'download' | 'bidirectional') => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await projectSyncService.bidirectionalSync(direction);
      setSyncResult(result);
      setLastSync(new Date());

      if (result.success) {
        setTimeout(() => setSyncResult(null), 5000);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (provider: LocalProviderConfig) => {
    switch (provider.status) {
      case 'connected':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'disconnected':
        return <XCircle size={16} className="text-slate-500" />;
      case 'checking':
        return <RefreshCw size={16} className="text-cyan-400 animate-spin" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
    }
  };

  const getStatusColor = (provider: LocalProviderConfig) => {
    switch (provider.status) {
      case 'connected':
        return 'border-green-500/30 bg-green-500/5';
      case 'disconnected':
        return 'border-slate-700 bg-slate-800/50';
      case 'checking':
        return 'border-cyan-500/30 bg-cyan-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
    }
  };

  const connectedCount = status.providers.filter(p => p.status === 'connected').length;
  const isHybridActive = status.enabled && connectedCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${
            isHybridActive
              ? 'bg-gradient-to-br from-cyan-500/20 to-green-500/20 border-cyan-500/30'
              : 'bg-slate-800 border-slate-700'
          }`}>
            <Zap size={20} className={isHybridActive ? 'text-cyan-400' : 'text-slate-400'} />
          </div>
          <div>
            <h3 className="font-semibold">Hybrid Mode</h3>
            <p className="text-sm text-slate-400">
              {isHybridActive
                ? `${connectedCount} local provider${connectedCount > 1 ? 's' : ''} connected`
                : 'No local providers detected'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Info size={18} className="text-slate-400" />
        </button>
      </div>

      {showInfo && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm space-y-2">
          <div className="font-semibold text-blue-400 flex items-center gap-2">
            <Info size={16} />
            How Hybrid Mode Works
          </div>
          <div className="text-slate-300 space-y-2">
            <p>
              Hybrid mode lets you use <strong>bolt.new's cloud interface</strong> while routing
              AI requests to your <strong>local providers</strong> (LM Studio, Ollama).
            </p>
            <div className="pl-4 space-y-1 text-xs text-slate-400">
              <div>• Keep working in bolt.new's UI</div>
              <div>• Send requests to your local machine</div>
              <div>• Pay $0 for AI tokens</div>
              <div>• Auto-fallback to cloud if local fails</div>
            </div>
            <div className="pt-2 border-t border-blue-500/20">
              <strong>Setup:</strong> Run proxy server locally:
              <code className="block mt-1 p-2 bg-slate-900 rounded text-cyan-400">
                node local-proxy-server.js
              </code>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">Enable Hybrid Mode</div>
          <button
            onClick={toggleHybridMode}
            disabled={connectedCount === 0}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              status.enabled ? 'bg-cyan-500' : 'bg-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                status.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {connectedCount === 0 && (
          <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            No local providers detected. Make sure LM Studio or Ollama is running and the proxy server is started.
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Local Providers</span>
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={`text-cyan-400 ${checking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {status.providers.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              Checking for local providers...
            </div>
          ) : (
            <div className="space-y-2">
              {status.providers.map((provider, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all ${getStatusColor(provider)}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(provider)}
                    <div>
                      <div className="text-sm font-medium">{provider.name}</div>
                      <div className="text-xs text-slate-500">{provider.endpoint}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-xs text-slate-400">
                    {provider.status === 'connected' && provider.latency && (
                      <div className="text-green-400 font-medium">{provider.latency}ms</div>
                    )}
                    <div className="capitalize">{provider.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isHybridActive && (
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <Activity size={14} className="animate-pulse" />
              <span>Hybrid mode active - requests routed to local providers</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <HardDrive size={16} className="text-cyan-400 mx-auto mb-1" />
          <div className="text-xs text-slate-400">Local</div>
          <div className="text-sm font-bold">{connectedCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <Cloud size={16} className="text-blue-400 mx-auto mb-1" />
          <div className="text-xs text-slate-400">Cloud</div>
          <div className="text-sm font-bold">Ready</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <Zap size={16} className="text-green-400 mx-auto mb-1" />
          <div className="text-xs text-slate-400">Status</div>
          <div className="text-sm font-bold">{isHybridActive ? 'Active' : 'Cloud'}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-cyan-400" />
            <span className="font-semibold">Project Sync</span>
          </div>
          {lastSync && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={12} />
              <span>{lastSync.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {syncResult && (
          <div className={`text-xs p-3 rounded-lg border ${
            syncResult.success
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className="font-semibold mb-1">
              {syncResult.success ? 'Sync Complete!' : 'Sync Issues'}
            </div>
            <div className="space-y-0.5 text-slate-300">
              {syncResult.projectsUploaded > 0 && (
                <div>↑ {syncResult.projectsUploaded} project(s) uploaded</div>
              )}
              {syncResult.projectsDownloaded > 0 && (
                <div>↓ {syncResult.projectsDownloaded} project(s) downloaded</div>
              )}
              {syncResult.conflicts.length > 0 && (
                <div>⚠ {syncResult.conflicts.length} conflict(s) detected</div>
              )}
              {syncResult.errors.length > 0 && (
                <div className="text-red-400">{syncResult.errors[0]}</div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSync('upload')}
            disabled={syncing}
            className="flex flex-col items-center gap-1 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} className="text-cyan-400" />
            <span className="text-xs">Upload</span>
          </button>
          <button
            onClick={() => handleSync('download')}
            disabled={syncing}
            className="flex flex-col items-center gap-1 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} className="text-blue-400" />
            <span className="text-xs">Download</span>
          </button>
          <button
            onClick={() => handleSync('bidirectional')}
            disabled={syncing}
            className="flex flex-col items-center gap-1 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-green-500/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight size={16} className="text-green-400" />
            <span className="text-xs">Bi-Sync</span>
          </button>
        </div>

        {syncing && (
          <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
            <RefreshCw size={14} className="animate-spin" />
            <span>Syncing projects...</span>
          </div>
        )}
      </div>
    </div>
  );
}
