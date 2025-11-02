import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import {
  CheckCircle,
  Cpu,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';

import { isDemoMode, supabase } from '../lib/supabase';
import { demoModels, demoProviders } from '../services/demoData';
import { llmService } from '../services/llm';
import { DiscoveredModel, modelDiscoveryService } from '../services/modelDiscovery';
import { LLMProvider, Model } from '../types';

function Settings() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [discoveredModels, setDiscoveredModels] = useState<DiscoveredModel[]>([]);
  const [discoveringModels, setDiscoveringModels] = useState<string | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [newProvider, setNewProvider] = useState({
    name: 'lm_studio' as const,
    endpoint_url: 'http://localhost:1234',
    api_key: '',
    priority: 1,
  });
  const [newModel, setNewModel] = useState({
    provider_id: '',
    model_name: '',
    display_name: '',
    context_window: 4096,
    use_case: 'general' as const,
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);

      // Use demo data if in demo mode
      if (isDemoMode) {
        setProviders(demoProviders);
        setModels(demoModels);
        setLoading(false);
        return;
      }

      const { data: providersData, error: providersError } = await supabase
        .from('llm_providers')
        .select('*')
        .order('priority', { ascending: true });

      if (providersError) throw providersError;

      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*')
        .order('created_at', { ascending: false });

      if (modelsError) throw modelsError;

      if (providersData) setProviders(providersData);
      if (modelsData) setModels(modelsData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const addProvider = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('llm_providers')
        .insert([newProvider])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProviders([...providers, data]);
        setShowAddProvider(false);
        setNewProvider({
          name: 'lm_studio',
          endpoint_url: 'http://localhost:1234',
          api_key: '',
          priority: 1,
        });
      }
    } catch (error) {
      console.error('Failed to add provider:', error);
      alert('Failed to add provider. Please check the console for details.');
    }
  }, [providers, newProvider]);

  const deleteProvider = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all associated models.')) return;

    try {
      const { error } = await supabase.from('llm_providers').delete().eq('id', id);

      if (error) throw error;

      setProviders(providers.filter(p => p.id !== id));
      setModels(models.filter(m => m.provider_id !== id));
    } catch (error) {
      console.error('Failed to delete provider:', error);
    }
  };

  const toggleProvider = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('llm_providers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setProviders(providers.map(p => (p.id === id ? { ...p, is_active: !currentStatus } : p)));
    } catch (error) {
      console.error('Failed to toggle provider:', error);
    }
  };

  const testProviderConnection = async (provider: LLMProvider) => {
    setTestingProvider(provider.id);
    try {
      const result = await llmService.testConnection(provider);
      if (result) {
        const discoveryResult = await modelDiscoveryService.discoverModels(provider);
        if (discoveryResult.success) {
          alert(`Connection successful! Found ${discoveryResult.models.length} models.`);
        } else {
          alert('Connection successful!');
        }
      } else {
        alert('Connection failed. Please check the endpoint URL.');
      }
    } catch (error) {
      alert('Connection failed. Please check the endpoint URL and try again.');
    } finally {
      setTestingProvider(null);
    }
  };

  const discoverModels = async (provider: LLMProvider) => {
    setDiscoveringModels(provider.id);
    try {
      const result = await modelDiscoveryService.discoverModels(provider);
      if (result.success) {
        setDiscoveredModels(result.models);
        setSelectedProvider(provider);
        setShowModelPicker(true);
      } else {
        alert(`Failed to discover models: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to discover models. Please check the provider connection.');
    } finally {
      setDiscoveringModels(null);
    }
  };

  const bulkImportModels = async (provider: LLMProvider) => {
    setDiscoveringModels(provider.id);
    try {
      const result = await modelDiscoveryService.discoverModels(provider);
      if (!result.success) {
        alert(`Failed to discover models: ${result.error}`);
        return;
      }

      const importResult = await modelDiscoveryService.bulkImportModels(provider.id, result.models);

      alert(
        `Import complete!\n` +
          `Imported: ${importResult.imported}\n` +
          `Skipped: ${importResult.skipped}\n` +
          `Errors: ${importResult.errors.length}`
      );

      await loadSettings();
    } catch (error) {
      alert('Failed to import models. Please check the console for details.');
    } finally {
      setDiscoveringModels(null);
    }
  };

  const addDiscoveredModel = async (discoveredModel: DiscoveredModel) => {
    if (!selectedProvider) return;

    try {
      const { data, error } = await supabase
        .from('models')
        .insert([
          {
            provider_id: selectedProvider.id,
            model_name: discoveredModel.model_name,
            display_name: discoveredModel.display_name,
            context_window: discoveredModel.context_window,
            use_case: 'general',
            is_available: true,
            performance_metrics: {},
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setModels([data, ...models]);
        setDiscoveredModels(discoveredModels.filter(m => m.id !== discoveredModel.id));
      }
    } catch (error) {
      console.error('Failed to add model:', error);
      alert('Failed to add model. It may already exist.');
    }
  };

  const addModel = async () => {
    try {
      const { data, error } = await supabase.from('models').insert([newModel]).select().single();

      if (error) throw error;

      if (data) {
        setModels([data, ...models]);
        setShowAddModel(false);
        setNewModel({
          provider_id: '',
          model_name: '',
          display_name: '',
          context_window: 4096,
          use_case: 'general',
        });
      }
    } catch (error) {
      console.error('Failed to add model:', error);
      alert('Failed to add model. Please check the console for details.');
    }
  };

  const deleteModel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const { error } = await supabase.from('models').delete().eq('id', id);

      if (error) throw error;

      setModels(models.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  const toggleModel = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('models')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setModels(models.map(m => (m.id === id ? { ...m, is_available: !currentStatus } : m)));
    } catch (error) {
      console.error('Failed to toggle model:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-slate-400 text-lg">Configure your LLM providers and models</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server size={24} className="text-cyan-400" />
              <h2 className="text-2xl font-bold">LLM Providers</h2>
            </div>
            <button
              onClick={() => setShowAddProvider(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={20} />
              Add Provider
            </button>
          </div>

          <div className="space-y-3">
            {providers.map(provider => (
              <div
                key={provider.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold capitalize">
                        {provider.name.replace('_', ' ')}
                      </h3>
                      {provider.is_active ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">
                          <CheckCircle size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
                          <XCircle size={12} />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{provider.endpoint_url}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Priority: {provider.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => discoverModels(provider)}
                      disabled={discoveringModels === provider.id || !provider.is_active}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                      title="Discover available models"
                    >
                      {discoveringModels === provider.id ? (
                        <Loader2 size={18} className="animate-spin text-cyan-400" />
                      ) : (
                        <Zap size={18} className="text-cyan-400" />
                      )}
                    </button>
                    <button
                      onClick={() => bulkImportModels(provider)}
                      disabled={discoveringModels === provider.id || !provider.is_active}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                      title="Import all models"
                    >
                      <Download size={18} className="text-green-400" />
                    </button>
                    <button
                      onClick={() => testProviderConnection(provider)}
                      disabled={testingProvider === provider.id}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                      title="Test connection"
                    >
                      {testingProvider === provider.id ? (
                        <Loader2 size={18} className="animate-spin text-cyan-400" />
                      ) : (
                        <RefreshCw size={18} className="text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleProvider(provider.id, provider.is_active)}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      title={provider.is_active ? 'Disable' : 'Enable'}
                    >
                      {provider.is_active ? (
                        <CheckCircle size={18} className="text-green-400" />
                      ) : (
                        <XCircle size={18} className="text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteProvider(provider.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete provider"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {providers.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <Server size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No LLM providers configured</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cpu size={24} className="text-cyan-400" />
              <h2 className="text-2xl font-bold">Models</h2>
            </div>
            <button
              onClick={() => setShowAddModel(true)}
              disabled={providers.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Add Model
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {models.map(model => {
              const provider = providers.find(p => p.id === model.provider_id);
              return (
                <div
                  key={model.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{model.display_name}</h3>
                      <p className="text-slate-400 text-xs mb-2">{model.model_name}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">
                          {provider?.name.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">
                          {model.use_case}
                        </span>
                        <span className="text-slate-500">
                          {model.context_window.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleModel(model.id, model.is_available)}
                        className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                        title={model.is_available ? 'Disable' : 'Enable'}
                      >
                        {model.is_available ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <XCircle size={16} className="text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteModel(model.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete model"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {models.length === 0 && (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <Cpu size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No models configured</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add LLM Provider</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Provider Type</label>
                <select
                  value={newProvider.name}
                  onChange={e => setNewProvider({ ...newProvider, name: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="lm_studio">LM Studio</option>
                  <option value="ollama">Ollama</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Endpoint URL</label>
                <input
                  type="text"
                  value={newProvider.endpoint_url}
                  onChange={e => setNewProvider({ ...newProvider, endpoint_url: e.target.value })}
                  placeholder="http://localhost:1234"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">API Key (optional)</label>
                <input
                  type="password"
                  value={newProvider.api_key}
                  onChange={e => setNewProvider({ ...newProvider, api_key: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Priority</label>
                <input
                  type="number"
                  value={newProvider.priority}
                  onChange={e =>
                    setNewProvider({ ...newProvider, priority: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={addProvider}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Add Provider
                </button>
                <button
                  onClick={() => setShowAddProvider(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Model</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Provider</label>
                <select
                  value={newModel.provider_id}
                  onChange={e => setNewModel({ ...newModel, provider_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select a provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Model Name</label>
                <input
                  type="text"
                  value={newModel.model_name}
                  onChange={e => setNewModel({ ...newModel, model_name: e.target.value })}
                  placeholder="llama-2-7b"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={newModel.display_name}
                  onChange={e => setNewModel({ ...newModel, display_name: e.target.value })}
                  placeholder="Llama 2 7B"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Context Window</label>
                <input
                  type="number"
                  value={newModel.context_window}
                  onChange={e =>
                    setNewModel({ ...newModel, context_window: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Use Case</label>
                <select
                  value={newModel.use_case}
                  onChange={e => setNewModel({ ...newModel, use_case: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="general">General</option>
                  <option value="coding">Coding</option>
                  <option value="analysis">Analysis</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={addModel}
                  disabled={!newModel.provider_id || !newModel.model_name || !newModel.display_name}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Model
                </button>
                <button
                  onClick={() => setShowAddModel(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModelPicker && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Available Models</h3>
                <p className="text-slate-400 text-sm">
                  {selectedProvider.name.replace('_', ' ')} - {discoveredModels.length} models found
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModelPicker(false);
                  setDiscoveredModels([]);
                  setSelectedProvider(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <XCircle size={24} />
              </button>
            </div>

            {discoveredModels.length === 0 ? (
              <div className="text-center py-12">
                <Cpu size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No models discovered</p>
              </div>
            ) : (
              <div className="space-y-2">
                {discoveredModels.map(model => (
                  <div
                    key={model.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{model.display_name}</h4>
                          {model.state === 'loaded' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                              <CheckCircle size={12} />
                              Loaded
                            </span>
                          )}
                          {model.state === 'not-loaded' && (
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">
                              Not Loaded
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mb-2">{model.model_name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {model.context_window && (
                            <span>{model.context_window.toLocaleString()} tokens</span>
                          )}
                          {model.quantization && (
                            <span className="px-2 py-0.5 bg-slate-700 rounded">
                              {model.quantization}
                            </span>
                          )}
                          {model.arch && (
                            <span className="px-2 py-0.5 bg-slate-700 rounded">{model.arch}</span>
                          )}
                          {model.type && model.type !== 'llm' && (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                              {model.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => addDiscoveredModel(model)}
                        className="ml-4 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Add Model
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={async () => {
                  if (!selectedProvider) return;
                  await bulkImportModels(selectedProvider);
                  setShowModelPicker(false);
                  setDiscoveredModels([]);
                  setSelectedProvider(null);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Import All Models
              </button>
              <button
                onClick={() => {
                  setShowModelPicker(false);
                  setDiscoveredModels([]);
                  setSelectedProvider(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Settings);
