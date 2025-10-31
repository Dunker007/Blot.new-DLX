import { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  GitBranch,
  Clock,
  Search,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Project, ProjectTemplate } from '../types';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    project_type: 'landing_page' as const,
    tech_stack: [] as string[],
    status: 'planning' as const,
    repository_url: '',
    deployment_url: '',
  });

  useEffect(() => {
    loadProjects();
    loadTemplates();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('project_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (data) setTemplates(data);
  };

  const createProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProjects([data, ...projects]);
        setShowCreateModal(false);
        resetNewProject();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const updateProject = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: selectedProject.name,
          description: selectedProject.description,
          project_type: selectedProject.project_type,
          tech_stack: selectedProject.tech_stack,
          status: selectedProject.status,
          repository_url: selectedProject.repository_url,
          deployment_url: selectedProject.deployment_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedProject.id);

      if (error) throw error;

      setProjects(
        projects.map((p) => (p.id === selectedProject.id ? selectedProject : p))
      );
      setShowEditModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const createFromTemplate = (template: ProjectTemplate) => {
    setNewProject({
      name: `${template.name} - Copy`,
      description: template.description,
      project_type: template.template_type as any,
      tech_stack: template.tech_stack,
      status: 'planning',
      repository_url: '',
      deployment_url: '',
    });
    setShowCreateModal(true);
  };

  const resetNewProject = () => {
    setNewProject({
      name: '',
      description: '',
      project_type: 'landing_page',
      tech_stack: [],
      status: 'planning',
      repository_url: '',
      deployment_url: '',
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusColors = {
    planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    deployed: 'bg-green-500/10 text-green-400 border-green-500/20',
    archived: 'bg-slate-700 text-slate-400 border-slate-600',
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Projects</h1>
        <p className="text-slate-400 text-lg">Manage your web development projects</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-2">
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>
      </div>

      {templates.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Start Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.slice(0, 3).map((template) => (
              <div
                key={template.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer"
                onClick={() => createFromTemplate(template)}
              >
                <h3 className="font-semibold mb-2">{template.name}</h3>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{template.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.tech_stack.slice(0, 3).map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-500">Used {template.usage_count} times</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">
          Your Projects ({filteredProjects.length})
        </h2>
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowEditModal(true);
                      }}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit project"
                    >
                      <Edit2 size={16} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack.map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 border rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    {project.repository_url && (
                      <a
                        href={project.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                        title="View repository"
                      >
                        <GitBranch size={16} />
                      </a>
                    )}
                    {project.deployment_url && (
                      <a
                        href={project.deployment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                        title="View deployment"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Clock size={14} />
                      {new Date(project.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <FolderKanban size={64} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Create Project
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="My Awesome Project"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your project..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Project Type</label>
                  <select
                    value={newProject.project_type}
                    onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="landing_page">Landing Page</option>
                    <option value="saas">SaaS Application</option>
                    <option value="trading_bot">Trading Bot</option>
                    <option value="affiliate">Affiliate Site</option>
                    <option value="chrome_extension">Chrome Extension</option>
                    <option value="api_service">API Service</option>
                    <option value="content_site">Content Site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="deployed">Deployed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.tech_stack.join(', ')}
                  onChange={(e) => setNewProject({
                    ...newProject,
                    tech_stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="react, typescript, tailwind"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Repository URL (optional)</label>
                <input
                  type="url"
                  value={newProject.repository_url}
                  onChange={(e) => setNewProject({ ...newProject, repository_url: e.target.value })}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Deployment URL (optional)</label>
                <input
                  type="url"
                  value={newProject.deployment_url}
                  onChange={(e) => setNewProject({ ...newProject, deployment_url: e.target.value })}
                  placeholder="https://myproject.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={createProject}
                  disabled={!newProject.name}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewProject();
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

      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6">Edit Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={selectedProject.name}
                  onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={selectedProject.description}
                  onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Project Type</label>
                  <select
                    value={selectedProject.project_type}
                    onChange={(e) => setSelectedProject({ ...selectedProject, project_type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="landing_page">Landing Page</option>
                    <option value="saas">SaaS Application</option>
                    <option value="trading_bot">Trading Bot</option>
                    <option value="affiliate">Affiliate Site</option>
                    <option value="chrome_extension">Chrome Extension</option>
                    <option value="api_service">API Service</option>
                    <option value="content_site">Content Site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Status</label>
                  <select
                    value={selectedProject.status}
                    onChange={(e) => setSelectedProject({ ...selectedProject, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="deployed">Deployed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={selectedProject.tech_stack.join(', ')}
                  onChange={(e) => setSelectedProject({
                    ...selectedProject,
                    tech_stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Repository URL</label>
                <input
                  type="url"
                  value={selectedProject.repository_url || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, repository_url: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Deployment URL</label>
                <input
                  type="url"
                  value={selectedProject.deployment_url || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject, deployment_url: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={updateProject}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProject(null);
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
