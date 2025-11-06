/**
 * Flow Board Component
 * Kanban board with drag-and-drop support
 */

import React, { useState, useCallback } from 'react';
import { ProjectFlowItem, FlowColumn } from '../../types/projectFlow';
import { FlowCard } from './FlowCard';
import { FlowConnector } from './FlowConnector';

interface FlowBoardProps {
  items: ProjectFlowItem[];
  onMoveItem: (id: string, column: FlowColumn) => void;
  onExecuteTask?: (id: string) => void;
  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onLinkItems?: (id: string) => void;
  executingTaskId?: string;
}

const COLUMNS: Array<{ id: FlowColumn; label: string; color: string }> = [
  { id: 'ideas', label: 'Ideas', color: 'cyan' },
  { id: 'backlog', label: 'Backlog', color: 'blue' },
  { id: 'in-progress', label: 'In Progress', color: 'yellow' },
  { id: 'review', label: 'Review', color: 'purple' },
  { id: 'done', label: 'Done', color: 'green' },
];

export const FlowBoard: React.FC<FlowBoardProps> = ({
  items,
  onMoveItem,
  onExecuteTask,
  onEditItem,
  onDeleteItem,
  onLinkItems,
  executingTaskId,
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<FlowColumn | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent, column: FlowColumn) => {
    e.preventDefault();
    setDragOverColumn(column);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, column: FlowColumn) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) {
      onMoveItem(itemId, column);
    }
    setDraggedItem(null);
    setDragOverColumn(null);
  }, [onMoveItem]);

  const handleDragStart = useCallback((itemId: string) => {
    setDraggedItem(itemId);
  }, []);

  const getColumnItems = (column: FlowColumn) => {
    return items.filter(item => item.column === column);
  };

  return (
    <div className="relative w-full h-full">
      {/* Flow Connections Layer */}
      <FlowConnector items={items} />

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 relative z-10">
        {COLUMNS.map((column) => {
          const columnItems = getColumnItems(column.id);
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 bg-slate-800/50 border rounded-lg p-4 transition-all ${
                isDragOver ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700'
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold text-lg text-${column.color}-400`}>
                  {column.label}
                </h3>
                <span className="text-sm text-gray-500 bg-slate-700/50 px-2 py-1 rounded">
                  {columnItems.length}
                </span>
              </div>

              {/* Column Items */}
              <div className="space-y-3 min-h-[200px]">
                {columnItems.map((item) => (
                  <FlowCard
                    key={item.id}
                    item={item}
                    onMove={onMoveItem}
                    onExecute={onExecuteTask}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    onLink={onLinkItems}
                    isExecuting={executingTaskId === item.id}
                  />
                ))}
                {columnItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Drop items here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
