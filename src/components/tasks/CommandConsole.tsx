import React, { useState } from 'react';
import { Send, Zap, Search } from 'lucide-react';

type CommandMode = 'task' | 'analysis';

interface CommandConsoleProps {
  onTaskSubmit: (taskText: string) => void;
  onIntelSubmit: (query: string) => void;
  isLoading: boolean;
}

const CommandConsole: React.FC<CommandConsoleProps> = ({ onTaskSubmit, onIntelSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<CommandMode>('task');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (mode === 'task') {
      onTaskSubmit(text);
    } else {
      onIntelSubmit(text);
    }
    setText('');
  };

  const placeholderText =
    mode === 'task'
      ? "Enter task description... e.g., 'Analyze user engagement metrics'"
      : "Enter complex query for structured analysis... e.g., 'Summarize all project status updates'";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex bg-slate-800/50 p-1 rounded-lg mb-4 w-full md:w-2/3 mx-auto border border-slate-700">
        <button
          type="button"
          onClick={() => setMode('task')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
            mode === 'task'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-transparent hover:bg-slate-700/50 text-cyan-300'
          }`}
        >
          <Zap className="w-4 h-4" />
          Quick Task
        </button>
        <button
          type="button"
          onClick={() => setMode('analysis')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
            mode === 'analysis'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-transparent hover:bg-slate-700/50 text-cyan-300'
          }`}
        >
          <Search className="w-4 h-4" />
          Intel Analysis
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholderText}
        className="w-full p-4 mb-4 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
        rows={5}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-5 rounded-lg font-bold transition-all duration-200 shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/50"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            PROCESSING...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            EXECUTE
          </>
        )}
      </button>
    </form>
  );
};

export default CommandConsole;

