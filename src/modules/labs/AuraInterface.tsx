/**
 * AURA Interface Lab
 * Ported from DLX-Ultra-2 - Primary conversational channel with AURA
 */

import React, { useState, useRef, useCallback } from 'react';
import { ChatMessage } from './types';
import { geminiService } from '../../services/gemini/geminiService';
import { Send, Brain, Sparkles } from 'lucide-react';

const AURA_CORE_PROMPT = `You are AURA, the cognitive AI for the DLX Command Center. Your core operational directive is the 'Zero-Friction Principle'. You are an invisible hand, a seamless and intelligent partner that makes every workflow smoother, faster, and less demanding on human cognitive resources. Be concise, proactive, and helpful.`;

const AuraInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Hello! I\'m AURA, your cognitive AI assistant. How can I help streamline your workflow today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.generateText(
        `${AURA_CORE_PROMPT}\n\nUser: ${userMessage.content}\n\nAURA:`
      );

      const modelMessage: ChatMessage = {
        role: 'model',
        content: response || 'I apologize, but I couldn\'t generate a response. Please try again.',
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('AURA Error:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: 'An error occurred. Please check your Gemini API key in Settings.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">AURA Interface</h1>
        </div>
        <p className="text-gray-400">Direct communication channel with AURA, the core cognitive AI</p>
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
                  <span className="text-xs text-cyan-400 font-semibold">AURA</span>
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
                <span className="text-gray-400 text-sm">AURA is thinking...</span>
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
            placeholder="Ask AURA anything..."
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
    </div>
  );
};

export default AuraInterface;

