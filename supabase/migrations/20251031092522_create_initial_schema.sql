/*
  # Create DLX Studios Initial Schema

  ## Overview
  This migration creates the complete database schema for DLX Studios - an AI-powered web development command center.

  ## New Tables
  
  ### 1. `llm_providers`
  Stores configuration for LLM providers (LM Studio, Ollama, OpenAI, etc.)
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional - for multi-user support later)
  - `name` (text) - Provider type
  - `endpoint_url` (text) - API endpoint
  - `api_key` (text, optional) - API authentication key
  - `is_active` (boolean) - Whether provider is enabled
  - `priority` (integer) - Failover priority
  - `config` (jsonb) - Additional configuration
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `models`
  Stores available AI models for each provider
  - `id` (uuid, primary key)
  - `provider_id` (uuid, foreign key to llm_providers)
  - `model_name` (text) - Internal model identifier
  - `display_name` (text) - Human-readable name
  - `context_window` (integer) - Token context limit
  - `use_case` (text) - Model specialization
  - `is_available` (boolean) - Whether model is currently available
  - `performance_metrics` (jsonb) - Speed and quality metrics
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `projects`
  Stores user projects and their configurations
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional)
  - `name` (text) - Project name
  - `description` (text) - Project description
  - `project_type` (text) - Type of project being built
  - `tech_stack` (text array) - Technologies used
  - `status` (text) - Current project status
  - `repository_url` (text, optional) - Git repository
  - `deployment_url` (text, optional) - Live deployment URL
  - `settings` (jsonb) - Project-specific settings
  - `metadata` (jsonb) - Additional metadata
  - `created_at`, `updated_at` (timestamptz)

  ### 4. `conversations`
  Stores AI chat conversations
  - `id` (uuid, primary key)
  - `project_id` (uuid, optional, foreign key to projects)
  - `user_id` (uuid, optional)
  - `title` (text) - Conversation title
  - `context` (jsonb) - Conversation context and metadata
  - `created_at`, `updated_at` (timestamptz)

  ### 5. `messages`
  Stores individual messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key to conversations)
  - `role` (text) - user, assistant, or system
  - `content` (text) - Message content
  - `metadata` (jsonb) - Model info, tokens, attachments
  - `created_at` (timestamptz)

  ### 6. `project_templates`
  Stores reusable project templates
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional)
  - `name` (text) - Template name
  - `description` (text) - Template description
  - `template_type` (text) - Category of template
  - `tech_stack` (text array) - Default technologies
  - `file_structure` (jsonb) - File/folder structure
  - `is_public` (boolean) - Whether template is shared
  - `usage_count` (integer) - How many times used
  - `created_at`, `updated_at` (timestamptz)

  ### 7. `trading_strategies`
  Stores trading bot configurations and strategies
  - `id` (uuid, primary key)
  - `project_id` (uuid, optional, foreign key to projects)
  - `user_id` (uuid, optional)
  - `name` (text) - Strategy name
  - `description` (text) - Strategy description
  - `strategy_type` (text) - Type of trading strategy
  - `parameters` (jsonb) - Strategy parameters
  - `is_active` (boolean) - Whether strategy is running
  - `performance_metrics` (jsonb) - Backtesting results
  - `created_at`, `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public access policies for demo/development mode
  - Ready for user authentication integration

  ## Notes
  - All IDs use gen_random_uuid() for automatic generation
  - Timestamps automatically set with now()
  - Foreign keys use ON DELETE CASCADE for cleanup
  - JSONB columns for flexible metadata storage
*/

-- Create llm_providers table
CREATE TABLE IF NOT EXISTS llm_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL CHECK (name IN ('lm_studio', 'openai', 'anthropic', 'gemini', 'ollama')),
  endpoint_url text NOT NULL,
  api_key text,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE llm_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to llm_providers"
  ON llm_providers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to llm_providers"
  ON llm_providers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to llm_providers"
  ON llm_providers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from llm_providers"
  ON llm_providers FOR DELETE
  TO public
  USING (true);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,
  model_name text NOT NULL,
  display_name text NOT NULL,
  context_window integer DEFAULT 4096,
  use_case text DEFAULT 'general' CHECK (use_case IN ('coding', 'analysis', 'creative', 'general')),
  is_available boolean DEFAULT true,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to models"
  ON models FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to models"
  ON models FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to models"
  ON models FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from models"
  ON models FOR DELETE
  TO public
  USING (true);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  description text DEFAULT '',
  project_type text DEFAULT 'landing_page' CHECK (project_type IN ('landing_page', 'saas', 'trading_bot', 'affiliate', 'chrome_extension', 'api_service', 'content_site')),
  tech_stack text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'deployed', 'archived')),
  repository_url text,
  deployment_url text,
  settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to projects"
  ON projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to projects"
  ON projects FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to projects"
  ON projects FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from projects"
  ON projects FOR DELETE
  TO public
  USING (true);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid,
  title text DEFAULT 'New Conversation',
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to conversations"
  ON conversations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to conversations"
  ON conversations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to conversations"
  ON conversations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from conversations"
  ON conversations FOR DELETE
  TO public
  USING (true);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to messages"
  ON messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to messages"
  ON messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to messages"
  ON messages FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from messages"
  ON messages FOR DELETE
  TO public
  USING (true);

-- Create project_templates table
CREATE TABLE IF NOT EXISTS project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  description text DEFAULT '',
  template_type text NOT NULL,
  tech_stack text[] DEFAULT ARRAY[]::text[],
  file_structure jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to project_templates"
  ON project_templates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to project_templates"
  ON project_templates FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to project_templates"
  ON project_templates FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from project_templates"
  ON project_templates FOR DELETE
  TO public
  USING (true);

-- Create trading_strategies table
CREATE TABLE IF NOT EXISTS trading_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid,
  name text NOT NULL,
  description text DEFAULT '',
  strategy_type text DEFAULT 'trend_following' CHECK (strategy_type IN ('trend_following', 'mean_reversion', 'arbitrage', 'market_making', 'custom')),
  parameters jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to trading_strategies"
  ON trading_strategies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to trading_strategies"
  ON trading_strategies FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to trading_strategies"
  ON trading_strategies FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from trading_strategies"
  ON trading_strategies FOR DELETE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_models_provider_id ON models(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_project_id ON trading_strategies(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_llm_providers_is_active ON llm_providers(is_active);

-- Insert default LM Studio provider
INSERT INTO llm_providers (name, endpoint_url, is_active, priority, config)
VALUES ('lm_studio', 'http://localhost:1234', true, 1, '{"description": "Local LM Studio instance"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert some default project templates
INSERT INTO project_templates (name, description, template_type, tech_stack, is_public, file_structure)
VALUES 
  ('React SaaS Starter', 'Full-featured SaaS application with authentication, billing, and dashboard', 'saas', 
   ARRAY['react', 'typescript', 'tailwind', 'supabase'], true,
   '{"src": {"components": {}, "pages": {}, "utils": {}}, "public": {}}'::jsonb),
  ('Landing Page', 'Modern, responsive landing page with hero, features, and CTA sections', 'landing_page',
   ARRAY['react', 'typescript', 'tailwind'], true,
   '{"src": {"components": {}, "assets": {}}, "public": {}}'::jsonb),
  ('Trading Bot', 'Crypto trading bot with strategy backtesting and live trading', 'trading_bot',
   ARRAY['typescript', 'nodejs', 'ccxt'], true,
   '{"src": {"strategies": {}, "indicators": {}, "utils": {}}, "config": {}}'::jsonb)
ON CONFLICT DO NOTHING;