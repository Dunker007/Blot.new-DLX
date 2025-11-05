/**
 * Agent Forge Lab
 * Create, manage, and interact with specialized AI agents
 * Uses Gemini Pro (gemini-2.0-flash-exp or gemini-2.5-pro)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Agent, ChatMessage } from './types';
import { geminiService } from '../../services/gemini/geminiService';
import { LocalStorageManager } from '../../utils/localStorage';
import { agentService } from '../../services/agentService';
import {
  Plus,
  Bot,
  Send,
  Trash2,
  Edit,
  Play,
  Settings,
  Sparkles,
  X,
  Save,
} from 'lucide-react';

const STORAGE_KEY = 'dlx-agents';

const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Expert at writing, reviewing, and debugging code',
    corePrompt:
      'You are an expert software engineer. You write clean, efficient, well-documented code. You understand best practices, design patterns, and can debug complex issues. Always provide code examples when relevant.',
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    tools: [],
  },
  {
    id: 'researcher',
    name: 'Research Agent',
    description: 'Gathers and synthesizes information from multiple sources',
    corePrompt:
      'You are a research specialist. You gather information, analyze data, and provide comprehensive summaries. You cite sources when possible and distinguish between facts and opinions.',
    model: 'gemini-2.0-flash-exp',
    temperature: 0.3,
    tools: [],
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Specializes in creative content, storytelling, and writing',
    corePrompt:
      'You are a creative writing assistant. You help with storytelling, character development, world-building, and crafting engaging narratives. You provide constructive feedback and creative suggestions.',
    model: 'gemini-2.5-pro',
    temperature: 0.9,
    tools: [],
  },
];

const AgentForge: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(() => {
    return LocalStorageManager.get<Agent[]>(STORAGE_KEY, DEFAULT_AGENTS);
  });

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: '',
    description: '',
    corePrompt: '',
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    tools: [],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist agents
  useEffect(() => {
    LocalStorageManager.set(STORAGE_KEY, agents);
  }, [agents]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.corePrompt) return;

    const agent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgent.name!,
      description: newAgent.description || '',
      corePrompt: newAgent.corePrompt!,
      model: (newAgent.model || 'gemini-2.0-flash-exp') as Agent['model'],
      temperature: newAgent.temperature || 0.7,
      tools: newAgent.tools || [],
    };

    setAgents((prev) => [...prev, agent]);
    setNewAgent({
      name: '',
      description: '',
      corePrompt: '',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      tools: [],
    });
    setShowCreateModal(false);
    setSelectedAgent(agent);
    setMessages([
      {
        role: 'model',
        content: `Hello! I'm ${agent.name}. ${agent.description || 'How can I help you today?'}`,
      },
    ]);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setNewAgent({
      name: agent.name,
      description: agent.description,
      corePrompt: agent.corePrompt,
      model: agent.model,
      temperature: agent.temperature,
      tools: agent.tools,
    });
    setShowCreateModal(true);
  };

  const handleUpdateAgent = () => {
    if (!editingAgent || !newAgent.name || !newAgent.corePrompt) return;

    setAgents((prev) =>
      prev.map((a) =>
        a.id === editingAgent.id
          ? {
              ...a,
              name: newAgent.name!,
              description: newAgent.description || '',
              corePrompt: newAgent.corePrompt!,
              model: (newAgent.model || 'gemini-2.0-flash-exp') as Agent['model'],
              temperature: newAgent.temperature || 0.7,
              tools: newAgent.tools || [],
            }
          : a
      )
    );

    if (selectedAgent?.id === editingAgent.id) {
      setSelectedAgent({
        ...selectedAgent,
        name: newAgent.name!,
        description: newAgent.description || '',
        corePrompt: newAgent.corePrompt!,
        model: (newAgent.model || 'gemini-2.0-flash-exp') as Agent['model'],
        temperature: newAgent.temperature || 0.7,
        tools: newAgent.tools || [],
      });
    }

    setEditingAgent(null);
    setShowCreateModal(false);
    setNewAgent({
      name: '',
      description: '',
      corePrompt: '',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      tools: [],
    });
  };

  const handleDeleteAgent = (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    setAgents((prev) => prev.filter((a) => a.id !== id));
    if (selectedAgent?.id === id) {
      setSelectedAgent(null);
      setMessages([]);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([
      {
        role: 'model',
        content: `Hello! I'm ${agent.name}. ${agent.description || 'How can I help you today?'}`,
      },
    ]);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !selectedAgent) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const fullPrompt = `${selectedAgent.corePrompt}\n\n${
        conversationHistory ? `${conversationHistory}\n\n` : ''
      }User: ${userMessage.content}\n\nAssistant:`;

      const response = await geminiService.generateText(fullPrompt, selectedAgent.model);

      const modelMessage: ChatMessage = {
        role: 'model',
        content: response || 'I apologize, but I couldn\'t generate a response. Please try again.',
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Agent Error:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content:
          'An error occurred. Please check your Gemini API key in Settings → Gemini API.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedAgent, messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar - Agent Library */}
      <div className="w-80 bg-slate-800/50 border-r border-cyan-500/20 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-cyan-400">Agent Forge</h2>
            </div>
            <button
              onClick={() => {
                setEditingAgent(null);
                setNewAgent({
                  name: '',
                  description: '',
                  corePrompt: '',
                  model: 'gemini-2.0-flash-exp',
                  temperature: 0.7,
                  tools: [],
                });
                setShowCreateModal(true);
              }}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
              title="Create New Agent"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-sm text-gray-400">Create and manage AI agents</p>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedAgent?.id === agent.id
                  ? 'bg-cyan-600/20 border-cyan-500'
                  : 'bg-slate-700/50 border-slate-600 hover:border-cyan-500/50'
              }`}
              onClick={() => handleSelectAgent(agent)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAgent(agent);
                    }}
                    className="p-1 hover:bg-slate-600 rounded"
                    title="Edit Agent"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAgent(agent.id);
                    }}
                    className="p-1 hover:bg-red-600/20 rounded"
                    title="Delete Agent"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{agent.description}</p>
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="px-2 py-1 bg-slate-600 rounded text-gray-300">
                  {agent.model.replace('gemini-', '').replace('-', ' ')}
                </span>
                <span className="text-gray-500">Temp: {agent.temperature}</span>
              </div>
              {/* Show which labs use this agent */}
              {(() => {
                const labs = agentService.getAgentLabs(agent.id);
                if (labs.length > 0) {
                  return (
                    <div className="text-xs text-cyan-400/70">
                      Used in: {labs.join(', ')}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-400">{selectedAgent.name}</h1>
                  <p className="text-sm text-gray-400">{selectedAgent.description}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-cyan-600/20 border border-cyan-500/30 text-white'
                        : 'bg-slate-800/50 border border-slate-700 text-gray-200'
                    }`}
                  >
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-cyan-400 font-semibold">
                          {selectedAgent.name}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-400 text-sm">{selectedAgent.name} is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-cyan-500/20 bg-slate-800/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={`Chat with ${selectedAgent.name}...`}
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">Select an Agent</h2>
              <p className="text-gray-500 mb-6">Choose an agent from the sidebar to start chatting</p>
              <button
                onClick={() => {
                  setEditingAgent(null);
                  setNewAgent({
                    name: '',
                    description: '',
                    corePrompt: '',
                    model: 'gemini-2.0-flash-exp',
                    temperature: 0.7,
                    tools: [],
                  });
                  setShowCreateModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Your First Agent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-cyan-400">
                {editingAgent ? 'Edit Agent' : 'Create New Agent'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAgent(null);
                  setNewAgent({
                    name: '',
                    description: '',
                    corePrompt: '',
                    model: 'gemini-2.0-flash-exp',
                    temperature: 0.7,
                    tools: [],
                  });
                }}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="e.g., Code Assistant"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="What does this agent do?"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Core Prompt (Personality & Instructions)
                </label>
                <textarea
                  value={newAgent.corePrompt}
                  onChange={(e) => setNewAgent({ ...newAgent, corePrompt: e.target.value })}
                  placeholder="Define the agent's personality, expertise, and how it should respond..."
                  rows={6}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                  <select
                    value={newAgent.model}
                    onChange={(e) =>
                      setNewAgent({
                        ...newAgent,
                        model: e.target.value as Agent['model'],
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Fast)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Powerful)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Balanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperature: {newAgent.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newAgent.temperature}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
                  disabled={!newAgent.name || !newAgent.corePrompt}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAgent(null);
                    setNewAgent({
                      name: '',
                      description: '',
                      corePrompt: '',
                      model: 'gemini-2.0-flash-exp',
                      temperature: 0.7,
                      tools: [],
                    });
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
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

export default AgentForge;

