import React, { useState, useRef, useCallback, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { geminiService } from '../../services/gemini/geminiService';
import { realtimeSyncService } from '../../services/realtimeSync';
import { contextService } from '../../services/contextService';
import type { editor } from 'monaco-editor';
import {
  File,
  FileCode,
  FolderOpen,
  Play,
  Plus,
  Save,
  Trash2,
  Users,
  Wifi,
  WifiOff,
  Loader2,
  Layers,
} from 'lucide-react';
import ComposerPanel from './ComposerPanel';
import AIChatPanel from './AIChatPanel';
import SecurityPanel from './SecurityPanel';
import QualityMetricsPanel from './QualityMetricsPanel';
import CodeExplanationPanel from './CodeExplanationPanel';
import RefactoringPanel from './RefactoringPanel';

interface FileItem {
  name: string;
  content: string;
  language: string;
}

const MonacoEditorPage: React.FC = () => {
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [composerMode, setComposerMode] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRefactor, setShowRefactor] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Real-time collaboration
  useEffect(() => {
    const projectId = 'monaco-editor-project';
    const userId = 'user-' + Math.random().toString(36).substr(2, 9);

    realtimeSyncService.createSession(projectId, userId).then((session) => {
      if (session) {
        setIsConnected(true);

        realtimeSyncService.subscribeToProject(projectId, {
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

  // Update file content
  const updateFileContent = useCallback(
    (content: string | undefined) => {
      if (content === undefined) return;
      const updatedFiles = [...files];
      updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content };
      setFiles(updatedFiles);
    },
    [files, activeFileIndex]
  );

  // Handle code selection from editor
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
        setSelectedCode(selectedText);
      } else {
        setSelectedCode('');
      }
    });

    return () => {
      disposable.dispose();
    };
  }, [activeFileIndex, files]);

  // Add new file
  const addNewFile = useCallback(() => {
    if (!newFileName.trim()) return;

    const extension = newFileName.split('.').pop() || 'txt';
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      java: 'java',
      cs: 'csharp',
      cpp: 'cpp',
      c: 'cpp',
      go: 'go',
      rs: 'rust',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown',
    };

    const newFile: FileItem = {
      name: newFileName,
      language: languageMap[extension] || 'plaintext',
      content: '',
    };

    setFiles([...files, newFile]);
    setActiveFileIndex(files.length);
    setNewFileName('');
    setShowNewFileModal(false);
  }, [files, newFileName]);

  // Delete file
  const deleteFile = useCallback(
    (index: number) => {
      if (files.length === 1) {
        alert('Cannot delete the last file');
        return;
      }

      if (!confirm(`Delete ${files[index].name}?`)) return;

      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      setActiveFileIndex(Math.max(0, activeFileIndex - 1));
    },
    [files, activeFileIndex]
  );

  // AI code generation with context awareness
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;

    if (composerMode) {
      // Multi-file operations in composer mode
      setIsGenerating(true);
      try {
        // Get operations from composer panel (will be handled by apply handler)
        setAiPrompt('');
      } catch (error) {
        console.error('Multi-file generation failed:', error);
        alert('Failed to generate multi-file code. Please check your Gemini API key in settings.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Single file generation with context
      setIsGenerating(true);
      try {
        // Analyze project context
        const projectContext = contextService.analyzeContext(files);
        const contextSummary = contextService.generateContextSummary(projectContext);
        
        // Get relevant files for better context
        const relevantFiles = contextService.getRelevantFiles(projectContext, activeFile.name);
        const relevantContext = relevantFiles.length > 0 
          ? `\n\nRelevant Files:\n${relevantFiles.map(f => `${f.name}:\n${f.content.substring(0, 500)}...`).join('\n\n')}`
          : '';

        const fullContext = `${contextSummary}\n\nCurrent File (${activeFile.name}):\n${activeFile.content}${relevantContext}`;
        
        const generatedCode = await geminiService.generateCode(aiPrompt, fullContext);
        const updatedFiles = [...files];
        updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: generatedCode };
        setFiles(updatedFiles);
        setAiPrompt('');
      } catch (error) {
        console.error('Code generation failed:', error);
        alert('Failed to generate code. Please check your Gemini API key in settings.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // Handle composer operations
  const handleApplyComposerOperations = async (operations: Array<{ type: 'create' | 'modify' | 'delete'; file: string; content?: string }>) => {
    if (operations.length === 0) return;

    setIsGenerating(true);
    try {
      const fileContext = files.map(f => ({ name: f.name, content: f.content }));
      const results = await geminiService.generateMultiFileCode(aiPrompt, fileContext, operations);
      
      // Apply operations
      let updatedFiles = [...files];
      
      for (const result of results) {
        if (result.operation === 'delete') {
          updatedFiles = updatedFiles.filter(f => f.name !== result.file);
        } else if (result.operation === 'create') {
          const extension = result.file.split('.').pop() || 'txt';
          const languageMap: Record<string, string> = {
            ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
            py: 'python', java: 'java', cs: 'csharp', cpp: 'cpp', c: 'cpp',
            go: 'go', rs: 'rust', css: 'css', html: 'html', json: 'json', md: 'markdown',
          };
          updatedFiles.push({
            name: result.file,
            content: result.content,
            language: languageMap[extension] || 'plaintext',
          });
        } else if (result.operation === 'modify') {
          const fileIndex = updatedFiles.findIndex(f => f.name === result.file);
          if (fileIndex !== -1) {
            updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], content: result.content };
          }
        }
      }

      setFiles(updatedFiles);
      setComposerMode(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Composer operations failed:', error);
      alert('Failed to apply composer operations. Please check your Gemini API key in settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save files
  const saveFiles = useCallback(() => {
    try {
      localStorage.setItem('monaco-editor-files', JSON.stringify(files));
      alert('Files saved successfully!');
    } catch (error) {
      console.error('Failed to save files:', error);
      alert('Failed to save files.');
    }
  }, [files]);

  // Run code
  const runCode = useCallback(() => {
    alert(
      'Code execution coming soon! This will compile and run your code in a sandboxed environment.'
    );
  }, []);

  // Load saved files
  useEffect(() => {
    try {
      const saved = localStorage.getItem('monaco-editor-files');
      if (saved) {
        const parsedFiles = JSON.parse(saved);
        if (parsedFiles.length > 0) {
          setFiles(parsedFiles);
        }
      }
    } catch (error) {
      console.error('Failed to load saved files:', error);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden relative">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-slate-800 border-b border-slate-700 z-10 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Monaco Code Editor</h1>
            <p className="text-slate-400 text-sm">Multi-file editor with AI assistance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setComposerMode(!composerMode)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                composerMode
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-white'
              }`}
              title="Composer Mode - Multi-file editing"
            >
              <Layers size={16} />
              <span className="text-sm">Composer</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg">
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
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg">
                <Users size={16} className="text-cyan-400" />
                <span className="text-sm text-slate-300">{activeUsers} active</span>
              </div>
            )}
            <button
              onClick={saveFiles}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors text-white"
            >
              <Save size={18} />
              Save
            </button>
            <button
              onClick={runCode}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity text-white"
            >
              <Play size={18} />
              Run
            </button>
          </div>
        </div>

        {/* AI Prompt */}
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI to generate or modify code..."
            className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-cyan-500"
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-64 border-r border-slate-800 p-4 flex flex-col bg-slate-900/50">
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
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'hover:bg-slate-800 text-slate-300 border border-transparent'
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

        {/* Editor Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="border-b border-slate-800 px-6 py-3 flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center gap-3">
              <FileCode size={18} className="text-cyan-400" />
              <span className="font-medium text-white">{activeFile.name}</span>
              <span className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded capitalize">
                {activeFile.language}
              </span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <CodeEditor
              language={activeFile.language}
              value={activeFile.content}
              onChange={updateFileContent}
              editorRef={editorRef}
              onContextChange={(context) => {
                // Context is captured for AI suggestions
                // This could be used for real-time autocomplete suggestions
              }}
            />
          </div>
        </div>

        {/* Preview/Output Panel or Composer Panel or AI Chat or Security Panel */}
        {composerMode ? (
          <div className="w-96">
            <ComposerPanel
              files={files}
              onApplyOperations={handleApplyComposerOperations}
              onCancel={() => setComposerMode(false)}
            />
          </div>
        ) : showSecurity ? (
          <div className="w-96">
            <SecurityPanel
              code={activeFile.content}
              fileName={activeFile.name}
              onNavigateToReview={() => {
                // Navigate to Code Review Lab
                window.location.hash = '#/review';
              }}
            />
          </div>
        ) : showQuality ? (
          <div className="w-96">
            <QualityMetricsPanel
              code={activeFile.content}
              fileName={activeFile.name}
              onRefactor={() => {
                // Could trigger refactoring assistant
                setShowChat(true);
                setShowQuality(false);
              }}
            />
          </div>
        ) : showExplanation ? (
          <div className="w-96">
            <CodeExplanationPanel
              code={activeFile.content}
              fileName={activeFile.name}
              language={activeFile.language}
              editorInstance={editorRef.current}
              learningMode={true}
            />
          </div>
        ) : showRefactor ? (
          <div className="w-96">
            <RefactoringPanel
              code={activeFile.content}
              fileName={activeFile.name}
              language={activeFile.language}
              onApply={(refactoredCode) => {
                const updatedFiles = [...files];
                updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: refactoredCode };
                setFiles(updatedFiles);
                setShowRefactor(false);
                setShowChat(true);
              }}
              onNavigateToReview={() => {
                window.location.hash = '#/review';
              }}
            />
          </div>
        ) : showChat ? (
          <div className="w-96">
            <AIChatPanel
              selectedCode={selectedCode}
              fileContent={activeFile.content}
              fileName={activeFile.name}
              onCodeUpdate={(code) => {
                const updatedFiles = [...files];
                updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: code };
                setFiles(updatedFiles);
              }}
            />
          </div>
        ) : (
        <div className="w-96 border-l border-slate-800 p-6 overflow-y-auto bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <Play size={18} className="text-cyan-400" />
              Preview / Output
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSecurity(true);
                  setShowChat(false);
                  setShowQuality(false);
                }}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs text-red-400 transition-colors"
              >
                Security
              </button>
              <button
                onClick={() => {
                  setShowQuality(true);
                  setShowChat(false);
                  setShowSecurity(false);
                  setShowExplanation(false);
                  setShowRefactor(false);
                }}
                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded text-xs text-yellow-400 transition-colors"
              >
                Quality
              </button>
              <button
                onClick={() => {
                  setShowRefactor(true);
                  setShowChat(false);
                  setShowSecurity(false);
                  setShowQuality(false);
                  setShowExplanation(false);
                }}
                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-xs text-green-400 transition-colors"
              >
                Refactor
              </button>
              <button
                onClick={() => {
                  setShowExplanation(true);
                  setShowChat(false);
                  setShowSecurity(false);
                  setShowQuality(false);
                  setShowRefactor(false);
                }}
                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded text-xs text-purple-400 transition-colors"
              >
                Explain
              </button>
              <button
                onClick={() => {
                  setShowChat(true);
                  setShowSecurity(false);
                  setShowQuality(false);
                  setShowExplanation(false);
                  setShowRefactor(false);
                }}
                className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-xs text-cyan-400 transition-colors"
              >
                Chat
              </button>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[300px]">
            <div className="text-slate-400 text-sm">
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2">Console Output</div>
                <div className="bg-slate-900 rounded p-3 font-mono text-xs">
                  <div className="text-green-400">Ready to run...</div>
                  <div className="text-slate-500 mt-1">Click &quot;Run&quot; to execute your code</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">File Stats</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Lines:</span>
                    <span className="text-slate-300">{activeFile.content.split('\n').length}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Characters:</span>
                    <span className="text-slate-300">{activeFile.content.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Language:</span>
                    <span className="text-slate-300 capitalize">{activeFile.language}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-white">Create New File</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewFile()}
                  placeholder="example.tsx"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                  autoFocus
                />
                <div className="text-xs text-slate-500 mt-2">
                  Supported: .ts, .tsx, .js, .jsx, .py, .java, .css, .html, .json, .md
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addNewFile}
                  disabled={!newFileName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  Create File
                </button>
                <button
                  onClick={() => {
                    setShowNewFileModal(false);
                    setNewFileName('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors text-white"
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
};

export default MonacoEditorPage;
