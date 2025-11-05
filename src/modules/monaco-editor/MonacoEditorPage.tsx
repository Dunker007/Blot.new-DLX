import React, { useState, useRef } from 'react';
import CodeEditor from './CodeEditor';
import { geminiService } from '../../services/gemini/geminiService';
import type { editor } from 'monaco-editor';

const MonacoEditorPage: React.FC = () => {
  const [code, setCode] = useState('// Start coding here...\n');
  const [language, setLanguage] = useState('javascript');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const generatedCode = await geminiService.generateCode(aiPrompt, code);
      setCode(generatedCode);
    } catch (error) {
      console.error('Code generation failed:', error);
      alert('Failed to generate code. Please check your Gemini API key in settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-4">Monaco Code Editor</h1>
        
        <div className="flex gap-4 mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask AI to generate or modify code..."
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <CodeEditor
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          editorRef={editorRef}
        />
      </div>
    </div>
  );
};

export default MonacoEditorPage;

