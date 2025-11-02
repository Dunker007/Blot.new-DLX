import { ReactElement } from 'react';

import { RenderOptions, render } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { ...options });
}

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => ({
  from: vi.fn((_table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn(callback => callback({ data: [], error: null })),
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
});

/**
 * Mock LLM response for testing
 */
export const createMockLLMResponse = (overrides = {}) => ({
  content: 'Mock LLM response',
  model: 'test-model',
  tokens: 100,
  promptTokens: 50,
  completionTokens: 50,
  ...overrides,
});

/**
 * Mock LLM provider for testing
 */
export const createMockProvider = (overrides = {}) => ({
  id: 'test-provider-1',
  user_id: 'test-user',
  name: 'lm_studio' as const,
  endpoint_url: 'http://localhost:1234/v1',
  is_active: true,
  priority: 1,
  config: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Mock model for testing
 */
export const createMockModel = (overrides = {}) => ({
  id: 'test-model-1',
  provider_id: 'test-provider-1',
  model_name: 'test-model',
  display_name: 'Test Model',
  context_window: 4096,
  use_case: 'coding' as const,
  is_available: true,
  performance_metrics: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Mock project for testing
 */
export const createMockProject = (overrides = {}) => ({
  id: 'test-project-1',
  user_id: 'test-user',
  name: 'Test Project',
  description: 'A test project',
  project_type: 'saas' as const,
  tech_stack: ['React', 'TypeScript'],
  status: 'in_progress' as const,
  settings: {},
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Create mock fetch response
 */
export const createMockFetchResponse = (data: any, ok = true) => ({
  ok,
  status: ok ? 200 : 400,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers(),
  redirected: false,
  statusText: ok ? 'OK' : 'Bad Request',
  type: 'basic' as ResponseType,
  url: '',
  clone: vi.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: async () => new ArrayBuffer(0),
  blob: async () => new Blob(),
  formData: async () => new FormData(),
});

/**
 * Mock localStorage for testing
 */
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { vi } from 'vitest';
