-- Enable Row Level Security on all tables
ALTER TABLE workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE person ENABLE ROW LEVEL SECURITY;
ALTER TABLE org ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounter ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_encounter ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE task ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;

-- Function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current workspace ID
CREATE OR REPLACE FUNCTION get_current_workspace_id() RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_workspace_id', true)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is member of workspace
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_uuid UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_member 
    WHERE workspace_id = workspace_uuid 
    AND user_id = get_current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin of workspace
CREATE OR REPLACE FUNCTION is_workspace_admin(workspace_uuid UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_member 
    WHERE workspace_id = workspace_uuid 
    AND user_id = get_current_user_id()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Workspace policies
CREATE POLICY workspace_owner_policy ON workspace FOR ALL USING (owner_id = get_current_user_id());
CREATE POLICY workspace_member_policy ON workspace FOR SELECT USING (is_workspace_member(id));

-- Workspace member policies
CREATE POLICY workspace_member_view_policy ON workspace_member FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY workspace_member_admin_policy ON workspace_member FOR ALL USING (is_workspace_admin(workspace_id));

-- Workspace activity policies
CREATE POLICY workspace_activity_view_policy ON workspace_activity FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY workspace_activity_insert_policy ON workspace_activity FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

-- Notification policies
CREATE POLICY notification_view_policy ON notification FOR SELECT USING (
  workspace_id = get_current_workspace_id() AND user_id = get_current_user_id()
);
CREATE POLICY notification_insert_policy ON notification FOR INSERT WITH CHECK (
  is_workspace_member(workspace_id)
);
CREATE POLICY notification_update_policy ON notification FOR UPDATE USING (
  workspace_id = get_current_workspace_id() AND user_id = get_current_user_id()
);

-- Person policies (workspace-scoped)
CREATE POLICY person_workspace_policy ON person FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- Org policies (no workspace scoping needed)
CREATE POLICY org_view_policy ON org FOR SELECT USING (true);

-- Encounter policies (workspace-scoped)
CREATE POLICY encounter_workspace_policy ON encounter FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- Person-encounter policies
CREATE POLICY person_encounter_view_policy ON person_encounter FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM person p 
    WHERE p.id = person_encounter.person_id 
    AND p.workspace_id = get_current_workspace_id()
    AND is_workspace_member(p.workspace_id)
  )
);

-- Edge policies (workspace-scoped)
CREATE POLICY edge_workspace_policy ON edge FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- Claim policies (workspace-scoped)
CREATE POLICY claim_workspace_policy ON claim FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- Goal policies (workspace-scoped)
CREATE POLICY goal_workspace_policy ON goal FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- Suggestion policies (workspace-scoped)
CREATE POLICY suggestion_workspace_policy ON suggestion FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- Consent policies (workspace-scoped)
CREATE POLICY consent_workspace_policy ON consent FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- Task policies (workspace-scoped)
CREATE POLICY task_workspace_policy ON task FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- Event log policies (workspace-scoped)
CREATE POLICY event_log_workspace_policy ON event_log FOR ALL USING (
  workspace_id = get_current_workspace_id() AND is_workspace_member(workspace_id)
);

-- PII Access Audit Trigger
CREATE OR REPLACE FUNCTION audit_pii_access() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'SELECT' AND (
    NEW.primary_phone IS NOT NULL OR 
    NEW.primary_email IS NOT NULL OR 
    NEW.full_name IS NOT NULL
  ) THEN
    INSERT INTO event_log (
      workspace_id, owner_id, event, entity_type, entity_id, metadata
    ) VALUES (
      NEW.workspace_id,
      get_current_user_id(), 
      'pii_access', 
      'person', 
      NEW.id, 
      jsonb_build_object(
        'table', TG_TABLE_NAME, 
        'operation', TG_OP, 
        'accessed_fields', jsonb_build_object(
          'phone', NEW.primary_phone IS NOT NULL, 
          'email', NEW.primary_email IS NOT NULL, 
          'name', NEW.full_name IS NOT NULL
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_pii_access_trigger 
  AFTER SELECT ON person 
  FOR EACH ROW 
  EXECUTE FUNCTION audit_pii_access();
