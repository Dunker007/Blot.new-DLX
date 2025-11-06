/**
 * Project Flow Tracker
 * Unified Kanban board for Ideas and Tasks
 * Replaces TaskPunchList and TaskManagement
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProjectFlowItem, FlowColumn } from '../types/projectFlow';
import { projectFlowService } from '../services/projectFlowService';
import { FlowBoard } from './project-flow/FlowBoard';
import { TaskExecutionPanel } from './project-flow/TaskExecutionPanel';
import { IntelAnalysisModal } from './project-flow/IntelAnalysisModal';
import { IntelReport } from '../types/task';
import { 
  Search, Filter, Plus, Sparkles, Network, Lightbulb, CheckSquare,
  X
} from 'lucide-react';
import { LocalStorageManager } from '../utils/localStorage';
import { Idea } from '../types/idea';
import { Task } from '../types/task';
import { todoScannerService } from '../services/todoScannerService';

const ProjectFlowTracker: React.FC = () => {
  const [items, setItems] = useState<ProjectFlowItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'idea' | 'task'>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'votes' | 'dueDate'>('date');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ProjectFlowItem | null>(null);
  const [intelReport, setIntelReport] = useState<IntelReport | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIntelModal, setShowIntelModal] = useState(false);

  // Load items on mount
  useEffect(() => {
    loadItems();
    migrateExistingData();
    // Auto-sync TODOs to project flow on mount
    todoScannerService.syncTODOsToFlow().then(count => {
      if (count > 0) {
        loadItems();
        console.log(`Auto-added ${count} TODO items to Project Flow`);
      }
    });
    // Migrate labs to Project Flow (one-time)
    const labCount = projectFlowService.migrateLabsToFlow();
    if (labCount > 0) {
      loadItems();
    }
    // Sync projects to Project Flow
    syncProjects();
  }, []);

  const syncProjects = async () => {
    try {
      // Try to load projects from localStorage or Supabase
      const { isDemoMode, supabase } = await import('../lib/supabase');
      const { demoProjects } = await import('../services/demoData');
      
      let projects: any[] = [];
      if (isDemoMode) {
        projects = demoProjects;
      } else {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false });
        if (data) projects = data;
      }
      
      // Also check localStorage for projects
      const localProjects = LocalStorageManager.get<any[]>('dlx-projects', []);
      if (localProjects.length > 0) {
        projects = [...projects, ...localProjects];
      }
      
      if (projects.length > 0) {
        const syncedCount = projectFlowService.syncProjectsToFlow(projects);
        if (syncedCount > 0) {
          loadItems();
          // Synced projects to Project Flow
        }
      }
    } catch (error) {
      console.error('Failed to sync projects:', error);
    }
  };

  const loadItems = () => {
    const loaded = projectFlowService.getItems();
    setItems(loaded);
  };

  // Migrate existing data from TaskPunchList and TaskManagement
  const migrateExistingData = () => {
    const existingItems = projectFlowService.getItems();
    if (existingItems.length > 0) return; // Already migrated

    // Migrate from TaskPunchList
    try {
      const punchItems = LocalStorageManager.get<any[]>('dlx-punch-list', []);
      punchItems.forEach((punch: any) => {
        const item: ProjectFlowItem = {
          id: `task-${punch.id}`,
          type: 'task',
          title: punch.content,
          description: punch.description || punch.content,
          status: punch.status === 'completed' ? 'Complete' : 
                  punch.status === 'in_progress' ? 'In Progress...' : 'In Progress...',
          column: punch.status === 'completed' ? 'done' :
                  punch.status === 'in_progress' ? 'in-progress' : 'backlog',
          timestamp: punch.createdAt || new Date().toISOString(),
          updatedAt: punch.updatedAt || new Date().toISOString(),
          tags: punch.tags || [],
          priority: punch.priority || 'medium',
          dueDate: punch.dueDate,
          subtasks: punch.subtasks || [],
        };
        projectFlowService.upsertItem(item);
      });
    } catch (e) {
      console.error('Failed to migrate punch list:', e);
    }

    // Migrate from TaskManagement
    try {
      const tasks = LocalStorageManager.get<Task[]>('dlx-tasks', []);
      tasks.forEach((task) => {
        const item = projectFlowService.taskToFlowItem(task);
        projectFlowService.upsertItem(item);
      });
    } catch (e) {
      console.error('Failed to migrate tasks:', e);
    }

    // Sync with Ideas (if they exist)
    try {
      const ideas = LocalStorageManager.get<Idea[]>('dlx-ideas', []);
      ideas.forEach((idea) => {
        const existingItem = projectFlowService.getItems().find(i => i.id === `idea-${idea.id}`);
        if (!existingItem) {
          const item = projectFlowService.ideaToFlowItem(idea);
          projectFlowService.upsertItem(item);
        }
      });
    } catch (e) {
      console.error('Failed to sync ideas:', e);
    }

    loadItems();
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      
      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matches) return false;
      }
      
      // Tag filter
      if (tagFilter.length > 0) {
        const hasMatchingTag = item.tags?.some(tag => tagFilter.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority || 'medium'] || 0) - (priorityOrder[a.priority || 'medium'] || 0);
        case 'votes':
          return (b.votes || 0) - (a.votes || 0);
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        case 'date':
        default:
          return new Date(b.updatedAt || b.timestamp).getTime() - new Date(a.updatedAt || a.timestamp).getTime();
      }
    });

    return filtered;
  }, [items, searchQuery, typeFilter, tagFilter, priorityFilter, sortBy]);

  // All unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  const handleMoveItem = useCallback((id: string, column: FlowColumn) => {
    projectFlowService.moveItem(id, column);
    loadItems();
  }, []);

  const handleExecuteTask = useCallback(async (id: string) => {
    setExecutingTaskId(id);
    try {
      await projectFlowService.executeTaskItem(id);
      loadItems();
      const updatedItem = projectFlowService.getItems().find(i => i.id === id);
      if (updatedItem) {
        setSelectedTask(updatedItem);
      }
    } catch (error) {
      console.error('Task execution failed:', error);
    } finally {
      setExecutingTaskId(null);
    }
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      projectFlowService.removeItem(id);
      loadItems();
    }
  }, []);

  const handleGenerateIntel = useCallback(async (query: string) => {
    try {
      const report = await projectFlowService.generateIntelReport(query);
      setIntelReport(report);
      setShowIntelModal(true);
    } catch (error) {
      console.error('Intel generation failed:', error);
    }
  }, []);

  const handleConvertIdeaToTasks = useCallback(async (ideaId: string) => {
    try {
      const newTasks = await projectFlowService.convertIdeaToTasks(ideaId);
      loadItems();
      alert(`Created ${newTasks.length} tasks from idea`);
    } catch (error) {
      console.error('Failed to convert idea to tasks:', error);
      alert('Failed to convert idea to tasks');
    }
  }, []);

  const handleAddItem = useCallback((type: 'idea' | 'task', data: Partial<ProjectFlowItem>) => {
    const newItem: ProjectFlowItem = {
      id: `${type}-${Date.now()}`,
      type,
      title: data.title || 'New Item',
      description: data.description || '',
      status: type === 'idea' ? 'New Idea' : 'In Progress...',
      column: type === 'idea' ? 'ideas' : 'backlog',
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags || [],
      priority: data.priority || 'medium',
      ...data,
    };
    
    projectFlowService.upsertItem(newItem);
    loadItems();
    setShowAddModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 p-2 rounded-lg">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-cyan-400">Project Flow</h1>
                <p className="text-gray-400 text-sm">Unified Ideas & Tasks Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateIntel('Analyze current project status and priorities')}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Intel Analysis
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          {/* Filters - Consolidated into 2 rows */}
          {/* Row 1: Tag Suggestions */}
          {allTags.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setTagFilter(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap ${
                    tagFilter.includes(tag)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {tagFilter.length > 0 && (
                <button
                  onClick={() => setTagFilter([])}
                  className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 whitespace-nowrap"
                >
                  Clear Tags
                </button>
              )}
            </div>
          )}

          {/* Row 2: Search + Dropdowns */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Types</option>
                <option value="idea">Ideas</option>
                <option value="task">Tasks</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="date">Sort: Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="votes">Sort: Votes</option>
                <option value="dueDate">Sort: Due Date</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </header>

        {/* Flow Board */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
          <FlowBoard
            items={filteredItems}
            onMoveItem={handleMoveItem}
            onExecuteTask={handleExecuteTask}
            onEditItem={(id) => {
              const item = items.find(i => i.id === id);
              if (item) setSelectedTask(item);
            }}
            onDeleteItem={handleDeleteItem}
            onLinkItems={(id) => {
              // Simple linking - allow selecting another item to link
              const otherItems = items.filter(i => i.id !== id);
              if (otherItems.length === 0) {
                alert('No other items to link');
                return;
              }
              const itemToLink = prompt(`Enter item ID to link to "${items.find(i => i.id === id)?.title}":\n\nAvailable: ${otherItems.slice(0, 5).map(i => `${i.id}: ${i.title}`).join('\n')}`);
              if (itemToLink) {
                const targetItem = items.find(i => i.id === itemToLink || i.title === itemToLink);
                if (targetItem) {
                  projectFlowService.linkItems(id, targetItem.id);
                  loadItems();
                  alert('Items linked successfully!');
                } else {
                  alert('Item not found');
                }
              }
            }}
            executingTaskId={executingTaskId || undefined}
          />
        </div>

        {/* Task Execution Panel (Sidebar/Modal) */}
        {selectedTask && selectedTask.type === 'task' && (
          <div className="fixed right-4 top-4 w-96 z-50">
            <TaskExecutionPanel
              taskId={selectedTask.id}
              taskTitle={selectedTask.title}
              onExecute={handleExecuteTask}
              result={selectedTask.result}
              isExecuting={executingTaskId === selectedTask.id}
              executionStatus={selectedTask.executionStatus}
              onClose={() => setSelectedTask(null)}
            />
          </div>
        )}

        {/* Intel Analysis Modal */}
        {showIntelModal && intelReport && (
          <IntelAnalysisModal
            report={intelReport}
            onClose={() => {
              setShowIntelModal(false);
              setIntelReport(null);
            }}
          />
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <AddItemModal
            onAdd={handleAddItem}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Add Item Modal Component
interface AddItemModalProps {
  onAdd: (type: 'idea' | 'task', data: Partial<ProjectFlowItem>) => void;
  onClose: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onAdd, onClose }) => {
  const [type, setType] = useState<'idea' | 'task'>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(type, {
        title: title.trim(),
        description: description.trim(),
        priority,
        tags,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Add New Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('idea')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  type === 'idea'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Idea
              </button>
              <button
                type="button"
                onClick={() => setType('task')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  type === 'task'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Task
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${type} title...`}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe the ${type}...`}
              rows={3}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all"
            >
              Add {type === 'idea' ? 'Idea' : 'Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFlowTracker;
