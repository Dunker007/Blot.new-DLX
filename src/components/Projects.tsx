import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Globe,
  Briefcase,
  TrendingUp,
  Link as LinkIcon,
  Chrome,
  Server,
  FileText,
  X,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

const projectTypeIcons = {
  landing_page: Globe,
  saas: Briefcase,
  trading_bot: TrendingUp,
  affiliate: LinkIcon,
  chrome_extension: Chrome,
  api_service: Server,
  content_site: FileText,
};

const projectTypeLabels = {
  landing_page: 'Landing Page',
  saas: 'SaaS Application',
  trading_bot: 'Trading Bot',
  affiliate: 'Affiliate Site',
  chrome_extension: 'Chrome Extension',
  api_service: 'API Service',
  content_site: 'Content Site',
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (data) setProjects(data);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-slate-400">
            Manage your AI-powered web projects
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="deployed">Deployed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Plus size={48} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery
              ? 'Try a different search term'
              : 'Start building your first project'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const Icon = projectTypeIcons[project.project_type];
          return (
            <div
              key={project.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <Icon size={24} className="text-cyan-400" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'deployed'
                      ? 'bg-green-500/10 text-green-400'
                      : project.status === 'in_progress'
                      ? 'bg-blue-500/10 text-blue-400'
                      : project.status === 'planning'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.slice(0, 3).map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
                {project.tech_stack.length > 3 && (
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                    +{project.tech_stack.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadProjects}
        />
      )}
    </div>
  );
}

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const projectTypes = Object.entries(projectTypeLabels).map(([key, label]) => ({
    id: key,
    label,
    icon: projectTypeIcons[key as keyof typeof projectTypeIcons],
  }));

  const handleCreate = async () => {
    if (!name || !selectedType) return;

    const { error } = await supabase.from('projects').insert([
      {
        name,
        description,
        project_type: selectedType,
        tech_stack: [],
        status: 'planning',
        settings: {},
        metadata: {},
      },
    ]);

    if (!error) {
      onCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-4">
              <p className="text-slate-400">
                Choose the type of project you want to create
              </p>
              <div className="grid grid-cols-2 gap-3">
                {projectTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        setStep('details');
                      }}
                      className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all text-left"
                    >
                      <Icon size={24} className="text-cyan-400" />
                      <span className="font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('type')}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                ← Change project type
              </button>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this project do?"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Create Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
