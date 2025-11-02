import { useEffect, useState } from 'react';

import {
  Activity,
  BarChart3,
  DollarSign,
  Edit2,
  Pause,
  Play,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import { Project, TradingStrategy } from '../types';

export default function TradingBots() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    strategy_type: 'trend_following' as const,
    project_id: '',
    parameters: {},
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [strategiesResult, projectsResult] = await Promise.all([
        supabase.from('trading_strategies').select('*').order('updated_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
          .eq('project_type', 'trading_bot')
          .order('name', { ascending: true }),
      ]);

      if (strategiesResult.data) setStrategies(strategiesResult.data);
      if (projectsResult.data) setProjects(projectsResult.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStrategy = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .insert([
          {
            ...newStrategy,
            project_id: newStrategy.project_id || null,
            is_active: false,
            performance_metrics: {},
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setStrategies([data, ...strategies]);
        setShowCreateModal(false);
        resetNewStrategy();
      }
    } catch (error) {
      console.error('Failed to create strategy:', error);
      alert('Failed to create strategy. Please try again.');
    }
  };

  const updateStrategy = async () => {
    if (!selectedStrategy) return;

    try {
      const { error } = await supabase
        .from('trading_strategies')
        .update({
          name: selectedStrategy.name,
          description: selectedStrategy.description,
          strategy_type: selectedStrategy.strategy_type,
          project_id: selectedStrategy.project_id || null,
          parameters: selectedStrategy.parameters,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedStrategy.id);

      if (error) throw error;

      setStrategies(strategies.map(s => (s.id === selectedStrategy.id ? selectedStrategy : s)));
      setShowEditModal(false);
      setSelectedStrategy(null);
    } catch (error) {
      console.error('Failed to update strategy:', error);
      alert('Failed to update strategy. Please try again.');
    }
  };

  const deleteStrategy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;

    try {
      const { error } = await supabase.from('trading_strategies').delete().eq('id', id);

      if (error) throw error;

      setStrategies(strategies.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      alert('Failed to delete strategy. Please try again.');
    }
  };

  const toggleStrategyStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('trading_strategies')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setStrategies(strategies.map(s => (s.id === id ? { ...s, is_active: !currentStatus } : s)));
    } catch (error) {
      console.error('Failed to toggle strategy status:', error);
      alert('Failed to toggle strategy status. Please try again.');
    }
  };

  const resetNewStrategy = () => {
    setNewStrategy({
      name: '',
      description: '',
      strategy_type: 'trend_following',
      project_id: '',
      parameters: {},
    });
  };

  const strategyTypeLabels: Record<string, string> = {
    trend_following: 'Trend Following',
    mean_reversion: 'Mean Reversion',
    arbitrage: 'Arbitrage',
    market_making: 'Market Making',
    custom: 'Custom',
  };

  const strategyTypeColors: Record<string, string> = {
    trend_following: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    mean_reversion: 'bg-green-500/10 text-green-400 border-green-500/20',
    arbitrage: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    market_making: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    custom: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading strategies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Trading Bot Studio</h1>
        <p className="text-slate-400 text-lg">Build and manage crypto trading strategies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Activity size={24} className="text-cyan-400" />
            <span className="text-3xl font-bold">{strategies.length}</span>
          </div>
          <div className="text-slate-400 text-sm">Total Strategies</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Play size={24} className="text-green-400" />
            <span className="text-3xl font-bold">{strategies.filter(s => s.is_active).length}</span>
          </div>
          <div className="text-slate-400 text-sm">Active Strategies</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 size={24} className="text-blue-400" />
            <span className="text-3xl font-bold">{projects.length}</span>
          </div>
          <div className="text-slate-400 text-sm">Trading Projects</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign size={24} className="text-yellow-400" />
            <span className="text-3xl font-bold">
              {strategies.reduce((acc, s) => acc + (s.performance_metrics.total_trades || 0), 0)}
            </span>
          </div>
          <div className="text-slate-400 text-sm">Total Trades</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Strategies</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          New Strategy
        </button>
      </div>

      {strategies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {strategies.map(strategy => {
            const project = projects.find(p => p.id === strategy.project_id);
            return (
              <div
                key={strategy.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{strategy.name}</h3>
                      {strategy.is_active ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">
                          <Play size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
                          <Pause size={12} />
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{strategy.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStrategyStatus(strategy.id, strategy.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        strategy.is_active
                          ? 'hover:bg-red-500/20 text-red-400'
                          : 'hover:bg-green-500/20 text-green-400'
                      }`}
                      title={strategy.is_active ? 'Pause strategy' : 'Activate strategy'}
                    >
                      {strategy.is_active ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStrategy(strategy);
                        setShowEditModal(true);
                      }}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit strategy"
                    >
                      <Edit2 size={16} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => deleteStrategy(strategy.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete strategy"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-3 py-1 border rounded-full text-xs font-medium ${
                      strategyTypeColors[strategy.strategy_type]
                    }`}
                  >
                    {strategyTypeLabels[strategy.strategy_type]}
                  </span>
                  {project && (
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs">
                      {project.name}
                    </span>
                  )}
                </div>

                {Object.keys(strategy.performance_metrics).length > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                    {strategy.performance_metrics.total_trades !== undefined && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Total Trades</div>
                        <div className="text-lg font-semibold">
                          {strategy.performance_metrics.total_trades}
                        </div>
                      </div>
                    )}
                    {strategy.performance_metrics.win_rate !== undefined && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Win Rate</div>
                        <div className="text-lg font-semibold text-green-400">
                          {strategy.performance_metrics.win_rate.toFixed(1)}%
                        </div>
                      </div>
                    )}
                    {strategy.performance_metrics.profit_loss !== undefined && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">P&L</div>
                        <div
                          className={`text-lg font-semibold flex items-center gap-1 ${
                            strategy.performance_metrics.profit_loss >= 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {strategy.performance_metrics.profit_loss >= 0 ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                          {strategy.performance_metrics.profit_loss >= 0 ? '+' : ''}
                          {strategy.performance_metrics.profit_loss.toFixed(2)}%
                        </div>
                      </div>
                    )}
                    {strategy.performance_metrics.sharpe_ratio !== undefined && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Sharpe Ratio</div>
                        <div className="text-lg font-semibold">
                          {strategy.performance_metrics.sharpe_ratio.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <TrendingUp size={64} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold mb-2">No strategies yet</h3>
          <p className="text-slate-400 mb-6">Create your first trading strategy to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Strategy
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-6">Create New Strategy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Strategy Name</label>
                <input
                  type="text"
                  value={newStrategy.name}
                  onChange={e => setNewStrategy({ ...newStrategy, name: e.target.value })}
                  placeholder="My Trading Strategy"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={newStrategy.description}
                  onChange={e => setNewStrategy({ ...newStrategy, description: e.target.value })}
                  placeholder="Describe your strategy..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Strategy Type</label>
                  <select
                    value={newStrategy.strategy_type}
                    onChange={e =>
                      setNewStrategy({ ...newStrategy, strategy_type: e.target.value as any })
                    }
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="trend_following">Trend Following</option>
                    <option value="mean_reversion">Mean Reversion</option>
                    <option value="arbitrage">Arbitrage</option>
                    <option value="market_making">Market Making</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Project (optional)</label>
                  <select
                    value={newStrategy.project_id}
                    onChange={e => setNewStrategy({ ...newStrategy, project_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">None</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={createStrategy}
                  disabled={!newStrategy.name}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Strategy
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewStrategy();
                  }}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedStrategy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-6">Edit Strategy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Strategy Name</label>
                <input
                  type="text"
                  value={selectedStrategy.name}
                  onChange={e => setSelectedStrategy({ ...selectedStrategy, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={selectedStrategy.description}
                  onChange={e =>
                    setSelectedStrategy({ ...selectedStrategy, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Strategy Type</label>
                  <select
                    value={selectedStrategy.strategy_type}
                    onChange={e =>
                      setSelectedStrategy({
                        ...selectedStrategy,
                        strategy_type: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="trend_following">Trend Following</option>
                    <option value="mean_reversion">Mean Reversion</option>
                    <option value="arbitrage">Arbitrage</option>
                    <option value="market_making">Market Making</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Project</label>
                  <select
                    value={selectedStrategy.project_id || ''}
                    onChange={e =>
                      setSelectedStrategy({ ...selectedStrategy, project_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">None</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={updateStrategy}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStrategy(null);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
