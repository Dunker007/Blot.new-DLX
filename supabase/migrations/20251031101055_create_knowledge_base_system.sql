/*
  # Knowledge Base and Memory System

  ## Overview
  Creates a comprehensive knowledge base system for storing personas, agent handoff notes,
  project context, and reusable knowledge. This enables persistent memory across sessions
  and intelligent context management.

  ## New Tables

  ### 1. `knowledge_base`
  Central knowledge repository for all types of information
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional for multi-user)
  - `project_id` (uuid, optional link to projects)
  - `category` (text) - persona, handoff, context, snippet, template, tip
  - `title` (text) - Knowledge entry title
  - `content` (text) - Main content/body
  - `tags` (text array) - Searchable tags
  - `metadata` (jsonb) - Additional structured data
  - `is_pinned` (boolean) - Pin important entries
  - `is_archived` (boolean) - Archive old entries
  - `version` (integer) - Version tracking
  - `created_at`, `updated_at` (timestamptz)

  ### 2. `agent_personas`
  Define AI agent personas with specific traits and capabilities
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional)
  - `name` (text) - Persona name
  - `role` (text) - Developer, Designer, Analyst, etc.
  - `description` (text) - Persona description
  - `traits` (jsonb) - Personality traits and preferences
  - `capabilities` (text array) - What this persona can do
  - `communication_style` (text) - How the persona communicates
  - `preferred_tools` (text array) - Preferred tech stack
  - `is_active` (boolean) - Currently active
  - `avatar_url` (text, optional) - Visual representation
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `agent_handoffs`
  Track context when switching between AI agents or sessions
  - `id` (uuid, primary key)
  - `project_id` (uuid, link to projects)
  - `conversation_id` (uuid, optional link to conversations)
  - `from_persona_id` (uuid, optional link to agent_personas)
  - `to_persona_id` (uuid, optional link to agent_personas)
  - `context_summary` (text) - What was accomplished
  - `current_state` (text) - Current project state
  - `next_steps` (text array) - Recommended next actions
  - `warnings` (text array) - Important caveats
  - `code_references` (jsonb) - File and line references
  - `dependencies` (text array) - External dependencies
  - `created_at` (timestamptz)

  ### 4. `memory_contexts`
  Persistent memory for ongoing work and sessions
  - `id` (uuid, primary key)
  - `project_id` (uuid, link to projects)
  - `context_type` (text) - session, task, feature, bugfix
  - `title` (text) - Context title
  - `content` (text) - Detailed context
  - `status` (text) - active, completed, paused, abandoned
  - `priority` (integer) - 1-5 priority level
  - `related_files` (text array) - Associated file paths
  - `decisions_made` (jsonb) - Key decisions and rationale
  - `blockers` (text array) - Current blockers
  - `created_at`, `updated_at` (timestamptz)

  ### 5. `knowledge_snippets`
  Reusable code snippets and patterns
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional)
  - `language` (text) - Programming language
  - `title` (text) - Snippet title
  - `description` (text) - What it does
  - `code` (text) - The actual code
  - `tags` (text array) - Searchable tags
  - `usage_count` (integer) - How many times used
  - `is_favorite` (boolean) - User favorite
  - `created_at`, `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public access for demo mode
  - Ready for user-specific policies

  ## Notes
  - Enables AI agents to remember context across sessions
  - Supports collaborative agent workflows
  - Provides searchable knowledge repository
*/

-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  category text DEFAULT 'general' CHECK (category IN ('persona', 'handoff', 'context', 'snippet', 'template', 'tip', 'note', 'general')),
  title text NOT NULL,
  content text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  is_pinned boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to knowledge_base"
  ON knowledge_base FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to knowledge_base"
  ON knowledge_base FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to knowledge_base"
  ON knowledge_base FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from knowledge_base"
  ON knowledge_base FOR DELETE
  TO public
  USING (true);

-- Create agent_personas table
CREATE TABLE IF NOT EXISTS agent_personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  role text DEFAULT 'assistant' CHECK (role IN ('developer', 'designer', 'analyst', 'architect', 'devops', 'assistant', 'specialist')),
  description text DEFAULT '',
  traits jsonb DEFAULT '{}'::jsonb,
  capabilities text[] DEFAULT ARRAY[]::text[],
  communication_style text DEFAULT 'professional',
  preferred_tools text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agent_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to agent_personas"
  ON agent_personas FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to agent_personas"
  ON agent_personas FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to agent_personas"
  ON agent_personas FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from agent_personas"
  ON agent_personas FOR DELETE
  TO public
  USING (true);

