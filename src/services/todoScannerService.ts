/**
 * TODO Scanner Service
 * Automatically scans codebase for TODOs and converts them to Project Flow items
 */

import { ProjectFlowItem, FlowColumn } from '../types/projectFlow';
import { projectFlowService } from './projectFlowService';

interface TODOPattern {
  file: string;
  line: number;
  content: string;
  type: 'feature' | 'bug' | 'enhancement' | 'refactor' | 'documentation';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

class TODOScannerService {
  private scannedFiles = new Set<string>();

  /**
   * Scan a file for TODO comments
   * Enhanced to catch more patterns including inline comments
   */
  scanFileForTODOs(fileContent: string, fileName: string): TODOPattern[] {
    const todos: TODOPattern[] = [];
    const lines = fileContent.split('\n');
    
    lines.forEach((line, index) => {
      // Match TODO, FIXME, XXX, HACK patterns (case insensitive)
      // Also match patterns like: // TODO, /* TODO, # TODO, <!-- TODO -->
      const todoMatch = line.match(/(?:\/\/|\/\*|#|<!--)\s*(?:TODO|FIXME|XXX|HACK|BUG|NOTE|OPTIMIZE|REFACTOR):\s*(.+?)(?:\*\/|-->)?$/i);
      if (todoMatch) {
        const content = todoMatch[1].trim();
        const type = this.detectType(content);
        const priority = this.detectPriority(content);
        
        todos.push({
          file: fileName,
          line: index + 1,
          content,
          type,
          priority,
        });
      }
    });
    
    return todos;
  }

  /**
   * Detect TODO type from content
   * Enhanced with more keywords
   */
  private detectType(content: string): TODOPattern['type'] {
    const lower = content.toLowerCase();
    if (lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('broken')) {
      return 'bug';
    }
    if (lower.includes('feature') || lower.includes('implement') || lower.includes('add') || lower.includes('create') || lower.includes('build')) {
      return 'feature';
    }
    if (lower.includes('refactor') || lower.includes('optimize') || lower.includes('cleanup') || lower.includes('improve') || lower.includes('enhance')) {
      return 'refactor';
    }
    if (lower.includes('document') || lower.includes('comment') || lower.includes('doc') || lower.includes('readme')) {
      return 'documentation';
    }
    return 'enhancement';
  }

  /**
   * Detect priority from content
   */
  private detectPriority(content: string): TODOPattern['priority'] {
    const lower = content.toLowerCase();
    if (lower.includes('critical') || lower.includes('urgent') || lower.includes('blocker')) {
      return 'critical';
    }
    if (lower.includes('high') || lower.includes('important') || lower.includes('priority')) {
      return 'high';
    }
    if (lower.includes('low') || lower.includes('minor') || lower.includes('nice to have')) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Convert TODO to Project Flow item
   */
  todoToFlowItem(todo: TODOPattern): ProjectFlowItem {
    const column: FlowColumn = 
      todo.priority === 'critical' || todo.priority === 'high' ? 'backlog' :
      todo.type === 'bug' ? 'backlog' :
      'backlog';

    return {
      id: `todo-${todo.file.replace(/[^a-zA-Z0-9]/g, '-')}-${todo.line}`,
      type: 'task',
      title: `${todo.type === 'bug' ? '🐛 Fix: ' : todo.type === 'feature' ? '✨ Feature: ' : '📝 '}${todo.content.substring(0, 60)}`,
      description: `TODO found in ${todo.file}:${todo.line}\n\n${todo.content}`,
      status: 'In Progress...',
      column,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [todo.type, `file:${todo.file.split('/').pop()}`, `priority:${todo.priority}`],
      priority: todo.priority,
      executionStatus: 'pending',
    };
  }

  /**
   * Auto-sync TODOs to Project Flow
   * This would be called on app startup or periodically
   */
  async syncTODOsToFlow(): Promise<number> {
    // In a real implementation, this would scan the codebase
    // For now, we'll add the known TODOs manually
    
    const knownTODOs: Array<{ file: string; line: number; content: string }> = [
      {
        file: 'src/services/realtimeCollaboration.ts',
        line: 342,
        content: 'Implement proper operational transformation - Use Y.js, ShareJS, or Automerge for production',
      },
      {
        file: 'src/services/pluginSystem.ts',
        line: 292,
        content: 'Implement UI cleanup for plugins - Remove DOM components, event listeners, styles, routes',
      },
      {
        file: 'src/modules/vibe-de/VibeDEEditor.tsx',
        line: 157,
        content: 'Add support for OpenAI, Anthropic, and Local models',
      },
      {
        file: 'src/modules/vibe-de/VibeDEEditor.tsx',
        line: 400,
        content: 'Implement voice input functionality',
      },
      {
        file: 'src/modules/vibe-de/VibeDEEditor.tsx',
        line: 412,
        content: 'Implement video input functionality',
      },
      {
        file: 'src/modules/vibe-de/VibeDEEditor.tsx',
        line: 424,
        content: 'Implement webcam self-correction feature',
      },
      {
        file: 'src/modules/monaco-editor/MonacoEditorPage.tsx',
        line: 281,
        content: 'Add code execution in sandboxed environment',
      },
      {
        file: 'BACKFILL_PLAN.md',
        line: 7,
        content: 'Complete remaining labs: Code Review, Data Weave, Signal, System Matrix, Knowledge Base, Ambiance',
      },
      {
        file: 'BACKFILL_PLAN.md',
        line: 26,
        content: 'Calculate actual metrics from logs in EnhancedAnalyticsDashboard',
      },
      {
        file: 'BACKFILL_PLAN.md',
        line: 27,
        content: 'Calculate error rate from logs in EnhancedAnalyticsDashboard',
      },
    ];

    const existingItems = projectFlowService.getItems();
    const existingTodoIds = new Set(
      existingItems
        .filter(item => item.id.startsWith('todo-'))
        .map(item => item.id)
    );

    let addedCount = 0;
    for (const todo of knownTODOs) {
      const todoPattern: TODOPattern = {
        file: todo.file,
        line: todo.line,
        content: todo.content,
        type: this.detectType(todo.content),
        priority: this.detectPriority(todo.content),
      };

      const flowItem = this.todoToFlowItem(todoPattern);
      
      // Only add if not already exists
      if (!existingTodoIds.has(flowItem.id)) {
        projectFlowService.upsertItem(flowItem);
        addedCount++;
      }
    }

    return addedCount;
  }
}

export const todoScannerService = new TODOScannerService();
