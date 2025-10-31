import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Server, Database, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { hybridBridge } from '../services/hybridBridge';
import { requestCache } from '../services/requestCache';
import { providerRouter } from '../services/providerRouter';

interface ProviderStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  latency?: number;
  consecutiveFailures?: number;
  availableModels?: string[];
}

export default function ConnectionDashboard() {
  const [localProviders, setLocalProviders] = useState<ProviderStatus[]>([]);
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
  });
  const [queueStats, setQueueStats] = useState({
    queueSize: 0,
    activeRequests: 0,
  });
  const [providerStats, setProviderStats] = useState({
    total: 0,
    healthy: 0,
    degraded: 0,
    down: 0,
    local: 0,
    cloud: 0,
  });

  useEffect(() => {
    const updateStats = async () => {
      const bridgeStatus = hybridBridge.getStatus();
      setLocalProviders(bridgeStatus.providers);

      const cache = requestCache.getStats();
      setCacheStats(cache);

      setQueueStats({
        queueSize: hybridBridge.getQueueSize(),
        activeRequests: hybridBridge.getActiveRequests(),
      });

      const stats = await providerRouter.getProviderStats();
      setProviderStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'disconnected':
        return 'text-red-400';
      case 'checking':
        return 'text-yellow-400';
      case 'error':
        return 'text-orange-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi size={16} className="text-green-400" />;
      case 'disconnected':
      case 'error':
        return <WifiOff size={16} className="text-red-400" />;
      case 'checking':
        return <Activity size={16} className="text-yellow-400 animate-pulse" />;
      default:
        return <AlertCircle size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Connection Status</h1>
        <p className="text-slate-400 text-lg">Monitor your local and cloud provider connections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Server size={20} className="text-cyan-400" />
            <span className="text-2xl font-bold text-slate-100">
              {providerStats.total}
            </span>
          </div>
          <p className="text-sm text-slate-400">Total Providers</p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="text-green-400">{providerStats.healthy} healthy</span>
            <span className="text-red-400">{providerStats.down} down</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Database size={20} className="text-blue-400" />
            <span className="text-2xl font-bold text-slate-100">
              {cacheStats.size}
            </span>
          </div>
          <p className="text-sm text-slate-400">Cache Entries</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Hit Rate</span>
              <span className="text-green-400">
                {(cacheStats.hitRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap size={20} className="text-yellow-400" />
            <span className="text-2xl font-bold text-slate-100">
              {queueStats.activeRequests}
            </span>
          </div>
          <p className="text-sm text-slate-400">Active Requests</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Queued</span>
              <span className="text-slate-300">{queueStats.queueSize}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} className="text-purple-400" />
            <span className="text-2xl font-bold text-slate-100">
              {cacheStats.hits + cacheStats.misses}
            </span>
          </div>
          <p className="text-sm text-slate-400">Total Requests</p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="text-green-400">{cacheStats.hits} cached</span>
            <span className="text-slate-500">{cacheStats.misses} miss</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Server size={20} className="text-cyan-400" />
          <h2 className="text-xl font-bold">Local Providers</h2>
        </div>

        {localProviders.length === 0 ? (
          <div className="text-center py-12">
            <WifiOff size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No local providers detected</p>
            <p className="text-sm text-slate-500 mt-2">
              Start LM Studio or Ollama to enable local AI models
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {localProviders.map((provider, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(provider.status)}
                  <div>
                    <h3 className="font-medium text-slate-100">{provider.name}</h3>
                    <p className="text-sm text-slate-400">
                      {provider.availableModels && provider.availableModels.length > 0
                        ? `${provider.availableModels.length} models available`
                        : 'No models detected'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {provider.latency !== undefined && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-100">
                        {provider.latency}ms
                      </p>
                      <p className="text-xs text-slate-500">Latency</p>
                    </div>
                  )}

                  {provider.consecutiveFailures !== undefined &&
                    provider.consecutiveFailures > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-400">
                          {provider.consecutiveFailures}
                        </p>
                        <p className="text-xs text-slate-500">Failures</p>
                      </div>
                    )}

                  <div className="text-right min-w-[100px]">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        provider.status === 'connected'
                          ? 'bg-green-500/10 text-green-400'
                          : provider.status === 'checking'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {provider.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database size={20} className="text-blue-400" />
          <h2 className="text-xl font-bold">Cache Performance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-2">Cache Hit Rate</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-100">
                {(cacheStats.hitRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${cacheStats.hitRate * 100}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-2">Total Hits</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-green-400">
                {cacheStats.hits}
              </span>
              <span className="text-sm text-slate-500 mb-1">requests</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-2">Cache Misses</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-400">
                {cacheStats.misses}
              </span>
              <span className="text-sm text-slate-500 mb-1">requests</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={20} className="text-yellow-400" />
          <h2 className="text-xl font-bold">Request Queue</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Active Requests</p>
            <p className="text-4xl font-bold text-cyan-400">
              {queueStats.activeRequests}
            </p>
          </div>

          <div className="text-center p-6 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Queued Requests</p>
            <p className="text-4xl font-bold text-yellow-400">
              {queueStats.queueSize}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
