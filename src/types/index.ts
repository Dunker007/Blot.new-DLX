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

export interface TradingStrategy {
  id: string;
  project_id?: string;
  user_id: string;
  name: string;
  description: string;
  strategy_type: 'trend_following' | 'mean_reversion' | 'arbitrage' | 'market_making' | 'custom';
  parameters: Record<string, any>;
  is_active: boolean;
  performance_metrics: {
    total_trades?: number;
    win_rate?: number;
    profit_loss?: number;
    sharpe_ratio?: number;
    max_drawdown?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface TokenUsageLog {
  id: string;
  conversation_id?: string;
  project_id?: string;
  provider_id: string;
  model_id: string;
  user_id?: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  response_time_ms: number;
  status: 'success' | 'failed' | 'cached' | 'rate_limited';
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ProviderConfig {
  id: string;
  provider_id: string;
  cost_per_input_token: number;
  cost_per_output_token: number;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  token_limit_per_request: number;
  is_free: boolean;
  config_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TokenBudget {
  id: string;
  user_id?: string;
  project_id?: string;
  budget_type: 'daily' | 'monthly' | 'project' | 'total';
  token_limit: number;
  tokens_used: number;
  cost_limit: number;
  cost_spent: number;
  reset_at: string;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeploymentEnvironment {
  id: string;
  environment_name: 'local' | 'cloud' | 'hybrid';
  user_id?: string;
  is_primary: boolean;
  sync_enabled: boolean;
  settings: Record<string, any>;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectExport {
  id: string;
  project_id: string;
  export_type: 'full' | 'incremental' | 'conversation_only';
  file_size_bytes: number;
  export_format: 'json' | 'zip';
  storage_path?: string;
  expires_at: string;
  created_at: string;
}

export interface EnhancedLLMProvider extends LLMProvider {
  provider_type: 'local' | 'cloud' | 'hybrid';
  health_status: 'healthy' | 'degraded' | 'down' | 'unknown';
  last_health_check?: string;
}

export interface EnhancedModel extends Model {
  cost_tier: 'free' | 'low' | 'medium' | 'high' | 'premium';
  is_local: boolean;
}

export interface KnowledgeBase {
  id: string;
  user_id?: string;
  project_id?: string;
  category: 'persona' | 'handoff' | 'context' | 'snippet' | 'template' | 'tip' | 'note' | 'general';
  title: string;
  content: string;
  tags: string[];
  metadata: Record<string, any>;
  is_pinned: boolean;
  is_archived: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AgentPersona {
  id: string;
  user_id?: string;
  name: string;
  role: 'developer' | 'designer' | 'analyst' | 'architect' | 'devops' | 'assistant' | 'specialist';
  description: string;
  traits: Record<string, any>;
  capabilities: string[];
  communication_style: string;
  preferred_tools: string[];
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentHandoff {
  id: string;
  project_id?: string;
  conversation_id?: string;
  from_persona_id?: string;
  to_persona_id?: string;
  context_summary: string;
  current_state: string;
  next_steps: string[];
  warnings: string[];
  code_references: Record<string, any>;
  dependencies: string[];
  created_at: string;
}

export interface MemoryContext {
  id: string;
  project_id: string;
  context_type: 'session' | 'task' | 'feature' | 'bugfix' | 'refactor' | 'research';
  title: string;
  content: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  priority: number;
  related_files: string[];
  decisions_made: Record<string, any>;
  blockers: string[];
  created_at: string;
  updated_at: string;
}

export interface KnowledgeSnippet {
  id: string;
  user_id?: string;
  language: string;
  title: string;
  description: string;
  code: string;
  tags: string[];
  usage_count: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
