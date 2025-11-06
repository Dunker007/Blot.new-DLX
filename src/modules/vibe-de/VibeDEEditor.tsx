/**
 * DLX Vibe Development Environment (Vibe.d.e)
 * Natural Language Coding Without Code
 * Showcase feature for DLX Studios
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Play,
  Maximize2,
  Minimize2,
  Video,
  Camera,
  Mic,
  Loader2,
  RefreshCw,
  Eye,
  Code2,
  Settings,
  Monitor,
  Webcam,
} from 'lucide-react';
import { geminiService } from '../../services/gemini/geminiService';
import { LocalStorageManager } from '../../utils/localStorage';

interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'local';
  type: 'cloud' | 'local';
  description: string;
}

interface GenerationHistory {
  id: string;
  prompt: string;
  code: string;
  timestamp: Date;
  model: string;
}

const VibeDEEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewWindow, setPreviewWindow] = useState<Window | null>(null);
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Audio/Video features (planned)
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  
  const previewRef = useRef<HTMLIFrameElement>(null);
  const codeBlobRef = useRef<string>('');

  // Available AI models
  const availableModels: AIModel[] = [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash (Free)',
      provider: 'gemini',
      type: 'cloud',
      description: 'Fast and free - best for rapid prototyping',
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      type: 'cloud',
      description: 'Balanced performance - free tier',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'gemini',
      type: 'cloud',
      description: 'Google\'s most advanced model - best for code generation',
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      type: 'cloud',
      description: 'OpenAI\'s powerful model (requires API key)',
    },
    {
      id: 'claude-3.7',
      name: 'Claude 3.7 Sonnet',
      provider: 'anthropic',
      type: 'cloud',
      description: 'Anthropic\'s advanced reasoning model (requires API key)',
    },
    {
      id: 'local-default',
      name: 'Local Model',
      provider: 'local',
      type: 'local',
      description: 'Local LM Studio model (requires LM Studio connection)',
    },
  ];

  useEffect(() => {
    // Load saved model preference, default to free model
    const savedModelId = LocalStorageManager.get<string>('vibe-de-selected-model', 'gemini-2.0-flash-exp');
    const model = availableModels.find(m => m.id === savedModelId) || availableModels[0];
    setSelectedModel(model);
    
    // Load generation history
    const savedHistory = LocalStorageManager.get<GenerationHistory[]>('vibe-de-history', []);
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    // Save model preference
    if (selectedModel) {
      LocalStorageManager.set('vibe-de-selected-model', selectedModel.id);
    }
  }, [selectedModel]);

  useEffect(() => {
    // Save history
    LocalStorageManager.set('vibe-de-history', history);
  }, [history]);

  // Generate code from natural language
  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsGenerating(true);
    try {
      let code = '';

      if (selectedModel.provider === 'gemini') {
        // Use Gemini service
        const fullPrompt = `You are a natural language to code generator. Convert the following natural language description into working HTML/CSS/JavaScript code. The code should be a complete, runnable web application.

Requirements:
- Generate complete, self-contained HTML with embedded CSS and JavaScript
- Make it modern, responsive, and visually appealing
- Use dark theme with cyan/blue/purple accents
- Ensure the code runs immediately when opened

User Request: ${prompt}

Generate the complete HTML code:`;

        code = await geminiService.generateText(fullPrompt, selectedModel.id);
        
        // Extract code from markdown code blocks if present
        const codeMatch = code.match(/```(?:html|javascript)?\n([\s\S]*?)```/);
        if (codeMatch) {
          code = codeMatch[1];
        }
      } else {
        // For other providers, show placeholder
        code = `<!-- ${selectedModel.name} integration coming soon -->\n<div class="container">\n  <h1>Generated from: "${prompt}"</h1>\n  <p>This model requires API key configuration.</p>\n</div>`;
      }

      setGeneratedCode(code);
      codeBlobRef.current = code;

      // Add to history
      const historyItem: GenerationHistory = {
        id: Date.now().toString(),
        prompt,
        code,
        timestamp: new Date(),
        model: selectedModel.name,
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50

      // Auto-update preview if live preview is enabled
      if (isLivePreview) {
        updatePreview(code);
      }
    } catch (error) {
      console.error('Code generation failed:', error);
      alert('Failed to generate code. Please check your API key in settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update preview with generated code
  const updatePreview = useCallback((code: string) => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    // Update iframe
    if (previewRef.current) {
      previewRef.current.src = url;
    }

    // Update popout window if open
    if (previewWindow && !previewWindow.closed) {
      previewWindow.document.open();
      previewWindow.document.write(code);
      previewWindow.document.close();
    }
  }, [previewWindow]);

  // Open preview in popout window
  const handlePopoutPreview = () => {
    if (!generatedCode) {
      alert('Generate some code first!');
      return;
    }

    const popout = window.open('', 'vibe-de-preview', 'width=1200,height=800,resizable=yes,scrollbars=yes');
    if (popout) {
      popout.document.open();
      popout.document.write(generatedCode);
      popout.document.close();
      setPreviewWindow(popout);

      // Watch for window close
      const checkClosed = setInterval(() => {
        if (popout.closed) {
          setPreviewWindow(null);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  };

  // Enable audio input
  const handleAudioToggle = async () => {
    if (!audioEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
        setAudioEnabled(true);
        
        // Start transcription (would integrate with audio transcriber)
        // For now, just show that audio is active
      } catch (error) {
        console.error('Audio access denied:', error);
        alert('Microphone access is required for voice input.');
      }
    } else {
      audioStream?.getTracks().forEach(track => track.stop());
      setAudioStream(null);
      setAudioEnabled(false);
    }
  };

  // Enable video/webcam input
  const handleVideoToggle = async () => {
    if (!videoEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        setVideoEnabled(true);
        
        // Set up video element for display
        // Future: Process video frames for AI analysis
      } catch (error) {
        console.error('Camera access denied:', error);
        alert('Camera access is required for video input.');
      }
    } else {
      videoStream?.getTracks().forEach(track => track.stop());
      setVideoStream(null);
      setVideoEnabled(false);
    }
  };

  // Enable webcam pointing at monitor (self-correction feature)
  const handleWebcamToggle = async () => {
    if (!webcamEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
        });
        setWebcamEnabled(true);
        
        // Future: Process video to detect monitor content
        // Use OCR/vision AI to read what's on screen
        // Send to AI for self-correction feedback
        alert('Webcam self-correction mode enabled! This feature will analyze your screen and provide AI feedback.');
      } catch (error) {
        console.error('Webcam access denied:', error);
        alert('Camera access is required for webcam self-correction.');
      }
    } else {
      setWebcamEnabled(false);
    }
  };

  // Load code from history
  const loadFromHistory = (historyItem: GenerationHistory) => {
    setPrompt(historyItem.prompt);
    setGeneratedCode(historyItem.code);
    codeBlobRef.current = historyItem.code;
    updatePreview(historyItem.code);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-slate-800 border-b border-slate-700 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="text-pink-400" size={24} />
              DLX Vibe.d.e
            </h1>
            <p className="text-slate-400 text-sm">Natural Language Coding Without Code</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <select
              value={selectedModel?.id || ''}
              onChange={(e) => {
                const model = availableModels.find(m => m.id === e.target.value);
                if (model) setSelectedModel(model);
              }}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.type})
                </option>
              ))}
            </select>

            {/* Live Preview Toggle */}
            <button
              onClick={() => setIsLivePreview(!isLivePreview)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isLivePreview
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-slate-700 text-slate-300 border border-slate-600'
              }`}
              title="Toggle live preview"
            >
              <Eye size={16} />
              <span className="text-sm">Live</span>
            </button>

            {/* Popout Preview */}
            {generatedCode && (
              <button
                onClick={handlePopoutPreview}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-colors"
                title="Open preview in new window"
              >
                <Maximize2 size={16} />
                <span className="text-sm">Popout</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build in natural language... (e.g., 'Create a todo app with dark theme and animations')"
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleGenerate();
              }
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !selectedModel}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-opacity flex items-center gap-2 text-white font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play size={18} />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Feature Controls */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleAudioToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              audioEnabled
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
            }`}
            title="Voice input (coming soon)"
          >
            <Mic size={14} />
            Voice
          </button>
          <button
            onClick={handleVideoToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              videoEnabled
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
            }`}
            title="Video input (coming soon)"
          >
            <Video size={14} />
            Video
          </button>
          <button
            onClick={handleWebcamToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              webcamEnabled
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
            }`}
            title="Webcam self-correction (coming soon)"
          >
            <Webcam size={14} />
            Self-Correct
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600 rounded text-xs transition-colors"
          >
            <RefreshCw size={14} />
            History ({history.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor / Preview Split */}
        <div className="flex-1 flex flex-col border-r border-slate-800">
          {/* Code Display */}
          <div className="flex-1 overflow-auto p-4">
            {generatedCode ? (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code2 size={16} className="text-cyan-400" />
                    Generated Code
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      alert('Code copied to clipboard!');
                    }}
                    className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-white"
                  >
                    Copy Code
                  </button>
                </div>
                <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles size={64} className="text-pink-400/50 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Describe your idea in natural language and watch it come to life as code.
                  No coding required - just speak your vision!
                </p>
                <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-left">
                  <p className="text-xs text-slate-300 mb-2 font-semibold">Example prompts:</p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li>"Create a dark-themed calculator with smooth animations"</li>
                    <li>"Build a todo app with drag-and-drop functionality"</li>
                    <li>"Make a weather dashboard with cards and animations"</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-96 flex flex-col border-l border-slate-800 bg-slate-900/50">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Eye size={16} className="text-cyan-400" />
              Live Preview
            </h3>
          </div>
          <div className="flex-1 overflow-hidden relative">
            {previewUrl || generatedCode ? (
              <iframe
                ref={previewRef}
                src={previewUrl || undefined}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Vibe.d.e Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Preview will appear here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-800 z-50 overflow-y-auto">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Generation History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            >
              <Minimize2 size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {history.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-8">
                No generation history yet
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                >
                  <div className="text-xs text-slate-400 mb-1">
                    {item.timestamp.toLocaleString()} • {item.model}
                  </div>
                  <div className="text-sm text-white line-clamp-2">{item.prompt}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VibeDEEditor;

