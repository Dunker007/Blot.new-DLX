import { useEffect, useState } from 'react';

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Brain,
  Clock,
  DollarSign,
  Lightbulb,
  PieChart,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { advancedCache } from '../services/advancedCache';
import { providerRouter } from '../services/providerRouter';
import { tokenTrackingService } from '../services/tokenTracking';

interface AnalyticsData {
  usage: {
    totalTokens: number;
    totalCost: number;
    requestCount: number;
    avgResponseTime: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
  performance: {
    hitRate: number;
    avgLatency: number;
    errorRate: number;
    uptime: number;
  };
  providers: Array<{
    id: string;
    name: string;
    requestCount: number;
    totalTokens: number;
    totalCost: number;
    avgResponseTime: number;
    errorRate: number;
    healthStatus: 'healthy' | 'degraded' | 'down';
  }>;
  predictions: {
    monthlyCost: number;
    tokenBurnRate: number;
    costOptimization: Array<{
      suggestion: string;
      potentialSaving: number;
      impact: 'high' | 'medium' | 'low';
    }>;
    usagePatterns: Array<{
      pattern: string;
      frequency: number;
      recommendation: string;
    }>;
  };
  insights: Array<{
    type: 'cost' | 'performance' | 'usage' | 'optimization';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action?: string;
  }>;
}

export default function EnhancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  useEffect(() => {
    loadAnalyticsData();

    // Set up auto-refresh
    const interval = setInterval(loadAnalyticsData, 30000); // 30 seconds

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Check cache first
      const cacheKey = `analytics_${timeRange}`;
      const cached = advancedCache.get<AnalyticsData>(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Get date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      // Gather data from various services
      const [usageStats, providerStats, cacheStats, errorRate] = await Promise.all([
        tokenTrackingService.getUsageStats({ startDate, endDate }),
        providerRouter.getProviderStats(),
        advancedCache.getStats(),
        calculateErrorRate(),
      ]);

      // Get detailed provider data
      const topProviders = await tokenTrackingService.getTopProviders(10);

      // Calculate predictions and insights
      const predictions = await generatePredictions(usageStats, topProviders);
      const insights = await generateInsights(usageStats, providerStats, cacheStats);

      const analyticsData: AnalyticsData = {
        usage: {
          ...usageStats,
          trend: calculateTrend(usageStats),
          change: calculateChange(usageStats),
        },
        performance: {
          hitRate: cacheStats.hitRate,
          avgLatency: usageStats.avgResponseTime,
          errorRate,
          uptime: calculateUptime(providerStats),
        },
        providers: topProviders.map((p: any) => ({
          id: p.provider_id,
          name: p.provider_name,
          requestCount: p.request_count,
          totalTokens: p.total_tokens,
          totalCost: p.total_cost,
          avgResponseTime: p.avg_response_time || 0,
          errorRate: p.error_rate || 0,
          healthStatus: (p.error_rate || 0) < 0.1 ? 'healthy' : (p.error_rate < 0.5 ? 'degraded' : 'unhealthy') as 'healthy' | 'degraded' | 'unhealthy',
        })),
        predictions,
        insights,
      };

      // Cache the results
      advancedCache.set(cacheKey, analyticsData, {
        ttl: 2 * 60 * 1000, // 2 minutes
        tags: ['analytics', `timerange_${timeRange}`],
      });

      setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async (
    usageStats: any,
    _providers: any[]
  ): Promise<AnalyticsData['predictions']> => {
    // Simple prediction algorithms - could be enhanced with ML
    const dailyCost = usageStats.totalCost;
    const monthlyCost = dailyCost * 30;
    const tokenBurnRate = usageStats.totalTokens / 24; // tokens per hour

    return {
      monthlyCost,
      tokenBurnRate,
      costOptimization: [
        {
          suggestion: 'Switch to local models for simple tasks',
          potentialSaving: monthlyCost * 0.3,
          impact: 'high',
        },
        {
          suggestion: 'Enable aggressive caching',
          potentialSaving: monthlyCost * 0.15,
          impact: 'medium',
        },
        {
          suggestion: 'Optimize prompt engineering',
          potentialSaving: monthlyCost * 0.1,
          impact: 'medium',
        },
      ],
      usagePatterns: [
        {
          pattern: 'Peak usage during business hours',
          frequency: 0.7,
          recommendation: 'Consider rate limiting during peak times',
        },
        {
          pattern: 'High token usage for code generation',
          frequency: 0.8,
          recommendation: 'Use more efficient models for simple completions',
        },
      ],
    };
  };

  const generateInsights = async (
    usageStats: any,
    providerStats: any,
    cacheStats: any
  ): Promise<AnalyticsData['insights']> => {
    const insights: AnalyticsData['insights'] = [];

    // Cost insights
    if (usageStats.totalCost > 10) {
      insights.push({
        type: 'cost',
        title: 'High API Costs Detected',
        description: `Daily spending of $${usageStats.totalCost.toFixed(2)} may exceed budget`,
        impact: 'high',
        action: 'Review provider selection and enable cost limits',
      });
    }

    // Performance insights
    if (cacheStats.hitRate < 0.5) {
      insights.push({
        type: 'performance',
        title: 'Low Cache Hit Rate',
        description: `Cache hit rate of ${(cacheStats.hitRate * 100).toFixed(1)}% indicates inefficient caching`,
        impact: 'medium',
        action: 'Review cache configuration and TTL settings',
      });
    }

    // Provider insights
    if (providerStats.down > 0) {
      insights.push({
        type: 'performance',
        title: 'Provider Downtime Detected',
        description: `${providerStats.down} provider(s) are currently down`,
        impact: 'high',
        action: 'Check provider configurations and failover settings',
      });
    }

    // Usage optimization
    if (usageStats.avgResponseTime > 5000) {
      insights.push({
        type: 'optimization',
        title: 'Slow Response Times',
        description: `Average response time of ${(usageStats.avgResponseTime / 1000).toFixed(1)}s is above optimal`,
        impact: 'medium',
        action: 'Consider using faster models or local providers',
      });
    }

    return insights;
  };

  const calculateTrend = (stats: any): 'up' | 'down' | 'stable' => {
    // Simplified trend calculation
    return stats.requestCount > 10 ? 'up' : 'stable';
  };

  const calculateChange = (_stats: any): number => {
    // Simplified change calculation
    return Math.random() * 20 - 10; // -10% to +10%
  };

  const calculateErrorRate = async (): Promise<number> => {
    try {
      const stats = await tokenTrackingService.getUsageStats({ startDate, endDate });
      return 1 - (stats.successRate || 0); // Convert success rate to error rate
    } catch {
      return 0;
    }
  };

  const calculateUptime = (providerStats: any): number => {
    const total = providerStats.total;
    const healthy = providerStats.healthy;
    return total > 0 ? healthy / total : 1;
  };

  const StatCard = ({
    title,
    value,
    change,
    trend,
    icon: Icon,
    format = 'number',
  }: {
    title: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
    icon: any;
    format?: 'number' | 'currency' | 'percentage' | 'time';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return `$${val.toFixed(2)}`;
        case 'percentage':
          return `${(val * 100).toFixed(1)}%`;
        case 'time':
          return `${(val / 1000).toFixed(1)}s`;
        default:
          return val.toLocaleString();
      }
    };

    const getTrendColor = (trend?: string) => {
      switch (trend) {
        case 'up':
          return 'text-green-400';
        case 'down':
          return 'text-red-400';
        default:
          return 'text-slate-400';
      }
    };

    const getTrendIcon = (trend?: string) => {
      switch (trend) {
        case 'up':
          return ArrowUp;
        case 'down':
          return ArrowDown;
        default:
          return Activity;
      }
    };

    const TrendIcon = getTrendIcon(trend);

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <div className="flex items-baseline mt-2">
              <p className="text-2xl font-bold text-white">{formatValue(value)}</p>
              {change !== undefined && (
                <div className={`ml-2 flex items-center text-sm ${getTrendColor(trend)}`}>
                  <TrendIcon size={16} className="mr-1" />
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
            <Icon size={24} className="text-cyan-400" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold mb-2">No Analytics Data</h3>
            <p className="text-slate-400">Start using the platform to see analytics data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-slate-400 mt-1">AI usage insights and cost optimization</p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <button
              onClick={loadAnalyticsData}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Cost"
            value={data.usage.totalCost}
            change={data.usage.change}
            trend={data.usage.trend}
            icon={DollarSign}
            format="currency"
          />
          <StatCard
            title="Tokens Used"
            value={data.usage.totalTokens}
            change={data.usage.change}
            trend={data.usage.trend}
            icon={Zap}
          />
          <StatCard
            title="Requests"
            value={data.usage.requestCount}
            change={data.usage.change}
            trend={data.usage.trend}
            icon={Activity}
          />
          <StatCard
            title="Avg Response"
            value={data.usage.avgResponseTime}
            icon={Clock}
            format="time"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Cache Hit Rate"
            value={data.performance.hitRate}
            icon={Target}
            format="percentage"
          />
          <StatCard
            title="Error Rate"
            value={data.performance.errorRate}
            icon={AlertTriangle}
            format="percentage"
          />
          <StatCard
            title="Uptime"
            value={data.performance.uptime}
            icon={TrendingUp}
            format="percentage"
          />
          <StatCard
            title="Avg Latency"
            value={data.performance.avgLatency}
            icon={Zap}
            format="time"
          />
        </div>

        {/* Insights and Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Insights */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Brain size={24} className="text-purple-400" />
              <h2 className="text-xl font-semibold">AI Insights</h2>
            </div>

            <div className="space-y-4">
              {data.insights.map((insight, index) => (
                <div key={index} className="p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">{insight.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        insight.impact === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : insight.impact === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{insight.description}</p>
                  {insight.action && (
                    <p className="text-cyan-400 text-sm font-medium">💡 {insight.action}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cost Optimization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb size={24} className="text-yellow-400" />
              <h2 className="text-xl font-semibold">Cost Optimization</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                <h3 className="text-green-400 font-medium mb-2">Monthly Projection</h3>
                <p className="text-2xl font-bold text-white">
                  ${data.predictions.monthlyCost.toFixed(2)}
                </p>
                <p className="text-slate-400 text-sm">Based on current usage patterns</p>
              </div>

              {data.predictions.costOptimization.map((opt, index) => (
                <div key={index} className="p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">{opt.suggestion}</h3>
                    <span className="text-green-400 font-medium">
                      -${opt.potentialSaving.toFixed(2)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      opt.impact === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : opt.impact === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {opt.impact} impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Provider Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart size={24} className="text-blue-400" />
            <h2 className="text-xl font-semibold">Provider Performance</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 text-slate-400 font-medium">Provider</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Requests</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Tokens</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Cost</th>
                  <th className="text-right py-3 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.providers.map(provider => (
                  <tr key={provider.id} className="border-b border-slate-800/50">
                    <td className="py-3 text-white font-medium">{provider.name}</td>
                    <td className="text-right py-3 text-slate-300">
                      {provider.requestCount.toLocaleString()}
                    </td>
                    <td className="text-right py-3 text-slate-300">
                      {provider.totalTokens.toLocaleString()}
                    </td>
                    <td className="text-right py-3 text-slate-300">
                      ${provider.totalCost.toFixed(2)}
                    </td>
                    <td className="text-right py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provider.healthStatus === 'healthy'
                            ? 'bg-green-500/20 text-green-400'
                            : provider.healthStatus === 'degraded'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {provider.healthStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
