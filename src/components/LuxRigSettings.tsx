/**
 * LuxRig Configuration Panel
 * Settings for Windows 11 home server configuration
 */

import React, { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Network, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { HolographicCard } from './HolographicCard';
import { CompactSection } from './CompactSection';

interface LuxRigStatus {
  serverRunning: boolean;
  port: number;
  lmStudioConnected: boolean;
  lmStudioUrl: string;
  systemResources: {
    cpu: number;
    ram: number;
    vram: number;
  };
  lastCheck: string;
}

const LuxRigSettings: React.FC = () => {
  const [status, setStatus] = useState<LuxRigStatus>({
    serverRunning: false,
    port: 3001,
    lmStudioConnected: false,
    lmStudioUrl: 'http://localhost:1234',
    systemResources: {
      cpu: 0,
      ram: 0,
      vram: 0,
    },
    lastCheck: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      // Check server health
      const healthResponse = await fetch('/health');
      const serverRunning = healthResponse.ok;

      // Check LM Studio connection
      let lmStudioConnected = false;
      try {
        const lmResponse = await fetch('/api/lm-studio/health');
        lmStudioConnected = lmResponse.ok;
      } catch {
        lmStudioConnected = false;
      }

      // Get system info (mock for now, would need backend endpoint)
      const systemResources = {
        cpu: Math.random() * 100,
        ram: Math.random() * 100,
        vram: Math.random() * 100,
      };

      setStatus({
        serverRunning,
        port: 3001,
        lmStudioConnected,
        lmStudioUrl: localStorage.getItem('lm_studio_url') || 'http://localhost:1234',
        systemResources,
        lastCheck: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to check LuxRig status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLmStudioUrl = (url: string) => {
    localStorage.setItem('lm_studio_url', url);
    setStatus(prev => ({ ...prev, lmStudioUrl: url }));
  };

  return (
    <div className="space-y-3">
      {/* Status Overview */}
      <CompactSection title="LuxRig Status" card glow="cyan">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <HolographicCard glow="none" compact className="border-[rgba(0,255,255,0.2)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400 uppercase mb-1">Server</div>
                <div className="flex items-center gap-2">
                  {status.serverRunning ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">Running</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400 font-semibold">Stopped</span>
                    </>
                  )}
                </div>
              </div>
              <Server className="w-5 h-5 text-cyan-400/50" />
            </div>
          </HolographicCard>

          <HolographicCard glow="none" compact className="border-[rgba(0,255,255,0.2)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400 uppercase mb-1">LM Studio</div>
                <div className="flex items-center gap-2">
                  {status.lmStudioConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-semibold">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
              <Network className="w-5 h-5 text-cyan-400/50" />
            </div>
          </HolographicCard>
        </div>

        <button
          onClick={checkStatus}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[rgba(0,255,255,0.1)] hover:bg-[rgba(0,255,255,0.2)] border border-[rgba(0,255,255,0.3)] rounded text-xs text-cyan-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </CompactSection>

      {/* System Resources */}
      <CompactSection title="System Resources" card glow="purple">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-gray-400">CPU Usage</span>
              </div>
              <span className="text-xs font-semibold text-purple-400">{status.systemResources.cpu.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[rgba(168,85,247,0.1)] rounded-full h-1.5">
              <div
                className="bg-purple-400 h-1.5 rounded-full transition-all"
                style={{ width: `${status.systemResources.cpu}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] text-gray-400">RAM Usage</span>
              </div>
              <span className="text-xs font-semibold text-cyan-400">{status.systemResources.ram.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[rgba(0,255,255,0.1)] rounded-full h-1.5">
              <div
                className="bg-cyan-400 h-1.5 rounded-full transition-all"
                style={{ width: `${status.systemResources.ram}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] text-gray-400">VRAM Usage</span>
              </div>
              <span className="text-xs font-semibold text-yellow-400">{status.systemResources.vram.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[rgba(234,179,8,0.1)] rounded-full h-1.5">
              <div
                className="bg-yellow-400 h-1.5 rounded-full transition-all"
                style={{ width: `${status.systemResources.vram}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CompactSection>

      {/* Configuration */}
      <CompactSection title="Configuration" card glow="magenta">
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1">Server Port</label>
            <input
              type="number"
              value={status.port}
              readOnly
              className="w-full px-2 py-1.5 bg-[rgba(255,0,255,0.1)] border border-[rgba(255,0,255,0.3)] rounded text-xs text-white"
            />
            <p className="text-[9px] text-gray-500 mt-1">Default: 3001 (configured in server.js)</p>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase mb-1">LM Studio URL</label>
            <input
              type="text"
              value={status.lmStudioUrl}
              onChange={(e) => updateLmStudioUrl(e.target.value)}
              className="w-full px-2 py-1.5 bg-[rgba(255,0,255,0.1)] border border-[rgba(255,0,255,0.3)] rounded text-xs text-white"
              placeholder="http://localhost:1234"
            />
            <p className="text-[9px] text-gray-500 mt-1">Update this if LM Studio runs on a different port</p>
          </div>
        </div>
      </CompactSection>

      {/* Quick Actions */}
      <CompactSection title="Quick Actions" card glow="cyan">
        <div className="space-y-1.5">
          <button className="w-full px-3 py-2 bg-[rgba(0,255,255,0.1)] hover:bg-[rgba(0,255,255,0.2)] border border-[rgba(0,255,255,0.3)] rounded text-xs text-cyan-400 transition-colors">
            View Server Logs
          </button>
          <button className="w-full px-3 py-2 bg-[rgba(0,255,255,0.1)] hover:bg-[rgba(0,255,255,0.2)] border border-[rgba(0,255,255,0.3)] rounded text-xs text-cyan-400 transition-colors">
            Open Windows Service Manager
          </button>
          <button className="w-full px-3 py-2 bg-[rgba(0,255,255,0.1)] hover:bg-[rgba(0,255,255,0.2)] border border-[rgba(0,255,255,0.3)] rounded text-xs text-cyan-400 transition-colors">
            Export Configuration
          </button>
        </div>
      </CompactSection>
    </div>
  );
};

export default LuxRigSettings;

