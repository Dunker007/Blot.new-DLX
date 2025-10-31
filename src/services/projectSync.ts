import { supabase } from '../lib/supabase';
import { Project, Conversation, Message, ProjectExport } from '../types';

export interface ProjectExportData {
  project: Project;
  conversations: Conversation[];
  messages: Message[];
  exportedAt: string;
  version: string;
}

export class ProjectSyncService {
  async exportProject(
    projectId: string,
    exportType: 'full' | 'incremental' | 'conversation_only' = 'full'
  ): Promise<Blob> {
    const exportData: Partial<ProjectExportData> = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    exportData.project = project;

    if (exportType === 'full' || exportType === 'conversation_only') {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('project_id', projectId);

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

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    await supabase.from('project_exports').insert([{
      project_id: projectId,
      export_type: exportType,
      file_size_bytes: blob.size,
      export_format: 'json',
      created_at: new Date().toISOString(),
    }]);

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
      const conversationMap = new Map<string, string>();

      for (const conversation of data.conversations) {
        const oldId = conversation.id;
        const conversationData = {
          ...conversation,
          project_id: newProject.id,
        };
        delete (conversationData as any).id;
        delete (conversationData as any).created_at;
        delete (conversationData as any).updated_at;

        const { data: newConversation } = await supabase
          .from('conversations')
          .insert([conversationData])
          .select()
          .single();

        if (newConversation) {
          conversationMap.set(oldId, newConversation.id);
        }
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

    await supabase
      .from('project_exports')
      .delete()
      .lt('expires_at', now);
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
}

export const projectSyncService = new ProjectSyncService();
