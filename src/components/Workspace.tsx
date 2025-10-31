import { useState, useEffect } from 'react';
import { FileCode, Play, Save, FolderOpen, Plus, Trash2, File, Users, Wifi, WifiOff } from 'lucide-react';
import { realtimeSyncService } from '../services/realtimeSync';

interface FileItem {
  name: string;
  content: string;
  language: string;
}

export default function Workspace() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: 'app.tsx',
      language: 'typescript',
      content: `import React from 'react';

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <p>Start building something amazing!</p>
    </div>
  );
}`,
    },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [cursors, setCursors] = useState<any[]>([]);

  useEffect(() => {
    const projectId = 'demo-project';
    const userId = 'demo-user';

    realtimeSyncService.createSession(projectId, userId).then(session => {
      if (session) {
        setIsConnected(true);

        realtimeSyncService.subscribeToProject(projectId, {
          onCursorUpdate: (cursor) => {
            setCursors(prev => {
              const filtered = prev.filter(c => c.session_id !== cursor.session_id);
              return [...filtered, cursor];
            });
          },
          onPresenceChange: (presence) => {
            setActiveUsers(presence.length);
          },
        });
      }
    });

    return () => {
      realtimeSyncService.endSession();
      realtimeSyncService.unsubscribeAll();
    };
  }, []);

  const activeFile = files[activeFileIndex];

  const updateFileContent = (content: string) => {
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content };
    setFiles(updatedFiles);
  };

  const addNewFile = () => {
    if (!newFileName.trim()) return;

    const extension = newFileName.split('.').pop() || 'txt';
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      css: 'css',
      html: 'html',
      json: 'json',
    };

    const newFile: FileItem = {
      name: newFileName,
      language: languageMap[extension] || 'text',
      content: '',
    };

    setFiles([...files, newFile]);
    setActiveFileIndex(files.length);
    setNewFileName('');
    setShowNewFileModal(false);
  };

  const deleteFile = (index: number) => {
    if (files.length === 1) {
      alert('Cannot delete the last file');
      return;
    }

    if (!confirm(`Delete ${files[index].name}?`)) return;

    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setActiveFileIndex(Math.max(0, activeFileIndex - 1));
  };

  const runCode = () => {
    alert('Code execution coming soon! This will compile and run your code in a sandboxed environment.');
  };

  const saveFiles = () => {
    alert('Files saved successfully! In production, this would save to your project repository.');
  };

  return (
    <div className="max-w-full mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Code Workspace</h1>
          <p className="text-slate-400 text-lg">Build and test your code with AI assistance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            {isConnected ? (
              <>
                <Wifi size={16} className="text-green-400" />
                <span className="text-sm text-slate-300">Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-400" />
                <span className="text-sm text-slate-300">Offline</span>
              </>
            )}
          </div>
          {activeUsers > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
              <Users size={16} className="text-cyan-400" />
              <span className="text-sm text-slate-300">{activeUsers} active</span>
            </div>
          )}
          <button
            onClick={saveFiles}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Save size={18} />
            Save
          </button>
          <button
            onClick={runCode}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Play size={18} />
            Run
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex">
        <div className="w-64 border-r border-slate-800 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-400">
              <FolderOpen size={18} />
              <span className="text-sm font-medium">Files</span>
            </div>
            <button
              onClick={() => setShowNewFileModal(true)}
              className="p-1.5 hover:bg-slate-800 rounded transition-colors"
              title="New file"
            >
              <Plus size={16} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeFileIndex === index
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
                onClick={() => setActiveFileIndex(index)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File size={14} />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCode size={18} className="text-cyan-400" />
              <span className="font-medium">{activeFile.name}</span>
              <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded">
                {activeFile.language}
              </span>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            <textarea
              value={activeFile.content}
              onChange={(e) => updateFileContent(e.target.value)}
              className="w-full h-full bg-slate-950 text-slate-100 font-mono text-sm p-4 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Start coding..."
              spellCheck={false}
            />
          </div>
        </div>

        <div className="w-96 border-l border-slate-800 p-6 overflow-y-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Play size={18} className="text-cyan-400" />
            Preview / Output
          </h3>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[300px]">
            <div className="text-slate-400 text-sm">
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2">Console Output</div>
                <div className="bg-slate-900 rounded p-3 font-mono text-xs">
                  <div className="text-green-400">Ready to run...</div>
                  <div className="text-slate-500 mt-1">
                    Click "Run" to execute your code
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">Quick Info</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Lines:</span>
                    <span>{activeFile.content.split('\n').length}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Characters:</span>
                    <span>{activeFile.content.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Language:</span>
                    <span className="capitalize">{activeFile.language}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 text-slate-400">AI Assistant</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                Explain this code
              </button>
              <button className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                Fix errors
              </button>
              <button className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                Add comments
              </button>
              <button className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                Optimize performance
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New File</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewFile()}
                  placeholder="example.tsx"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
                <div className="text-xs text-slate-500 mt-2">
                  Supported: .ts, .tsx, .js, .jsx, .css, .html, .json
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addNewFile}
                  disabled={!newFileName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create File
                </button>
                <button
                  onClick={() => {
                    setShowNewFileModal(false);
                    setNewFileName('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
