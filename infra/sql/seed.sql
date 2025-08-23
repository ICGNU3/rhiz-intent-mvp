-- Seed data for Rhiz MVP
-- This creates a complete demo environment with visible Intent Card data

-- Demo user
INSERT INTO person (id, owner_id, full_name, primary_email, location, created_at, updated_at)
VALUES (
  'demo-user-id',
  'demo-user-id',
  'Demo User',
  'demo@rhiz.ai',
  'San Francisco, CA',
  NOW(),
  NOW()
);

-- Demo organizations
INSERT INTO org (id, name, domain, created_at, updated_at)
VALUES 
  ('org-1', 'TechCorp', 'techcorp.com', NOW(), NOW()),
  ('org-2', 'StartupHub', 'startuphub.io', NOW(), NOW()),
  ('org-3', 'Innovation Labs', 'innovationlabs.co', NOW(), NOW());

-- Demo people
INSERT INTO person (id, owner_id, full_name, primary_email, primary_phone, location, created_at, updated_at)
VALUES 
  ('person-1', 'demo-user-id', 'Sarah Chen', 'sarah@techcorp.com', '+1-555-0101', 'San Francisco, CA', NOW(), NOW()),
  ('person-2', 'demo-user-id', 'Michael Rodriguez', 'michael@startuphub.io', '+1-555-0102', 'New York, NY', NOW(), NOW()),
  ('person-3', 'demo-user-id', 'Emily Johnson', 'emily@innovationlabs.co', '+1-555-0103', 'Austin, TX', NOW(), NOW()),
  ('person-4', 'demo-user-id', 'David Kim', 'david@techcorp.com', '+1-555-0104', 'Seattle, WA', NOW(), NOW()),
  ('person-5', 'demo-user-id', 'Lisa Wang', 'lisa@startuphub.io', '+1-555-0105', 'Boston, MA', NOW(), NOW());

-- Demo encounters
INSERT INTO encounter (id, owner_id, kind, occurred_at, summary, raw, created_at)
VALUES 
  ('encounter-1', 'demo-user-id', 'meeting', '2024-01-15 10:00:00', 'Product strategy meeting with Sarah Chen', 
   '{"attendees": ["sarah@techcorp.com"], "duration": 60, "location": "San Francisco"}', NOW()),
  ('encounter-2', 'demo-user-id', 'call', '2024-01-20 14:00:00', 'Investment discussion with Michael Rodriguez', 
   '{"attendees": ["michael@startuphub.io"], "duration": 45, "location": "Zoom"}', NOW()),
  ('encounter-3', 'demo-user-id', 'meeting', '2024-01-25 11:00:00', 'Technical review with Emily Johnson', 
   '{"attendees": ["emily@innovationlabs.co"], "duration": 90, "location": "Austin"}', NOW());

-- Person-encounter relationships
INSERT INTO person_encounter (id, person_id, encounter_id, role)
VALUES 
  ('pe-1', 'person-1', 'encounter-1', 'attendee'),
  ('pe-2', 'person-2', 'encounter-2', 'attendee'),
  ('pe-3', 'person-3', 'encounter-3', 'attendee');

-- Demo goal
INSERT INTO goal (id, owner_id, kind, title, details, status, created_at)
VALUES (
  'goal-1',
  'demo-user-id',
  'raise_seed',
  'Raise $2M Seed Round',
  'Looking to raise a seed round to scale our AI-powered networking platform. Need introductions to VCs and angel investors.',
  'active',
  NOW()
);

