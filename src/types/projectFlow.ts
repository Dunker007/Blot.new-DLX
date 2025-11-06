/**
 * Unified Project Flow Types
 * Combines Ideas and Tasks into a single flow system
 */

import { Idea, IdeaStatus } from './idea';
import { Task, IntelReport } from './task';

export type FlowItemType = 'idea' | 'task';

export type FlowColumn = 'ideas' | 'backlog' | 'in-progress' | 'review' | 'done';

export interface ProjectFlowItem {
  id: string; // Unified ID (can be idea ID or task ID)
  type: FlowItemType;
  
  // Common fields
  title: string;
  description: string;
  status: string; // IdeaStatus or Task status
  column: FlowColumn;
  timestamp: string;
  updatedAt: string;
  
  // Metadata (from both systems)
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  
  // Idea-specific fields
  votes?: number;
  aiGenerated?: boolean;
  template?: string;
  
  // Task-specific fields
  result?: string; // AI execution result
  executionStatus?: 'pending' | 'running' | 'complete' | 'failed';
  intelReport?: IntelReport;
  
  // Linking
  linkedItems?: string[]; // IDs of linked items (ideas or tasks)
  linkedIdeaId?: number; // If this task came from an idea
  linkedTaskIds?: string[]; // If this idea spawned tasks
  convertedToTask?: boolean; // If idea was converted
  
  // Subtasks (from TaskPunchList)
  subtasks?: Array<{ id: string; content: string; completed: boolean }>;
}

export interface FlowConnection {
  from: string; // Item ID
  to: string; // Item ID
  type: 'idea-to-task' | 'task-to-task' | 'idea-to-idea';
  color?: string;
}

export interface FlowBoardState {
  items: ProjectFlowItem[];
  connections: FlowConnection[];
  filters: {
    type?: FlowItemType;
    tags?: string[];
    priority?: string[];
    search?: string;
  };
}
