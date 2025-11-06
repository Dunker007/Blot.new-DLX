/**
 * Project Flow Service
 * Unified state management for Ideas and Tasks in the flow system
 */

import { LocalStorageManager } from '../utils/localStorage';
import { ProjectFlowItem, FlowColumn, FlowItemType } from '../types/projectFlow';
import { Idea, IdeaStatus } from '../types/idea';
import { Task } from '../types/task';
import { executeTask, analyzeIntel } from './taskService';
import { IntelReport } from '../types/task';
import { Lab } from '../modules/labs/types';
import { LABS } from '../modules/labs/labsConfig';

const STORAGE_KEY = 'dlx-project-flow';
const IDEAS_STORAGE_KEY = 'dlx-ideas'; // Keep for Idea Lab compatibility

class ProjectFlowService {
  /**
   * Get all flow items
   */
  getItems(): ProjectFlowItem[] {
    try {
      return LocalStorageManager.get<ProjectFlowItem[]>(STORAGE_KEY, []);
    } catch (error) {
      console.error('Failed to load project flow items:', error);
      return [];
    }
  }

  /**
   * Save flow items
   */
  saveItems(items: ProjectFlowItem[]): void {
    try {
      LocalStorageManager.set(STORAGE_KEY, items);
    } catch (error) {
      console.error('Failed to save project flow items:', error);
    }
  }

  /**
   * Convert Idea to ProjectFlowItem
   */
  ideaToFlowItem(idea: Idea): ProjectFlowItem {
    const column: FlowColumn = 
      idea.status === IdeaStatus.NEW ? 'ideas' :
      idea.status === IdeaStatus.DISCUSSION ? 'ideas' :
      idea.status === IdeaStatus.APPROVED ? 'backlog' :
      'done';

    return {
      id: `idea-${idea.id}`,
      type: 'idea',
      title: idea.title,
      description: idea.description,
      status: idea.status,
      column,
      timestamp: idea.timestamp,
      updatedAt: idea.timestamp,
      tags: idea.tags || [],
      priority: idea.priority || 'medium',
      votes: idea.votes || 0,
      dueDate: idea.dueDate,
      attachments: idea.attachments,
      aiGenerated: idea.aiGenerated,
      template: idea.template,
      linkedTaskIds: [],
    };
  }

  /**
   * Convert Task to ProjectFlowItem
   */
  taskToFlowItem(task: Task, linkedIdeaId?: number): ProjectFlowItem {
    const column: FlowColumn = 
      task.status === 'In Progress...' ? 'in-progress' :
      task.status === 'Complete' ? 'done' :
      'backlog';

    return {
      id: `task-${task.id}`,
      type: 'task',
      title: task.text,
      description: task.text,
      status: task.status,
      column,
      timestamp: task.timestamp,
      updatedAt: task.timestamp,
      result: task.result,
      executionStatus: task.status === 'Complete' ? 'complete' : 
                       task.status === 'Failed' ? 'failed' : 'pending',
      linkedIdeaId,
    };
  }

  /**
   * Convert ProjectFlowItem back to Idea (for Idea Lab compatibility)
   */
  flowItemToIdea(item: ProjectFlowItem): Idea | null {
    if (item.type !== 'idea') return null;
    
    const id = parseInt(item.id.replace('idea-', ''));
    const status = item.status as IdeaStatus;
    
    return {
      id,
      title: item.title,
      description: item.description,
      status,
      timestamp: item.timestamp,
      tags: item.tags,
      priority: item.priority,
      votes: item.votes,
      dueDate: item.dueDate,
      attachments: item.attachments,
      aiGenerated: item.aiGenerated,
      template: item.template,
    };
  }

  /**
   * Convert ProjectFlowItem back to Task (for compatibility)
   */
  flowItemToTask(item: ProjectFlowItem): Task | null {
    if (item.type !== 'task') return null;
    
    const id = parseInt(item.id.replace('task-', ''));
    const status = item.status as 'In Progress...' | 'Complete' | 'Failed';
    
    return {
      id,
      text: item.title,
      status,
      result: item.result,
      timestamp: item.timestamp,
    };
  }

  /**
   * Add or update flow item
   */
  upsertItem(item: ProjectFlowItem): void {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
    } else {
      items.push(item);
    }
    