-- Demo claims (facts about people)
INSERT INTO claim (id, owner_id, subject_type, subject_id, key, value, confidence, source, lawful_basis, observed_at, provenance)
VALUES 
  -- Sarah Chen
  ('claim-1', 'demo-user-id', 'person', 'person-1', 'title', 'VP of Product', 90, 'calendar', 'legitimate_interest', NOW(), 
   '{"source": "calendar", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-15T10:00:00Z", "metadata": {"event": "Product strategy meeting"}}'),
  ('claim-2', 'demo-user-id', 'person', 'person-1', 'company', 'TechCorp', 95, 'calendar', 'legitimate_interest', NOW(),
   '{"source": "calendar", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-15T10:00:00Z", "metadata": {"email_domain": "techcorp.com"}}'),
  ('claim-3', 'demo-user-id', 'person', 'person-1', 'expertise', 'Product Management', 85, 'enrichment', 'legitimate_interest', NOW(),
   '{"source": "enrichment", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-15T10:00:00Z", "metadata": {"provider": "null"}}'),
  
  -- Michael Rodriguez
  ('claim-4', 'demo-user-id', 'person', 'person-2', 'title', 'Managing Partner', 90, 'calendar', 'legitimate_interest', NOW(),
   '{"source": "calendar", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-20T14:00:00Z", "metadata": {"event": "Investment discussion"}}'),
  ('claim-5', 'demo-user-id', 'person', 'person-2', 'company', 'StartupHub', 95, 'calendar', 'legitimate_interest', NOW(),
   '{"source": "calendar", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-20T14:00:00Z", "metadata": {"email_domain": "startuphub.io"}}'),
  ('claim-6', 'demo-user-id', 'person', 'person-2', 'expertise', 'Venture Capital', 90, 'enrichment', 'legitimate_interest', NOW(),
   '{"source": "enrichment", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-20T14:00:00Z", "metadata": {"provider": "null"}}'),
  
  -- Emily Johnson
  ('claim-7', 'demo-user-id', 'person', 'person-3', 'title', 'CTO', 90, 'calendar', 'legitimate_interest', NOW(),
   '{"source": "calendar", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-25T11:00:00Z", "metadata": {"event": "Technical review"}}'),
  ('claim-8', 'demo-user-id', 'person', 'person-3', 'company', 'Innovation Labs', 95, 'calendar', 'legitimate_interest', NOW(),
   '{"source": "calendar", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-25T11:00:00Z", "metadata": {"email_domain": "innovationlabs.co"}}'),
  ('claim-9', 'demo-user-id', 'person', 'person-3', 'expertise', 'Software Engineering', 90, 'enrichment', 'legitimate_interest', NOW(),
   '{"source": "enrichment", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-25T11:00:00Z", "metadata": {"provider": "null"}}'),
  
  -- David Kim
  ('claim-10', 'demo-user-id', 'person', 'person-4', 'title', 'Senior Engineer', 85, 'enrichment', 'legitimate_interest', NOW(),
   '{"source": "enrichment", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-26T12:00:00Z", "metadata": {"provider": "null"}}'),
  ('claim-11', 'demo-user-id', 'person', 'person-4', 'company', 'TechCorp', 90, 'enrichment', 'legitimate_interest', NOW(),
   '{"source": "enrichment", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-26T12:00:00Z", "metadata": {"provider": "null"}}'),
  
  -- Lisa Wang
  ('claim-12', 'demo-user-id', 'person', 'person-5', 'title', 'Investment Associate', 85, 'enrichment', 'legitimate_interest', NOW(),
   '{"source": "enrichment", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-26T12:00:00Z", "metadata": {"provider": "null"}}'),
  ('claim-13', 'demo-user-id', 'person', 'person-5', 'company', 'StartupHub', 90, 'enrichment', 'legitimate_interest', NOW(),
   '{"source": "enrichment", "lawful_basis": "legitimate_interest", "observed_at": "2024-01-26T12:00:00Z", "metadata": {"provider": "null"}}');

-- Demo edges (relationships)
INSERT INTO edge (id, owner_id, a_id, b_id, kind, strength, last_signal_at, meta)
VALUES 
  ('edge-1', 'demo-user-id', 'person-1', 'person-4', 'colleague', 8, NOW(), '{"shared_company": "TechCorp"}'),
  ('edge-2', 'demo-user-id', 'person-2', 'person-5', 'colleague', 7, NOW(), '{"shared_company": "StartupHub"}'),
  ('edge-3', 'demo-user-id', 'person-1', 'person-2', 'professional', 6, NOW(), '{"mutual_interest": "startups"}');

