/**
 * Dataverse Lab
 * RAG-powered knowledge system grounded in project documentation
 * Uses Research Agent + Data Analyst
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/agentService';
import { Agent } from './types';
import AgentChat from '../../components/labs/AgentChat';
import { geminiService } from '../../services/gemini/geminiService';
import {
  Database,
  Search,
  BookOpen,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  tags: string[];
  timestamp: string;
}

interface QueryResult {
  query: string;
  results: KnowledgeEntry[];
  answer: string;
  sources: string[];
  timestamp: string;
}

const DataverseLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', content: '', source: '' });

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('dataverse');
      setAgents(labAgents);
    };
    loadAgents();

    // Load saved knowledge
    const saved = localStorage.getItem('dlx-dataverse-knowledge');
    if (saved) {
      try {
        setKnowledge(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dlx-dataverse-knowledge', JSON.stringify(knowledge));
  }, [knowledge]);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('dataverse');

  const handleAddDocument = () => {
    if (!newDoc.title || !newDoc.content) return;

    const entry: KnowledgeEntry = {
      id: `doc-${Date.now()}`,
      title: newDoc.title,
      content: newDoc.content,
      source: newDoc.source || 'Manual Entry',
      tags: [],
      timestamp: new Date().toISOString(),
    };

    setKnowledge((prev) => [entry, ...prev]);
    setNewDoc({ title: '', content: '', source: '' });
  };

  const handleQuery = async () => {
    if (!query.trim() || knowledge.length === 0) return;

    setIsQuerying(true);

    try {
      // Simple RAG: find relevant documents
      const relevantDocs = knowledge
        .map((doc) => ({
          doc,
          score:
            doc.title.toLowerCase().includes(query.toLowerCase()) ||
            doc.content.toLowerCase().includes(query.toLowerCase())
              ? 1
              : 0,
        }))
        .filter((item) => item.score > 0)
        .slice(0, 5)
        .map((item) => item.doc);

      if (relevantDocs.length === 0) {
        setQueryResults((prev) => [
          {
            query,
            results: [],
            answer: 'No relevant documents found in the knowledge base.',
            sources: [],
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
        setIsQuerying(false);
        return;
      }

      // Use Research Agent to synthesize answer
      const researchAgent = agents.find((a) => a.id === 'researcher') || agents[0];
      const context = relevantDocs.map((d) => `**${d.title}**\n${d.content}`).join('\n\n---\n\n');

      const prompt = `Based on the following knowledge base documents, answer this question: "${query}"

Documents:
${context}

Provide a comprehensive answer grounded in the provided documents. Cite specific documents when referencing information.`;

      const answer = await geminiService.generateText(prompt, researchAgent.model);

      const result: QueryResult = {
        query,
        results: relevantDocs,
        answer,
        sources: relevantDocs.map((d) => d.title),
        timestamp: new Date().toISOString(),
      };

      setQueryResults((prev) => [result, ...prev]);
      setQuery('');
    } catch (err) {
      console.error('Query error:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">Dataverse</h1>
        </div>
        <p className="text-gray-400">RAG-powered knowledge system grounded in project documentation</p>
      </div>

      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Base */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Knowledge Base ({knowledge.length})
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="Document title"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              />
              <input
                type="text"
                value={newDoc.source}
                onChange={(e) => setNewDoc({ ...newDoc, source: e.target.value })}
                placeholder="Source (optional)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              />
              <textarea
                value={newDoc.content}
                onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                placeholder="Document content..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              />
              <button
                onClick={handleAddDocument}
                disabled={!newDoc.title || !newDoc.content}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Add Document
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-white mb-3">Documents</h3>
            <div className="space-y-2">
              {knowledge.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-900/50 border border-slate-700 rounded p-2 hover:border-slate-600 transition-colors"
                >
                  <div className="font-medium text-white text-sm">{doc.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{doc.source}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Query Interface */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Query Knowledge Base
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                placeholder="Ask a question about your knowledge base..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isQuerying}
              />
              <button
                onClick={handleQuery}
                disabled={isQuerying || !query.trim() || knowledge.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isQuerying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Querying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Query
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {queryResults.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No queries yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add documents and query the knowledge base
                </p>
              </div>
            ) : (
              queryResults.map((result, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{result.query}</h3>
                  <div className="text-sm text-gray-400 mb-4">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-cyan-400 mb-2">Answer</h4>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{result.answer}</p>
                    </div>
                  </div>

                  {result.sources.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Sources</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.sources.map((source, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Agent Chat */}
      {agents.length > 0 && (
        <AgentChat
          agents={hasGlobalHelper ? [...agents, agentService.getGlobalHelperAgent()] : agents}
          defaultAgentId={agents.find((a) => a.id === 'researcher')?.id || agents[0]?.id}
          labId="dataverse"
          compact={false}
        />
      )}
    </div>
  );
};

export default DataverseLab;

