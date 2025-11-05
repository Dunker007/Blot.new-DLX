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
}

