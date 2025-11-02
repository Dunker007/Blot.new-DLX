import { useEffect, useState } from 'react';

import {
  Brain,
  Code,
  Coins,
  Maximize2,
  MessageCircle,
  Minimize2,
  Send,
  TrendingUp,
  X,
} from 'lucide-react';

import { multiModelOrchestratorService } from '../services/multiModelOrchestrator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIGuideProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function AIGuide({ currentView, onNavigate }: AIGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickSuggestions = [
    { text: 'Generate a crypto trading bot', action: () => onNavigate('trading') },
    { text: 'Create an AI SaaS business', action: () => onNavigate('business-generator') },
    { text: 'Build a DeFi dashboard', action: () => onNavigate('dev-lab') },
    { text: 'Set up affiliate content', action: () => onNavigate('content-factory') },
    { text: 'Connect my crypto wallet', action: () => onNavigate('crypto') },
    { text: 'Show me premium features', action: () => onNavigate('pricing') },
  ];

  const contextualSuggestions: Record<string, string[]> = {
    dashboard: [
      'Show me the best revenue opportunities',
      'What crypto trends should I know about?',
      'Generate a new business idea',
    ],
    crypto: [
      'How do I start DeFi yield farming?',
      'Deploy an arbitrage bot',
      'What are the best crypto opportunities?',
    ],
    trading: [
      'Set up a DCA bot for Bitcoin',
      'Find arbitrage opportunities',
      'Create a momentum trading strategy',
    ],
    'dev-lab': [
      'Generate an NFT marketplace',
      'Build a SaaS platform',
      'Create a mobile app with AI',
    ],
    'business-generator': [
      'Generate a $10K/month business',
      'Find trending niches',
      'Create a revenue model',
    ],
  };

  const initialMessage: Message = {
    id: '1',
    role: 'assistant',
    content:
      "👋 Hey! I'm your AI guide. I can help you generate businesses, deploy trading bots, create apps, and make money with AI and crypto. What would you like to build today?",
    timestamp: new Date(),
    suggestions: quickSuggestions.map(s => s.text),
  };

  useEffect(() => {
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    // Show contextual suggestions based on current view
    if (contextualSuggestions[currentView]) {
      const contextualMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I see you're in the ${currentView.replace('-', ' ')} section. Here are some things I can help you with:`,
        timestamp: new Date(),
        suggestions: contextualSuggestions[currentView],
      };

      setMessages(prev => {
        // Only add if it's a different context
        if (prev[prev.length - 1]?.suggestions?.join() !== contextualMessage.suggestions?.join()) {
          return [...prev, contextualMessage];
        }
        return prev;
      });
    }
  }, [currentView]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Use our AI orchestrator for responses
      const response = await multiModelOrchestratorService.orchestrate([
        {
          role: 'system',
          content:
            'You are an AI assistant for a platform that helps users create AI-powered businesses, crypto trading bots, and applications. Be helpful, concise, and action-oriented. Always suggest specific actions the user can take.',
        },
        { role: 'user', content },
      ]);

      // Generate contextual suggestions based on the response
      const suggestions = generateSuggestions(content, response.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm having trouble connecting right now, but I can still help you navigate! Try one of the quick actions above.",
        timestamp: new Date(),
        suggestions: quickSuggestions.map(s => s.text),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSuggestions = (userInput: string, aiResponse: string): string[] => {
    const lower = (userInput + ' ' + aiResponse).toLowerCase();

    if (lower.includes('crypto') || lower.includes('trading') || lower.includes('defi')) {
      return ['Deploy a trading bot', 'Connect wallet', 'Check DeFi opportunities'];
    }
    if (lower.includes('business') || lower.includes('revenue') || lower.includes('money')) {
      return ['Generate business model', 'Create content strategy', 'Set up affiliate system'];
    }
    if (lower.includes('app') || lower.includes('code') || lower.includes('develop')) {
      return ['Generate an app', 'Deploy to production', 'Add AI features'];
    }

    return quickSuggestions.slice(0, 3).map(s => s.text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const quickAction = quickSuggestions.find(s => s.text === suggestion);
    if (quickAction) {
      quickAction.action();
      setIsOpen(false);
    } else {
      sendMessage(suggestion);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 z-50 group"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-black/80 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          AI Guide • Ask me anything!
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/20 z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[32rem]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Guide</h3>
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white/60" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white/60" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-black/30 text-white'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.suggestions && (
                    <div className="mt-3 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-white/10 hover:bg-white/20 rounded px-2 py-1 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-black/30 text-white rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-purple-500/20">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { icon: <TrendingUp className="w-4 h-4" />, action: () => onNavigate('trading') },
                { icon: <Coins className="w-4 h-4" />, action: () => onNavigate('crypto') },
                { icon: <Code className="w-4 h-4" />, action: () => onNavigate('dev-lab') },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors flex justify-center"
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-purple-500/20">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage(inputMessage)}
                placeholder="Ask me anything..."
                className="flex-1 bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
