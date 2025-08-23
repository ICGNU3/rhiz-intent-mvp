-- Migration: Add workspace support
-- This migration adds workspace functionality and updates all existing tables

-- Create workspace table
CREATE TABLE IF NOT EXISTS workspace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create workspace_member table
CREATE TABLE IF NOT EXISTS workspace_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Create workspace_activity table
CREATE TABLE IF NOT EXISTS workspace_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create notification table
CREATE TABLE IF NOT EXISTS notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add workspace_id column to existing tables
ALTER TABLE person ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE encounter ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE edge ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE claim ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE goal ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE suggestion ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE consent ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE task ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspace(id) ON DELETE CASCADE;

-- Create indexes for workspace_id columns
CREATE INDEX IF NOT EXISTS person_workspace_idx ON person(workspace_id);
CREATE INDEX IF NOT EXISTS encounter_workspace_idx ON encounter(workspace_id);
CREATE INDEX IF NOT EXISTS edge_workspace_idx ON edge(workspace_id);
CREATE INDEX IF NOT EXISTS claim_workspace_idx ON claim(workspace_id);
CREATE INDEX IF NOT EXISTS goal_workspace_idx ON goal(workspace_id);
CREATE INDEX IF NOT EXISTS suggestion_workspace_idx ON suggestion(workspace_id);
CREATE INDEX IF NOT EXISTS consent_workspace_idx ON consent(workspace_id);
CREATE INDEX IF NOT EXISTS task_workspace_idx ON task(workspace_id);
CREATE INDEX IF NOT EXISTS event_log_workspace_idx ON event_log(workspace_id);

-- Create indexes for workspace tables
CREATE INDEX IF NOT EXISTS workspace_owner_idx ON workspace(owner_id);
CREATE INDEX IF NOT EXISTS workspace_member_workspace_idx ON workspace_member(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_member_user_idx ON workspace_member(user_id);
CREATE INDEX IF NOT EXISTS workspace_member_unique_idx ON workspace_member(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS workspace_activity_workspace_idx ON workspace_activity(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_activity_user_idx ON workspace_activity(user_id);
CREATE INDEX IF NOT EXISTS workspace_activity_created_idx ON workspace_activity(created_at);
CREATE INDEX IF NOT EXISTS notification_workspace_idx ON notification(workspace_id);
CREATE INDEX IF NOT EXISTS notification_user_idx ON notification(user_id);
CREATE INDEX IF NOT EXISTS notification_read_idx ON notification(read_at);

-- Make workspace_id NOT NULL after adding default workspace
-- This will be done in the seed script
