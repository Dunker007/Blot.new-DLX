import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, Code, Wand2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { geminiService } from '../../services/gemini/geminiService';
import { testGenerator } from '../../services/testGenerator';
import { contextService } from '../../services/contextService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionType?: 'explain' | 'fix' | 'refactor' | 'general';
}

interface AIChatPanelProps {
  selectedCode?: string;
  fileContent?: string;
  fileName?: string;
  onCodeUpdate?: (code: string) => void;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  selectedCode,
  fileContent,
  fileName,
  onCodeUpdate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help explain code, fix errors, refactor, and answer questions. Select code or ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = async (action: 'explain' | 'fix' | 'refactor') => {
    if (!selectedCode && !fileContent) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please select some code first, or I can work with the entire file.',
        timestamp: new Date(),
        actionType: action,
      }]);
      return;
    }

    const codeToUse = selectedCode || fileContent || '';
    let prompt = '';

    switch (action) {
      case 'explain':
        prompt = `Explain this code in detail:\n\n${codeToUse}\n\nProvide a clear explanation of what this code does, how it works, and any important concepts.`;
        break;
      case 'fix':
        prompt = `Fix any errors or issues in this code:\n\n${codeToUse}\n\nProvide the corrected code with explanations of what was fixed.`;
        break;
      case 'refactor':
        prompt = `Refactor this code to improve it:\n\n${codeToUse}\n\nProvide improved code with explanations of the improvements made.`;
        break;
    }

    await sendMessage(prompt, action);
  };

  const sendMessage = async (text: string, actionType?: 'explain' | 'fix' | 'refactor' | 'general') => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
      actionType: actionType || 'general',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context-aware prompt
      let fullPrompt = text;
      
      if (selectedCode) {
        fullPrompt = `Selected code from ${fileName || 'file'}:\n\n\`\`\`\n${selectedCode}\n\`\`\`\n\nUser question/request: ${text}`;
      } else if (fileContent) {
        fullPrompt = `Current file (${fileName || 'file'}):\n\n\`\`\`\n${fileContent}\n\`\`\`\n\nUser question/request: ${text}`;
      }

      // Add system context based on action type
      if (actionType === 'fix') {
        fullPrompt = `You are a code debugging assistant. ${fullPrompt}\n\nAnalyze the code for errors and provide a corrected version with explanations.`;
      } else if (actionType === 'refactor') {
        fullPrompt = `You are a code refactoring expert. ${fullPrompt}\n\nProvide improved, cleaner code with explanations of improvements.`;
      } else if (actionType === 'explain') {
        fullPrompt = `You are a code explanation assistant. ${fullPrompt}\n\nProvide a clear, detailed explanation of the code.`;
      }

      const response = await geminiService.generateChatResponse(fullPrompt);
      
      // Try to extract code blocks from response
      const codeBlocks = response.text.match(/```[\w]*\n([\s\S]*?)```/g);
      let processedResponse = response.text;

      // If response contains code and action is fix/refactor, offer to apply it
      if (codeBlocks && (actionType === 'fix' || actionType === 'refactor') && onCodeUpdate) {
        const newCode = codeBlocks[0].replace(/```[\w]*\n/, '').replace(/```$/, '').trim();
        processedResponse = response.text + '\n\n[Code update available - see actions below]';
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: processedResponse,
        timestamp: new Date(),
        actionType,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-scroll to bottom
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your Gemini API key in settings and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
    }
  };

  const formatMessage = (content: string) => {
    // Basic markdown/code formatting
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const codeRegex = /```([\w]*)\n?([\s\S]*?)```/g;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Code block
      const language = match[1] || '';
      const code = match[2];
      parts.push(
        <pre key={`code-${match.index}`} className="bg-slate-900 border border-slate-700 rounded p-3 my-2 overflow-x-auto">
          <code className={`language-${language} text-sm`}>{code}</code>
        </pre>
      );

      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">AI Chat</h3>
          </div>
          {selectedCode && (
            <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-400">
              <Code size={12} />
              Code Selected
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">Ask questions, get explanations, fix errors</p>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-slate-800 bg-slate-800/30">
        <div className="flex gap-2">
          <button
            onClick={() => handleQuickAction('explain')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white transition-colors disabled:opacity-50"
            title="Explain selected code"
          >
            <Sparkles size={14} />
            Explain
          </button>
          <button
            onClick={() => handleQuickAction('fix')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white transition-colors disabled:opacity-50"
            title="Fix errors in code"
          >
            <AlertCircle size={14} />
            Fix
          </button>
          <button
            onClick={() => handleQuickAction('refactor')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded text-sm text-white transition-colors disabled:opacity-50"
            title="Refactor code"
          >
            <Wand2 size={14} />
            Refactor
          </button>
        </div>
      </div>

      {/* Documentation and Test Generation */}
      <div className="p-3 border-b border-slate-800 bg-slate-800/30 space-y-2">
        <button
          onClick={async () => {
            const codeToUse = selectedCode || fileContent || '';
            if (!codeToUse) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Please select some code first, or I can generate documentation for the entire file.',
                timestamp: new Date(),
              }]);
              return;
            }

            setIsLoading(true);
            try {
              // Detect language from file name or code
              const detectedLang = fileName?.includes('.ts') || fileName?.includes('.tsx') ? 'tsdoc' :
                                  fileName?.includes('.py') ? 'python' :
                                  fileName?.includes('.java') ? 'java' : 'jsdoc';

              const documentedCode = await geminiService.generateDocumentation(
                codeToUse,
                detectedLang === 'tsdoc' ? 'typescript' : detectedLang === 'python' ? 'python' : detectedLang === 'java' ? 'java' : 'javascript',
                detectedLang as 'jsdoc' | 'tsdoc' | 'python' | 'java'
              );

              if (onCodeUpdate) {
                onCodeUpdate(documentedCode);
              }

              setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Documentation generated! The code has been updated with ${detectedLang} comments.`,
                timestamp: new Date(),
                actionType: 'general',
              }]);
            } catch (error) {
              console.error('Documentation generation failed:', error);
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Failed to generate documentation. Please check your Gemini API key.',
                timestamp: new Date(),
              }]);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded text-sm text-purple-400 transition-colors disabled:opacity-50"
          title="Generate documentation"
        >
          <Code size={14} />
          Generate Docs
        </button>
        <button
          onClick={async () => {
            const codeToUse = selectedCode || fileContent || '';
            if (!codeToUse) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Please select some code first to generate tests for.',
                timestamp: new Date(),
              }]);
              return;
            }

            setIsLoading(true);
            try {
              const language = fileName?.split('.').pop() || 'javascript';
              const projectContext = contextService.analyzeContext([{ name: fileName || 'test', content: codeToUse, language }]);
              const framework = testGenerator.detectFramework(codeToUse, fileName, projectContext) || testGenerator.detectFramework(codeToUse, fileName);
              
              if (!framework) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: 'Could not detect test framework. Please specify the framework or ensure your code includes framework imports.',
                  timestamp: new Date(),
                }]);
                setIsLoading(false);
                return;
              }

              const testableItems = testGenerator.extractTestableItems(codeToUse, language);
              if (testableItems.length === 0) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: 'No testable functions or classes found in the selected code.',
                  timestamp: new Date(),
                }]);
                setIsLoading(false);
                return;
              }

              // Generate test structure
              let testCode = testGenerator.generateTestStructure(codeToUse, fileName || 'test', framework, testableItems);
              
              // Enhance with AI
              const enhancedTests = await geminiService.generateCode(
                `Generate comprehensive ${framework.name} tests for these functions:\n${testableItems.map(item => `${item.name} (${item.type})`).join('\n')}\n\nOriginal code:\n\`\`\`\n${codeToUse}\n\`\`\`\n\nGenerate complete test cases with edge cases and assertions.`,
                testCode
              );

              // Show test code in chat
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Generated ${framework.name} test file:\n\n\`\`\`${framework.language}\n${enhancedTests}\n\`\`\``,
                timestamp: new Date(),
                actionType: 'general',
              }]);
            } catch (error) {
              console.error('Test generation failed:', error);
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Failed to generate tests. Please check your Gemini API key.',
                timestamp: new Date(),
              }]);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-sm text-green-400 transition-colors disabled:opacity-50"
          title="Generate tests"
        >
          <CheckCircle2 size={14} />
          Generate Tests
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {formatMessage(message.content)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <Loader2 size={16} className="animate-spin text-cyan-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-800/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or describe what you need..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-opacity flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatPanel;

