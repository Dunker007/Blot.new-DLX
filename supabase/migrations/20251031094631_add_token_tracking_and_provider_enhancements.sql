/*
  # Enhanced Token Tracking and Provider Management

  ## Overview
  This migration enhances the DLX Studios platform with comprehensive token tracking,
  cost management, and provider optimization features for the DIY/.new harmony architecture.

  ## New Tables

  ### 1. `token_usage_logs`
  Tracks every LLM API call with detailed token consumption and cost data
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, optional link to conversations)
  - `project_id` (uuid, optional link to projects)
  - `provider_id` (uuid, link to llm_providers)
  - `model_id` (uuid, link to models)
  - `user_id` (uuid, optional for multi-user support)
  - `prompt_tokens` (integer) - Input token count
  - `completion_tokens` (integer) - Output token count
  - `total_tokens` (integer) - Total tokens used
  - `estimated_cost` (numeric) - Cost in USD
  - `response_time_ms` (integer) - API response time
  - `status` (text) - success, failed, cached
  - `error_message` (text, optional) - Error details if failed
  - `metadata` (jsonb) - Additional context
  - `created_at` (timestamptz)

  ### 2. `provider_configs`
  Extended configuration for LLM providers including costs and limits
  - `id` (uuid, primary key)
  - `provider_id` (uuid, link to llm_providers)
  - `cost_per_input_token` (numeric) - Cost per 1M input tokens
  - `cost_per_output_token` (numeric) - Cost per 1M output tokens
  - `rate_limit_per_minute` (integer) - Max requests per minute
  - `rate_limit_per_day` (integer) - Max requests per day
  - `token_limit_per_request` (integer) - Max tokens per single request
  - `is_free` (boolean) - Whether provider is free (local models)
  - `config_metadata` (jsonb) - Additional settings
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `token_budgets`
  User/project token budgets and spending limits
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional)
  - `project_id` (uuid, optional)
  - `budget_type` (text) - daily, monthly, project, total
  - `token_limit` (bigint) - Max tokens allowed
  - `tokens_used` (bigint) - Current usage
  - `cost_limit` (numeric) - Max cost in USD
  - `cost_spent` (numeric) - Current spending
  - `reset_at` (timestamptz) - When budget resets
  - `alert_threshold` (integer) - Percent to trigger alert
  - `is_active` (boolean)
  - `created_at`, `updated_at` (timestamptz)

  ### 4. `deployment_environments`
  Track deployment mode (local DIY vs cloud .new)
  - `id` (uuid, primary key)
  - `environment_name` (text) - local, cloud, hybrid
  - `user_id` (uuid, optional)
  - `is_primary` (boolean) - Primary environment for user
  - `sync_enabled` (boolean) - Whether to sync with cloud
  - `settings` (jsonb) - Environment-specific settings
  - `last_sync_at` (timestamptz)
  - `created_at`, `updated_at` (timestamptz)

  ### 5. `project_exports`
  Track project export/import history for sync
  - `id` (uuid, primary key)
  - `project_id` (uuid, link to projects)
  - `export_type` (text) - full, incremental, conversation_only
  - `file_size_bytes` (bigint)
  - `export_format` (text) - json, zip
  - `storage_path` (text) - Where export is stored
  - `expires_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Modified Tables

  ### Enhanced `llm_providers`
  - Added `provider_type` to distinguish local vs cloud
  - Added `health_status` for monitoring
  - Added `last_health_check` timestamp

  ### Enhanced `models`
  - Added `cost_tier` for pricing categories
  - Added `is_local` flag to identify local models

  ## Security
  - RLS enabled on all new tables
  - Public access for demo mode (ready for auth)
  - Indexes for performance on frequently queried columns

  ## Notes
  - Token costs stored in USD (can be converted to other currencies in app)
  - Supports both free local models and paid cloud APIs
  - Ready for multi-tenant architecture with user_id fields
*/

-- Add columns to existing llm_providers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'llm_providers' AND column_name = 'provider_type'
  ) THEN
    ALTER TABLE llm_providers ADD COLUMN provider_type text DEFAULT 'local' CHECK (provider_type IN ('local', 'cloud', 'hybrid'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'llm_providers' AND column_name = 'health_status'
  ) THEN
    ALTER TABLE llm_providers ADD COLUMN health_status text DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'down', 'unknown'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'llm_providers' AND column_name = 'last_health_check'
  ) THEN
    ALTER TABLE llm_providers ADD COLUMN last_health_check timestamptz;
  END IF;
END $$;