-- Create agent_handoffs table
CREATE TABLE IF NOT EXISTS agent_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  from_persona_id uuid REFERENCES agent_personas(id) ON DELETE SET NULL,
  to_persona_id uuid REFERENCES agent_personas(id) ON DELETE SET NULL,
  context_summary text DEFAULT '',
  current_state text DEFAULT '',
  next_steps text[] DEFAULT ARRAY[]::text[],
  warnings text[] DEFAULT ARRAY[]::text[],
  code_references jsonb DEFAULT '{}'::jsonb,
  dependencies text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to agent_handoffs"
  ON agent_handoffs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to agent_handoffs"
  ON agent_handoffs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete from agent_handoffs"
  ON agent_handoffs FOR DELETE
  TO public
  USING (true);

-- Create memory_contexts table
CREATE TABLE IF NOT EXISTS memory_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  context_type text DEFAULT 'session' CHECK (context_type IN ('session', 'task', 'feature', 'bugfix', 'refactor', 'research')),
  title text NOT NULL,
  content text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  priority integer DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  related_files text[] DEFAULT ARRAY[]::text[],
  decisions_made jsonb DEFAULT '{}'::jsonb,
  blockers text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memory_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to memory_contexts"
  ON memory_contexts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to memory_contexts"
  ON memory_contexts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to memory_contexts"
  ON memory_contexts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from memory_contexts"
  ON memory_contexts FOR DELETE
  TO public
  USING (true);

-- Create knowledge_snippets table
CREATE TABLE IF NOT EXISTS knowledge_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  language text DEFAULT 'javascript',
  title text NOT NULL,
  description text DEFAULT '',
  code text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  usage_count integer DEFAULT 0,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to knowledge_snippets"
  ON knowledge_snippets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to knowledge_snippets"
  ON knowledge_snippets FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to knowledge_snippets"
  ON knowledge_snippets FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from knowledge_snippets"
  ON knowledge_snippets FOR DELETE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_project_id ON knowledge_base(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_pinned ON knowledge_base(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_agent_personas_role ON agent_personas(role);
CREATE INDEX IF NOT EXISTS idx_agent_personas_active ON agent_personas(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_project_id ON agent_handoffs(project_id);
CREATE INDEX IF NOT EXISTS idx_memory_contexts_project_id ON memory_contexts(project_id);
CREATE INDEX IF NOT EXISTS idx_memory_contexts_status ON memory_contexts(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_snippets_language ON knowledge_snippets(language);
CREATE INDEX IF NOT EXISTS idx_knowledge_snippets_tags ON knowledge_snippets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_snippets_favorite ON knowledge_snippets(is_favorite) WHERE is_favorite = true;

-- Insert default personas
INSERT INTO agent_personas (name, role, description, traits, capabilities, communication_style, preferred_tools)
VALUES 
  ('Dev Agent', 'developer', 'Full-stack developer focused on building robust, scalable applications', 
   '{"creativity": 8, "precision": 9, "speed": 7, "collaboration": 8}'::jsonb,
   ARRAY['React', 'TypeScript', 'Node.js', 'Database Design', 'API Development'],
   'direct and technical',
   ARRAY['VS Code', 'Git', 'Docker', 'PostgreSQL']),
  
  ('Design Agent', 'designer', 'UX/UI specialist creating beautiful, intuitive user experiences',
   '{"creativity": 10, "precision": 8, "aesthetics": 10, "empathy": 9}'::jsonb,
   ARRAY['UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'Accessibility'],
   'visual and empathetic',
   ARRAY['Figma', 'Tailwind', 'CSS', 'Animation']),
  
  ('Architect Agent', 'architect', 'System architect planning scalable, maintainable architectures',
   '{"strategic_thinking": 10, "systems_view": 9, "foresight": 9, "pragmatism": 8}'::jsonb,
   ARRAY['System Design', 'Performance Optimization', 'Security', 'Scalability', 'Best Practices'],
   'strategic and thorough',
   ARRAY['Architecture Diagrams', 'Documentation', 'Code Review'])
ON CONFLICT DO NOTHING;

-- Insert starter knowledge base entries
INSERT INTO knowledge_base (category, title, content, tags, is_pinned)
VALUES
  ('tip', 'Token Management Best Practices', 
   'Always track token usage for cost optimization. Use local models for development and testing, cloud models for production. Set budget alerts at 80% threshold.',
   ARRAY['tokens', 'cost', 'optimization'],
   true),
  
  ('tip', 'Project Organization', 
   'Keep components small and focused. Use services for business logic. Separate concerns with clear boundaries. Document major decisions in handoff notes.',
   ARRAY['organization', 'best-practices'],
   true),
  
  ('template', 'API Integration Pattern',
   'When integrating new APIs: 1) Create service file, 2) Define types, 3) Add error handling, 4) Track usage if LLM, 5) Test thoroughly',
   ARRAY['api', 'template', 'integration'],
   false)
ON CONFLICT DO NOTHING;