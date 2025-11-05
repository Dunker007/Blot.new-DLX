/**
 * Data Weave Lab
 * Synthesize outputs from multiple agents for cross-domain insights
 * Uses Data Analyst + Research Agent
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/agentService';
import { Agent } from './types';
import AgentChat from '../../components/labs/AgentChat';
import { geminiService } from '../../services/gemini/geminiService';
import {
  Network,
  Database,
  Sparkles,
  Play,
  Loader2,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';

interface SynthesisTask {
  id: string;
  name: string;
  agents: string[];
  query: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: string;
  timestamp: string;
}

const DataWeaveLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<SynthesisTask[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('data-weave');
      setAgents(labAgents);
      // Auto-select available agents
      if (labAgents.length > 0) {
        setSelectedAgents(labAgents.slice(0, 2).map((a) => a.id));
      }
    };
    loadAgents();
  }, []);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('data-weave');

  const handleSynthesize = async () => {
    if (!query.trim() || selectedAgents.length === 0) {
      return;
    }

    const task: SynthesisTask = {
      id: `task-${Date.now()}`,
      name: `Synthesis: ${query.substring(0, 30)}...`,
      agents: selectedAgents,
      query,
      status: 'running',
      timestamp: new Date().toISOString(),
    };

    setTasks((prev) => [task, ...prev]);
    setIsSynthesizing(true);

    try {
      // Get selected agent instances
      const selectedAgentInstances = agents.filter((a) => selectedAgents.includes(a.id));

      // Query each agent in parallel
      const agentResponses = await Promise.all(
        selectedAgentInstances.map(async (agent) => {
          const prompt = `${agent.corePrompt}\n\nUser Query: ${query}\n\nPlease provide your analysis:`;
          const response = await geminiService.generateText(prompt, agent.model);
          return {
            agent: agent.name,
            response,
          };
        })
      );

      // Synthesize responses using Data Analyst
      const dataAnalyst = agents.find((a) => a.id === 'data-analyst') || agents[0];
      const synthesisPrompt = `You are synthesizing insights from multiple AI agents. Here are their responses:

${agentResponses
  .map((r) => `**${r.agent}**:\n${r.response}`)
  .join('\n\n---\n\n')}

User Query: ${query}

Please synthesize these perspectives into a comprehensive, unified analysis. Identify:
1. Common themes and agreements
2. Divergent perspectives
3. Missing information or gaps
4. Actionable insights
5. Recommendations

Provide a clear, structured synthesis:`;

      const synthesis = await geminiService.generateText(synthesisPrompt, dataAnalyst.model);

      // Update task with result
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: 'complete',
                result: synthesis,
              }
            : t
        )
      );
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: 'error',
                result: error instanceof Error ? error.message : 'Synthesis failed',
              }
            : t
        )
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <Network className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">Data Weave Lab</h1>
        </div>
        <p className="text-gray-400">Synthesize outputs from multiple agents for cross-domain insights</p>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Agent Selection */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Select Agents for Synthesis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgents((prev) =>
                    prev.includes(agent.id)
                      ? prev.filter((id) => id !== agent.id)
                      : [...prev, agent.id]
                  );
                }}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedAgents.includes(agent.id)
                    ? 'bg-cyan-600/20 border-cyan-500'
                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                </div>
                <p className="text-xs text-gray-400">{agent.description}</p>
                {selectedAgents.includes(agent.id) && (
                  <div className="mt-2 text-xs text-cyan-400">✓ Selected</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Query for Synthesis</h2>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a question or topic that requires insights from multiple agents..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
          />
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing || !query.trim() || selectedAgents.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Synthesize Insights
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Synthesis Results</h2>
          {tasks.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No synthesis tasks yet</p>
              <p className="text-sm text-gray-500 mt-2">Select agents and enter a query to get started</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{task.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Agents: {task.agents.join(', ')}</span>
                      <span>•</span>
                      <span>{new Date(task.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'running' && (
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                    )}
                    {task.status === 'complete' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {task.status === 'error' && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Error</span>
                    )}
                  </div>
                </div>

                {task.result && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">Synthesized Insights</span>
                    </div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">{task.result}</div>
                  </div>
                )}

                {task.status === 'running' && (
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Querying agents and synthesizing responses...
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agent Chat */}
      {agents.length > 0 && (
        <AgentChat
          agents={hasGlobalHelper ? [...agents, agentService.getGlobalHelperAgent()] : agents}
          defaultAgentId={agents.find((a) => a.id === 'data-analyst')?.id || agents[0]?.id}
          labId="data-weave"
          compact={false}
        />
      )}
    </div>
  );
};

export default DataWeaveLab;

