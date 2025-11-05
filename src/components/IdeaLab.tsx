import React, { useState, useEffect, useCallback } from 'react';
import { Idea, IdeaStatus } from '../types/idea';
import { IdeaBoard } from './ideas/IdeaBoard';
import { AddIdeaForm } from './ideas/AddIdeaForm';
import { Lightbulb } from 'lucide-react';

const STORAGE_KEY = 'dlx-ideas';

const IdeaLab: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    try {
      const savedIdeas = localStorage.getItem(STORAGE_KEY);
      return savedIdeas
        ? JSON.parse(savedIdeas)
        : [
            {
              id: 1,
              title: 'Enhanced Mind Map Visualization',
              description: 'Add WebGL background and better node connections to the mind map feature.',
              status: IdeaStatus.DISCUSSION,
              timestamp: new Date().toISOString(),
            },
            {
              id: 2,
              title: 'Voice Control Integration',
              description: 'Add voice commands for navigating and controlling the application.',
              status: IdeaStatus.NEW,
              timestamp: new Date().toISOString(),
            },
            {
              id: 3,
              title: 'AI-Powered Code Suggestions',
              description: 'Implement real-time AI code completion in the Monaco editor.',
              status: IdeaStatus.APPROVED,
              timestamp: new Date().toISOString(),
            },
          ];
    } catch (error) {
      console.error('Failed to parse ideas from localStorage', error);
      return [];
    }
  });

  // Persist ideas to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch (error) {
      console.error('Failed to save ideas to localStorage', error);
    }
  }, [ideas]);

  const handleIdeaSubmit = useCallback((title: string, description: string) => {
    const newIdea: Idea = {
      id: Date.now(),
      title,
      description,
      status: IdeaStatus.NEW,
      timestamp: new Date().toISOString(),
    };
    setIdeas((prev) => [newIdea, ...prev]);
  }, []);

  const handleUpdateIdeaStatus = useCallback((id: number, newStatus: IdeaStatus) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status: newStatus } : idea)));
  }, []);

  const handleDeleteIdea = useCallback((id: number) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, []);

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

        <div className="mb-6">
          <AddIdeaForm onSubmit={handleIdeaSubmit} />
        </div>

        <div className="mt-8">
          <IdeaBoard ideas={ideas} onUpdateStatus={handleUpdateIdeaStatus} onDelete={handleDeleteIdea} />
        </div>
      </div>
    </div>
  );
};

export default IdeaLab;

