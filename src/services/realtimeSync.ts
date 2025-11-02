import { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

export interface WorkspaceSession {
  id: string;
  user_id: string;
  project_id: string;
  session_token: string;
  status: 'active' | 'idle' | 'disconnected';
  current_file?: string;
  cursor_position?: any;
  metadata?: any;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export interface LiveCursor {
  id: string;
  session_id: string;
  user_id: string;
  file_path: string;
  line_number: number;
  column_number: number;
  selection_start?: any;
  selection_end?: any;
  color: string;
  updated_at: string;
}

export interface PresenceData {
  user_id: string;
  username?: string;
  cursor_position?: { line: number; column: number };
  current_file?: string;
  status: 'online' | 'away' | 'busy';
}

export interface CollaborationEvent {
  id: string;
  project_id: string;
  event_type:
    | 'join'
    | 'leave'
    | 'edit'
    | 'comment'
    | 'lock'
    | 'unlock'
    | 'cursor_move'
    | 'file_open'
    | 'file_close';
  actor_id: string;
  actor_name?: string;
  target_file?: string;
  event_data?: any;
  created_at: string;
}

export class RealtimeSyncService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private sessionId: string | null = null;
  private presenceUpdateInterval?: number;

  async createSession(projectId: string, userId: string): Promise<WorkspaceSession | null> {
    const sessionToken = this.generateSessionToken();

    const { data, error } = await supabase
      .from('workspace_sessions')
      .insert([
        {
          user_id: userId,
          project_id: projectId,
          session_token: sessionToken,
          status: 'active',
          last_activity: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to create session:', error);
      return null;
    }

    this.sessionId = data.id;
    this.startPresenceUpdates();

    return data;
  }

  async updateSessionActivity(): Promise<void> {
    if (!this.sessionId) return;

    await supabase
      .from('workspace_sessions')
      .update({
        last_activity: new Date().toISOString(),
        status: 'active',
      })
      .eq('id', this.sessionId);
  }

  async endSession(): Promise<void> {
    if (!this.sessionId) return;

    await supabase
      .from('workspace_sessions')
      .update({ status: 'disconnected' })
      .eq('id', this.sessionId);

    this.stopPresenceUpdates();
    this.sessionId = null;
  }

  subscribeToProject(
    projectId: string,
    callbacks: {
      onCursorUpdate?: (cursor: LiveCursor) => void;
      onEvent?: (event: CollaborationEvent) => void;
      onPresenceChange?: (presence: PresenceData[]) => void;
    }
  ): RealtimeChannel {
    const channelName = `project:${projectId}`;

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_cursors',
          filter: `session_id=in.(select id from workspace_sessions where project_id=eq.${projectId})`,
        },
        payload => {
          if (callbacks.onCursorUpdate && payload.new) {
            callbacks.onCursorUpdate(payload.new as LiveCursor);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_events',
          filter: `project_id=eq.${projectId}`,
        },
        payload => {
          if (callbacks.onEvent && payload.new) {
            callbacks.onEvent(payload.new as CollaborationEvent);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const presenceList = Object.values(state).flat() as PresenceData[];

        if (callbacks.onPresenceChange) {
          callbacks.onPresenceChange(presenceList);
        }
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  async trackPresence(projectId: string, data: Partial<PresenceData>): Promise<void> {
    const channel = this.channels.get(`project:${projectId}`);

    if (!channel) {
      console.warn('No active channel for project:', projectId);
      return;
    }

    await channel.track({
      user_id: data.user_id,
      username: data.username,
      cursor_position: data.cursor_position,
      current_file: data.current_file,
      status: data.status || 'online',
      online_at: new Date().toISOString(),
    });
  }

  async updateCursor(
    sessionId: string,
    userId: string,
    filePath: string,
    line: number,
    column: number,
    selection?: { start: any; end: any }
  ): Promise<void> {
    const { error } = await supabase.from('live_cursors').upsert(
      {
        session_id: sessionId,
        user_id: userId,
        file_path: filePath,
        line_number: line,
        column_number: column,
        selection_start: selection?.start,
        selection_end: selection?.end,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'session_id,file_path',
      }
    );

    if (error) {
      console.error('Failed to update cursor:', error);
    }
  }

  async logEvent(
    projectId: string,
    eventType: CollaborationEvent['event_type'],
    actorId: string,
    data?: {
      actorName?: string;
      targetFile?: string;
      eventData?: any;
    }
  ): Promise<void> {
    await supabase.from('collaboration_events').insert([
      {
        project_id: projectId,
        session_id: this.sessionId,
        event_type: eventType,
        actor_id: actorId,
        actor_name: data?.actorName,
        target_file: data?.targetFile,
        event_data: data?.eventData,
      },
    ]);
  }

  async getActiveUsers(projectId: string): Promise<WorkspaceSession[]> {
    const { data, error } = await supabase
      .from('workspace_sessions')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (error) {
      console.error('Failed to get active users:', error);
      return [];
    }

    return data || [];
  }

  async acquireFileLock(
    projectId: string,
    filePath: string,
    userId: string,
    lockType: 'read' | 'write' | 'exclusive' = 'write'
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('file_locks').insert([
        {
          project_id: projectId,
          file_path: filePath,
          locked_by: userId,
          lock_type: lockType,
          acquired_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      ]);

      return !error;
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      return false;
    }
  }

  async releaseFileLock(projectId: string, filePath: string, userId: string): Promise<void> {
    await supabase
      .from('file_locks')
      .delete()
      .eq('project_id', projectId)
      .eq('file_path', filePath)
      .eq('locked_by', userId);
  }

  async checkFileLock(
    projectId: string,
    filePath: string
  ): Promise<{
    locked: boolean;
    lockedBy?: string;
    expiresAt?: string;
  }> {
    const { data } = await supabase
      .from('file_locks')
      .select('*')
      .eq('project_id', projectId)
      .eq('file_path', filePath)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (!data) {
      return { locked: false };
    }

    return {
      locked: true,
      lockedBy: data.locked_by,
      expiresAt: data.expires_at,
    };
  }

  async cleanupExpiredLocks(): Promise<void> {
    await supabase.from('file_locks').delete().lt('expires_at', new Date().toISOString());
  }

  unsubscribeFromProject(projectId: string): void {
    const channelName = `project:${projectId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.stopPresenceUpdates();
  }

  private generateSessionToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private startPresenceUpdates(): void {
    this.presenceUpdateInterval = window.setInterval(() => {
      this.updateSessionActivity();
    }, 30000);
  }

  private stopPresenceUpdates(): void {
    if (this.presenceUpdateInterval) {
      clearInterval(this.presenceUpdateInterval);
      this.presenceUpdateInterval = undefined;
    }
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  isConnected(): boolean {
    return this.sessionId !== null;
  }

  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

export const realtimeSyncService = new RealtimeSyncService();
