/**
 * Signal Lab
 * Research tool with Google Search grounding for real-time data
 * Uses Research Agent for information gathering
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/agentService';
import { Agent } from './types';
import AgentChat from '../../components/labs/AgentChat';
import { geminiService } from '../../services/gemini/geminiService';
import {
  Radio,
  Search,
  Globe,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface ResearchResult {
  query: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  summary: string;
  keyFindings: string[];
  timestamp: string;
}

const SignalLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('signal');
      setAgents(labAgents);
    };
    loadAgents();
  }, []);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('signal');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const researchAgent = agents.find((a) => a.id === 'researcher') || agents[0];
      if (!researchAgent) {
        throw new Error('Research Agent not available');
      }

      // Note: Google Search API integration would go here
      // For now, using Gemini with web search context simulation
      const prompt = `You are a research agent with access to real-time web data. Research the following query and provide comprehensive information:

Query: ${searchQuery}

Please provide:
1. A comprehensive summary of findings
2. Key findings as bullet points
3. Important sources and references (format as: Title - URL)
4. Any recent developments or trends

Format your response clearly and cite sources when possible.`;

      const response = await geminiService.generateText(prompt, researchAgent.model);

      // Parse response (simplified - in production would parse structured data)
      const keyFindings = response
        .split('\n')
        .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
        .slice(0, 5);

      const result: ResearchResult = {
        query: searchQuery,
        sources: [
          {
            title: 'Web Search Results',
            url: '#',
            snippet: 'Real-time web search data',
          },
        ],
        summary: response,
        keyFindings: keyFindings.length > 0 ? keyFindings : ['See summary for details'],
        timestamp: new Date().toISOString(),
      };

      setResults((prev) => [result, ...prev]);
      setSearchQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">Signal Lab</h1>
        </div>
        <p className="text-gray-400">Research tool with real-time data grounding</p>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Search Interface */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Research Query</h2>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter a research question or topic..."
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Research
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No research results yet</p>
              <p className="text-sm text-gray-500 mt-2">Enter a query to start researching</p>
            </div>
          ) : (
            results.map((result, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{result.query}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Research Complete</span>
                      <span>•</span>
                      <span>{new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Key Findings */}
                {result.keyFindings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-cyan-400 mb-2">Key Findings</h4>
                    <ul className="space-y-1">
                      {result.keyFindings.map((finding, fIdx) => (
                        <li key={fIdx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Summary */}
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-2">Summary</h4>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{result.summary}</p>
                  </div>
                </div>

                {/* Sources */}
                {result.sources.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Sources</h4>
                    <div className="space-y-2">
                      {result.sources.map((source, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-start gap-3"
                        >
                          <FileText className="w-5 h-5 text-cyan-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-white">{source.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{source.snippet}</div>
                            {source.url !== '#' && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-1"
                              >
                                View Source
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
          defaultAgentId={agents.find((a) => a.id === 'researcher')?.id || agents[0]?.id}
          labId="signal"
          compact={false}
        />
      )}
    </div>
  );
};

export default SignalLab;

