/**
 * Compact Project Flow View
 * Optimized for split-screen layout (1080p)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ProjectFlowItem, FlowColumn } from '../../types/projectFlow';
import { projectFlowService } from '../../services/projectFlowService';
import { 
  Search, Filter, Plus, Network, Lightbulb, CheckSquare,
  ChevronRight, ChevronLeft, Play, X
} from 'lucide-react';

interface ProjectFlowCompactProps {
  onFullView?: () => void;
}

const ProjectFlowCompact: React.FC<ProjectFlowCompactProps> = ({ onFullView }) => {
  const [items, setItems] = useState<ProjectFlowItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<FlowColumn>('in-progress');
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);

  const COLUMNS: Array<{ id: FlowColumn; label: string; color: string }> = [
    { id: 'ideas', label: 'Ideas', color: 'cyan' },
    { id: 'backlog', label: 'Backlog', color: 'blue' },
    { id: 'in-progress', label: 'Active', color: 'yellow' },
    { id: 'review', label: 'Review', color: 'purple' },
    { id: 'done', label: 'Done', color: 'green' },
  ];

  useEffect(() => {
    // Migrate labs on mount if not already done
    const labCount = projectFlowService.migrateLabsToFlow();
    if (labCount > 0) {
      console.log(`✅ Compact View: Migrated ${labCount} labs to Project Flow`);
    }
    loadItems();
  }, []);

  const loadItems = () => {
    const loaded = projectFlowService.getItems();
    setItems(loaded);
  };

  const filteredItems = useMemo(() => {
    const columnItems = items.filter(item => item.column === selectedColumn);
    if (!searchQuery) return columnItems;
    
    const query = searchQuery.toLowerCase();
    return columnItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [items, selectedColumn, searchQuery]);

  const handleMoveItem = useCallback((id: string, column: FlowColumn) => {
    projectFlowService.moveItem(id, column);
    loadItems();
  }, []);

  const handleExecuteTask = useCallback(async (id: string) => {
    setExecutingTaskId(id);
    try {
      await projectFlowService.executeTaskItem(id);
      loadItems();
    } catch (error) {
      console.error('Task execution failed:', error);
    } finally {
      setExecutingTaskId(null);
    }
  }, []);

  const stats = useMemo(() => {
    return {
      total: items.length,
      ideas: items.filter(i => i.column === 'ideas').length,
      active: items.filter(i => i.column === 'in-progress').length,
      backlog: items.filter(i => i.column === 'backlog').length,
      done: items.filter(i => i.column === 'done').length,
    };
  }, [items]);

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      {/* Compact Header */}
      <div className="p-3 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Project Flow</h2>
            {onFullView && (
              <button
                onClick={onFullView}
                className="ml-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Full View →
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{stats.total} items</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span className="text-yellow-400">{stats.active} active</span>
          </div>
        </div>

        {/* Column Tabs */}
        <div className="flex gap-1 mb-2">
          {COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedColumn(col.id)}
              className={`flex-1 px-2 py-1 text-xs font-semibold rounded transition-colors ${
                selectedColumn === col.id
                  ? `bg-${col.color}-600/30 text-${col.color}-400 border border-${col.color}-500/50`
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700/70'
              }`}
            >
              {col.label} ({items.filter(i => i.column === col.id).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-900/50 border border-slate-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            {searchQuery ? 'No items match your search' : 'No items in this column'}
          </div>
        ) : (
          filteredItems.slice(0, 20).map((item) => (
            <div
              key={item.id}
              className={`group bg-slate-800/50 border rounded-lg p-2 transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 ${
                item.type === 'idea' ? 'border-cyan-500/30' : 'border-purple-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {item.type === 'idea' ? (
                      <Lightbulb className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <CheckSquare className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                    {item.priority && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        item.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        item.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-1">{item.description}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs px-1.5 py-0.5 bg-slate-700/50 text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-xs px-1.5 py-0.5 bg-slate-700/50 text-gray-500 rounded">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Task Execute Button */}
              {item.type === 'task' && item.column !== 'done' && (
                <button
                  onClick={() => handleExecuteTask(item.id)}
                  disabled={executingTaskId === item.id}
                  className="mt-2 w-full px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  {executingTaskId === item.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Execute
                    </>
                  )}
                </button>
              )}

              {/* Quick Actions */}
              <div className="flex gap-1 mt-2">
                {COLUMNS.filter(col => col.id !== selectedColumn).map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleMoveItem(item.id, col.id)}
                    className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                      col.id === 'done' 
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        : col.id === 'backlog'
                        ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                        : col.id === 'review'
                        ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                        : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                    }`}
                  >
                    → {col.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Item Button */}
      <div className="p-2 border-t border-slate-700/50">
        <button
          onClick={() => {
            // Use the full view's add modal
            if (onFullView) {
              onFullView();
            }
          }}
          className="w-full px-3 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded text-xs font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-3 h-3" />
          Add Item
        </button>
      </div>
    </div>
  );
};

export default ProjectFlowCompact;