    this.saveItems(items);
  }

  /**
   * Remove flow item
   */
  removeItem(id: string): void {
    const items = this.getItems().filter(i => i.id !== id);
    this.saveItems(items);
  }

  /**
   * Move item to different column
   */
  moveItem(id: string, column: FlowColumn): void {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    
    if (item) {
      item.column = column;
      item.updatedAt = new Date().toISOString();
      
      // Auto-update status based on column
      if (column === 'done' && item.type === 'task') {
        item.status = 'Complete';
        item.executionStatus = 'complete';
      } else if (column === 'in-progress' && item.type === 'task') {
        item.status = 'In Progress...';
        item.executionStatus = 'running';
      } else if (column === 'backlog' && item.type === 'idea') {
        item.status = IdeaStatus.APPROVED;
      }
      
      this.saveItems(items);
    }
  }

  /**
   * Link items together
   */
  linkItems(fromId: string, toId: string): void {
    const items = this.getItems();
    const fromItem = items.find(i => i.id === fromId);
    const toItem = items.find(i => i.id === toId);
    
    if (fromItem && toItem) {
      if (!fromItem.linkedItems) fromItem.linkedItems = [];
      if (!toItem.linkedItems) toItem.linkedItems = [];
      
      if (!fromItem.linkedItems.includes(toId)) {
        fromItem.linkedItems.push(toId);
      }
      if (!toItem.linkedItems.includes(fromId)) {
        toItem.linkedItems.push(fromId);
      }
      
      // Special handling for idea-to-task links
      if (fromItem.type === 'idea' && toItem.type === 'task') {
        fromItem.linkedTaskIds = fromItem.linkedTaskIds || [];
        if (!fromItem.linkedTaskIds.includes(toId)) {
          fromItem.linkedTaskIds.push(toId);
        }
        toItem.linkedIdeaId = parseInt(fromItem.id.replace('idea-', ''));
      }
      
      this.saveItems(items);
    }
  }

  /**
   * Execute task (AI-powered)
   */
  async executeTaskItem(itemId: string): Promise<string> {
    const items = this.getItems();
    const item = items.find(i => i.id === itemId && i.type === 'task');
    
    if (!item) {
      throw new Error('Task not found');
    }
    
    // Update status to running
    item.executionStatus = 'running';
    item.status = 'In Progress...';
    item.updatedAt = new Date().toISOString();
    this.saveItems(items);
    
    try {
      const result = await executeTask(item.title);
      item.result = result;
      item.executionStatus = 'complete';
      item.status = 'Complete';
      item.column = 'done';
      item.updatedAt = new Date().toISOString();
      this.saveItems(items);
      return result;
    } catch (error) {
      item.executionStatus = 'failed';
      item.status = 'Failed';
      item.updatedAt = new Date().toISOString();
      this.saveItems(items);
      throw error;
    }
  }

  /**
   * Generate intel report (AI-powered analysis)
   */
  async generateIntelReport(query: string): Promise<IntelReport> {
    return await analyzeIntel(query);
  }

  /**
   * Convert idea to tasks (auto-generate)
   */
  async convertIdeaToTasks(ideaId: string, taskCount: number = 3): Promise<ProjectFlowItem[]> {
    const items = this.getItems();
    const idea = items.find(i => i.id === ideaId && i.type === 'idea');
    
    if (!idea) {
      throw new Error('Idea not found');
    }
    
    // Use AI to generate task breakdown
    const { geminiService } = await import('./gemini/geminiService');
    const prompt = `Based on this idea: "${idea.title}\n\n${idea.description}"

Generate ${taskCount} specific, actionable tasks needed to implement this idea. Format each task as:
Task: [task name]

Return only the task names, one per line.`;
    
    const response = await geminiService.generateText(prompt);
    const taskLines = response.split('\n').filter(line => line.trim().startsWith('Task:'));
    const newTasks: ProjectFlowItem[] = [];
    
    taskLines.forEach((line, index) => {
      const taskName = line.replace(/^Task:\s*/, '').trim();
      if (taskName) {
        const task: ProjectFlowItem = {
          id: `task-${Date.now()}-${index}`,
          type: 'task',
          title: taskName,
          description: `Task for: ${idea.title}`,
          status: 'In Progress...',
          column: 'backlog',
          timestamp: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          executionStatus: 'pending',
          linkedIdeaId: parseInt(ideaId.replace('idea-', '')),
        };
        
        newTasks.push(task);
        items.push(task);
        
        // Link idea to task
        this.linkItems(ideaId, task.id);
      }
    });
    
    idea.convertedToTask = true;
    this.saveItems(items);
    
    return newTasks;
  }

  /**
   * Convert Lab to ProjectFlowItem
   */
  labToFlowItem(lab: Lab): ProjectFlowItem {
    // Map lab status to flow column
    const column: FlowColumn = 
      lab.status === 'active' ? 'backlog' :
      lab.status === 'preview' ? 'ideas' :
      'ideas'; // coming-soon also goes to ideas
    
    // Map lab status to priority
    const priority: 'low' | 'medium' | 'high' | 'critical' = 
      lab.status === 'active' ? 'high' :
      lab.status === 'preview' ? 'medium' :
      'low';
    
    return {
      id: `lab-${lab.id}`,
      type: 'idea',
      title: lab.name,
      description: lab.description,
      status: lab.status === 'active' ? IdeaStatus.APPROVED : IdeaStatus.NEW,
      column,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['lab', lab.category, lab.id],
      priority,
      votes: 0,
      aiGenerated: false,
    };
  }

  /**
   * Migrate all labs to Project Flow (one-time migration)
   */
  migrateLabsToFlow(): number {
    const items = this.getItems();
    const existingLabIds = new Set(
      items
        .filter(i => i.id.startsWith('lab-'))
        .map(i => i.id)
    );
    
    let migratedCount = 0;
    LABS.forEach(lab => {
      const labId = `lab-${lab.id}`;
      if (!existingLabIds.has(labId)) {
        const flowItem = this.labToFlowItem(lab);
        items.push(flowItem);
        migratedCount++;
      }
    });
    
    if (migratedCount > 0) {
      this.saveItems(items);
      console.log(`✅ Migrated ${migratedCount} labs to Project Flow`);
    }
    
    return migratedCount;
  }

  /**
   * Convert Project to ProjectFlowItem
   */
  projectToFlowItem(project: any): ProjectFlowItem {
    // Map project status to flow column
    const column: FlowColumn = 
      project.status === 'planning' ? 'backlog' :
      project.status === 'in_progress' ? 'in-progress' :
      project.status === 'deployed' ? 'done' :
      project.status === 'archived' ? 'done' :
      'backlog';
    
    return {
      id: `project-${project.id || Date.now()}`,
      type: 'idea',
      title: project.name || 'Untitled Project',
      description: project.description || '',
      status: project.status === 'deployed' || project.status === 'archived' ? IdeaStatus.ARCHIVED : IdeaStatus.APPROVED,
      column,
      timestamp: project.created_at || project.timestamp || new Date().toISOString(),
      updatedAt: project.updated_at || project.updatedAt || new Date().toISOString(),
      tags: ['project', ...(project.tech_stack || [])],
      priority: project.status === 'in_progress' ? 'high' : 'medium',
      votes: 0,
      aiGenerated: false,
    };
  }

  /**
   * Sync projects from Projects component to Project Flow
   */
  syncProjectsToFlow(projects: any[]): number {
    const items = this.getItems();
    const existingProjectIds = new Set(
      items
        .filter(i => i.id.startsWith('project-'))
        .map(i => i.id)
    );
    
    let syncedCount = 0;
    projects.forEach(project => {
      const projectId = `project-${project.id || project.name}`;
      if (!existingProjectIds.has(projectId)) {
        const flowItem = this.projectToFlowItem(project);
        items.push(flowItem);
        syncedCount++;
      }
    });
    
    if (syncedCount > 0) {
      this.saveItems(items);
    }
    
    return syncedCount;
  }

  /**
   * Sync with Idea Lab (if ideas are stored separately)
   */
  syncWithIdeas(ideas: Idea[]): void {
    const items = this.getItems();
    const ideaItems = items.filter(i => i.type === 'idea');
    
    // Update existing idea items
    ideas.forEach(idea => {
      const existingItem = ideaItems.find(i => i.id === `idea-${idea.id}`);
      if (existingItem) {
        const updated = this.ideaToFlowItem(idea);
        Object.assign(existingItem, updated);
      }
    });
    
    this.saveItems(items);
  }
}

export const projectFlowService = new ProjectFlowService();
