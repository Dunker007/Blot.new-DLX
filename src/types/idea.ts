/**
 * Idea Management Types
 * Ported from DLX-Command-Center-LUX-2.0
 */

export enum IdeaStatus {
  NEW = 'New Idea',
  DISCUSSION = 'In Discussion',
  APPROVED = 'Approved',
  ARCHIVED = 'Archived',
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  status: IdeaStatus;
  timestamp: string;
  // New fields
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  votes?: number;
  dueDate?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  template?: string;
  aiGenerated?: boolean;
}