-- Add columns to existing models table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'cost_tier'
  ) THEN
    ALTER TABLE models ADD COLUMN cost_tier text DEFAULT 'free' CHECK (cost_tier IN ('free', 'low', 'medium', 'high', 'premium'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'models' AND column_name = 'is_local'
  ) THEN
    ALTER TABLE models ADD COLUMN is_local boolean DEFAULT true;
  END IF;
END $$;

-- Create token_usage_logs table
CREATE TABLE IF NOT EXISTS token_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES llm_providers(id) ON DELETE CASCADE,
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  user_id uuid,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  estimated_cost numeric(10, 6) DEFAULT 0,
  response_time_ms integer DEFAULT 0,
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed', 'cached', 'rate_limited')),
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to token_usage_logs"
  ON token_usage_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to token_usage_logs"
  ON token_usage_logs FOR INSERT
  TO public
  WITH CHECK (true);

-- Create provider_configs table
CREATE TABLE IF NOT EXISTS provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,
  cost_per_input_token numeric(12, 8) DEFAULT 0,
  cost_per_output_token numeric(12, 8) DEFAULT 0,
  rate_limit_per_minute integer DEFAULT 60,
  rate_limit_per_day integer DEFAULT 10000,
  token_limit_per_request integer DEFAULT 8192,
  is_free boolean DEFAULT false,
  config_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider_id)
);

ALTER TABLE provider_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to provider_configs"
  ON provider_configs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to provider_configs"
  ON provider_configs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to provider_configs"
  ON provider_configs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from provider_configs"
  ON provider_configs FOR DELETE
  TO public
  USING (true);

-- Create token_budgets table
CREATE TABLE IF NOT EXISTS token_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  budget_type text DEFAULT 'monthly' CHECK (budget_type IN ('daily', 'monthly', 'project', 'total')),
  token_limit bigint DEFAULT 1000000,
  tokens_used bigint DEFAULT 0,
  cost_limit numeric(10, 2) DEFAULT 10.00,
  cost_spent numeric(10, 2) DEFAULT 0,
  reset_at timestamptz DEFAULT (now() + interval '30 days'),
  alert_threshold integer DEFAULT 80 CHECK (alert_threshold >= 0 AND alert_threshold <= 100),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE token_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to token_budgets"
  ON token_budgets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to token_budgets"
  ON token_budgets FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to token_budgets"
  ON token_budgets FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from token_budgets"
  ON token_budgets FOR DELETE
  TO public
  USING (true);

-- Create deployment_environments table
CREATE TABLE IF NOT EXISTS deployment_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_name text NOT NULL CHECK (environment_name IN ('local', 'cloud', 'hybrid')),
  user_id uuid,
  is_primary boolean DEFAULT false,
  sync_enabled boolean DEFAULT false,
  settings jsonb DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deployment_environments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to deployment_environments"
  ON deployment_environments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to deployment_environments"
  ON deployment_environments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to deployment_environments"
  ON deployment_environments FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from deployment_environments"
  ON deployment_environments FOR DELETE
  TO public
  USING (true);

-- Create project_exports table
CREATE TABLE IF NOT EXISTS project_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  export_type text DEFAULT 'full' CHECK (export_type IN ('full', 'incremental', 'conversation_only')),
  file_size_bytes bigint DEFAULT 0,
  export_format text DEFAULT 'json' CHECK (export_format IN ('json', 'zip')),
  storage_path text,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to project_exports"
  ON project_exports FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to project_exports"
  ON project_exports FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete from project_exports"
  ON project_exports FOR DELETE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_conversation_id ON token_usage_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_project_id ON token_usage_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_provider_id ON token_usage_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_created_at ON token_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_id ON token_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_token_budgets_user_id ON token_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_token_budgets_project_id ON token_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_token_budgets_is_active ON token_budgets(is_active);
CREATE INDEX IF NOT EXISTS idx_project_exports_project_id ON project_exports(project_id);
CREATE INDEX IF NOT EXISTS idx_deployment_environments_user_id ON deployment_environments(user_id);

-- Insert default local deployment environment
INSERT INTO deployment_environments (environment_name, is_primary, sync_enabled, settings)
VALUES ('local', true, false, '{"description": "Default local development environment"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert default provider configs for LM Studio
INSERT INTO provider_configs (
  provider_id, 
  cost_per_input_token, 
  cost_per_output_token, 
  is_free, 
  config_metadata
)
SELECT 
  id, 
  0, 
  0, 
  true,
  '{"description": "Local LM Studio - completely free"}'::jsonb
FROM llm_providers 
WHERE name = 'lm_studio'
ON CONFLICT (provider_id) DO NOTHING;

-- Insert default token budget for demo
INSERT INTO token_budgets (budget_type, token_limit, cost_limit, is_active)
VALUES ('monthly', 10000000, 50.00, true)
ON CONFLICT DO NOTHING;