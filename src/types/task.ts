/**
 * Task Management Types
 * Ported from DLX-Command-Center-LUX-2.0
 */

export interface Task {
  id: number;
  text: string;
  status: 'In Progress...' | 'Complete' | 'Failed';
  result?: string;
  timestamp: string;
}

export interface IntelReport {
  title: string;
  summary: string;
  key_points: string[];
}