-- Demo suggestions
INSERT INTO suggestion (id, owner_id, kind, a_id, b_id, goal_id, score, why, draft, state, created_at)
VALUES (
  'suggestion-1',
  'demo-user-id',
  'introduction',
  'person-1',
  'person-2',
  'goal-1',
  85,
  '{"mutualInterests": ["startups", "product management", "venture capital"], "recency": 8, "frequency": 6, "affiliation": 7, "goalAlignment": 9}',
  '{"preIntroPing": "Hi Sarah, I think you and Michael would have a great conversation about product strategy and startup growth. Would you be open to an intro?", "doubleOptIntro": "Hi Sarah and Michael, I wanted to connect you both. Sarah leads product at TechCorp and Michael is a managing partner at StartupHub. I think you could have a valuable discussion about product-market fit and scaling strategies.", "generatedAt": "2024-01-26T12:00:00Z", "cost": 25, "tokens": 500}',
  'ready',
  NOW()
),
(
  'suggestion-2',
  'demo-user-id',
  'introduction',
  'person-3',
  'person-4',
  'goal-1',
  78,
  '{"mutualInterests": ["software engineering", "technical architecture", "AI"], "recency": 7, "frequency": 5, "affiliation": 6, "goalAlignment": 8}',
  '{"preIntroPing": "Hi Emily, I think you and David would have an interesting technical discussion. Would you be open to an intro?", "doubleOptIntro": "Hi Emily and David, I wanted to connect you both. Emily is CTO at Innovation Labs and David is a senior engineer at TechCorp. I think you could have a great discussion about technical architecture and engineering best practices.", "generatedAt": "2024-01-26T12:00:00Z", "cost": 25, "tokens": 500}',
  'ready',
  NOW()
),
(
  'suggestion-3',
  'demo-user-id',
  'introduction',
  'person-2',
  'person-5',
  'goal-1',
  92,
  '{"mutualInterests": ["venture capital", "startup investing", "due diligence"], "recency": 9, "frequency": 8, "affiliation": 9, "goalAlignment": 9}',
  '{"preIntroPing": "Hi Michael, I think you and Lisa would have a valuable discussion about investment strategies. Would you be open to an intro?", "doubleOptIntro": "Hi Michael and Lisa, I wanted to connect you both. Michael is managing partner at StartupHub and Lisa is an investment associate there. I think you could have a great discussion about investment thesis and portfolio strategy.", "generatedAt": "2024-01-26T12:00:00Z", "cost": 25, "tokens": 500}',
  'proposed',
  NOW()
);

-- Demo tasks
INSERT INTO task (id, owner_id, title, due_at, data, completed)
VALUES 
  ('task-1', 'demo-user-id', 'Follow up on intro: suggestion-1', '2024-01-28 10:00:00', 
   '{"suggestionId": "suggestion-1", "personAId": "person-1", "personBId": "person-2", "daysSinceAcceptance": 2, "followUpMessage": "Check in on recent introduction"}', false),
  ('task-2', 'demo-user-id', 'Schedule coffee with Sarah Chen', '2024-01-30 14:00:00', 
   '{"personId": "person-1", "purpose": "Discuss potential collaboration"}', false);

-- Demo event logs
INSERT INTO event_log (id, owner_id, event, entity_type, entity_id, metadata, created_at)
VALUES 
  ('event-1', 'demo-user-id', 'goal_created', 'goal', 'goal-1', '{"kind": "raise_seed", "title": "Raise $2M Seed Round"}', NOW()),
  ('event-2', 'demo-user-id', 'suggestion_generated', 'suggestion', 'suggestion-1', '{"score": 85, "personA": "person-1", "personB": "person-2"}', NOW()),
  ('event-3', 'demo-user-id', 'intro_drafted', 'suggestion', 'suggestion-1', '{"draftsGenerated": 2, "cost": 25, "tokens": 500}', NOW()),
  ('event-4', 'demo-user-id', 'suggestion_accepted', 'suggestion', 'suggestion-1', '{"acceptedAt": "2024-01-26T12:00:00Z"}', NOW());
