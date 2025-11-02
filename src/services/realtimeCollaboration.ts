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

    // Create new channel for the project
    this.channel = supabase.channel(`project:${projectId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Subscribe to presence changes
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState();
        this.updatePresenceState(state || {});
      })
      .on(
        'presence',
        { event: 'join' },
        ({ key, newPresences }: { key: string; newPresences: any[] }) => {
          console.log('User joined:', key, newPresences);
          this.emitEvent({
            type: 'user_join',
            userId: key,
            data: newPresences[0],
            timestamp: new Date(),
          });
        }
      )
      .on(
        'presence',
        { event: 'leave' },
        ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
          console.log('User left:', key, leftPresences);
          this.activeUsers.delete(key);
          this.emitEvent({
            type: 'user_leave',
            userId: key,
            data: leftPresences[0],
            timestamp: new Date(),
          });
        }
      );

    // Subscribe to broadcast events
    this.channel
      .on('broadcast', { event: 'cursor_move' }, (payload: any) => {
        this.handleCursorMove(payload);
      })
      .on('broadcast', { event: 'text_change' }, (payload: any) => {
        this.handleTextChange(payload);
      })
      .on('broadcast', { event: 'selection_change' }, (payload: any) => {
        this.handleSelectionChange(payload);
      })
      .on('broadcast', { event: 'ai_response' }, (payload: any) => {
        this.handleAIResponse(payload);
      });

    // Subscribe and track presence
    await this.channel.subscribe(async (status: string) => {
      if (status !== 'SUBSCRIBED') return;

      await this.channel?.track(this.currentUser);
      this.startPresenceHeartbeat();
    });
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
    if (!this.channel || !this.currentUser) return;

    this.currentUser.cursor = cursor;
    this.channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        userId: this.currentUser.id,
        cursor,
        timestamp: new Date().toISOString(),
      },
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
    if (!this.channel || !this.currentUser) return;

    this.channel.send({
      type: 'broadcast',
      event: 'text_change',
      payload: {
        userId: this.currentUser.id,
        elementId,
        change,
        timestamp: new Date().toISOString(),
      },
    });
  }

  broadcastSelectionChange(elementId: string, selection: { start: number; end: number }): void {
    if (!this.channel || !this.currentUser) return;

    this.currentUser.selection = { ...selection, elementId };
    this.channel.send({
      type: 'broadcast',
      event: 'selection_change',
      payload: {
        userId: this.currentUser.id,
        elementId,
        selection,
        timestamp: new Date().toISOString(),
      },
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
    if (!this.channel || !this.currentUser) return;

    this.channel.send({
      type: 'broadcast',
      event: 'ai_response',
      payload: {
        userId: this.currentUser.id,
        conversationId,
        response,
        timestamp: new Date().toISOString(),
      },
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
    this.presenceTimer = setInterval(async () => {
      if (this.currentUser && this.channel) {
        this.currentUser.lastActive = new Date();
        await this.channel.track(this.currentUser);
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
