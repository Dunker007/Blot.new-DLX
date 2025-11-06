import { supabase } from '../lib/supabase';

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: {
    x: number;
    y: number;
    elementId?: string;
  };
  selection?: {
    start: number;
    end: number;
    elementId: string;
  };
  presence: 'online' | 'away' | 'offline';
  lastActive: Date;
}

export interface CollaborationEvent {
  type:
    | 'cursor_move'
    | 'text_change'
    | 'selection_change'
    | 'user_join'
    | 'user_leave'
    | 'ai_response';
  userId: string;
  data: any;
  timestamp: Date;
  elementId?: string;
}

export interface SharedDocument {
  id: string;
  projectId: string;
  content: string;
  version: number;
  lastModified: Date;
  activeUsers: CollaborationUser[];
}

export class RealtimeCollaborationService {
  private channel: any = null;
  private currentUser: CollaborationUser | null = null;
  private activeUsers = new Map<string, CollaborationUser>();
  private eventListeners = new Map<string, ((event: CollaborationEvent) => void)[]>();
  private presenceTimer: NodeJS.Timeout | null = null;

  async joinSession(
    projectId: string,
    user: Omit<CollaborationUser, 'presence' | 'lastActive'>
  ): Promise<void> {
    this.currentUser = {
      ...user,
      presence: 'online',
      lastActive: new Date(),
    };

    // Leave existing channel if any
    if (this.channel) {
      await this.leaveSession();
    }

    // Create simplified local channel (no Supabase needed)
    this.channel = {
      on: () => this.channel,
      subscribe: async () => Promise.resolve(),
      unsubscribe: async () => Promise.resolve(),
      track: async () => Promise.resolve(),
      send: () => {},
      presenceState: () => ({}),
    };

    // Add current user to active users
    this.activeUsers.set(this.currentUser.id, this.currentUser);
    this.emitEvent({
      type: 'user_join',
      userId: this.currentUser.id,
      data: this.currentUser,
      timestamp: new Date(),
    });

    // Start presence heartbeat for local mode
    this.startPresenceHeartbeat();
  }

  async leaveSession(): Promise<void> {
    if (this.presenceTimer) {
      clearInterval(this.presenceTimer);
      this.presenceTimer = null;
    }

    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }

