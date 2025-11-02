import { supabase } from '../lib/supabase';
import { Conversation, Message, Project, ProjectExport } from '../types';

export interface ProjectExportData {
  project: Project;
  conversations: Conversation[];
  messages: Message[];
  exportedAt: string;
  version: string;
}

export interface SyncConflict {
  type: 'project' | 'conversation' | 'message';
  itemId: string;
  localVersion: any;
  cloudVersion: any;
  resolution?: 'local' | 'cloud' | 'merge';
}

export interface SyncResult {
  success: boolean;
  projectsUploaded: number;
  projectsDownloaded: number;
  conversationsUploaded: number;
  conversationsDownloaded: number;
  conflicts: SyncConflict[];
  errors: string[];
  timestamp: Date;
}

export interface BackupSnapshot {
  id: string;
  projectId: string;
  name: string;
  timestamp: Date;
  size: number;
  itemCount: number;
  metadata: Record<string, any>;
}

export interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'local' | 'development' | 'staging' | 'production';
  url?: string;
  status: 'active' | 'inactive' | 'deploying';
  lastDeployed?: Date;
}

export class ProjectSyncService {
  private logExports: boolean = true; // Flag to control export logging

  setExportLogging(enabled: boolean): void {
    this.logExports = enabled;
  }

  async exportProject(
    projectId: string,
    exportType: 'full' | 'incremental' | 'conversation_only' = 'full'
  ): Promise<Blob> {
    const exportData: Partial<ProjectExportData> = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    // Parallel fetch of project and related data
    const projectPromise = supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    const conversationsPromise = (exportType === 'full' || exportType === 'conversation_only')
      ? supabase.from('conversations').select('*').eq('project_id', projectId)
      : Promise.resolve({ data: null, error: null });

    const [projectResult, conversationsResult] = await Promise.all([
      projectPromise,
      conversationsPromise
    ]);

    if (!projectResult.data) {
      throw new Error('Project not found');
    }

    exportData.project = projectResult.data;

    if (exportType === 'full' || exportType === 'conversation_only') {
      const conversations = conversationsResult.data;
      exportData.conversations = conversations || [];

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);

        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: true });

        exportData.messages = messages || [];
      } else {
        exportData.messages = [];
      }
    }

    // Create blob
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Optionally log the export (async, non-blocking)
    if (this.logExports) {
      supabase.from('project_exports').insert([{
    await supabase.from('project_exports').insert([
      {
        project_id: projectId,
        export_type: exportType,
        file_size_bytes: blob.size,
        export_format: 'json',
        created_at: new Date().toISOString(),
      }]).catch(err => console.error('Failed to log export:', err));
    }
      },
    ]);

    return blob;
  }

  async importProject(file: File): Promise<Project> {
    const text = await file.text();
    const data: ProjectExportData = JSON.parse(text);

    if (!data.project) {
      throw new Error('Invalid export file: missing project data');
    }

    const projectData = {
      ...data.project,
      name: `${data.project.name} (Imported)`,
    };
    delete (projectData as any).id;
    delete (projectData as any).created_at;
    delete (projectData as any).updated_at;

    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (projectError || !newProject) {
      throw new Error('Failed to import project');
    }

    if (data.conversations && data.conversations.length > 0) {
      // Batch insert conversations instead of one-by-one
      const conversationsToInsert = data.conversations.map(conv => {
        const conversationData = {
          ...conv,
          project_id: newProject.id,
        };
        delete (conversationData as any).id;
        delete (conversationData as any).created_at;
        delete (conversationData as any).updated_at;
        return conversationData;
      });

      const { data: newConversations } = await supabase
        .from('conversations')
        .insert(conversationsToInsert)
        .select();

      // Map old IDs to new IDs
      const conversationMap = new Map<string, string>();
      if (newConversations) {
        data.conversations.forEach((oldConv, idx) => {
          if (newConversations[idx]) {
            conversationMap.set(oldConv.id, newConversations[idx].id);
          }
        });
      }

      if (data.messages && data.messages.length > 0) {
        const messagesToInsert = data.messages
          .map(message => {
            const newConversationId = conversationMap.get(message.conversation_id);
            if (!newConversationId) return null;

            const messageData = {
              ...message,
              conversation_id: newConversationId,
            };
            delete (messageData as any).id;
            delete (messageData as any).created_at;

            return messageData;
          })
          .filter(m => m !== null);

        if (messagesToInsert.length > 0) {
          await supabase.from('messages').insert(messagesToInsert);
        }
      }
    }

    return newProject;
  }

  async downloadProjectExport(projectId: string, projectName: string): Promise<void> {
    const blob = await this.exportProject(projectId, 'full');

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async getExportHistory(projectId: string): Promise<ProjectExport[]> {
    const { data, error } = await supabase
      .from('project_exports')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get export history:', error);
      return [];
    }

    return data || [];
  }

  async cleanupExpiredExports(): Promise<void> {
    const now = new Date().toISOString();

    await supabase.from('project_exports').delete().lt('expires_at', now);
  }

  async syncProjectToCloud(projectId: string): Promise<boolean> {
    try {
      const exportData = await this.exportProject(projectId, 'full');

      console.log('Syncing project to cloud:', projectId);
      console.log('Export size:', exportData.size, 'bytes');

      return true;
    } catch (error) {
      console.error('Failed to sync project:', error);
      return false;
    }
  }

  async cloneProject(projectId: string): Promise<Project | null> {
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      return null;
    }

    const clonedData = {
      ...project,
      name: `${project.name} (Copy)`,
    };
    delete (clonedData as any).id;
    delete (clonedData as any).created_at;
    delete (clonedData as any).updated_at;

    const { data: newProject, error } = await supabase
      .from('projects')
      .insert([clonedData])
      .select()
      .single();

    if (error || !newProject) {
      console.error('Failed to clone project:', error);
      return null;
    }

    return newProject;
  }

  async duplicateConversation(
    conversationId: string,
    targetProjectId?: string
  ): Promise<Conversation | null> {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return null;
    }

    const duplicatedData = {
      ...conversation,
      title: `${conversation.title} (Copy)`,
      project_id: targetProjectId || conversation.project_id,
    };
    delete (duplicatedData as any).id;
    delete (duplicatedData as any).created_at;
    delete (duplicatedData as any).updated_at;

    const { data: newConversation } = await supabase
      .from('conversations')
      .insert([duplicatedData])
      .select()
      .single();

    if (newConversation) {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messages && messages.length > 0) {
        const duplicatedMessages = messages.map(m => {
          const msgData = { ...m, conversation_id: newConversation.id };
          delete (msgData as any).id;
          delete (msgData as any).created_at;
          return msgData;
        });

        await supabase.from('messages').insert(duplicatedMessages);
      }
    }

    return newConversation;
  }

  async bidirectionalSync(
    direction: 'upload' | 'download' | 'bidirectional' = 'bidirectional'
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      projectsUploaded: 0,
      projectsDownloaded: 0,
      conversationsUploaded: 0,
      conversationsDownloaded: 0,
      conflicts: [],
      errors: [],
      timestamp: new Date(),
    };

    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!projects) {
        result.errors.push('No projects found');
        return result;
      }

      for (const project of projects) {
        const localHash = this.hashObject(project);
        const cloudHash = project.sync_hash || '';

        if (localHash !== cloudHash) {
          if (direction === 'upload' || direction === 'bidirectional') {
            await supabase
              .from('projects')
              .update({ sync_hash: localHash, last_synced: new Date().toISOString() })
              .eq('id', project.id);
            result.projectsUploaded++;
          }
        }
      }

      result.success = result.conflicts.length === 0;
      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Sync failed');
      return result;
    }
  }

  async createBackup(projectId: string, name: string): Promise<BackupSnapshot> {
    const exportBlob = await this.exportProject(projectId, 'full');
    const exportText = await exportBlob.text();
    const exportData = JSON.parse(exportText) as ProjectExportData;

    const { data, error } = await supabase
      .from('project_backups')
      .insert([
        {
          project_id: projectId,
          backup_name: name,
          backup_size: exportBlob.size,
          item_count: (exportData.conversations?.length || 0) + (exportData.messages?.length || 0),
          backup_data: exportData,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to create backup: ${error.message}`);

    return {
      id: data.id,
      projectId: data.project_id,
      name: data.backup_name,
      timestamp: new Date(data.created_at),
      size: data.backup_size,
      itemCount: data.item_count,
      metadata: data.backup_data?.project || {},
    };
  }

  async listBackups(projectId: string): Promise<BackupSnapshot[]> {
    const { data, error } = await supabase
      .from('project_backups')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to list backups:', error);
      return [];
    }

    return data.map(b => ({
      id: b.id,
      projectId: b.project_id,
      name: b.backup_name,
      timestamp: new Date(b.created_at),
      size: b.backup_size,
      itemCount: b.item_count,
      metadata: b.backup_data?.project || {},
    }));
  }

  async restoreBackup(backupId: string): Promise<Project> {
    const { data: backup, error } = await supabase
      .from('project_backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (error) throw new Error(`Failed to get backup: ${error.message}`);

    const backupData = backup.backup_data as ProjectExportData;

    await supabase.from('conversations').delete().eq('project_id', backup.project_id);

    if (backupData.conversations && backupData.conversations.length > 0) {
      const conversationsToInsert = backupData.conversations.map(c => {
        const data = { ...c };
        delete (data as any).id;
        return data;
      });

      const { data: insertedConversations } = await supabase
        .from('conversations')
        .insert(conversationsToInsert)
        .select();

      if (insertedConversations && backupData.messages) {
        const conversationIdMap = new Map<string, string>();
        backupData.conversations.forEach((original, idx) => {
          if (insertedConversations[idx]) {
            conversationIdMap.set(original.id, insertedConversations[idx].id);
          }
        });

        const messagesToInsert = backupData.messages
          .map(m => {
            const newConvId = conversationIdMap.get(m.conversation_id);
            if (!newConvId) return null;
            const data = { ...m, conversation_id: newConvId };
            delete (data as any).id;
            return data;
          })
          .filter(m => m !== null);

        if (messagesToInsert.length > 0) {
          await supabase.from('messages').insert(messagesToInsert);
        }
      }
    }

    const { data: restoredProject } = await supabase
      .from('projects')
      .select('*')
      .eq('id', backup.project_id)
      .single();

    return restoredProject;
  }

  async resolveConflict(
    conflict: SyncConflict,
    resolution: 'local' | 'cloud' | 'merge'
  ): Promise<void> {
    if (resolution === 'local') {
      // Use local version - update cloud
      await this.updateCloudVersion(conflict.type, conflict.itemId, conflict.localVersion);
    } else if (resolution === 'cloud') {
      // Use cloud version - update local (no-op in web context)
      console.log('Using cloud version for', conflict.itemId);
    } else {
      // Merge strategy
      const merged = this.mergeVersions(conflict.localVersion, conflict.cloudVersion);
      await this.updateCloudVersion(conflict.type, conflict.itemId, merged);
    }
  }

  async deployToEnvironment(
    projectId: string,
    environment: DeploymentEnvironment
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const exportData = await this.exportProject(projectId, 'full');

      await supabase.from('deployments').insert([
        {
          project_id: projectId,
          environment_type: environment.type,
          environment_name: environment.name,
          deployment_status: 'deploying',
          deployed_at: new Date().toISOString(),
        },
      ]);

      // Simulate deployment process
      console.log(`Deploying to ${environment.name}...`);

      return {
        success: true,
        url: environment.url || `https://${environment.name}.example.com`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      };
    }
  }

  async getDeploymentHistory(projectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('deployments')
      .select('*')
      .eq('project_id', projectId)
      .order('deployed_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Failed to get deployment history:', error);
      return [];
    }

    return data || [];
  }

  private hashObject(obj: any): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private async updateCloudVersion(type: string, itemId: string, version: any): Promise<void> {
    const table =
      type === 'project' ? 'projects' : type === 'conversation' ? 'conversations' : 'messages';
    await supabase.from(table).update(version).eq('id', itemId);
  }

  private mergeVersions(local: any, cloud: any): any {
    return {
      ...cloud,
      ...local,
      updated_at: new Date().toISOString(),
      merged: true,
    };
  }

  async getSyncStatus(projectId: string): Promise<{
    lastSynced?: Date;
    pendingChanges: number;
    conflicts: number;
    status: 'synced' | 'pending' | 'conflict' | 'error';
  }> {
    const { data: project } = await supabase
      .from('projects')
      .select('last_synced')
      .eq('id', projectId)
      .single();

    return {
      lastSynced: project?.last_synced ? new Date(project.last_synced) : undefined,
      pendingChanges: 0,
      conflicts: 0,
      status: 'synced',
    };
  }
}

export const projectSyncService = new ProjectSyncService();
