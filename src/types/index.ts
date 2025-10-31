export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  project_type: 'landing_page' | 'saas' | 'trading_bot' | 'affiliate' | 'chrome_extension' | 'api_service' | 'content_site';
  tech_stack: string[];
  status: 'planning' | 'in_progress' | 'deployed' | 'archived';
  repository_url?: string;
  deployment_url?: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id?: string;
  user_id: string;
  title: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: {
    model?: string;
    tokens?: number;
    attachments?: string[];
  };
  created_at: string;
}

export interface LLMProvider {
  id: string;
  user_id: string;
  name: 'lm_studio' | 'openai' | 'anthropic' | 'gemini' | 'ollama';
  endpoint_url: string;
  api_key?: string;
  is_active: boolean;
  priority: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: string;
  provider_id: string;
  model_name: string;
  display_name: string;
  context_window: number;
  use_case: 'coding' | 'analysis' | 'creative' | 'general';
  is_available: boolean;
  performance_metrics: {
    tokens_per_second?: number;
    avg_response_time?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  template_type: string;
  tech_stack: string[];
  file_structure: Record<string, any>;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}
