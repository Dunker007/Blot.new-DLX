import { useState, useEffect } from 'react';
import { Key, Save } from 'lucide-react';
import { geminiService } from '../services/gemini/geminiService';

export default function GeminiSettings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load API key from localStorage
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      geminiService.setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    geminiService.setApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Key className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Gemini API Configuration</h2>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key..."
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <p className="text-sm text-slate-400 mt-2">
            Get your API key from{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          <Save size={18} />
          {saved ? 'Saved!' : 'Save API Key'}
        </button>

        {saved && (
          <div className="text-green-400 text-sm">
            ✓ API key saved successfully! You can now use Gemini-powered features.
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Gemini-Powered Features</h3>
        <ul className="space-y-2 text-slate-300">
          <li>• Monaco Code Editor - AI code generation</li>
          <li>• Audio Transcriber - Voice-to-text transcription</li>
          <li>• Image Analysis - Vision AI for image understanding</li>
          <li>• Mind Map - AI-assisted brainstorming</li>
        </ul>
      </div>
    </div>
  );
}

