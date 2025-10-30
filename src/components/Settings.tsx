import { useState, useEffect } from 'react';
import {
  Server,
  Plus,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LLMProvider, Model } from '../types';
import { llmService } from '../services/llm';

export default function Settings() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    const { data: providersData } = await supabase
      .from('llm_providers')
      .select('*')
      .order('priority', { ascending: true });

    if (providersData) {
      setProviders(providersData);
      llmService.setProviders(providersData);

      const providerIds = providersData.map((p) => p.id);
      const { data: modelsData } = await supabase
        .from('models')
        .select('*')
        .in('provider_id', providerIds);

      if (modelsData) {
        setModels(modelsData);
        llmService.setModels(modelsData);
      }
    }
  };

  const deleteProvider = async (id: string) => {
    await supabase.from('llm_providers').delete().eq('id', id);
    loadProviders();
  };

  const toggleProvider = async (id: string, isActive: boolean) => {
    await supabase
      .from('llm_providers')
      .update({ is_active: !isActive })
      .eq('id', id);
    loadProviders();
  };

  const testProvider = async (provider: LLMProvider) => {
    setTestingProvider(provider.id);
    const success = await llmService.testConnection(provider);
    setTestingProvider(null);

    if (success) {
      alert('Connection successful!');
    } else {
      alert('Connection failed. Please check your settings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-400">
          Configure your LLM providers and system preferences
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">LLM Providers</h2>
            <p className="text-slate-400 text-sm">
              Connect to LM Studio, OpenAI, Anthropic, and more
            </p>
          </div>
          <button
            onClick={() => setShowAddProvider(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors"
          >
            <Plus size={18} />
            Add Provider
          </button>
        </div>

        {providers.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
            <Server size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-semibold mb-2">No providers configured</h3>
            <p className="text-slate-400 mb-6">
              Add your first LLM provider to start using AI features
            </p>
            <button
              onClick={() => setShowAddProvider(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Add Provider
            </button>
          </div>
        )}

        <div className="space-y-3">
          {providers.map((provider) => {
            const providerModels = models.filter(
              (m) => m.provider_id === provider.id
            );

            return (
              <div
                key={provider.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold capitalize">
                        {provider.name.replace('_', ' ')}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          provider.is_active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {provider.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      {provider.endpoint_url}
                    </p>
                    {providerModels.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {providerModels.map((model) => (
                          <span
                            key={model.id}
                            className="px-2 py-1 bg-slate-700 rounded text-xs"
                          >
                            {model.display_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testProvider(provider)}
                      disabled={testingProvider === provider.id}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Test connection"
                    >
                      <RefreshCw
                        size={18}
                        className={testingProvider === provider.id ? 'animate-spin' : ''}
                      />
                    </button>
                    <button
                      onClick={() => toggleProvider(provider.id, provider.is_active)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title={provider.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {provider.is_active ? (
                        <Check size={18} className="text-green-400" />
                      ) : (
                        <X size={18} className="text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteProvider(provider.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-400 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-blue-400 mb-2">
              LuxRig Local LLMs
            </h3>
            <p className="text-sm text-slate-300">
              To connect to your LM Studio instance on LuxRig, use the endpoint:
              <code className="block mt-2 px-3 py-2 bg-slate-900 rounded font-mono text-cyan-400">
                http://luxrig:1234
              </code>
              Make sure LM Studio is running and the API server is enabled.
            </p>
          </div>
        </div>
      </div>

      {showAddProvider && (
        <AddProviderModal
          onClose={() => setShowAddProvider(false)}
          onAdded={loadProviders}
        />
      )}
    </div>
  );
}

interface AddProviderModalProps {
  onClose: () => void;
  onAdded: () => void;
}

function AddProviderModal({ onClose, onAdded }: AddProviderModalProps) {
  const [name, setName] = useState<string>('lm_studio');
  const [endpointUrl, setEndpointUrl] = useState('http://luxrig:1234');
  const [apiKey, setApiKey] = useState('');

  const providerOptions = [
    { value: 'lm_studio', label: 'LM Studio (LuxRig)' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'ollama', label: 'Ollama' },
  ];

  const defaultEndpoints: Record<string, string> = {
    lm_studio: 'http://luxrig:1234',
    openai: 'https://api.openai.com',
    anthropic: 'https://api.anthropic.com',
    gemini: 'https://generativelanguage.googleapis.com',
    ollama: 'http://localhost:11434',
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    setEndpointUrl(defaultEndpoints[newName] || '');
  };

  const handleAdd = async () => {
    if (!name || !endpointUrl) return;

    const { error } = await supabase.from('llm_providers').insert([
      {
        name,
        endpoint_url: endpointUrl,
        api_key: apiKey || null,
        is_active: true,
        priority: 0,
        config: {},
      },
    ]);

    if (!error) {
      onAdded();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold">Add LLM Provider</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <select
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              {providerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Endpoint URL
            </label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="http://luxrig:1234"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              API Key (optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave empty for local providers"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!name || !endpointUrl}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
