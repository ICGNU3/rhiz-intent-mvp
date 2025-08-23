-- Migration: Add integration tables
-- Created: 2024-01-01

-- Add slack_user_id column to workspace_member table
ALTER TABLE workspace_member ADD COLUMN slack_user_id TEXT;

-- Create index for slack_user_id
CREATE INDEX workspace_member_slack_user_idx ON workspace_member(slack_user_id);

-- Create integration table
CREATE TABLE integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id),
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  config JSONB,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for integration table
CREATE INDEX integration_workspace_idx ON integration(workspace_id);
CREATE INDEX integration_provider_idx ON integration(provider);
CREATE INDEX integration_status_idx ON integration(status);

-- Create oauth_token table
CREATE TABLE oauth_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id),
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scope TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for oauth_token table
CREATE INDEX oauth_token_workspace_idx ON oauth_token(workspace_id);
CREATE INDEX oauth_token_provider_idx ON oauth_token(provider);

-- Create crm_contact_sync table
CREATE TABLE crm_contact_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspace(id),
  crm_id TEXT NOT NULL,
  rhiz_person_id UUID NOT NULL REFERENCES person(id),
  crm_provider TEXT NOT NULL,
  last_synced_at TIMESTAMP NOT NULL DEFAULT NOW(),
  sync_status TEXT NOT NULL DEFAULT 'synced',
  metadata JSONB
);

-- Create indexes for crm_contact_sync table
CREATE INDEX crm_contact_sync_workspace_idx ON crm_contact_sync(workspace_id);
CREATE INDEX crm_contact_sync_crm_id_idx ON crm_contact_sync(crm_id);
CREATE INDEX crm_contact_sync_person_idx ON crm_contact_sync(rhiz_person_id);
CREATE INDEX crm_contact_sync_provider_idx ON crm_contact_sync(crm_provider);

-- Add RLS policies for integration table
ALTER TABLE integration ENABLE ROW LEVEL SECURITY;

CREATE POLICY integration_workspace_policy ON integration
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_member 
      WHERE user_id = current_setting('app.current_user_id', true)::TEXT
    )
  );

-- Add RLS policies for oauth_token table
ALTER TABLE oauth_token ENABLE ROW LEVEL SECURITY;

CREATE POLICY oauth_token_workspace_policy ON oauth_token
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_member 
      WHERE user_id = current_setting('app.current_user_id', true)::TEXT
    )
  );

-- Add RLS policies for crm_contact_sync table
ALTER TABLE crm_contact_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_contact_sync_workspace_policy ON crm_contact_sync
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_member 
      WHERE user_id = current_setting('app.current_user_id', true)::TEXT
    )
  );
