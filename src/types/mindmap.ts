/**
 * Enhanced Mind Map Types
 * Ported from DLX-Ultra - Better structure for mind mapping
 */

export interface Point {
  x: number;
  y: number;
}

export enum NodeType {
  ROOT = 'ROOT',
  MAIN = 'MAIN',
  LEAF = 'LEAF',
  AGENT = 'AGENT',
  AGENT_DESIGNER = 'AGENT_DESIGNER',
}

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export type NodeColor = 'cyan' | 'violet' | 'green' | 'orange' | 'pink' | 'default';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface AgentDesignerDetails {
  inputSchema: string;
  outputSchema: string;
  corePrompt: string;
  apiConnections: string[];
  model: 'gemini-pro' | 'gemini-flash' | 'ollama-local';
}

export interface MindMapNode {
  id: string;
  label: string;
  type: NodeType;
  position: Point;
  connections: string[];
  status?: NodeStatus;
  color?: NodeColor;
  icon?: string;
  description?: string;
  details?: AgentDesignerDetails;
  tasks?: Task[];
}

