import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, IntelReport } from '../types/task';
import { executeTask, analyzeIntel } from '../services/taskService';
import { TaskList } from './tasks/TaskList';
import CommandConsole from './tasks/CommandConsole';
import { CheckSquare, Filter, Search, FileText, X } from 'lucide-react';

const STORAGE_KEY = 'dlx-tasks';

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 1,
              text: 'System diagnostics initiated',
              status: 'Complete' as const,
              result: 'All systems nominal. Quantum core temperature stable at 3.14K.',
              timestamp: new Date().toISOString(),
            },
            {
              id: 2,
              text: 'Network analysis pending',
              status: 'In Progress...' as const,
              timestamp: new Date().toISOString(),
            },
          ];
    } catch (e) {
      console.error('Failed to load tasks', e);
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | Task['status']>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [intelReport, setIntelReport] = useState<IntelReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Persist tasks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [tasks]);

  const handleTaskSubmit = useCallback(
    async (taskText: string) => {
      if (!taskText.trim() || isLoading) return;

      const newTask: Task = {
        id: Date.now(),
        text: taskText,
        status: 'In Progress...',
        timestamp: new Date().toISOString(),
      };

      setTasks((prev) => [newTask, ...prev]);
      setIsLoading(true);

      try {
        const result = await executeTask(taskText);
        setTasks((prev) =>
          prev.map((task) =>
            task.id === newTask.id
              ? { ...task, status: 'Complete', result }
              : task
          )
        );
      } catch (error) {
        console.error('Task execution failed:', error);
        setTasks((prev) =>
          prev.map((task) =>
            task.id === newTask.id
              ? { ...task, status: 'Failed', result: error instanceof Error ? error.message : 'Task failed' }
              : task
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const handleIntelAnalysis = useCallback(async (query: string) => {
    if (!query.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setIntelReport(null);

    try {
      const result = await analyzeIntel(query);
      setIntelReport(result);
    } catch (error) {
      console.error('Intel analysis failed:', error);
      setIntelReport({
        title: 'Analysis Failed',
        summary: error instanceof Error ? error.message : 'An unknown error occurred',
        key_points: ['Please check your Gemini API key', 'Ensure the query is valid', 'Try again later'],
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.result?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'All' || task.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchTerm, filter]);

  const filterOptions: Array<'All' | Task['status']> = ['All', 'Complete', 'In Progress...', 'Failed'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-left mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckSquare className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">
              Task Management
            </h1>
          </div>
          <p className="text-gray-400 mt-2">Review and audit all operational tasks. Execute tasks with AI assistance.</p>
        </header>

        {/* Command Console */}
        <div className="mb-8 bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Command Console</h2>
          {intelReport ? (
            <div className="bg-slate-900/50 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-400">{intelReport.title}</h3>
                <button
                  onClick={() => setIntelReport(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-300 mb-4">{intelReport.summary}</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-400 mb-2">Key Points:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {intelReport.key_points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <CommandConsole
              onTaskSubmit={handleTaskSubmit}
              onIntelSubmit={handleIntelAnalysis}
              isLoading={isLoading || isAnalyzing}
            />
          )}
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    filter === option
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Tasks ({filteredTasks.length})
            </h2>
          </div>
          <TaskList tasks={filteredTasks} />
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;

