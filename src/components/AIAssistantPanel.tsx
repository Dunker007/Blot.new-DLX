import { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { multiModelOrchestratorService } from '../services/multiModelOrchestrator';
import { contextManager } from '../services/contextManager';
import { LLMMessage } from '../services/llm';

interface AISuggestion {
  type: 'optimization' | 'warning' | 'tip' | 'insight';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

interface AIAssistantPanelProps {
  messages?: LLMMessage[];
  currentContext?: string;
}

export default function AIAssistantPanel({ messages = [], currentContext }: AIAssistantPanelProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [complexity, setComplexity] = useState<any>(null);
  const [contextStats, setContextStats] = useState<any>(null);

  useEffect(() => {
    analyzeSituation();
  }, [messages, currentContext]);

  const analyzeSituation = async () => {
    const newSuggestions: AISuggestion[] = [];

    if (currentContext && currentContext.length > 10) {
      const taskComplexity = await multiModelOrchestratorService.analyzeTaskComplexity([{ role: 'user', content: currentContext }]);
      setComplexity(taskComplexity);

      if (taskComplexity.level === 'expert' || taskComplexity.level === 'complex') {
        newSuggestions.push({
          type: 'insight',
          title: 'Complex Task Detected',
          description: `This is a ${taskComplexity.level}-level task. Consider using a more powerful model for better results.`,
          action: 'Switch to advanced model',
          priority: 'high',
        });
      }
    }

    if (messages.length > 0) {
      const stats = contextManager.getContextStats(messages, 8000);
      setContextStats(stats);

      if (stats.needsOptimization) {
        newSuggestions.push({
          type: 'warning',
          title: 'Context Window Nearly Full',
          description: `You're using ${stats.utilizationPercent.toFixed(0)}% of the context window. Consider summarizing the conversation.`,
          action: 'Optimize context',
          priority: 'high',
        });
      }

      if (messages.length > 20) {
        newSuggestions.push({
          type: 'optimization',
          title: 'Long Conversation',
          description: 'This conversation has many messages. You might get better results by starting a new focused conversation.',
          action: 'Start fresh conversation',
          priority: 'medium',
        });
      }
    }

    if (messages.filter(m => m.role === 'user').length > 5) {
      const userMessages = messages.filter(m => m.role === 'user');
      const hasCodeBlocks = userMessages.some(m => m.content.includes('```'));

      if (hasCodeBlocks) {
        newSuggestions.push({
          type: 'tip',
          title: 'Code-Heavy Conversation',
          description: 'Consider using a coding-specific model for better code understanding and generation.',
          action: 'Switch to coding model',
          priority: 'medium',
        });
      }
    }

    if (newSuggestions.length === 0) {
      newSuggestions.push({
        type: 'tip',
        title: 'All Systems Optimal',
        description: 'Your conversation is well-optimized and the context usage is healthy.',
        priority: 'low',
      });
    }

    setSuggestions(newSuggestions);
  };

  const getIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'optimization': return TrendingUp;
      case 'warning': return AlertCircle;
      case 'tip': return Lightbulb;
      case 'insight': return Sparkles;
    }
  };

  const getColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={20} className="text-cyan-400" />
        <h3 className="font-semibold">AI Assistant</h3>
      </div>

      {complexity && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Task Complexity</span>
            <span className="text-sm font-semibold capitalize text-cyan-400">
              {complexity.level}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${complexity.score}%` }}
            />
          </div>
          {complexity.factors.length > 0 && (
            <div className="space-y-1 mt-3">
              {complexity.factors.slice(0, 3).map((factor: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle size={12} className="text-cyan-400" />
                  {factor}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {contextStats && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-3">Context Usage</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500">Messages</div>
              <div className="text-lg font-semibold">{contextStats.totalMessages}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Tokens</div>
              <div className="text-lg font-semibold">{contextStats.totalTokens.toLocaleString()}</div>
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Utilization</span>
                <span>{contextStats.utilizationPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    contextStats.utilizationPercent > 80
                      ? 'bg-red-500'
                      : contextStats.utilizationPercent > 60
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, contextStats.utilizationPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {suggestions.map((suggestion, idx) => {
          const Icon = getIcon(suggestion.type);
          const colorClass = getColor(suggestion.priority);

          return (
            <div
              key={idx}
              className={`border rounded-lg p-3 ${colorClass}`}
            >
              <div className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">{suggestion.title}</div>
                  <div className="text-xs opacity-90 mb-2">{suggestion.description}</div>
                  {suggestion.action && (
                    <button className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors">
                      {suggestion.action}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
