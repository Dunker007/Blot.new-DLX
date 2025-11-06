import React, { useState, useCallback } from 'react';
import { File, Folder, Plus, Trash2, Edit3, Check, X, Loader2 } from 'lucide-react';

interface FileItem {
  name: string;
  content: string;
  language: string;
}

interface FileOperation {
  type: 'create' | 'modify' | 'delete';
  file: string;
  content?: string;
  originalContent?: string;
}

interface ComposerPanelProps {
  files: FileItem[];
  onApplyOperations: (operations: FileOperation[]) => void;
  onCancel: () => void;
}

const ComposerPanel: React.FC<ComposerPanelProps> = ({ files, onApplyOperations, onCancel }) => {
  const [operations, setOperations] = useState<FileOperation[]>([]);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  const addOperation = useCallback((type: 'create' | 'modify' | 'delete', fileName: string, content?: string) => {
    const existingOp = operations.find(op => op.file === fileName);
    if (existingOp) {
      // Update existing operation
      setOperations(prev => prev.map(op => 
        op.file === fileName 
          ? { ...op, type, content: content || op.content }
          : op
      ));
    } else {
      // Add new operation
      const file = files.find(f => f.name === fileName);
      setOperations(prev => [...prev, {
        type,
        file: fileName,
        content: content || file?.content || '',
        originalContent: file?.content
      }]);
    }
  }, [operations, files]);

  const removeOperation = useCallback((fileName: string) => {
    setOperations(prev => prev.filter(op => op.file !== fileName));
  }, []);

  const handleCreateFile = useCallback(() => {
    if (!newFileName.trim()) return;
    addOperation('create', newFileName);
    setNewFileName('');
    setShowNewFileInput(false);
  }, [newFileName, addOperation]);

  const handleApply = useCallback(() => {
    if (operations.length === 0) return;
    onApplyOperations(operations);
  }, [operations, onApplyOperations]);

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create': return <Plus size={14} className="text-green-400" />;
      case 'modify': return <Edit3 size={14} className="text-blue-400" />;
      case 'delete': return <Trash2 size={14} className="text-red-400" />;
      default: return null;
    }
  };

  const getOperationLabel = (type: string) => {
    switch (type) {
      case 'create': return 'Create';
      case 'modify': return 'Modify';
      case 'delete': return 'Delete';
      default: return type;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Folder size={18} className="text-cyan-400" />
            Composer Mode
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Close Composer"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <p className="text-xs text-slate-400">Multi-file operations preview</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Project Files */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-300">Project Files</h4>
            <button
              onClick={() => setShowNewFileInput(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
            >
              <Plus size={12} />
              New File
            </button>
          </div>

          {showNewFileInput && (
            <div className="mb-3 p-2 bg-slate-800/50 rounded border border-cyan-500/30">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                placeholder="file.tsx"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleCreateFile}
                  className="flex-1 px-2 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowNewFileInput(false);
                    setNewFileName('');
                  }}
                  className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {files.map((file, index) => {
              const operation = operations.find(op => op.file === file.name);
              const hasOperation = !!operation;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded border transition-colors ${
                    hasOperation
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <File size={14} className={hasOperation ? 'text-cyan-400' : 'text-slate-500'} />
                    <span className={`text-sm truncate ${hasOperation ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasOperation && (
                      <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                        {getOperationLabel(operation.type)}
                      </span>
                    )}
                    <button
                      onClick={() => addOperation('modify', file.name)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                      title="Modify"
                    >
                      <Edit3 size={12} className="text-blue-400" />
                    </button>
                    <button
                      onClick={() => addOperation('delete', file.name)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Operations */}
        {operations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Pending Operations ({operations.length})
            </h4>
            <div className="space-y-2">
              {operations.map((op, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-800/50 border border-slate-700 rounded"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getOperationIcon(op.type)}
                      <span className="text-sm font-medium text-white">{op.file}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">
                        {getOperationLabel(op.type)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeOperation(op.file)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      <X size={12} className="text-slate-400" />
                    </button>
                  </div>
                  {op.type !== 'delete' && op.content && (
                    <div className="mt-2 p-2 bg-slate-900 rounded text-xs text-slate-400 font-mono max-h-32 overflow-y-auto">
                      {op.content.substring(0, 200)}
                      {op.content.length > 200 && '...'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-800/50">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {operations.length} operation{operations.length !== 1 ? 's' : ''} pending
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={operations.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-opacity text-sm font-medium flex items-center gap-2"
            >
              <Check size={16} />
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposerPanel;

