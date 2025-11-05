import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ArrowRight, Code2, FolderKanban, MessageSquare, TrendingUp, Zap } from 'lucide-react';

import { isDemoMode, supabase } from '../lib/supabase';
import { demoProjects, demoStats } from '../services/demoData';
import { Project } from '../types';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

function Dashboard({ onNavigate }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    deployedProjects: 0,
    conversations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use demo data if in demo mode
      if (isDemoMode) {
        setProjects(demoProjects);
        setStats(demoStats);
        setLoading(false);
        return;
      }

      const { data: allProjectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Get recent projects (limit to 5)
      const projectsData = allProjectsData?.slice(0, 5) || [];

      // Calculate counts from data
      const totalCount = allProjectsData?.length || 0;
      const activeCount =
        allProjectsData?.filter((p: any) => p.status === 'in_progress').length || 0;
      const deployedCount =
        allProjectsData?.filter((p: any) => p.status === 'deployed').length || 0;

      const { data: conversationsData } = await supabase.from('conversations').select('*');

      const conversationsCount = conversationsData?.length || 0;

      setProjects(projectsData);

      setStats({
        totalProjects: totalCount,
        activeProjects: activeCount,
        deployedProjects: deployedCount,
        conversations: conversationsCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Memoize static data to prevent recreation on every render
  const quickActions = useMemo(
    () => [
      {
        title: 'Start Dev Lab',
        description: 'Chat with AI to plan and build',
        icon: MessageSquare,
        action: () => onNavigate('dev-lab'),
        gradient: 'from-cyan-500 to-blue-600',
      },
      {
        title: 'Open Workspace',
        description: 'Code with AI assistance',
        icon: Code2,
        action: () => onNavigate('workspace'),
        gradient: 'from-blue-500 to-slate-600',
      },
      {
        title: 'New Project',
        description: 'Create from templates',
        icon: FolderKanban,
        action: () => onNavigate('projects'),
        gradient: 'from-green-500 to-emerald-600',
      },
      {
        title: 'Trading Bot',
        description: 'Build crypto strategies',
        icon: TrendingUp,
        action: () => onNavigate('trading'),
        gradient: 'from-orange-500 to-red-600',
      },
    ],
    [onNavigate]
  );

  const statCards = useMemo(
    () => [
      { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban },
      { label: 'Active', value: stats.activeProjects, icon: Zap },
      { label: 'Deployed', value: stats.deployedProjects, icon: TrendingUp },
      { label: 'Conversations', value: stats.conversations, icon: MessageSquare },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-slate-300">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to DLX Studios</h1>
        <p className="text-slate-400 text-lg">Your AI-powered web development command center</p>
      </div>

      {isDemoMode && (
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Zap className="text-cyan-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-cyan-400 font-semibold text-lg mb-2">Demo Mode Active</h3>
              <p className="text-slate-300 mb-3">
                All data is stored locally in your browser using IndexedDB and LocalStorage.
              </p>
              <p className="text-slate-500 text-xs">
                💡 Your projects, providers, and settings are automatically saved locally.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={24} className="text-cyan-400" />
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.action}
                className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${action.gradient}`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-slate-400 text-sm">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <button
              onClick={() => onNavigate('projects')}
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer"
                onClick={() => onNavigate('projects')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{project.name}</h3>
                    <p className="text-slate-400 text-sm">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'deployed'
                          ? 'bg-green-500/10 text-green-400'
                          : project.status === 'in_progress'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <FolderKanban size={48} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-slate-400 mb-6">Start building your first AI-powered project</p>
          <button
            onClick={() => onNavigate('dev-lab')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start in Dev Lab
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(Dashboard);
