/**
 * Creator Studio Lab
 * AI-powered image generation from text prompts
 * Uses Creative Director + Content Strategist agents
 */

import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/agentService';
import { Agent } from './types';
import AgentChat from '../../components/labs/AgentChat';
import { geminiService } from '../../services/gemini/geminiService';
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Download,
  Loader2,
  Wand2,
} from 'lucide-react';

interface GeneratedImage {
  id: string;
  prompt: string;
  enhancedPrompt: string;
  imageUrl?: string;
  status: 'generating' | 'complete' | 'error';
  timestamp: string;
}

const CreatorStudio: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      const labAgents = await agentService.getLabAgentList('creator');
      setAgents(labAgents);
    };
    loadAgents();
  }, []);

  const hasGlobalHelper = agentService.labUsesGlobalHelper('creator');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Get Creative Director agent to enhance prompt
      const creativeDirector = agents.find((a) => a.id === 'creative-director') || agents[0];
      if (!creativeDirector) {
        throw new Error('Creative Director agent not available');
      }

      // Enhance the prompt using Creative Director
      const enhancementPrompt = `You are an expert Art Director. Take this simple prompt and expand it into a rich, detailed, and evocative prompt for an AI image generation model:

User's prompt: "${prompt}"

Consider:
- Lighting and mood
- Composition and framing
- Artistic style and medium
- Specific details and colors
- Visual atmosphere

Provide ONLY the enhanced prompt, no other text:`;

      const enhancedPrompt = await geminiService.generateText(enhancementPrompt, creativeDirector.model);

      const image: GeneratedImage = {
        id: `img-${Date.now()}`,
        prompt,
        enhancedPrompt: enhancedPrompt.trim(),
        status: 'generating',
        timestamp: new Date().toISOString(),
      };

      setImages((prev) => [image, ...prev]);

      // Note: Actual image generation would use an image generation API
      // For now, we'll simulate it or use a placeholder
      // In production, integrate with Imagen, DALL-E, Stable Diffusion, etc.

      setTimeout(() => {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'complete',
                  imageUrl: `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`,
                }
              : img
          )
        );
        setIsGenerating(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-cyan-400">Creator Studio</h1>
        </div>
        <p className="text-gray-400">AI-powered image generation from text prompts</p>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Prompt Input */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Image Generation</h2>
          </div>
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create... (e.g., 'A futuristic cityscape at sunset')"
              rows={3}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Generated Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.length === 0 ? (
            <div className="col-span-full bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No images generated yet</p>
              <p className="text-sm text-gray-500 mt-2">Enter a prompt and click "Generate Image"</p>
            </div>
          ) : (
            images.map((image) => (
              <div
                key={image.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-slate-900 flex items-center justify-center relative">
                  {image.status === 'generating' ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Generating...</p>
                    </div>
                  ) : image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-gray-600" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 truncate">{image.prompt}</h3>
                  {image.enhancedPrompt && image.enhancedPrompt !== image.prompt && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Enhanced Prompt:</p>
                      <p className="text-xs text-gray-400 italic">{image.enhancedPrompt}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(image.timestamp).toLocaleString()}
                    </span>
                    {image.status === 'complete' && (
                      <button
                        onClick={() => {
                          if (image.imageUrl) {
                            const link = document.createElement('a');
                            link.href = image.imageUrl;
                            link.download = `image-${image.id}.png`;
                            link.click();
                          }
                        }}
                        className="p-2 hover:bg-slate-700 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            <strong className="text-blue-400">Note:</strong> This lab uses prompt enhancement via Creative Director
            agent. Actual image generation requires integration with an image generation API (Imagen, DALL-E, Stable
            Diffusion, etc.). The enhanced prompts are ready for use with any image generation service.
          </p>
        </div>
      </div>

      {/* Agent Chat */}
      {agents.length > 0 && (
        <AgentChat
          agents={hasGlobalHelper ? [...agents, agentService.getGlobalHelperAgent()] : agents}
          defaultAgentId={agents.find((a) => a.id === 'creative-director')?.id || agents[0]?.id}
          labId="creator"
          compact={false}
        />
      )}
    </div>
  );
};

export default CreatorStudio;

