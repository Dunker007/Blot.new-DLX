/*
  # Real-time Collaboration and Advanced Features

  ## Overview
  This migration adds support for real-time collaboration, shared documents,
  error tracking, and advanced analytics features.

  ## New Tables

  ### 1. `shared_documents`
  Stores collaborative documents with version control
  - `id` (uuid, primary key)
  - `project_id` (uuid, link to projects)
  - `content` (text) - Document content
  - `version` (integer) - Version number for conflict resolution
  - `last_modified` (timestamptz) - Last modification timestamp
  - `created_by` (uuid, optional user)
  - `is_locked` (boolean) - Whether document is locked for editing
  - `metadata` (jsonb) - Additional document metadata
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `error_logs`
  Track application errors and user feedback
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional)
  - `project_id` (uuid, optional)
  - `error_type` (text) - Type of error
  - `error_message` (text) - Error message
  - `stack_trace` (text, optional) - Stack trace
  - `user_agent` (text, optional) - Browser info
  - `url` (text, optional) - Page where error occurred
  - `severity` (text) - Error severity level
  - `resolved` (boolean) - Whether error is resolved
  - `metadata` (jsonb) - Additional error context
  - `created_at` (timestamptz)

  ### 3. `analytics_events`
  Track user interactions and performance metrics
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional)
  - `project_id` (uuid, optional)
  - `event_type` (text) - Type of event
  - `event_data` (jsonb) - Event payload
  - `session_id` (uuid, optional) - Session identifier
  - `duration_ms` (integer, optional) - Event duration
  - `success` (boolean) - Whether event succeeded
  - `metadata` (jsonb) - Additional context
  - `created_at` (timestamptz)

  ### 4. `ai_suggestions`
  Store AI-generated code suggestions and completions
  - `id` (uuid, primary key)
  - `project_id` (uuid, link to projects)
  - `conversation_id` (uuid, optional link to conversations)
  - `suggestion_type` (text) - Type of suggestion
  - `context_code` (text) - Code context
  - `suggested_code` (text) - AI-generated suggestion
  - `confidence_score` (numeric) - AI confidence (0-1)
  - `accepted` (boolean, optional) - Whether user accepted
  - `model_used` (text) - Model that generated suggestion
  - `tokens_used` (integer) - Tokens consumed
  - `metadata` (jsonb) - Additional context
  - `created_at` (timestamptz)

  ### 5. `plugin_registry`
  Registry for extensible plugins and integrations
  - `id` (uuid, primary key)
  - `name` (text) - Plugin name
  - `version` (text) - Plugin version
  - `author` (text) - Plugin author
  - `description` (text) - Plugin description
  - `plugin_type` (text) - Type of plugin
  - `config_schema` (jsonb) - Configuration schema
  - `is_active` (boolean) - Whether plugin is active
  - `download_count` (integer) - Usage statistics
  - `rating` (numeric, optional) - User rating
  - `source_url` (text, optional) - Source code URL
  - `created_at`, `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all new tables
  - Public access for demo mode
  - Indexes for performance optimization
*/

-- Create shared_documents table
CREATE TABLE IF NOT EXISTS shared_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content text DEFAULT '',
  version integer DEFAULT 1,
  last_modified timestamptz DEFAULT now(),
  created_by uuid,
  is_locked boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to shared_documents"
  ON shared_documents FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to shared_documents"
  ON shared_documents FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to shared_documents"
  ON shared_documents FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from shared_documents"
  ON shared_documents FOR DELETE
  TO public
  USING (true);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  error_type text NOT NULL CHECK (error_type IN ('javascript', 'network', 'validation', 'api', 'ui', 'other')),
  error_message text NOT NULL,
  stack_trace text,
  user_agent text,
  url text,
  severity text DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  resolved boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to error_logs"
  ON error_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to error_logs"
  ON error_logs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to error_logs"
  ON error_logs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'page_view', 'button_click', 'ai_request', 'code_generation', 
    'project_create', 'provider_add', 'model_test', 'export', 
    'collaboration_join', 'error_boundary', 'performance'
  )),
  event_data jsonb DEFAULT '{}'::jsonb,
  session_id uuid,
  duration_ms integer,
  success boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to analytics_events"
  ON analytics_events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to analytics_events"
  ON analytics_events FOR INSERT
  TO public
  WITH CHECK (true);

-- Create ai_suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  suggestion_type text DEFAULT 'code_completion' CHECK (suggestion_type IN (
    'code_completion', 'code_generation', 'refactoring', 'bug_fix',
    'optimization', 'documentation', 'testing', 'architecture'
  )),
  context_code text DEFAULT '',
  suggested_code text NOT NULL,
  confidence_score numeric(3, 2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  accepted boolean,
  model_used text,
  tokens_used integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to ai_suggestions"
  ON ai_suggestions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to ai_suggestions"
  ON ai_suggestions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to ai_suggestions"
  ON ai_suggestions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create plugin_registry table
CREATE TABLE IF NOT EXISTS plugin_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  version text DEFAULT '1.0.0',
  author text DEFAULT 'Unknown',
  description text DEFAULT '',
  plugin_type text DEFAULT 'integration' CHECK (plugin_type IN (
    'provider', 'tool', 'integration', 'ui_component', 'workflow',
    'analytics', 'security', 'optimization', 'collaboration'
  )),
  config_schema jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  download_count integer DEFAULT 0,
  rating numeric(2, 1) CHECK (rating >= 0 AND rating <= 5),
  source_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plugin_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to plugin_registry"
  ON plugin_registry FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to plugin_registry"
  ON plugin_registry FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to plugin_registry"
  ON plugin_registry FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_documents_project_id ON shared_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_shared_documents_last_modified ON shared_documents(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_project_id ON ai_suggestions(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_suggestion_type ON ai_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_confidence_score ON ai_suggestions(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_plugin_type ON plugin_registry(plugin_type);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_is_active ON plugin_registry(is_active);

-- Insert some default plugins
INSERT INTO plugin_registry (name, description, plugin_type, is_active, config_schema) VALUES
  ('GitHub Integration', 'Connect with GitHub repositories for seamless version control', 'integration', true, 
   '{"properties": {"token": {"type": "string", "description": "GitHub personal access token"}, "repository": {"type": "string", "description": "Repository URL"}}}'::jsonb),
  ('VS Code Extension Bridge', 'Bridge to VS Code for enhanced development experience', 'tool', false,
   '{"properties": {"port": {"type": "number", "default": 8080, "description": "Bridge port"}}}'::jsonb),
  ('Advanced Code Analyzer', 'AI-powered code quality and security analysis', 'tool', true,
   '{"properties": {"languages": {"type": "array", "items": {"type": "string"}, "default": ["javascript", "typescript", "python"]}}}'::jsonb),
  ('Cost Optimizer Pro', 'Advanced token cost optimization and routing', 'optimization', true,
   '{"properties": {"aggressive_caching": {"type": "boolean", "default": false}, "cost_threshold": {"type": "number", "default": 0.1}}}'::jsonb),
  ('Team Collaboration Hub', 'Enhanced team features with shared workspaces', 'collaboration', false,
   '{"properties": {"max_collaborators": {"type": "number", "default": 5}, "real_time_sync": {"type": "boolean", "default": true}}}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Update plugin download counts to simulate usage
UPDATE plugin_registry SET 
  download_count = FLOOR(RANDOM() * 1000) + 100,
  rating = ROUND((RANDOM() * 2 + 3)::numeric, 1)
WHERE download_count = 0;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_shared_documents_updated_at BEFORE UPDATE ON shared_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plugin_registry_updated_at BEFORE UPDATE ON plugin_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();