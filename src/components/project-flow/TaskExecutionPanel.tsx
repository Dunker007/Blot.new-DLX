/**
 * Task Execution Panel
 * AI-powered task execution UI (from TaskManagement)
 */

import React, { useState } from 'react';
import { Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface TaskExecutionPanelProps {
  taskId: string;
  taskTitle: string;
  onExecute: (taskId: string) => Promise<void>;
  result?: string;
  isExecuting?: boolean;
  executionStatus?: 'pending' | 'running' | 'complete' | 'failed';
  onClose?: () => void;
}

export const TaskExecutionPanel: React.FC<TaskExecutionPanelProps> = ({
  taskId,
  taskTitle,
  onExecute,
  result,
  isExecuting,
  executionStatus,
  onClose,
}) => {
  const [localResult, setLocalResult] = useState<string | undefined>(result);

  const handleExecute = async () => {
    try {
      await onExecute(taskId);
      // Result will be updated via props
    } catch (error) {
      console.error('Task execution failed:', error);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Execute Task</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <p className="text-sm text-gray-300 mb-4">{taskTitle}</p>

      {executionStatus === 'pending' && (
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Execute with AI
        </button>
      )}

      {isExecuting && (
        <div className="flex items-center justify-center gap-2 text-cyan-400 py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Executing task...</span>
        </div>
      )}

      {executionStatus === 'complete' && (result || localResult) && (
        <div className="bg-slate-900/50 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-green-400">Task Completed</span>
          </div>
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {result || localResult}
          </div>
        </div>
      )}

      {executionStatus === 'failed' && (
        <div className="bg-slate-900/50 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-red-400">Execution Failed</span>
          </div>
          <div className="text-sm text-gray-300">
            {result || 'Task execution failed. Please try again.'}
          </div>
        </div>
      )}
    </div>
  );
};
