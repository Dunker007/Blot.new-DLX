/**
 * Flow Card Component
 * Displays both Idea and Task items in the Kanban board
 */

import React, { useState } from 'react';
import { ProjectFlowItem } from '../../types/projectFlow';
import { 
  Lightbulb, CheckSquare, Play, MoreVertical, Tag, Calendar, 
  ChevronUp, ChevronDown, Link2, Trash2, Edit2, Sparkles, FlaskConical
} from 'lucide-react';
import { IdeaStatus } from '../../types/idea';

interface FlowCardProps {
  item: ProjectFlowItem;
  onMove: (id: string, column: string) => void;
  onExecute?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLink?: (id: string) => void;
  isExecuting?: boolean;
}

export const FlowCard: React.FC<FlowCardProps> = ({
  item,
  onMove,
  onExecute,
  onEdit,
  onDelete,
  onLink,
  isExecuting = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const isIdea = item.type === 'idea';
  const isTask = item.type === 'task';
  const isLab = item.id.startsWith('lab-');
  const isCompleted = item.column === 'done' || item.status === 'Complete';
  const isRunning = item.executionStatus === 'running' || isExecuting;

  const priorityColors = {
    critical: 'bg-red-500/20 border-red-500/50 text-red-400',
    high: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    low: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  };

  const typeColors = {
    idea: 'bg-cyan-500/20 border-cyan-500/50',
    task: 'bg-purple-500/20 border-purple-500/50',
  };

  return (
    <div
      className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border rounded-lg p-4 transition-all hover:shadow-lg hover:shadow-cyan-500/20 cursor-move ${
        typeColors[item.type]
      } ${isCompleted ? 'opacity-75' : ''} ${isRunning ? 'ring-2 ring-cyan-400 animate-pulse' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('itemId', item.id);
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {isIdea ? (
            <Lightbulb className="w-4 h-4 text-cyan-400" />
          ) : (
            <CheckSquare className="w-4 h-4 text-purple-400" />
          )}
          <span className="text-xs font-semibold text-gray-400 uppercase">
            {isIdea ? 'Idea' : 'Task'}
          </span>
          {isLab && (
            <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-500/20 border-purple-500/50 text-purple-400 flex items-center gap-1">
              <FlaskConical className="w-3 h-3" />
              Lab
            </span>
          )}
          {item.priority && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[item.priority]}`}>
              {item.priority}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-bold text-white mb-2 text-sm line-clamp-2">{item.title}</h3>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description}</p>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 bg-slate-700/50 text-gray-300 rounded"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-gray-500 rounded">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Subtasks */}
      {item.subtasks && item.subtasks.length > 0 && (
        <div className="mb-2 text-xs text-gray-500">
          {item.subtasks.filter(s => s.completed).length} / {item.subtasks.length} subtasks
        </div>
      )}

      {/* Due Date */}
      {item.dueDate && (
        <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(item.dueDate).toLocaleDateString()}
        </div>
      )}

      {/* Task-specific: Execute button */}
      {isTask && onExecute && !isCompleted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExecute(item.id);
          }}
          disabled={isRunning}
          className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Result preview (for completed tasks) */}
      {isTask && item.result && isCompleted && (
        <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-gray-400 line-clamp-2">
          {item.result.substring(0, 100)}...
        </div>
      )}

      {/* Linked items indicator */}
      {item.linkedItems && item.linkedItems.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-cyan-400">
          <Link2 className="w-3 h-3" />
          {item.linkedItems.length} linked
        </div>
      )}

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute top-10 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[150px]">
          <div className="py-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
            {onLink && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLink(item.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Link Item
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
