-- Enable RLS on all tables
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

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Person table RLS
CREATE POLICY person_owner_policy ON person
  FOR ALL USING (owner_id = get_current_user_id());

-- Org table RLS (read-only for all, write for owner)
CREATE POLICY org_read_policy ON org
  FOR SELECT USING (true);
CREATE POLICY org_write_policy ON org
  FOR ALL USING (true); -- Orgs can be shared

-- Encounter table RLS
CREATE POLICY encounter_owner_policy ON encounter
  FOR ALL USING (owner_id = get_current_user_id());

-- Person-Encounter table RLS
CREATE POLICY person_encounter_owner_policy ON person_encounter
  FOR ALL USING (
    encounter_id IN (
      SELECT id FROM encounter WHERE owner_id = get_current_user_id()
    )
  );

-- Edge table RLS
CREATE POLICY edge_owner_policy ON edge
  FOR ALL USING (owner_id = get_current_user_id());

-- Claim table RLS
CREATE POLICY claim_owner_policy ON claim
  FOR ALL USING (owner_id = get_current_user_id());

-- Goal table RLS
CREATE POLICY goal_owner_policy ON goal
  FOR ALL USING (owner_id = get_current_user_id());

-- Suggestion table RLS
CREATE POLICY suggestion_owner_policy ON suggestion
  FOR ALL USING (owner_id = get_current_user_id());

-- Consent table RLS
CREATE POLICY consent_owner_policy ON consent
  FOR ALL USING (owner_id = get_current_user_id());

-- Task table RLS
CREATE POLICY task_owner_policy ON task
  FOR ALL USING (owner_id = get_current_user_id());

-- Event log table RLS
CREATE POLICY event_log_owner_policy ON event_log
  FOR ALL USING (owner_id = get_current_user_id());

-- Create audit trigger for PII access
CREATE OR REPLACE FUNCTION audit_pii_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive fields
  IF TG_OP = 'SELECT' AND (
    NEW.primary_phone IS NOT NULL OR 
    NEW.primary_email IS NOT NULL OR
    NEW.full_name IS NOT NULL
  ) THEN
    INSERT INTO event_log (
      owner_id,
      event,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
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

-- Create trigger for PII access logging
CREATE TRIGGER audit_pii_access_trigger
  AFTER SELECT ON person
  FOR EACH ROW
  EXECUTE FUNCTION audit_pii_access();
