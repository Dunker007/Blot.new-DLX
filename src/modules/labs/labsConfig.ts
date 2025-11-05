/**
 * Labs Configuration
 * Ported from DLX-Ultra-2
 */

import { Lab } from './types';
import { featureFlagService } from '../../services/featureFlagService';

export const LABS: Lab[] = [
  {
    id: 'aura',
    name: 'AURA Interface',
    description: 'Direct communication channel with AURA, the core cognitive AI',
    icon: '🧠',
    status: featureFlagService.isAvailable('auraInterface') ? 'active' : 'preview',
    category: 'ai',
  },
  {
    id: 'forge',
    name: 'Agent Forge',
    description: 'Create, manage, and simulate specialized AI agents',
    icon: '⚙️',
    status: featureFlagService.isAvailable('agentForge') ? 'active' : 'preview',
    category: 'ai',
  },
  {
    id: 'data-weave',
    name: 'Data Weave',
    description: 'Synthesize outputs from multiple agents for cross-domain insights',
    icon: '🔗',
    status: featureFlagService.isAvailable('dataWeave') ? 'active' : 'preview',
    category: 'research',
  },
  {
    id: 'signal',
    name: 'Signal Lab',
    description: 'Research tool with Google Search grounding for real-time data',
    icon: '📡',
    status: featureFlagService.isAvailable('signalLab') ? 'preview' : 'coming-soon',
    category: 'research',
  },
  {
    id: 'creator',
    name: 'Creator Studio',
    description: 'AI-powered image generation from text prompts',
    icon: '🎨',
    status: featureFlagService.isAvailable('creatorStudio') ? 'preview' : 'coming-soon',
    category: 'ai',
  },
  {
    id: 'review',
    name: 'Code Review',
    description: 'AI-powered code analysis and review',
    icon: '🔍',
    status: featureFlagService.isAvailable('codeReview') ? 'preview' : 'coming-soon',
    category: 'development',
  },
  {
    id: 'crypto',
    name: 'Crypto Lab',
    description: 'Cryptocurrency analysis and portfolio tracking',
    icon: '₿',
    status: featureFlagService.isAvailable('cryptoLab') ? 'preview' : 'coming-soon',
    category: 'research',
  },
  {
    id: 'comms',
    name: 'Comms Channel',
    description: 'Real-time audio transcription interface',
    icon: '🎤',
    status: featureFlagService.isAvailable('commsChannel') ? 'preview' : 'coming-soon',
    category: 'ai',
  },
  {
    id: 'dataverse',
    name: 'Dataverse',
    description: 'RAG-powered knowledge system grounded in project documentation',
    icon: '🌌',
    status: featureFlagService.isAvailable('dataverse') ? 'preview' : 'coming-soon',
    category: 'research',
  },
  {
    id: 'training',
    name: 'Training Lab',
    description: 'Train and fine-tune AI models',
    icon: '🎓',
    status: 'coming-soon',
    category: 'ai',
  },
  {
    id: 'system-matrix',
    name: 'System Matrix',
    description: 'Core concepts, components, and operational parameters',
    icon: '⚡',
    status: featureFlagService.isAvailable('systemMatrix') ? 'preview' : 'coming-soon',
    category: 'system',
  },
];

export const getLabById = (id: string): Lab | undefined => {
  return LABS.find((lab) => lab.id === id);
};

export const getLabsByCategory = (category: Lab['category']): Lab[] => {
  return LABS.filter((lab) => lab.category === category);
};

