/**
 * Agent Chat Component
 * Reusable chat interface for agents in labs
 * Can be embedded in any lab that needs AI assistance
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Agent, ChatMessage } from '../../modules/labs/types';
import { geminiService } from '../../services/gemini/geminiService';
import { Send, Bot, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react';

interface AgentChatProps {
  agents: Agent[];
  defaultAgentId?: string;
  labId: string;
  compact?: boolean;
  onAgentSelect?: (agent: Agent) => void;
}

const AgentChat: React.FC<AgentChatProps> = ({
  agents,
  defaultAgentId,
  labId,
  compact = false,
  onAgentSelect,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(() => {
    if (defaultAgentId) {
      return agents.find((a) => a.id === defaultAgentId) || agents[0] || null;
    }
    return agents[0] || null;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(compact);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAgent && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content: `Hello! I'm ${selectedAgent.name}. ${selectedAgent.description || 'How can I help you today?'}`,
        },
      ]);
    }
  }, [selectedAgent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentSelector(false);
    setMessages([
      {
        role: 'model',
        content: `Hello! I'm ${agent.name}. ${agent.description || 'How can I help you today?'}`,
      },
    ]);
    onAgentSelect?.(agent);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !selectedAgent) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
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
        content: 'An error occurred. Please check your Gemini API key in Settings → Gemini API.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedAgent, messages]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all"
        >
          <Bot className="w-5 h-5" />
          <span className="font-semibold">
            {selectedAgent?.name || 'Agent'} Assistant
          </span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-slate-800 border border-cyan-500/30 rounded-lg shadow-2xl z-50 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="p-4 bg-slate-900/50 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Bot className="w-5 h-5 text-cyan-400" />
          <div className="flex-1">
            {agents.length > 1 ? (
              <div className="relative">
                <button
                  onClick={() => setShowAgentSelector(!showAgentSelector)}
                  className="text-white font-semibold hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  {selectedAgent?.name || 'Select Agent'}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showAgentSelector && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentSelect(agent)}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors ${
                          selectedAgent?.id === agent.id ? 'bg-cyan-600/20' : ''
                        }`}
                      >
                        <div className="font-semibold text-white">{agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-white font-semibold">{selectedAgent?.name || 'Agent'}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-600/20 border border-cyan-500/30 text-white'
                  : 'bg-slate-700/50 border border-slate-600 text-gray-200'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-400 font-semibold">
                    {selectedAgent?.name}
                  </span>
                </div>
              )}
              <p className="whitespace-pre-wrap text-xs">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-xs">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyan-500/20 bg-slate-900/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={selectedAgent ? `Ask ${selectedAgent.name}...` : 'Select an agent...'}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading || !selectedAgent}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !selectedAgent}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;