    this.activeUsers.clear();
    this.currentUser = null;
  }

  broadcastCursorMove(cursor: { x: number; y: number; elementId?: string }): void {
    if (!this.currentUser) return;

    this.currentUser.cursor = cursor;
    // In local mode, cursor updates are handled locally
    this.emitEvent({
      type: 'cursor_move',
      userId: this.currentUser.id,
      data: cursor,
      timestamp: new Date(),
    });
  }

  broadcastTextChange(
    elementId: string,
    change: {
      operation: 'insert' | 'delete' | 'replace';
      position: number;
      content: string;
      length?: number;
    }
  ): void {
    if (!this.currentUser) return;

    this.emitEvent({
      type: 'text_change',
      userId: this.currentUser.id,
      elementId,
      data: change,
      timestamp: new Date(),
    });
  }

  broadcastSelectionChange(elementId: string, selection: { start: number; end: number }): void {
    if (!this.currentUser) return;

    this.currentUser.selection = { ...selection, elementId };
    this.emitEvent({
      type: 'selection_change',
      userId: this.currentUser.id,
      elementId,
      data: selection,
      timestamp: new Date(),
    });
  }

  broadcastAIResponse(
    conversationId: string,
    response: {
      content: string;
      model: string;
      tokens?: number;
    }
  ): void {
    if (!this.currentUser) return;

    this.emitEvent({
      type: 'ai_response',
      userId: this.currentUser.id,
      data: { conversationId, response },
      timestamp: new Date(),
    });
  }

  addEventListener(eventType: string, callback: (event: CollaborationEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (event: CollaborationEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  getActiveUsers(): CollaborationUser[] {
    return Array.from(this.activeUsers.values());
  }

  getCurrentUser(): CollaborationUser | null {
    return this.currentUser;
  }

  private handleCursorMove(payload: any): void {
    const { userId, cursor, timestamp } = payload;
    if (userId === this.currentUser?.id) return;

    const user = this.activeUsers.get(userId);
    if (user) {
      user.cursor = cursor;
      user.lastActive = new Date(timestamp);
    }

    this.emitEvent({
      type: 'cursor_move',
      userId,
      data: cursor,
      timestamp: new Date(timestamp),
    });
  }

  private handleTextChange(payload: any): void {
    const { userId, elementId, change, timestamp } = payload;
    if (userId === this.currentUser?.id) return;

    this.emitEvent({
      type: 'text_change',
      userId,
      elementId,
      data: change,
      timestamp: new Date(timestamp),
    });
  }

  private handleSelectionChange(payload: any): void {
    const { userId, elementId, selection, timestamp } = payload;
    if (userId === this.currentUser?.id) return;

    const user = this.activeUsers.get(userId);
    if (user) {
      user.selection = { ...selection, elementId };
      user.lastActive = new Date(timestamp);
    }

    this.emitEvent({
      type: 'selection_change',
      userId,
      elementId,
      data: selection,
      timestamp: new Date(timestamp),
    });
  }

  private handleAIResponse(payload: any): void {
    const { userId, conversationId, response, timestamp } = payload;
    if (userId === this.currentUser?.id) return;

    this.emitEvent({
      type: 'ai_response',
      userId,
      data: { conversationId, response },
      timestamp: new Date(timestamp),
    });
  }

  private updatePresenceState(state: Record<string, any[]>): void {
    this.activeUsers.clear();

    Object.entries(state).forEach(([userId, presences]) => {
      if (presences.length > 0) {
        const presence = presences[0];
        this.activeUsers.set(userId, {
          id: userId,
          name: presence.name || 'Unknown User',
          avatar: presence.avatar,
          cursor: presence.cursor,
          selection: presence.selection,
          presence: 'online',
          lastActive: new Date(presence.lastActive || Date.now()),
        });
      }
    });
  }

  private startPresenceHeartbeat(): void {
    this.presenceTimer = setInterval(() => {
      if (this.currentUser) {
        this.currentUser.lastActive = new Date();
        // Update user in active users map
        this.activeUsers.set(this.currentUser.id, this.currentUser);
      }
    }, 30000); // Update every 30 seconds
  }

  private emitEvent(event: CollaborationEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  // Document synchronization methods
  async saveDocument(document: Omit<SharedDocument, 'activeUsers'>): Promise<void> {
    const { error } = await supabase.from('shared_documents').upsert({
      id: document.id,
      project_id: document.projectId,
      content: document.content,
      version: document.version,
      last_modified: document.lastModified.toISOString(),
    });

    if (error) {
      console.error('Failed to save document:', error);
      throw error;
    }
  }

  async loadDocument(documentId: string): Promise<SharedDocument | null> {
    const { data, error } = await supabase
      .from('shared_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Failed to load document:', error);
      return null;
    }

    return {
      id: data.id,
      projectId: data.project_id,
      content: data.content,
      version: data.version,
      lastModified: new Date(data.last_modified),
      activeUsers: this.getActiveUsers(),
    };
  }

  // Conflict resolution for concurrent edits
  resolveConflict(
    localChange: any,
    remoteChange: any,
    baseContent: string
  ): { resolved: string; conflicts: any[] } {
    // Implement operational transformation or CRDT-based conflict resolution
    // This is a simplified version - in production, use a library like Y.js or ShareJS

    const conflicts: any[] = [];
    let resolved = baseContent;

    // Simple last-write-wins for now
    // TODO: Implement proper operational transformation
    // NOTE: This is a simplified conflict resolution. For production use, consider:
    // - Y.js (CRDT-based collaboration)
    // - ShareJS (Operational Transformation)
    // - Automerge (CRDT library)
    // Priority: Medium - Needed for multi-user real-time editing
    if (remoteChange.timestamp > localChange.timestamp) {
      resolved = this.applyChange(resolved, remoteChange);
      conflicts.push({
        type: 'overwritten',
        local: localChange,
        remote: remoteChange,
      });
    } else {
      resolved = this.applyChange(resolved, localChange);
    }

    return { resolved, conflicts };
  }

  private applyChange(content: string, change: any): string {
    switch (change.operation) {
      case 'insert':
        return content.slice(0, change.position) + change.content + content.slice(change.position);
      case 'delete':
        return (
          content.slice(0, change.position) + content.slice(change.position + (change.length || 0))
        );
      case 'replace':
        return (
          content.slice(0, change.position) +
          change.content +
          content.slice(change.position + (change.length || 0))
        );
      default:
        return content;
    }
  }
}

export const realtimeCollaboration = new RealtimeCollaborationService();
