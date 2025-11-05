import React from 'react';
import { Task } from '../../types/task';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

export const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No tasks found. Submit a task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const getStatusIcon = () => {
          switch (task.status) {
            case 'Complete':
              return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            case 'Failed':
              return <XCircle className="w-5 h-5 text-red-400" />;
            default:
              return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
          }
        };

        const getStatusColor = () => {
          switch (task.status) {
            case 'Complete':
              return 'border-green-500/30 bg-green-900/20';
            case 'Failed':
              return 'border-red-500/30 bg-red-900/20';
            default:
              return 'border-yellow-500/30 bg-yellow-900/20';
          }
        };

        return (
          <div
            key={task.id}
            className={`border rounded-lg p-4 ${getStatusColor()} transition-all hover:shadow-lg`}
          >
            <div className="flex items-start gap-3">
              {getStatusIcon()}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{task.text}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.timestamp).toLocaleString()}
                  </span>
                </div>
                {task.result && (
                  <div className="mt-2 p-3 bg-slate-800/50 rounded border border-slate-700">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{task.result}</p>
                  </div>
                )}
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      task.status === 'Complete'
                        ? 'bg-green-500/20 text-green-400'
                        : task.status === 'Failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

