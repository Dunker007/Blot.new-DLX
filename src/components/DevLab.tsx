import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Download,
  Sparkles,
  Code,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Conversation, Message, Model } from '../types';
import { llmService } from '../services/llm';

export default function DevLab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([loadConversations(), loadModels()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    if (data) {
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0].id);
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
      return;
    }

    if (data) setMessages(data);
  };

  const loadModels = async () => {
    const { data: providersData } = await supabase
      .from('llm_providers')
      .select('id')
      .eq('is_active', true);

    if (providersData && providersData.length > 0) {
      const { data: modelsData } = await supabase
        .from('models')
        .select('*')
        .in('provider_id', providersData.map(p => p.id))
        .eq('is_available', true);

      if (modelsData && modelsData.length > 0) {
        setModels(modelsData);
        setSelectedModel(modelsData[0].id);
      }
    }
  };

  const createNewConversation = async () => {
    const { data } = await supabase
      .from('conversations')
      .insert([{ title: 'New Conversation', context: {} }])
      .select()
      .single();

    if (data) {
      setConversations([data, ...conversations]);
      setActiveConversation(data.id);
      setMessages([]);
    }
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    setConversations(conversations.filter((c) => c.id !== id));
    if (activeConversation === id) {
      setActiveConversation(conversations[0]?.id || null);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !activeConversation || !selectedModel) return;

    const userMessage = {
      conversation_id: activeConversation,
      role: 'user' as const,
      content: inputValue,
      metadata: {},
    };

    const { data: savedMessage } = await supabase
      .from('messages')
      .insert([userMessage])
      .select()
      .single();

    if (savedMessage) {
      setMessages([...messages, savedMessage]);
    }

    const currentInput = inputValue;
    setInputValue('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      conversationHistory.push({
        role: 'user',
        content: currentInput,
      });

      const response = await llmService.sendMessage(
        conversationHistory,
        selectedModel,
        (chunk) => {
          if (!chunk.done) {
            setStreamingContent((prev) => prev + chunk.content);
          }
        },
        {
          conversationId: activeConversation,
          trackUsage: true,
        }
      );

      const assistantMessage = {
        conversation_id: activeConversation,
        role: 'assistant' as const,
        content: response.content,
        metadata: {
          model: response.model,
          tokens: response.tokens,
        },
      };

      const { data: savedAssistantMessage } = await supabase
        .from('messages')
        .insert([assistantMessage])
        .select()
        .single();

      if (savedAssistantMessage) {
        setMessages([...messages, savedMessage!, savedAssistantMessage]);
      }

      await supabase
        .from('conversations')
        .update({
          updated_at: new Date().toISOString(),
          title: messages.length === 0 ? currentInput.slice(0, 50) : undefined,
        })
        .eq('id', activeConversation);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const exportConversation = async () => {
    if (!activeConversation) return;

    const conversation = conversations.find((c) => c.id === activeConversation);
    const exportData = {
      conversation,
      messages,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation?.title || 'export'}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Dev Lab...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Dev Lab</h3>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4">
      <div className="w-64 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
        <button
          onClick={createNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity mb-4"
        >
          <Plus size={20} />
          New Conversation
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                activeConversation === conv.id
                  ? 'bg-cyan-500/10 border border-cyan-500/20'
                  : 'hover:bg-slate-800'
              }`}
              onClick={() => setActiveConversation(conv.id)}
            >
              <span className="text-sm truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Sparkles className="text-cyan-400" size={20} />
            <h2 className="font-semibold">Development Lab</h2>
          </div>
          <div className="flex items-center gap-3">
            {models.length > 0 && (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.display_name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={exportConversation}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Export conversation"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Code size={48} className="mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                <p className="text-slate-400">
                  Ask AI to help you plan, design, or build your project
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'bg-cyan-500/10 border border-cyan-500/20'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div className="text-sm text-slate-400 mb-1">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                </div>
              </div>
            </div>
          ))}

          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-xl p-4 bg-slate-800 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">AI Assistant</div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{streamingContent}</pre>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Describe what you want to build..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500"
              disabled={isStreaming || !selectedModel}
            />
            <button
              onClick={sendMessage}
              disabled={isStreaming || !inputValue.trim() || !selectedModel}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isStreaming ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Thinking
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send
                </>
              )}
            </button>
          </div>
          {models.length === 0 && (
            <p className="text-sm text-amber-400 mt-2">
              No AI models configured. Please set up your LLM providers in Settings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
