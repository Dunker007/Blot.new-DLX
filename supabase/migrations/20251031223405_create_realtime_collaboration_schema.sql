/*
  # Real-time Collaboration System

  1. New Tables
    - `workspace_sessions`
      - Tracks active workspace sessions for real-time collaboration
      - Contains session ID, user info, project context, and activity status
      - Enables presence tracking and session management
    
    - `live_cursors`
      - Stores real-time cursor positions and selections for collaborative editing
      - Contains user ID, file path, position data, and selection ranges
      - Enables collaborative code editing with visual indicators
    
    - `file_locks`
      - Manages file editing locks to prevent conflicts
      - Contains file path, lock holder, and expiration timestamps
      - Supports optimistic locking with automatic release
    
    - `collaboration_events`
      - Logs all collaboration activities (joins, edits, comments, etc.)
      - Contains event type, actor, target, and metadata
      - Enables activity feeds and audit trails
    
    - `team_members`
      - Stores project team membership and roles
      - Contains user ID, project ID, role, and permissions
      - Enables role-based access control for collaboration
    
    - `presence_status`
      - Tracks online/offline status and current activity
      - Contains user ID, status type, last seen timestamp
      - Enables real-time presence indicators

  2. Indexes
    - Added indexes on frequently queried columns for performance
    - Composite indexes for session and presence lookups
    - Optimized for real-time queries with minimal latency

  3. Security
    - Enable RLS on all collaboration tables
    - Users can only access sessions they're part of
    - File locks are visible to all project members
    - Events are logged for audit but only visible to team members
    - Presence information restricted to project team members
*/

CREATE TABLE IF NOT EXISTS workspace_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'idle', 'disconnected')),
  current_file text,
  cursor_position jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_cursors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES workspace_sessions(id) ON DELETE CASCADE,
  user_id uuid,
  file_path text NOT NULL,
  line_number integer DEFAULT 0,
  column_number integer DEFAULT 0,
  selection_start jsonb,
  selection_end jsonb,
  color text DEFAULT '#3B82F6',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS file_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  locked_by uuid,
  lock_type text DEFAULT 'write' CHECK (lock_type IN ('read', 'write', 'exclusive')),
  acquired_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 minutes'),
  metadata jsonb DEFAULT '{}',
  UNIQUE(project_id, file_path, lock_type)
);

CREATE TABLE IF NOT EXISTS collaboration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  session_id uuid REFERENCES workspace_sessions(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('join', 'leave', 'edit', 'comment', 'lock', 'unlock', 'cursor_move', 'file_open', 'file_close')),
  actor_id uuid,
  actor_name text,
  target_file text,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'member')),
  permissions jsonb DEFAULT '{"read": true, "write": false, "delete": false, "admin": false}',
  joined_at timestamptz DEFAULT now(),
  invited_by uuid,
  status text DEFAULT 'active' CHECK (status IN ('invited', 'active', 'inactive')),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS presence_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  status text DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  current_activity text,
  current_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  last_seen timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_sessions_user ON workspace_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workspace_sessions_project ON workspace_sessions(project_id, status);
CREATE INDEX IF NOT EXISTS idx_workspace_sessions_activity ON workspace_sessions(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_live_cursors_session ON live_cursors(session_id);
CREATE INDEX IF NOT EXISTS idx_live_cursors_file ON live_cursors(file_path);
CREATE INDEX IF NOT EXISTS idx_live_cursors_updated ON live_cursors(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_locks_project ON file_locks(project_id, file_path);
CREATE INDEX IF NOT EXISTS idx_file_locks_expires ON file_locks(expires_at);

CREATE INDEX IF NOT EXISTS idx_collaboration_events_project ON collaboration_events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_events_session ON collaboration_events(session_id);

CREATE INDEX IF NOT EXISTS idx_team_members_project ON team_members(project_id, status);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_presence_status_user ON presence_status(user_id, status);
CREATE INDEX IF NOT EXISTS idx_presence_status_project ON presence_status(current_project_id);

ALTER TABLE workspace_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions in their projects"
  ON workspace_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = workspace_sessions.project_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own sessions"
  ON workspace_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON workspace_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON workspace_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team members can view cursors"
  ON live_cursors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_sessions
      JOIN team_members ON team_members.project_id = workspace_sessions.project_id
      WHERE workspace_sessions.id = live_cursors.session_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own cursors"
  ON live_cursors FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Team members can view file locks"
  ON file_locks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = file_locks.project_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create file locks"
  ON file_locks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = file_locks.project_id
      AND team_members.user_id = auth.uid()
      AND (team_members.permissions->>'write')::boolean = true
    )
  );

CREATE POLICY "Lock owners can delete locks"
  ON file_locks FOR DELETE
  TO authenticated
  USING (locked_by = auth.uid());

CREATE POLICY "Team members can view collaboration events"
  ON collaboration_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = collaboration_events.project_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create collaboration events"
  ON collaboration_events FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE POLICY "Users can view team memberships for their projects"
  ON team_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR project_id IN (
    SELECT project_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Project owners can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.project_id = team_members.project_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view presence of team members"
  ON presence_status FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    current_project_id IN (
      SELECT project_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own presence"
  ON presence_status FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
