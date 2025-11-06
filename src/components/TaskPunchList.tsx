import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LocalStorageManager } from '../utils/localStorage';
import { 
  CheckSquare, Circle, Clock, CheckCircle2, XCircle, AlertCircle, Filter, Search, 
  Plus, Edit2, Trash2, Calendar, Tag, ChevronDown, ChevronUp, MoreVertical,
  Download, Upload, FileText, Star, GripVertical, X
} from 'lucide-react';

interface PunchItem {
  id: string;
  content: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  category: string;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  subtasks?: Array<{ id: string; content: string; completed: boolean }>;
}

type SortField = 'priority' | 'status' | 'category' | 'dueDate' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const TaskPunchList: React.FC = () => {
  const [items, setItems] = useState<PunchItem[]>(() => {
    const saved = LocalStorageManager.get<PunchItem[]>('dlx-punch-list', []);
    if (saved.length > 0) {
      // Ensure all items have required fields
      return saved.map((item: PunchItem) => ({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        tags: item.tags || [],
        subtasks: item.subtasks || [],
      }));
    }
    // Default items
    return [
      { 
        id: 'bg-visibility', 
        content: 'Verify HUD background visibility and adjust opacity/blend mode if needed', 
        status: 'completed', 
        priority: 'high', 
        category: 'UI/UX',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        subtasks: [],
      },
      { 
        id: 'topical-headers', 
        content: 'Add more topical headers for remaining views (projects, connections, feature-flags, etc.)', 
        status: 'in_progress', 
        priority: 'high', 
        category: 'UI/UX',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        subtasks: [],
      },
      { 
        id: 'labs-enable', 
        content: 'Enable remaining labs: Signal Lab (needs Google Search API), Creator Studio (needs image gen API), Comms Channel (needs audio transcription API), Dataverse Lab (RAG knowledge system)', 
        status: 'pending', 
        priority: 'high', 
        category: 'Labs',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        subtasks: [],
      },
    ];
  });

  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PunchItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = LocalStorageManager.get<PunchItem[]>('dlx-punch-list', []);
    if (saved.length > 0) {
      setItems(saved.map((item: PunchItem) => ({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        tags: item.tags || [],
        subtasks: item.subtasks || [],
      })));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    LocalStorageManager.set('dlx-punch-list', items);
  }, [items]);

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category)));

  const toggleStatus = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const statusOrder: PunchItem['status'][] = ['pending', 'in_progress', 'completed', 'cancelled'];
        const currentIndex = statusOrder.indexOf(item.status);
        const nextIndex = currentIndex === statusOrder.length - 1 ? 0 : currentIndex + 1;
        return { ...item, status: statusOrder[nextIndex], updatedAt: new Date().toISOString() };
      }
      return item;
    }));
  };

  const addItem = (item: Omit<PunchItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: PunchItem = {
      ...item,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: item.tags || [],
      subtasks: item.subtasks || [],
    };
    setItems(prev => [newItem, ...prev]);
    setShowAddModal(false);
  };

  const updateItem = (id: string, updates: Partial<PunchItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    ));
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const deleteSelected = () => {
    setItems(prev => prev.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
    setShowBulkActions(false);
  };

  const bulkUpdateStatus = (status: PunchItem['status']) => {
    setItems(prev => prev.map(item => 
      selectedItems.has(item.id)
        ? { ...item, status, updatedAt: new Date().toISOString() }
        : item
    ));
    setSelectedItems(new Set());
    setShowBulkActions(false);
  };

  const bulkUpdatePriority = (priority: PunchItem['priority']) => {
    setItems(prev => prev.map(item => 
      selectedItems.has(item.id)
        ? { ...item, priority, updatedAt: new Date().toISOString() }
        : item
    ));
    setSelectedItems(new Set());
    setShowBulkActions(false);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter items - memoized for performance
  const filteredItems = useMemo(() => items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = searchTerm === '' || 
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesPriority && matchesCategory && matchesSearch;
  }), [items, filter, priorityFilter, categoryFilter, searchTerm]);

  // Sort items - memoized for performance
  const sortedItems = useMemo(() => [...filteredItems].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'status':
        const statusOrder = { completed: 4, in_progress: 3, pending: 2, cancelled: 1 };
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'createdAt':
      case 'updatedAt':
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      default:
        return 0;
    }

    if (aValue === bValue) return 0;
    const comparison = aValue > bValue ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  }), [filteredItems, sortField, sortDirection]);

  // Separate completed and non-completed tasks
  const nonCompletedTasks = sortedItems.filter(item => item.status !== 'completed');
  const completedTasks = sortedItems.filter(item => item.status === 'completed');

  // Show only 3 completed tasks initially, or all if showAllCompleted is true
  const displayedCompletedTasks = showAllCompleted 
    ? completedTasks 
    : completedTasks.slice(0, 3);
  
  const remainingCompletedCount = completedTasks.length - displayedCompletedTasks.length;

  // Combine: non-completed first, then completed at bottom
  const filteredAndSortedItems = [...nonCompletedTasks, ...displayedCompletedTasks];

  const getStatusIcon = (status: PunchItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-cyan-400 animate-spin" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: PunchItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const exportTasks = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dlx-punch-list-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setItems(imported);
        }
      } catch (error) {
        alert('Failed to import tasks. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const stats = {
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    inProgress: items.filter(i => i.status === 'in_progress').length,
    pending: items.filter(i => i.status === 'pending').length,
    overdue: items.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'completed').length,
  };

  return (
    <div className="h-full overflow-y-auto p-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Task Punch List
            </h1>
            <p className="text-gray-400">Interactive task management and progress tracking</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportTasks}
              className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-cyan-500/30 rounded-lg transition-all text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <label className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-cyan-500/30 rounded-lg transition-all text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input type="file" accept=".json" onChange={importTasks} className="hidden" />
            </label>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/50 rounded-lg transition-all text-sm text-white font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/20">
            <div className="text-xs text-gray-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-4 border border-emerald-500/20">
            <div className="text-xs text-gray-400 mb-1">Completed</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-4 border border-cyan-500/20">
            <div className="text-xs text-gray-400 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-cyan-400">{stats.inProgress}</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-4 border border-gray-500/20">
            <div className="text-xs text-gray-400 mb-1">Pending</div>
            <div className="text-2xl font-bold text-gray-400">{stats.pending}</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-4 border border-red-500/20">
            <div className="text-xs text-gray-400 mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Status:</span>
              {(['all', 'pending', 'in_progress', 'completed'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    filter === status
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-800/60 text-gray-400 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Priority:</span>
              {(['all', 'high', 'medium', 'low'] as const).map(priority => (
                <button
                  key={priority}
                  onClick={() => setPriorityFilter(priority)}
                  className={`px-3 py-1 rounded text-sm transition-colors capitalize ${
                    priorityFilter === priority
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-800/60 text-gray-400 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1 rounded text-sm bg-slate-800/60 text-white border border-slate-700/50 focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="all">All</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-3 py-1 rounded text-sm bg-slate-800/60 text-white border border-slate-700/50 focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="category">Category</option>
                <option value="dueDate">Due Date</option>
                <option value="createdAt">Created</option>
                <option value="updatedAt">Updated</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 rounded bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-gray-400 hover:text-white transition-colors"
              >
                {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-slate-800/60 rounded-lg px-4 py-2 border border-slate-700/50">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <span className="text-sm text-cyan-300">{selectedItems.size} selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-3 py-1 text-sm bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded text-gray-300 hover:text-white transition-colors"
                >
                  Actions
                  {showBulkActions ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />}
                </button>
                {showBulkActions && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => bulkUpdateStatus('completed')}
                      className="px-3 py-1 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded text-emerald-300 transition-colors"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => bulkUpdatePriority('high')}
                      className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-red-300 transition-colors"
                    >
                      High Priority
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedItems(new Set())}
                      className="px-3 py-1 text-sm bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded text-gray-300 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {/* Non-Completed Tasks */}
          {nonCompletedTasks.map((item) => (
            <div
              key={item.id}
              className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border rounded-lg p-4 transition-all hover:scale-[1.01] hover:border-cyan-500/50 ${
                item.status === 'in_progress' ? 'border-cyan-500/50' :
                item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'completed' ? 'border-red-500/50' :
                'border-cyan-500/20'
              } ${getPriorityColor(item.priority)} ${selectedItems.has(item.id) ? 'ring-2 ring-cyan-400' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1 cursor-pointer" onClick={() => toggleStatus(item.id)}>
                  {getStatusIcon(item.status)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      item.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 bg-slate-700/50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.dueDate && (
                      <div className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                        new Date(item.dueDate) < new Date() && item.status !== 'completed'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`text-base mb-1 ${
                    item.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'
                  }`}>
                    {item.content}
                  </div>
                  {item.description && (
                    <div className="text-sm text-gray-400 mb-2">
                      {item.description}
                    </div>
                  )}
                  {item.subtasks && item.subtasks.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => {
                              const updatedSubtasks = item.subtasks!.map(s =>
                                s.id === subtask.id ? { ...s, completed: !s.completed } : s
                              );
                              updateItem(item.id, { subtasks: updatedSubtasks });
                            }}
                            className="w-3 h-3 rounded border-slate-600 bg-slate-700 text-cyan-500"
                          />
                          <span className={subtask.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>
                            {subtask.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.updatedAt !== item.createdAt && (
                      <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="p-1 rounded hover:bg-slate-700/50 text-gray-400 hover:text-white transition-colors"
                  >
                    {expandedItems.has(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1 rounded hover:bg-slate-700/50 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 rounded hover:bg-slate-700/50 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedItems.has(item.id) && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Status</div>
                      <div className="text-white">{item.status}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Priority</div>
                      <div className="text-white capitalize">{item.priority}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Category</div>
                      <div className="text-white">{item.category}</div>
                    </div>
                    {item.dueDate && (
                      <div>
                        <div className="text-gray-400 mb-1">Due Date</div>
                        <div className="text-white">{new Date(item.dueDate).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Completed Tasks Section */}
          {displayedCompletedTasks.length > 0 && (
            <>
              {/* Separator */}
              {nonCompletedTasks.length > 0 && (
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                  <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Completed Tasks</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                </div>
              )}

              {/* Completed Tasks */}
              {displayedCompletedTasks.map((item) => (
                <div
                  key={item.id}
                  className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border rounded-lg p-4 transition-all hover:scale-[1.01] hover:border-cyan-500/50 border-emerald-500/30 opacity-75 ${getPriorityColor(item.priority)} ${selectedItems.has(item.id) ? 'ring-2 ring-cyan-400' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1 cursor-pointer" onClick={() => toggleStatus(item.id)}>
                      {getStatusIcon(item.status)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          item.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {item.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 bg-slate-700/50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        {item.dueDate && (
                          <div className="text-xs px-2 py-0.5 rounded flex items-center gap-1 bg-blue-500/20 text-blue-300">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-base mb-1 text-gray-400 line-through">
                        {item.content}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-400 mb-2">
                          {item.description}
                        </div>
                      )}
                      {item.subtasks && item.subtasks.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => {
                                  const updatedSubtasks = item.subtasks!.map(s =>
                                    s.id === subtask.id ? { ...s, completed: !s.completed } : s
                                  );
                                  updateItem(item.id, { subtasks: updatedSubtasks });
                                }}
                                className="w-3 h-3 rounded border-slate-600 bg-slate-700 text-cyan-500"
                              />
                              <span className={subtask.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>
                                {subtask.content}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.updatedAt !== item.createdAt && (
                          <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="p-1 rounded hover:bg-slate-700/50 text-gray-400 hover:text-white transition-colors"
                      >
                        {expandedItems.has(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1 rounded hover:bg-slate-700/50 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1 rounded hover:bg-slate-700/50 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedItems.has(item.id) && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Status</div>
                          <div className="text-white">{item.status}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Priority</div>
                          <div className="text-white capitalize">{item.priority}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Category</div>
                          <div className="text-white">{item.category}</div>
                        </div>
                        {item.dueDate && (
                          <div>
                            <div className="text-gray-400 mb-1">Due Date</div>
                            <div className="text-white">{new Date(item.dueDate).toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Show More History Link */}
              {remainingCompletedCount > 0 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/30 rounded-lg transition-all text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                  >
                    {showAllCompleted ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show Less ({remainingCompletedCount} hidden)
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show More History ({remainingCompletedCount} more completed tasks)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {(nonCompletedTasks.length === 0 && displayedCompletedTasks.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks match your filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <TaskModal
          item={editingItem}
          categories={categories}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={(item) => {
            if (editingItem) {
              updateItem(editingItem.id, item);
            } else {
              addItem(item);
            }
          }}
        />
      )}
    </div>
  );
};

interface TaskModalProps {
  item: PunchItem | null;
  categories: string[];
  onClose: () => void;
  onSave: (item: Omit<PunchItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ item, categories, onClose, onSave }) => {
  const [content, setContent] = useState(item?.content || '');
  const [description, setDescription] = useState(item?.description || '');
  const [status, setStatus] = useState<PunchItem['status']>(item?.status || 'pending');
  const [priority, setPriority] = useState<PunchItem['priority']>(item?.priority || 'medium');
  const [category, setCategory] = useState(item?.category || categories[0] || '');
  const [dueDate, setDueDate] = useState(item?.dueDate || '');
  const [tags, setTags] = useState<string>(item?.tags?.join(', ') || '');
  const [subtasks, setSubtasks] = useState<Array<{ id: string; content: string; completed: boolean }>>(
    item?.subtasks || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSave({
      content: content.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      category: category || categories[0] || 'Uncategorized',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      dueDate: dueDate || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: `sub-${Date.now()}`, content: '', completed: false }]);
  };

  const updateSubtask = (id: string, content: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, content } : s));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {item ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-slate-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Task Content *</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Enter task description..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none min-h-[100px]"
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PunchItem['status'])}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PunchItem['priority'])}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Category..."
                list="categories"
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-400">Subtasks</label>
              <button
                type="button"
                onClick={addSubtask}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Subtask
              </button>
            </div>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subtask.content}
                    onChange={(e) => updateSubtask(subtask.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 focus:outline-none"
                    placeholder="Subtask..."
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(subtask.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/50 rounded-lg transition-all text-white font-semibold"
            >
              {item ? 'Update Task' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-gray-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskPunchList;
