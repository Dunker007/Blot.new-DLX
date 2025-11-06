import { useState, useEffect, useCallback, useMemo } from 'react';
import { Idea, IdeaStatus } from '../types/idea';
import { IdeaBoard } from './ideas/IdeaBoard';
import { AddIdeaForm } from './ideas/AddIdeaForm';
import { Lightbulb, Search, Sparkles } from 'lucide-react';
import { LocalStorageManager } from '../utils/localStorage';
import { geminiService } from '../services/gemini/geminiService';

const STORAGE_KEY = 'dlx-ideas';
const VOTES_STORAGE_KEY = 'dlx-idea-votes';

const IdeaLab: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    try {
      const savedIdeas = LocalStorageManager.get<Idea[]>(STORAGE_KEY, []);
      // If no saved ideas, return default ideas
      if (!savedIdeas || savedIdeas.length === 0) {
        return [
        {
          id: 1,
          title: 'Project-Wide Context-Aware Code Completion',
          description: 'AI that understands the entire codebase to provide suggestions that consider relationships between files, dependencies, and project patterns. Inspired by Cursor\'s context-aware features.',
          status: IdeaStatus.DISCUSSION,
          timestamp: new Date().toISOString(),
          tags: ['ai', 'code-completion', 'monaco-editor'],
          priority: 'high',
          votes: 0,
        },
        {
          id: 2,
          title: 'Advanced Natural Language Code Generation',
          description: 'Enhance Vibe.d.e with multi-file project generation, framework detection, and iterative refinement. Support complex applications, not just single components.',
          status: IdeaStatus.NEW,
          timestamp: new Date().toISOString(),
          tags: ['vibe-de', 'ai', 'code-generation'],
          priority: 'high',
          votes: 0,
        },
        {
          id: 3,
          title: 'AI-Powered Debugging Chat Interface',
          description: 'Interactive debugging tool that explains complex code sections, identifies bugs through conversation, and suggests fixes with explanations. Copilot Workspace-style task-oriented debugging.',
          status: IdeaStatus.DISCUSSION,
          timestamp: new Date().toISOString(),
          tags: ['ai', 'debugging', 'chat'],
          priority: 'medium',
          votes: 0,
        },
        {
          id: 4,
          title: 'Task-Oriented AI for Complete Development Cycles',
          description: 'AI that can handle full development cycles from planning to deployment. Takes a task description and autonomously creates, tests, and deploys solutions.',
          status: IdeaStatus.NEW,
          timestamp: new Date().toISOString(),
          tags: ['ai', 'automation', 'devops'],
          priority: 'high',
          votes: 0,
        },
        {
          id: 5,
          title: 'Seamless AI Pair Programmer Integration',
          description: 'AI that acts as a true pair programmer, integrating seamlessly into coding flow. Real-time suggestions, code reviews, and collaborative problem-solving without interrupting workflow.',
          status: IdeaStatus.DISCUSSION,
          timestamp: new Date().toISOString(),
          tags: ['ai', 'collaboration', 'code-review'],
          priority: 'medium',
          votes: 0,
        },
        {
          id: 6,
          title: 'Intelligent Multi-File Editing with Project Context',
          description: 'Extend Composer mode to understand relationships between files, dependencies, and patterns. Allow AI to make coordinated changes across multiple files with full project awareness.',
          status: IdeaStatus.APPROVED,
          timestamp: new Date().toISOString(),
          tags: ['composer', 'multi-file', 'ai'],
          priority: 'high',
          votes: 0,
        },
        {
          id: 7,
          title: 'Continue-Style Codebase Chat Interface',
          description: 'Chat with your entire codebase. Ask questions, get explanations, find code, and understand relationships. Integrates with Monaco Editor for seamless code exploration.',
          status: IdeaStatus.NEW,
          timestamp: new Date().toISOString(),
          tags: ['chat', 'codebase', 'monaco-editor'],
          priority: 'medium',
          votes: 0,
        },
        {
          id: 8,
          title: 'Windsurf-Inspired Flow State IDE',
          description: 'Features that keep developers in a flow state: minimal interruptions, smart code suggestions, seamless context switching, and AI that anticipates needs.',
          status: IdeaStatus.DISCUSSION,
          timestamp: new Date().toISOString(),
          tags: ['ide', 'ux', 'productivity'],
          priority: 'medium',
          votes: 0,
        },
        {
          id: 9,
          title: 'Text-to-UI Component Generator',
          description: 'Generate complete UI components from text descriptions or design mockups. Supports multiple frameworks (React, Vue, Svelte) with responsive design and accessibility features.',
          status: IdeaStatus.NEW,
          timestamp: new Date().toISOString(),
          tags: ['ui', 'components', 'generation'],
          priority: 'high',
          votes: 0,
        },
        {
          id: 10,
          title: 'Emotion Analytics for Design Feedback',
          description: 'Capture emotional responses to designs and code. Use AI to analyze reactions and provide real-time feedback for prototyping and user experience optimization.',
          status: IdeaStatus.DISCUSSION,
          timestamp: new Date().toISOString(),
          tags: ['analytics', 'design', 'ux'],
          priority: 'low',
          votes: 0,
        },
        {
          id: 11,
          title: 'Code Explanation with Visual Diagrams',
          description: 'Generate visual diagrams and flowcharts to explain code structure, data flow, and execution paths. Makes complex code accessible to all skill levels.',
          status: IdeaStatus.NEW,
          timestamp: new Date().toISOString(),
          tags: ['visualization', 'documentation', 'education'],
          priority: 'medium',
          votes: 0,
        },
        {
          id: 12,
          title: 'AI-Powered Comprehensive Test Generation',
          description: 'Automatically generate test suites with multiple test types (unit, integration, e2e). Detects edge cases, generates test data, and ensures high coverage.',
          status: IdeaStatus.APPROVED,
          timestamp: new Date().toISOString(),
          tags: ['testing', 'ai', 'automation'],
          priority: 'high',
          votes: 0,
        },
        {
          id: 13,
          title: 'AI Refactoring Assistant with Impact Analysis',
          description: 'Refactoring tool that shows impact analysis before changes, suggests patterns, and safely refactors code across the entire project with dependency tracking.',
          status: IdeaStatus.DISCUSSION,
          timestamp: new Date().toISOString(),
          tags: ['refactoring', 'ai', 'code-quality'],
          priority: 'medium',
          votes: 0,
        },
        {
          id: 14,
          title: 'Seamless VS Code & JetBrains Integration',
          description: 'Bridge DLX Studios features with existing editors. Extensions for VS Code and JetBrains IDEs that bring AI-powered features to developers\' preferred environments.',
          status: IdeaStatus.NEW,
          timestamp: new Date().toISOString(),
          tags: ['integration', 'vscode', 'extensions'],
          priority: 'high',
          votes: 0,
        },
        {
          id: 15,
          title: 'Multi-User AI Collaborative Workspaces',
          description: 'Shared workspaces where teams can collaborate with AI. Real-time code generation, shared AI context, and collaborative problem-solving across team members.',
          status: IdeaStatus.DISCUSSION,
          timestamp: new Date().toISOString(),
          tags: ['collaboration', 'workspaces', 'team'],
          priority: 'medium',
          votes: 0,
        },
        {
          id: 16,
          title: 'Google Notebook LM Integration',
          description: 'Integrate Google\'s Notebook LM for document-based AI research and knowledge management. Upload documents, PDFs, code files, and chat with them to extract insights, generate summaries, and create knowledge bases. Perfect for research, documentation, and learning from existing codebases.',
          status: IdeaStatus.NEW,
          timestamp: new Date().toISOString(),
          tags: ['notebook-lm', 'research', 'documentation', 'knowledge-base'],
          priority: 'high',
          votes: 0,
        },
        ];
      }
      // Return saved ideas (they may not have all new fields, that's okay)
      console.log('Idea Lab: Loading saved ideas', savedIdeas.length);
      return savedIdeas;
    } catch (error) {
      console.error('Failed to parse ideas from localStorage', error);
      return [];
    }
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'timestamp' | 'votes' | 'priority' | 'dueDate'>('timestamp');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [steerTopic, setSteerTopic] = useState('');

  // Load votes from localStorage
  const [votes, setVotes] = useState<Record<number, number>>(() => {
    try {
      return LocalStorageManager.get<Record<number, number>>(VOTES_STORAGE_KEY, {});
    } catch {
      return {};
    }
  });

  // Migrate old ideas to include new fields
  useEffect(() => {
    const needsMigration = ideas.some(idea => 
      idea.tags === undefined || 
      idea.priority === undefined || 
      idea.votes === undefined
    );
    
    if (needsMigration) {
      console.log('Idea Lab: Migrating old ideas to include new fields');
      const migratedIdeas = ideas.map(idea => ({
        ...idea,
        tags: idea.tags || [],
        priority: idea.priority || 'medium',
        votes: idea.votes || 0,
      }));
      setIdeas(migratedIdeas);
    }
  }, []); // Only run once on mount

  // Persist ideas to localStorage
  useEffect(() => {
    try {
      LocalStorageManager.set(STORAGE_KEY, ideas);
    } catch (error) {
      console.error('Failed to save ideas to localStorage', error);
    }
  }, [ideas]);

  // Persist votes
  useEffect(() => {
    try {
      LocalStorageManager.set(VOTES_STORAGE_KEY, votes);
    } catch (error) {
      console.error('Failed to save votes to localStorage', error);
    }
  }, [votes]);

  // Get all unique tags from ideas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    ideas.forEach(idea => {
      idea.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [ideas]);

  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = ideas.filter(idea => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          idea.title.toLowerCase().includes(query) ||
          idea.description.toLowerCase().includes(query) ||
          idea.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = idea.tags?.some(tag => selectedTags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Priority filter
      if (selectedPriorities.length > 0 && idea.priority) {
        if (!selectedPriorities.includes(idea.priority)) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'votes': {
          const votesA = votes[a.id] || a.votes || 0;
          const votesB = votes[b.id] || b.votes || 0;
          return votesB - votesA;
        }
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          return priorityB - priorityA;
        }
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        case 'timestamp':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    return filtered;
  }, [ideas, searchQuery, selectedTags, selectedPriorities, sortBy, votes]);

  const handleIdeaSubmit = useCallback((ideaData: Partial<Idea>) => {
    const newIdea: Idea = {
      id: Date.now(),
      title: ideaData.title || '',
      description: ideaData.description || '',
      status: ideaData.status || IdeaStatus.NEW,
      timestamp: new Date().toISOString(),
      tags: ideaData.tags || [],
      priority: ideaData.priority || 'medium',
      votes: 0,
      dueDate: ideaData.dueDate,
      attachments: ideaData.attachments || [],
      template: ideaData.template,
      aiGenerated: ideaData.aiGenerated || false,
    };
    setIdeas((prev) => [newIdea, ...prev]);
  }, []);

  const handleUpdateIdeaStatus = useCallback((id: number, newStatus: IdeaStatus) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status: newStatus } : idea)));
  }, []);

  const handleDeleteIdea = useCallback((id: number) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    // Remove votes for deleted idea
    setVotes((prev) => {
      const newVotes = { ...prev };
      delete newVotes[id];
      return newVotes;
    });
  }, []);

  const handleVote = useCallback((id: number, delta: number) => {
    setVotes((prev) => {
      const currentVotes = prev[id] || 0;
      const newVotes = { ...prev, [id]: Math.max(0, currentVotes + delta) };
      return newVotes;
    });
    // Also update idea votes
    setIdeas((prev) => prev.map(idea => 
      idea.id === id 
        ? { ...idea, votes: Math.max(0, (votes[id] || idea.votes || 0) + delta) }
        : idea
    ));
  }, [votes]);

  const handleGenerateAI = useCallback(async () => {
    setIsGeneratingAI(true);
    try {
      const currentIdeasSummary = ideas.slice(0, 5).map(i => `- ${i.title}: ${i.description.substring(0, 100)}...`).join('\n');
      
      // Build prompt with steer topic if provided
      const topicContext = steerTopic.trim() 
        ? `Focus on this specific topic/area: "${steerTopic.trim()}"\n\n`
        : '';
      
      const prompt = `Based on these existing ideas for a coding IDE platform:

${currentIdeasSummary}

${topicContext}Generate 3-5 new, creative, and innovative ideas for enhancing a modern AI-powered coding IDE. Each idea should:
1. Be specific and actionable
2. Address real developer pain points
3. Be innovative and not duplicate existing ideas
4. Include relevant tags (comma-separated)
5. Suggest a priority level (low/medium/high/critical)

Format each idea as:
Title: [idea title]
Description: [detailed description]
Tags: [tag1, tag2, tag3]
Priority: [low|medium|high|critical]

Generate diverse ideas across different categories (AI features, developer experience, integrations, etc.).`;

      const response = await geminiService.generateText(prompt, 'gemini-2.5-pro', 0.9);
      
      // Parse generated ideas
      const ideaBlocks = response.split(/(?=Title:)/);
      const generatedIdeas: Idea[] = [];
      
      ideaBlocks.forEach((block, index) => {
        const titleMatch = block.match(/Title:\s*(.+)/);
        const descMatch = block.match(/Description:\s*(.+?)(?=Tags:|Priority:|$)/s);
        const tagsMatch = block.match(/Tags:\s*(.+)/);
        const priorityMatch = block.match(/Priority:\s*(low|medium|high|critical)/);
        
        if (titleMatch && descMatch) {
          const tags = tagsMatch?.[1]?.split(',').map(t => t.trim()).filter(Boolean) || [];
          const priority = (priorityMatch?.[1] as 'low' | 'medium' | 'high' | 'critical') || 'medium';
          
          generatedIdeas.push({
            id: Date.now() + index,
            title: titleMatch[1].trim(),
            description: descMatch[1].trim(),
            status: IdeaStatus.NEW,
            timestamp: new Date().toISOString(),
            tags,
            priority,
            votes: 0,
            aiGenerated: true,
          });
        }
      });

      if (generatedIdeas.length > 0) {
        setIdeas((prev) => [...generatedIdeas, ...prev]);
        setSteerTopic(''); // Clear steer topic after successful generation
        alert(`Generated ${generatedIdeas.length} new ideas!`);
      } else {
        alert('Failed to generate ideas. Please try again.');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate ideas. Please check your API key in settings.');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [ideas, steerTopic]);

  // Removed debug logging - component renders normally

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-left mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">
              Idea Lab
            </h1>
          </div>
          <p className="text-gray-400 mt-2">
            Foster, discuss, and organize ideas before they become projects. Use the Kanban board to track ideas
            through their lifecycle.
          </p>
        </header>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="timestamp">Sort by Date</option>
              <option value="votes">Sort by Votes</option>
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
          </div>
          
          {/* AI Generate Section with Steer Topic */}
          <div className="flex gap-4 items-start">
            <div className="flex-1 relative">
              <input
                type="text"
                value={steerTopic}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 200) {
                    setSteerTopic(value);
                  }
                }}
                placeholder="Steer topic (e.g., 'AI code completion features', 'Developer productivity tools') - Max 200 characters"
                maxLength={200}
                className="w-full pl-4 pr-20 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {steerTopic.length}/200
              </span>
            </div>
            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingAI ? 'Generating...' : 'AI Generate'}
            </button>
          </div>

          {/* Tag and Priority Filters */}
          {(allTags.length > 0 || selectedTags.length > 0 || selectedPriorities.length > 0) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-400">Filters:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {['low', 'medium', 'high', 'critical'].map(priority => (
                <button
                  key={priority}
                  onClick={() => {
                    setSelectedPriorities(prev => 
                      prev.includes(priority) 
                        ? prev.filter(p => p !== priority)
                        : [...prev, priority]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-colors capitalize ${
                    selectedPriorities.includes(priority)
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {priority}
                </button>
              ))}
              {(selectedTags.length > 0 || selectedPriorities.length > 0) && (
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    setSelectedPriorities([]);
                  }}
                  className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <AddIdeaForm onSubmit={handleIdeaSubmit} />
        </div>

        <div className="mt-8">
          <IdeaBoard 
            ideas={filteredAndSortedIdeas} 
            onUpdateStatus={handleUpdateIdeaStatus} 
            onDelete={handleDeleteIdea}
            onVote={handleVote}
            votes={votes}
          />
        </div>
      </div>
    </div>
  );
};

export default IdeaLab;

