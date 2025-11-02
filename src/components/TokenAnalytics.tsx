import { useEffect, useState } from 'react';

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Server,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { providerRouter } from '../services/providerRouter';
import { tokenTrackingService } from '../services/tokenTracking';
import { TokenBudget } from '../types';

export default function TokenAnalytics() {
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalCost: 0,
    requestCount: 0,
    avgResponseTime: 0,
  });
  const [budgets, setBudgets] = useState<TokenBudget[]>([]);
  const [topProviders, setTopProviders] = useState<any[]>([]);
  const [providerStats, setProviderStats] = useState({
    total: 0,
    healthy: 0,
    degraded: 0,
    down: 0,
    local: 0,
    cloud: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    budgets: true,
    providers: true,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [usageStats, budgetData, providerData, providerStatsData] = await Promise.all([
        tokenTrackingService.getUsageStats({
          startDate: thirtyDaysAgo,
        }),
        tokenTrackingService.getBudgetStatus(),
        tokenTrackingService.getTopProviders(5),
        providerRouter.getProviderStats(),
      ]);

      setStats(usageStats);
      setBudgets(budgetData);
      setTopProviders(providerData);
      setProviderStats(providerStatsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatCost = (cost: number): string => {
    if (cost === 0) return 'Free';
    if (cost < 0.01) return '< $0.01';
    return `$${cost.toFixed(2)}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toString();
  };

  const getBudgetStatus = (
    budget: TokenBudget
  ): {
    percentage: number;
    color: string;
    isWarning: boolean;
  } => {
    const tokenPercentage = (budget.tokens_used / budget.token_limit) * 100;
    const costPercentage = (budget.cost_spent / budget.cost_limit) * 100;
    const percentage = Math.max(tokenPercentage, costPercentage);

    let color = 'bg-green-500';
    let isWarning = false;

    if (percentage >= budget.alert_threshold) {
      color = 'bg-red-500';
      isWarning = true;
    } else if (percentage >= budget.alert_threshold * 0.75) {
      color = 'bg-yellow-500';
      isWarning = true;
    }

    return { percentage, color, isWarning };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => toggleSection('overview')}
          className="w-full flex items-center justify-between mb-4 hover:text-cyan-400 transition-colors"
        >
          <h2 className="text-2xl font-bold">Usage Overview (Last 30 Days)</h2>
          {expandedSections.overview ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {expandedSections.overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Zap size={24} className="text-cyan-400" />
                <TrendingUp size={20} className="text-green-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{formatNumber(stats.totalTokens)}</div>
              <div className="text-slate-400 text-sm">Total Tokens</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <DollarSign size={24} className="text-green-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{formatCost(stats.totalCost)}</div>
              <div className="text-slate-400 text-sm">Total Cost</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Server size={24} className="text-blue-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats.requestCount}</div>
              <div className="text-slate-400 text-sm">API Requests</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Clock size={24} className="text-orange-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{Math.round(stats.avgResponseTime)}ms</div>
              <div className="text-slate-400 text-sm">Avg Response Time</div>
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => toggleSection('budgets')}
          className="w-full flex items-center justify-between mb-4 hover:text-cyan-400 transition-colors"
        >
          <h2 className="text-2xl font-bold">Token Budgets</h2>
          {expandedSections.budgets ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {expandedSections.budgets && (
          <div className="space-y-4">
            {budgets.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <p className="text-slate-400">No active budgets configured</p>
              </div>
            ) : (
              budgets.map(budget => {
                const { percentage, color, isWarning } = getBudgetStatus(budget);

                return (
                  <div
                    key={budget.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold capitalize">
                            {budget.budget_type} Budget
                          </h3>
                          {isWarning && <AlertTriangle size={18} className="text-yellow-400" />}
                        </div>
                        <p className="text-sm text-slate-400">
                          Resets: {new Date(budget.reset_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          budget.is_active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {budget.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-400">Tokens</span>
                          <span className="font-medium">
                            {formatNumber(budget.tokens_used)} / {formatNumber(budget.token_limit)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className={`${color} h-2 rounded-full transition-all`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-400">Cost</span>
                          <span className="font-medium">
                            ${budget.cost_spent.toFixed(2)} / ${budget.cost_limit.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className={`${color} h-2 rounded-full transition-all`}
                            style={{
                              width: `${Math.min(
                                (budget.cost_spent / budget.cost_limit) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => toggleSection('providers')}
          className="w-full flex items-center justify-between mb-4 hover:text-cyan-400 transition-colors"
        >
          <h2 className="text-2xl font-bold">Provider Statistics</h2>
          {expandedSections.providers ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {expandedSections.providers && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-cyan-400 mb-1">{providerStats.total}</div>
                <div className="text-sm text-slate-400">Total Providers</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {providerStats.healthy}
                </div>
                <div className="text-sm text-slate-400">Healthy</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-400 mb-1">{providerStats.down}</div>
                <div className="text-sm text-slate-400">Down</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">{providerStats.local}</div>
                <div className="text-sm text-slate-400">Local</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-400 mb-1">{providerStats.cloud}</div>
                <div className="text-sm text-slate-400">Cloud</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Top Providers by Usage</h3>
              {topProviders.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No usage data available</p>
              ) : (
                <div className="space-y-3">
                  {topProviders.map((provider, index) => (
                    <div
                      key={provider.provider_id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-slate-500">#{index + 1}</div>
                        <div>
                          <div className="font-medium capitalize">{provider.provider_name}</div>
                          <div className="text-sm text-slate-400">
                            {provider.request_count} requests
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatNumber(provider.total_tokens)} tokens
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatCost(provider.total_cost)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
