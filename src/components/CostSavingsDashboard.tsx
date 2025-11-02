import { useEffect, useState } from 'react';

import { CheckCircle, Cloud, DollarSign, Server, TrendingDown, Zap } from 'lucide-react';

import { lmStudioService } from '../services/lmStudio';
import { components, gradients, utils } from '../styles/designSystem';

interface CostSavings {
  totalSavings: number;
  localRequests: number;
  cloudRequests: number;
  savingsRate: number;
  lastSaving: string;
}

export default function CostSavingsDashboard() {
  const [isLMStudioAvailable, setIsLMStudioAvailable] = useState(false);
  const [costData, setCostData] = useState<CostSavings>({
    totalSavings: 0,
    localRequests: 0,
    cloudRequests: 0,
    savingsRate: 0,
    lastSaving: '$0.0000',
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    checkLMStudioStatus();
    // Check every 30 seconds
    const interval = setInterval(checkLMStudioStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkLMStudioStatus = async () => {
    const available = await lmStudioService.isAvailable();
    setIsLMStudioAvailable(available);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await lmStudioService.chat([
        { role: 'user', content: 'Hello, this is a test message for cost tracking' },
      ]);

      // Update cost data with mock savings for demo
      setCostData(prev => ({
        totalSavings: prev.totalSavings + 0.0045,
        localRequests: prev.localRequests + 1,
        cloudRequests: prev.cloudRequests,
        savingsRate: 85,
        lastSaving: result.cost_savings,
      }));
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div
      className={`${components.card} bg-gradient-to-br ${gradients.primary}/10 border-purple-500/30 backdrop-blur-xl`}
    >
      <div className={`${utils.spaceBetween} mb-8`}>
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-xl shadow-lg">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">LuxRig Cost Savings</h3>
            <div className="flex items-center space-x-3 mt-2">
              <div
                className={`w-3 h-3 rounded-full ${isLMStudioAvailable ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`}
              ></div>
              <span
                className={`font-medium ${isLMStudioAvailable ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {isLMStudioAvailable ? 'LM Studio Connected' : 'LM Studio Offline'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={testConnection}
          disabled={!isLMStudioAvailable || isTestingConnection}
          className={`${components.buttonPrimary} ${utils.hoverGlow} px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTestingConnection ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      <div className={`${utils.gridResponsive} gap-6 mb-8`}>
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-emerald-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingDown className="w-6 h-6 text-emerald-400" />
            <span className="text-white/70 font-medium">Total Saved</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            ${costData.totalSavings.toFixed(4)}
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="w-6 h-6 text-purple-400" />
            <span className="text-white/70 font-medium">Local Requests</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">{costData.localRequests}</div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <Cloud className="w-6 h-6 text-cyan-400" />
            <span className="text-white/70 font-medium">Cloud Requests</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">{costData.cloudRequests}</div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-amber-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-amber-400" />
            <span className="text-white/70 font-medium">Savings Rate</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{costData.savingsRate}%</div>
        </div>
      </div>

      {isLMStudioAvailable && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
            <div>
              <div className="text-emerald-400 font-bold text-lg">Cost Optimization Active</div>
              <div className="text-white/70 mt-1">
                Simple tasks are being routed to LuxRig automatically. Last saving:{' '}
                <span className="text-emerald-400 font-semibold">{costData.lastSaving}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLMStudioAvailable && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <Server className="w-7 h-7 text-red-400" />
            <div>
              <div className="text-red-400 font-bold text-lg">LM Studio Unavailable</div>
              <div className="text-white/70 mt-1">
                All requests are using cloud APIs. Start LM Studio to enable cost savings.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
