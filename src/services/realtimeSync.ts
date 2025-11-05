import { supabase } from '../lib/supabase';

// Simplified channel interface for local storage
interface SimpleChannel {
  on: (event: string, callback: (payload: any) => void) => SimpleChannel;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  track: (data: any) => Promise<void>;
  presenceState: () => any;
  // Internal methods for callback management
  _triggerCursorUpdate?: (cursor: LiveCursor) => void;
  _triggerEvent?: (event: CollaborationEvent) => void;
  _triggerPresenceChange?: (presence: PresenceData[]) => void;
  _presenceData?: Map<string, PresenceData>;
  _pollInterval?: number;
}

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
  private channels: Map<string, SimpleChannel> = new Map();
  private sessionId: string | null = null;
  private sessionProjectMap: Map<string, string> = new Map(); // sessionId -> projectId
  private presenceUpdateInterval?: number;
  private pollingIntervals: Map<string, number> = new Map();
  private pollingInProgress: Map<string, boolean> = new Map(); // Track if polling is in progress per project

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
    // Store session to project mapping for efficient cursor update routing
    this.sessionProjectMap.set(data.id, projectId);
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

    // Clean up session mapping
    this.sessionProjectMap.delete(this.sessionId);
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
  ): SimpleChannel {
    const channelName = `project:${projectId}`;

    // If channel exists, update callbacks and return it
    if (this.channels.has(channelName)) {
      const existingChannel = this.channels.get(channelName)!;
      // Update callbacks
      if (callbacks.onCursorUpdate) existingChannel._triggerCursorUpdate = callbacks.onCursorUpdate;
      if (callbacks.onEvent) existingChannel._triggerEvent = callbacks.onEvent;
      if (callbacks.onPresenceChange) existingChannel._triggerPresenceChange = callbacks.onPresenceChange;
      return existingChannel;
    }

    // Create presence data storage for this channel
    const presenceData = new Map<string, PresenceData>();

    // Create a simplified channel using the storage layer
    const channel: SimpleChannel = {
      _triggerCursorUpdate: callbacks.onCursorUpdate,
      _triggerEvent: callbacks.onEvent,
      _triggerPresenceChange: callbacks.onPresenceChange,
      _presenceData: presenceData,
      
      on: (_event: string, _callback: (payload: any) => void) => {
        // Store additional event callbacks if needed
        // For now, we use the direct callbacks from subscribeToProject
        // Note: This could be extended to support multiple callbacks per event type
        return channel;
      },
      
      subscribe: async () => {
        // Start polling for updates
        this.startPollingForProject(projectId, channel);
        return Promise.resolve();
      },
      
      unsubscribe: async () => {
        // Stop polling
        this.stopPollingForProject(projectId);
        return Promise.resolve();
      },
      
      track: async (data: any) => {
        // Store presence data locally
        if (data.user_id && channel._presenceData) {
          channel._presenceData.set(data.user_id, {
            user_id: data.user_id,
            username: data.username,
            cursor_position: data.cursor_position,
            current_file: data.current_file,
            status: data.status || 'online',
          });
          
          // Trigger presence change callback
          if (channel._triggerPresenceChange) {
            channel._triggerPresenceChange(Array.from(channel._presenceData.values()));
          }
        }
        return Promise.resolve();
      },
      
      presenceState: () => {
        // Return current presence state
        if (channel._presenceData) {
          const state: Record<string, PresenceData[]> = {};
          channel._presenceData.forEach((presence, userId) => {
            state[userId] = [presence];
          });
          return state;
        }
        return {};
      },
    };

    this.channels.set(channelName, channel);
    
    // Auto-subscribe when channel is created
    channel.subscribe();
    
    return channel;
  }

  private startPollingForProject(projectId: string, channel: SimpleChannel): void {
    // Stop existing polling if any
    this.stopPollingForProject(projectId);

    // Use recursive setTimeout instead of setInterval to prevent overlapping async operations
    const poll = async (): Promise<void> => {
      // Check if polling is already in progress or if channel was removed
      if (this.pollingInProgress.get(projectId) || !this.channels.has(`project:${projectId}`)) {
        return;
      }

      // Set polling flag to prevent concurrent executions
      this.pollingInProgress.set(projectId, true);

      try {
        // Poll for cursor updates
        if (channel._triggerCursorUpdate) {
          const selectQuery = supabase
            .from('live_cursors')
            .select('*')
            .eq('project_id', projectId)
            .gte('updated_at', new Date(Date.now() - 5000).toISOString()); // Last 5 seconds

          const cursorsResult = await (selectQuery as unknown as Promise<{ data: any[] | null; error: Error | null }>);
          const cursors = cursorsResult?.data;

          if (cursors && cursors.length > 0) {
            cursors.forEach((cursor: any) => {
              channel._triggerCursorUpdate?.(cursor as LiveCursor);
            });
          }
        }

        // Poll for collaboration events
        if (channel._triggerEvent) {
          const selectQuery = supabase
            .from('collaboration_events')
            .select('*')
            .eq('project_id', projectId)
            .gte('created_at', new Date(Date.now() - 5000).toISOString()) // Last 5 seconds
            .order('created_at', { ascending: false })
            .limit(10);

          const eventsResult = await (selectQuery as unknown as Promise<{ data: any[] | null; error: Error | null }>);
          const events = eventsResult?.data;

          if (events && events.length > 0) {
            events.forEach((event: any) => {
              channel._triggerEvent?.(event as CollaborationEvent);
            });
          }
        }

        // Poll for presence changes
        if (channel._triggerPresenceChange) {
          const selectQuery = supabase
            .from('workspace_sessions')
            .select('*')
            .eq('project_id', projectId)
            .eq('status', 'active')
            .gte('last_activity', new Date(Date.now() - 30000).toISOString()); // Last 30 seconds

          const sessionsResult = await (selectQuery as unknown as Promise<{ data: any[] | null; error: Error | null }>);
          const sessions = sessionsResult?.data;

          if (sessions) {
            const presenceList: PresenceData[] = sessions.map((session: any) => ({
              user_id: session.user_id,
              username: session.metadata?.username,
              cursor_position: session.cursor_position,
              current_file: session.current_file,
              status: 'online',
            }));

            // Update presence data map atomically
            if (channel._presenceData) {
              // Clear and rebuild to avoid race conditions
              const newPresenceMap = new Map<string, PresenceData>();
              presenceList.forEach(presence => {
                newPresenceMap.set(presence.user_id, presence);
              });
              // Replace the entire map atomically
              channel._presenceData = newPresenceMap;
            }

            channel._triggerPresenceChange(presenceList);
          }
        }
      } catch (error) {
        console.error('Error polling for project updates:', error);
      } finally {
        // Clear polling flag
        this.pollingInProgress.set(projectId, false);

        // Schedule next poll only if channel still exists
        if (this.channels.has(`project:${projectId}`)) {
          const timeoutId = window.setTimeout(() => {
            poll();
          }, 2000); // Poll every 2 seconds, but only after previous poll completes

          // Store timeout ID so we can cancel it
          this.pollingIntervals.set(projectId, timeoutId);
        }
      }
    };

    // Start the first poll immediately
    poll();
  }

  private stopPollingForProject(projectId: string): void {
    const timeoutId = this.pollingIntervals.get(projectId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.pollingIntervals.delete(projectId);
    }
    // Clear polling flag
    this.pollingInProgress.delete(projectId);
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
    const cursorData = {
      session_id: sessionId,
      user_id: userId,
      file_path: filePath,
      line_number: line,
      column_number: column,
      selection_start: selection?.start,
      selection_end: selection?.end,
      updated_at: new Date().toISOString(),
    };

    // Use upsert which will insert or update based on the data
    // The storage layer handles upsert by inserting/updating the record
    const upsertResult = supabase.from('live_cursors').upsert(cursorData);
    let finalData: any = cursorData;
    let error: Error | null = null;
    
    // Handle the storage layer's select() method which returns a promise-like object
    if (upsertResult.select) {
      try {
        const selectResult = upsertResult.select();
        // The select() method returns an object with then() method (thenable)
        const result = await (selectResult as unknown as Promise<any>);
        if (result && result.data !== undefined) {
          finalData = Array.isArray(result.data) ? result.data[0] : result.data;
          error = result.error || null;
        }
      } catch (err) {
        error = err as Error;
        console.error('Error upserting cursor:', err);
      }
    }

    if (error) {
      console.error('Failed to update cursor:', error);
      return;
    }

    // Immediately trigger cursor update callback for the relevant project channel
    // Get projectId from session mapping
    const projectId = this.sessionProjectMap.get(sessionId);
    
    if (projectId && finalData) {
      const channelName = `project:${projectId}`;
      const channel = this.channels.get(channelName);
      
      if (channel && channel._triggerCursorUpdate) {
        // Create LiveCursor object from the stored data
        const cursorRecord = Array.isArray(finalData) ? finalData[0] : finalData;
        const liveCursor: LiveCursor = {
          id: cursorRecord?.id || `${sessionId}-${filePath}`,
          session_id: sessionId,
          user_id: userId,
          file_path: filePath,
          line_number: line,
          column_number: column,
          selection_start: selection?.start,
          selection_end: selection?.end,
          color: cursorRecord?.color || '#06B6D4',
          updated_at: cursorData.updated_at,
        };
        channel._triggerCursorUpdate(liveCursor);
      }
    }
    // Note: If projectId is not found, the polling mechanism will still catch the update
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
    const eventData = {
      project_id: projectId,
      session_id: this.sessionId,
      event_type: eventType,
      actor_id: actorId,
      actor_name: data?.actorName,
      target_file: data?.targetFile,
      event_data: data?.eventData,
      created_at: new Date().toISOString(),
    };

      const insertResult = supabase.from('collaboration_events').insert([eventData]);
      let insertedEvent: any = eventData;
      let error: Error | null = null;
      
      // Handle the storage layer's select() method
      if (insertResult.select) {
        try {
          const selectResult = insertResult.select();
          // The select() method returns a thenable object
          const result = await (selectResult as unknown as Promise<any>);
          if (result && result.data !== undefined) {
            insertedEvent = Array.isArray(result.data) ? result.data[0] : result.data;
            error = result.error || null;
          }
        } catch (err) {
          error = err as Error;
          console.error('Error inserting event:', err);
        }
      }

    if (error) {
      console.error('Failed to log event:', error);
      return;
    }

    // Immediately trigger event callback for the channel subscribed to this project
    const channelName = `project:${projectId}`;
    const channel = this.channels.get(channelName);
    
    if (channel && channel._triggerEvent && insertedEvent) {
      const collaborationEvent: CollaborationEvent = {
        id: (insertedEvent as any).id || `event-${Date.now()}`,
        project_id: projectId,
        event_type: eventType,
        actor_id: actorId,
        actor_name: data?.actorName,
        target_file: data?.targetFile,
        event_data: data?.eventData,
        created_at: (insertedEvent as any).created_at || eventData.created_at,
      };
      channel._triggerEvent(collaborationEvent);
    }
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
      const insertResult = supabase.from('file_locks').insert([
        {
          project_id: projectId,
          file_path: filePath,
          locked_by: userId,
          lock_type: lockType,
          acquired_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      ]);

      // Handle the promise-like result
      const result = await (insertResult as unknown as Promise<{ error: Error | null }>);
      return !result?.error;
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      return false;
    }
  }

  async releaseFileLock(projectId: string, filePath: string, userId: string): Promise<void> {
    // Get all locks and filter, then delete matching ones
    // The storage layer delete() only supports eq() with a single value
    // So we need to query first, then delete by ID
    const selectQuery = supabase
      .from('file_locks')
      .select('*')
      .eq('project_id', projectId)
      .eq('file_path', filePath)
      .eq('locked_by', userId);
    
    const locksResult = await (selectQuery as unknown as Promise<{ data: any[] | null; error: Error | null }>);
    const locks = locksResult?.data;
    
    if (locks && Array.isArray(locks)) {
      for (const lock of locks) {
        if (lock.id) {
          const deleteResult = supabase.from('file_locks').delete().eq('id', lock.id);
          await (deleteResult as unknown as Promise<any>);
        }
      }
    }
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
    // Get all locks and filter expired ones, then delete them
    const { data: locks } = await supabase.from('file_locks').select('*');
    
    if (locks && Array.isArray(locks)) {
      const now = new Date().toISOString();
      for (const lock of locks) {
        if (lock.expires_at && lock.expires_at < now && lock.id) {
          await supabase.from('file_locks').delete().eq('id', lock.id);
        }
      }
    }
  }

  unsubscribeFromProject(projectId: string): void {
    const channelName = `project:${projectId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      channel.unsubscribe();
      this.stopPollingForProject(projectId);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll(): void {
    // Stop all polling timeouts
    this.pollingIntervals.forEach((timeoutId, _projectId) => {
      clearTimeout(timeoutId);
    });
    this.pollingIntervals.clear();
    // Clear all polling flags
    this.pollingInProgress.clear();

    // Unsubscribe all channels
    this.channels.forEach(channel => {
      channel.unsubscribe();
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
