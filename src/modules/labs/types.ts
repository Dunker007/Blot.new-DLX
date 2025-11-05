/**
 * Labs System Types
 * Ported from DLX-Ultra-2
 */

export type LabId =
  | 'aura'
  | 'creator'
  | 'signal'
  | 'data-weave'
  | 'dataverse'
  | 'forge'
  | 'crypto'
  | 'review'
  | 'comms'
  | 'training'
  | 'system-matrix';

export interface Lab {
  id: LabId;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'preview' | 'coming-soon';
  category: 'ai' | 'development' | 'research' | 'system';
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  corePrompt: string;
  model: 'gemini-2.0-flash-exp' | 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'ollama-local';
  temperature: number;
  tools: any[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
  citations?: any[];
  image?: string;
}

