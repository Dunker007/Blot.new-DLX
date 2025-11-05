/**
 * System Matrix Lab
 * Core concepts, components, and operational parameters
 * Uses System Architect agent
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/agentService';
import { Agent } from './types';
import AgentChat from '../../components/labs/AgentChat';
import { geminiService } from '../../services/gemini/geminiService';
import {
  Settings,
  Cpu,
  Network,
  Database,
  Code,
  Zap,
  Info,
} from 'lucide-react';

interface SystemComponent {
  id: string;
  name: string;
  category: 'core' | 'ai' | 'storage' | 'network' | 'ui';
  description: string;
  status: 'operational' | 'maintenance' | 'deprecated';
  config: Record<string, any>;
}

const SystemMatrixLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<SystemComponent | null>(null);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('system-matrix');
      setAgents(labAgents);
    };
    loadAgents();

    // Initialize system components
    setComponents([
      {
        id: 'storage-layer',
        name: 'Storage Layer',
        category: 'storage',
        description: 'IndexedDB + LocalStorage hybrid storage system',
        status: 'operational',
        config: { type: 'hybrid', version: 2 },
      },
      {
        id: 'ai-orchestrator',
        name: 'AI Orchestrator',
        category: 'ai',
        description: 'Multi-model routing and cost optimization',
        status: 'operational',
        config: { preferLocal: true, fallbackToCloud: true },
      },
      {
        id: 'agent-system',
        name: 'Agent System',
        category: 'ai',
        description: 'Specialized AI agents for different domains',
        status: 'operational',
        config: { agents: 9, labs: 11 },
      },
      {
        id: 'labs-hub',
        name: 'Labs Hub',
        category: 'core',
        description: 'Centralized lab navigation and management',
        status: 'operational',
        config: { labs: 11, categories: 4 },
      },
    ]);
  }, []);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('system-matrix');

  const handleQuery = async () => {
    if (!query.trim()) return;

    try {
      const architect = agents.find((a) => a.id === 'architect') || agents[0];
      const systemContext = components
        .map((c) => `**${c.name}** (${c.category}): ${c.description}`)
        .join('\n');

      const prompt = `${architect.corePrompt}

System Overview:
${systemContext}

User Question: ${query}

Provide a clear, technical answer about the system architecture:`;

      const response = await geminiService.generateText(prompt, architect.model);
      setAnswer(response);
    } catch (err) {
      console.error('Query error:', err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core':
        return <Zap className="w-5 h-5" />;
      case 'ai':
        return <Cpu className="w-5 h-5" />;
      case 'storage':
        return <Database className="w-5 h-5" />;
      case 'network':
        return <Network className="w-5 h-5" />;
      case 'ui':
        return <Code className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-400';
      case 'maintenance':
        return 'text-yellow-400';
      case 'deprecated':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">System Matrix</h1>
        </div>
        <p className="text-gray-400">Core concepts, components, and operational parameters</p>
      </div>

      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Components List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-white mb-4">System Components</h2>
            <div className="space-y-2">
              {components.map((component) => (
                <button
                  key={component.id}
                  onClick={() => setSelectedComponent(component)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedComponent?.id === component.id
                      ? 'bg-cyan-600/20 border-cyan-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(component.category)}
                    <span className="font-semibold text-white">{component.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">{component.category}</span>
                    <span className={`text-xs capitalize ${getStatusColor(component.status)}`}>
                      {component.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Component Details / Query */}
        <div className="lg:col-span-2 space-y-4">
          {selectedComponent ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                {getCategoryIcon(selectedComponent.category)}
                <h2 className="text-2xl font-bold text-white">{selectedComponent.name}</h2>
              </div>
              <p className="text-gray-300 mb-4">{selectedComponent.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className={`text-sm capitalize ${getStatusColor(selectedComponent.status)}`}>
                    {selectedComponent.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Category:</span>
                  <span className="text-sm text-white capitalize">{selectedComponent.category}</span>
                </div>
                {Object.keys(selectedComponent.config).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Configuration</h3>
                    <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                      <pre className="text-xs text-gray-300">
                        {JSON.stringify(selectedComponent.config, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">System Query</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="Ask about system architecture, components, or configuration..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleQuery}
                  disabled={!query.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Query System
                </button>

                {answer && (
                  <div className="mt-4 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Answer</h3>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{answer}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Chat */}
      {agents.length > 0 && (
        <AgentChat
          agents={hasGlobalHelper ? [...agents, agentService.getGlobalHelperAgent()] : agents}
          defaultAgentId={agents.find((a) => a.id === 'architect')?.id || agents[0]?.id}
          labId="system-matrix"
          compact={false}
        />
      )}
    </div>
  );
};

export default SystemMatrixLab;

