-- Migration: Update edge table for graph visualization
-- Drop existing edge table and recreate with new structure

DROP TABLE IF EXISTS edge CASCADE;

CREATE TABLE edge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  from_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('encounter', 'intro', 'goal_link')),
  strength INTEGER NOT NULL DEFAULT 1 CHECK (strength >= 0 AND strength <= 10),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX edge_workspace_idx ON edge(workspace_id);
CREATE INDEX edge_owner_idx ON edge(owner_id);
CREATE INDEX edge_from_idx ON edge(from_id);
CREATE INDEX edge_to_idx ON edge(to_id);
CREATE INDEX edge_type_idx ON edge(type);

-- Add RLS policies
ALTER TABLE edge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view edges in their workspace" ON edge
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_member 
      WHERE user_id = current_setting('app.current_user_id', true)::text
    )
  );

CREATE POLICY "Users can insert edges in their workspace" ON edge
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_member 
      WHERE user_id = current_setting('app.current_user_id', true)::text
    )
  );

CREATE POLICY "Users can update edges in their workspace" ON edge
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_member 
      WHERE user_id = current_setting('app.current_user_id', true)::text
    )
  );

CREATE POLICY "Users can delete edges in their workspace" ON edge
  FOR DELETE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_member 
      WHERE user_id = current_setting('app.current_user_id', true)::text
    )
  );
