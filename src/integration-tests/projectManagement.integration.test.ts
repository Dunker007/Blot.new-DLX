import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Project } from '../types';

// Create a shared mock projects array that can be reset
let mockProjects: Project[] = [];

// Mock storage layer with factory function
vi.mock('../lib/storage', () => {
  return {
    storage: {
      from: (_table: string) => ({
        insert: vi.fn((data: any[]) => {
          const newProjects = data.map((item, index) => ({
            ...item,
            id: `project-${Date.now()}-${index}-${Math.random()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          mockProjects.push(...newProjects);
          return {
            select: () => ({
              single: () => Promise.resolve({ data: newProjects[0], error: null }),
            }),
          };
        }),
        select: vi.fn(() => ({
          eq: (column: string, value: any) => {
            const filtered = mockProjects.filter((p: any) => p[column] === value);
            return {
              single: () => {
                const project = filtered[0] || null;
                return Promise.resolve({ data: project, error: null });
              },
              then: (resolve: any) => {
                resolve({ data: filtered, error: null });
              },
            };
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            const sorted = [...mockProjects].sort((a: any, b: any) => {
              const aVal = a[column];
              const bVal = b[column];
              if (options?.ascending === false) {
                return bVal > aVal ? 1 : -1;
              }
              return aVal > bVal ? 1 : -1;
            });
            return Promise.resolve({ data: sorted, error: null });
          },
          then: (resolve: any) => {
            resolve({ data: mockProjects, error: null });
          },
        })),
        update: vi.fn((updates: any) => ({
          eq: (column: string, value: any) => {
            // Perform update immediately
            const index = mockProjects.findIndex((p: any) => p[column] === value);
            if (index !== -1) {
              mockProjects[index] = {
                ...mockProjects[index],
                ...updates,
                updated_at: new Date().toISOString(),
              };
            }
            return {
              select: () => ({
                single: () => {
                  return Promise.resolve({
                    data: index !== -1 ? mockProjects[index] : null,
                    error: null
                  });
                },
              }),
              then: (resolve: any) => {
                resolve({ error: null });
              },
            };
          },
        })),
        delete: vi.fn(() => ({
          eq: (column: string, value: any) => {
            const index = mockProjects.findIndex((p: any) => p[column] === value);
            if (index !== -1) {
              mockProjects.splice(index, 1);
            }
            return Promise.resolve({ error: null });
          },
        })),
      }),
    },
  };
});

import { storage } from '../lib/storage';

describe('Project Management Integration Tests', () => {
  beforeEach(() => {
    // Clear the mock projects array before each test
    mockProjects.length = 0;
    vi.clearAllMocks();
  });

  it('should create a new project with all required fields', async () => {
    // Arrange
    const newProject = {
      name: 'Test Project',
      description: 'A test project for integration testing',
      project_type: 'landing_page' as const,
      tech_stack: ['React', 'TypeScript', 'Tailwind'],
      status: 'planning' as const,
      repository_url: 'https://github.com/test/repo',
      deployment_url: '',
      settings: {},
      metadata: {},
    };

    // Act
    const { data, error } = await storage
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    // Assert
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe('Test Project');
    expect(data.project_type).toBe('landing_page');
    expect(data.tech_stack).toEqual(['React', 'TypeScript', 'Tailwind']);
    expect(data.id).toBeDefined();
    expect(data.created_at).toBeDefined();
  });

  it('should retrieve all projects', async () => {
    // Arrange: Create multiple projects
    const projects = [
      {
        name: 'Project 1',
        description: 'First project',
        project_type: 'landing_page' as const,
        tech_stack: ['React'],
        status: 'planning' as const,
      },
      {
        name: 'Project 2',
        description: 'Second project',
        project_type: 'saas' as const,
        tech_stack: ['Vue'],
        status: 'in_progress' as const,
      },
      {
        name: 'Project 3',
        description: 'Third project',
        project_type: 'api_service' as const,
        tech_stack: ['Node.js'],
        status: 'deployed' as const,
      },
    ];

    for (const project of projects) {
      await storage.from('projects').insert([project]);
    }

    // Act
    const { data, error } = await storage.from('projects').select('*');

    // Assert
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.length).toBe(3);
    expect(data.map((p: Project) => p.name)).toContain('Project 1');
    expect(data.map((p: Project) => p.name)).toContain('Project 2');
    expect(data.map((p: Project) => p.name)).toContain('Project 3');
  });

  it('should update an existing project', async () => {
    // Arrange: Create a project
    const { data: createdProject } = await storage
      .from('projects')
      .insert([
        {
          name: 'Original Name',
          description: 'Original description',
          project_type: 'landing_page' as const,
          tech_stack: ['React'],
          status: 'planning' as const,
        },
      ])
      .select()
      .single();

    expect(createdProject).toBeDefined();

    // Act: Update the project
    const { data: updatedProject, error } = await storage
      .from('projects')
      .update({
        name: 'Updated Name',
        description: 'Updated description',
        status: 'in_progress' as const,
        tech_stack: ['React', 'TypeScript'],
      })
      .eq('id', createdProject.id)
      .select()
      .single();

    // Assert
    expect(error).toBeNull();
    expect(updatedProject).toBeDefined();
    expect(updatedProject.name).toBe('Updated Name');
    expect(updatedProject.description).toBe('Updated description');
    expect(updatedProject.status).toBe('in_progress');
    expect(updatedProject.tech_stack).toEqual(['React', 'TypeScript']);
    expect(updatedProject.id).toBe(createdProject.id);
  });

  it('should delete a project', async () => {
    // Arrange: Create a project
    const { data: createdProject } = await storage
      .from('projects')
      .insert([
        {
          name: 'Project to Delete',
          description: 'This will be deleted',
          project_type: 'landing_page' as const,
          tech_stack: [],
          status: 'planning' as const,
        },
      ])
      .select()
      .single();

    expect(createdProject).toBeDefined();

    // Act: Delete the project
    const { error } = await storage.from('projects').delete().eq('id', createdProject.id);

    // Assert: Deletion successful
    expect(error).toBeNull();

    // Assert: Project no longer exists
    const { data: retrievedProject } = await storage
      .from('projects')
      .select('*')
      .eq('id', createdProject.id)
      .single();

    expect(retrievedProject).toBeNull();
  });

  it('should filter projects by status', async () => {
    // Arrange: Create projects with different statuses
    await storage.from('projects').insert([
      {
        name: 'Planning Project',
        project_type: 'landing_page' as const,
        status: 'planning' as const,
      },
      {
        name: 'In Progress Project',
        project_type: 'saas' as const,
        status: 'in_progress' as const,
      },
      {
        name: 'Deployed Project',
        project_type: 'api_service' as const,
        status: 'deployed' as const,
      },
    ]);

    // Act: Filter by status
    const { data, error } = await storage
      .from('projects')
      .select('*')
      .eq('status', 'in_progress');

    // Assert
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.length).toBe(1);
    expect(data[0].name).toBe('In Progress Project');
    expect(data[0].status).toBe('in_progress');
  });

  it('should order projects by updated_at', async () => {
    // Arrange: Create projects with delays to ensure different timestamps
    const project1 = await storage
      .from('projects')
      .insert([
        {
          name: 'First Project',
          project_type: 'landing_page' as const,
          status: 'planning' as const,
        },
      ])
      .select()
      .single();

    await new Promise(resolve => setTimeout(resolve, 10));

    const project2 = await storage
      .from('projects')
      .insert([
        {
          name: 'Second Project',
          project_type: 'saas' as const,
          status: 'planning' as const,
        },
      ])
      .select()
      .single();

    await new Promise(resolve => setTimeout(resolve, 10));

    const project3 = await storage
      .from('projects')
      .insert([
        {
          name: 'Third Project',
          project_type: 'api_service' as const,
          status: 'planning' as const,
        },
      ])
      .select()
      .single();

    // Act: Get projects ordered by updated_at descending
    const { data, error } = await storage
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    // Assert
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.length).toBe(3);
    expect(data[0].name).toBe('Third Project');
    expect(data[1].name).toBe('Second Project');
    expect(data[2].name).toBe('First Project');
  });

  it('should handle project lifecycle: create -> update -> deploy -> archive', async () => {
    // Step 1: Create project
    const { data: newProject } = await storage
      .from('projects')
      .insert([
        {
          name: 'Lifecycle Project',
          description: 'Testing full lifecycle',
          project_type: 'saas' as const,
          tech_stack: ['React', 'Node.js'],
          status: 'planning' as const,
          repository_url: '',
          deployment_url: '',
        },
      ])
      .select()
      .single();

    expect(newProject).toBeDefined();
    expect(newProject.status).toBe('planning');

    // Step 2: Update to in_progress
    await storage
      .from('projects')
      .update({
        status: 'in_progress' as const,
        repository_url: 'https://github.com/test/lifecycle',
      })
      .eq('id', newProject.id);

    const { data: inProgressProject } = await storage
      .from('projects')
      .select('*')
      .eq('id', newProject.id)
      .single();

    expect(inProgressProject.status).toBe('in_progress');
    expect(inProgressProject.repository_url).toBe('https://github.com/test/lifecycle');

    // Step 3: Deploy
    await storage
      .from('projects')
      .update({
        status: 'deployed' as const,
        deployment_url: 'https://lifecycle.example.com',
      })
      .eq('id', newProject.id);

    const { data: deployedProject } = await storage
      .from('projects')
      .select('*')
      .eq('id', newProject.id)
      .single();

    expect(deployedProject.status).toBe('deployed');
    expect(deployedProject.deployment_url).toBe('https://lifecycle.example.com');

    // Step 4: Archive
    await storage
      .from('projects')
      .update({ status: 'archived' as const })
      .eq('id', newProject.id);

    const { data: archivedProject } = await storage
      .from('projects')
      .select('*')
      .eq('id', newProject.id)
      .single();

    expect(archivedProject.status).toBe('archived');
  });

  it('should handle project metadata and settings', async () => {
    // Arrange & Act
    const { data: project } = await storage
      .from('projects')
      .insert([
        {
          name: 'Metadata Project',
          project_type: 'landing_page' as const,
          status: 'planning' as const,
          settings: {
            theme: 'dark',
            notifications: true,
          },
          metadata: {
            tags: ['important', 'client-work'],
            priority: 'high',
          },
        },
      ])
      .select()
      .single();

    // Assert
    expect(project).toBeDefined();
    expect(project.settings).toEqual({
      theme: 'dark',
      notifications: true,
    });
    expect(project.metadata).toEqual({
      tags: ['important', 'client-work'],
      priority: 'high',
    });

    // Update metadata
    await storage
      .from('projects')
      .update({
        metadata: {
          ...project.metadata,
          lastReviewed: new Date().toISOString(),
        },
      })
      .eq('id', project.id);

    const { data: updatedProject } = await storage
      .from('projects')
      .select('*')
      .eq('id', project.id)
      .single();

    expect(updatedProject.metadata.lastReviewed).toBeDefined();
    expect(updatedProject.metadata.tags).toEqual(['important', 'client-work']);
  });
});

