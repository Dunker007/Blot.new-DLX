import { useEffect, useState } from 'react';

import { Activity, Award, Clock, DollarSign, TrendingUp, Zap } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { modelDiscoveryService } from '../services/modelDiscovery';

interface ModelInsight {
  modelId: string;
  modelName: string;
  insights: any;
}

export default function ModelPerformanceDashboard() {
  const [modelInsights, setModelInsights] = useState<ModelInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const { data: models } = await supabase
        .from('models')
        .select('id, display_name, model_name')
        .eq('is_available', true)
        .limit(10);

      if (!models) {
        setLoading(false);
        return;
      }

      const insights = await Promise.all(
        models.map(async (model: any) => {
          const insight = await modelDiscoveryService.getModelInsights(model.id);
          return {
            modelId: model.id,
            modelName: model.display_name,
            insights: insight,
          };
        })
      );

      const sortedInsights = insights
        .filter((i: any) => i.insights.totalUsage > 0)
        .sort((a: any, b: any) => b.insights.totalUsage - a.insights.totalUsage);

      setModelInsights(sortedInsights);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCost = (cost: number) => {
    if (cost === 0) return 'Free';
    return `$${cost.toFixed(4)}`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-400';
    if (rate >= 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={24} className="text-cyan-400" />
          <div>
            <h3 className="text-xl font-bold">Model Performance</h3>
            <p className="text-slate-400 text-sm">Real-time analytics and insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {period === 'all' ? 'All Time' : period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {modelInsights.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Activity size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No performance data available yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Start using models to see performance metrics
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {modelInsights.map(item => (
            <div
              key={item.modelId}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold mb-1">{item.modelName}</h4>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>{item.insights.totalUsage} requests</span>
                    {item.insights.lastUsed && (
                      <span>Last used {new Date(item.insights.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                {item.insights.successRate >= 0.95 && (
                  <Award size={20} className="text-yellow-400" />
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp
                      size={14}
                      className={getSuccessRateColor(item.insights.successRate)}
                    />
                    <span className="text-xs text-slate-500">Success Rate</span>
                  </div>
                  <div
                    className={`text-lg font-semibold ${getSuccessRateColor(item.insights.successRate)}`}
                  >
                    {(item.insights.successRate * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-blue-400" />
                    <span className="text-xs text-slate-500">Avg Response</span>
                  </div>
                  <div className="text-lg font-semibold text-blue-400">
                    {formatTime(item.insights.avgResponseTime)}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-cyan-400" />
                    <span className="text-xs text-slate-500">Avg Tokens</span>
                  </div>
                  <div className="text-lg font-semibold text-cyan-400">
                    {Math.round(item.insights.avgTokensPerRequest)}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-green-400" />
                    <span className="text-xs text-slate-500">Total Cost</span>
                  </div>
                  <div className="text-lg font-semibold text-green-400">
                    {formatCost(item.insights.totalCost)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Performance Score</span>
                  <span className="font-medium text-cyan-400">
                    {Math.round(
                      item.insights.successRate * 100 - item.insights.avgResponseTime / 100
                    )}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          item.insights.successRate * 100 - item.insights.avgResponseTime / 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
