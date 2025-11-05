/**
 * Crypto Lab
 * Cryptocurrency analysis and portfolio tracking
 * Includes specialized crypto agents
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/agentService';
import { Agent } from './types';
import AgentChat from '../../components/labs/AgentChat';
import { TrendingUp, Wallet, BarChart3, Coins } from 'lucide-react';

const CryptoLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('crypto');
      setAgents(labAgents);
      setLoading(false);
    };
    loadAgents();
  }, []);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('crypto');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">Crypto Lab</h1>
        </div>
        <p className="text-gray-400">Cryptocurrency analysis and portfolio tracking</p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Market Analysis</h3>
            <p className="text-gray-400 text-sm">
              Real-time cryptocurrency market data and trends. Powered by specialized crypto agents.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <Wallet className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Portfolio Tracking</h3>
            <p className="text-gray-400 text-sm">
              Track your crypto holdings and analyze performance. Get optimization recommendations.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <BarChart3 className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">DeFi Analysis</h3>
            <p className="text-gray-400 text-sm">
              Analyze DeFi protocols, yield farming opportunities, and smart contract risks.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Available Agents</h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-slate-900/50 border border-slate-600 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs">
                    {agent.model.replace('gemini-', '').replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Chat - Floating */}
      {agents.length > 0 && (
        <AgentChat
          agents={hasGlobalHelper ? [...agents, agentService.getGlobalHelperAgent()] : agents}
          defaultAgentId={agents[0]?.id}
          labId="crypto"
          compact={false}
        />
      )}
    </div>
  );
};

export default CryptoLab;

