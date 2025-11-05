/**
 * Code Review Lab
 * AI-powered code analysis and review
 * Uses Code Reviewer agent for expert analysis
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/agentService';
import { Agent } from './types';
import AgentChat from '../../components/labs/AgentChat';
import { geminiService } from '../../services/gemini/geminiService';
import {
  Code,
  FileText,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from 'lucide-react';

interface ReviewResult {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  security: string[];
  performance: string[];
  bestPractices: string[];
  suggestions: string[];
  score: number;
}

const CodeReviewLab: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [code, setCode] = useState(`// Example code to review
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`);
  const [language, setLanguage] = useState('javascript');
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('review');
      setAgents(labAgents);
    };
    loadAgents();
  }, []);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('review');

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please enter code to review');
      return;
    }

    setIsReviewing(true);
    setError(null);
    setReviewResult(null);

    try {
      const codeReviewer = agents.find((a) => a.id === 'code-reviewer') || agents[0];
      if (!codeReviewer) {
        throw new Error('Code Reviewer agent not available');
      }

      const prompt = `Review the following ${language} code and provide a comprehensive analysis:

\`\`\`${language}
${code}
\`\`\`

Please analyze:
1. Code quality and best practices
2. Security vulnerabilities
3. Performance optimizations
4. Design patterns and architecture
5. Testing considerations
6. Documentation quality

Provide specific, actionable feedback. Format your response as JSON with this structure:
{
  "quality": "excellent|good|fair|poor",
  "security": ["issue1", "issue2"],
  "performance": ["optimization1", "optimization2"],
  "bestPractices": ["suggestion1", "suggestion2"],
  "suggestions": ["general suggestion1", "general suggestion2"],
  "score": 85
}`;

      const response = await geminiService.generateText(prompt, codeReviewer.model);

      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : response;
        const parsed = JSON.parse(jsonText);
        setReviewResult(parsed as ReviewResult);
      } catch {
        // If JSON parsing fails, create structured result from text
        setReviewResult({
          quality: 'good',
          security: response.includes('security') || response.includes('vulnerability') ? ['See full review below'] : [],
          performance: response.includes('performance') || response.includes('optimize') ? ['See full review below'] : [],
          bestPractices: response.includes('best practice') || response.includes('improve') ? ['See full review below'] : [],
          suggestions: [response],
          score: 75,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review code');
    } finally {
      setIsReviewing(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
            <Code className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">Code Review Lab</h1>
        </div>
        <p className="text-gray-400">AI-powered code analysis and review</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white">Code Input</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="other">Other</option>
              </select>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleReview}
              disabled={isReviewing || !code.trim()}
              className="mt-3 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isReviewing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Code...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Review Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Review Results */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {reviewResult ? (
            <div className="space-y-4">
              {/* Score Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Review Score</h2>
                  <div className={`text-4xl font-bold ${getScoreColor(reviewResult.score)}`}>
                    {reviewResult.score}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Quality:</span>
                  <span className={`font-semibold capitalize ${getQualityColor(reviewResult.quality)}`}>
                    {reviewResult.quality}
                  </span>
                </div>
              </div>

              {/* Security Issues */}
              {reviewResult.security.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="font-bold text-red-400">Security Issues</h3>
                  </div>
                  <ul className="space-y-2">
                    {reviewResult.security.map((issue, idx) => (
                      <li key={idx} className="text-sm text-red-300 list-disc list-inside">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Performance */}
              {reviewResult.performance.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold text-yellow-400">Performance Optimizations</h3>
                  </div>
                  <ul className="space-y-2">
                    {reviewResult.performance.map((opt, idx) => (
                      <li key={idx} className="text-sm text-yellow-300 list-disc list-inside">
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Best Practices */}
              {reviewResult.bestPractices.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-blue-400">Best Practices</h3>
                  </div>
                  <ul className="space-y-2">
                    {reviewResult.bestPractices.map((practice, idx) => (
                      <li key={idx} className="text-sm text-blue-300 list-disc list-inside">
                        {practice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {reviewResult.suggestions.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3">General Suggestions</h3>
                  <ul className="space-y-2">
                    {reviewResult.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-gray-300 list-disc list-inside">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Review results will appear here</p>
                <p className="text-sm text-gray-500 mt-2">Paste code and click "Review Code"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Chat */}
      {agents.length > 0 && (
        <AgentChat
          agents={hasGlobalHelper ? [...agents, agentService.getGlobalHelperAgent()] : agents}
          defaultAgentId={agents.find((a) => a.id === 'code-reviewer')?.id || agents[0]?.id}
          labId="review"
          compact={false}
        />
      )}
    </div>
  );
};

export default CodeReviewLab;

