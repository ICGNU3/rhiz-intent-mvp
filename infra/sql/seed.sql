-- Seed data for Rhiz MVP with workspace support

-- Create demo workspace
INSERT INTO workspace (id, name, owner_id, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Rhiz Demo Workspace', 'alice-user-id', NOW(), NOW());

-- Create workspace members (Alice as admin, Bob as member)
INSERT INTO workspace_member (id, workspace_id, user_id, role, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'admin', NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'member', NOW());

-- Create organizations
INSERT INTO org (id, name, domain, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'TechCorp', 'techcorp.com', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'StartupHub', 'startuphub.io', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Innovation Labs', 'innovationlabs.co', NOW(), NOW());

-- Create people with workspace_id
INSERT INTO person (id, workspace_id, owner_id, full_name, primary_email, primary_phone, location, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'Sarah Chen', 'sarah@techcorp.com', '+1-555-0101', 'San Francisco, CA', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'Michael Rodriguez', 'michael@startuphub.io', '+1-555-0102', 'New York, NY', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'Emily Johnson', 'emily@innovationlabs.co', '+1-555-0103', 'Austin, TX', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'David Kim', 'david@techcorp.com', '+1-555-0104', 'Seattle, WA', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'Lisa Wang', 'lisa@startuphub.io', '+1-555-0105', 'Boston, MA', NOW(), NOW());

-- Create encounters with workspace_id
INSERT INTO encounter (id, workspace_id, owner_id, kind, occurred_at, summary, raw, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'meeting', '2024-01-15 10:00:00', 'Product strategy discussion with Sarah', '{"location": "Zoom", "duration": 60}', NOW()),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'call', '2024-01-16 14:00:00', 'Follow-up call with Michael about partnership', '{"location": "Phone", "duration": 30}', NOW()),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'voice_note', '2024-01-17 09:00:00', 'Voice note about Emily Johnson from Innovation Labs', '{"duration": 120, "transcription": "Emily is interested in our AI platform"}', NOW());

-- Create person-encounter relationships
INSERT INTO person_encounter (id, person_id, encounter_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', 'attendee'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440031', 'attendee'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440032', 'mentioned');

-- Create shared goal (belongs to workspace)
INSERT INTO goal (id, workspace_id, owner_id, kind, title, details, status, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'raise_seed', 'Raise $2M Seed Round', 'Looking to raise seed funding for our AI platform', 'active', NOW());

-- Create claims with workspace_id and provenance
INSERT INTO claim (id, workspace_id, owner_id, subject_type, subject_id, key, value, confidence, source, lawful_basis, observed_at, provenance) VALUES 
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440020', 'title', 'VP of Engineering', 90, 'calendar', 'legitimate_interest', NOW(), '{"source": "calendar", "provider": "google", "reason": "meeting_attendee", "cost": 0.001, "tokens": 10}'),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440020', 'company', 'TechCorp', 95, 'calendar', 'legitimate_interest', NOW(), '{"source": "calendar", "provider": "google", "reason": "meeting_attendee", "cost": 0.001, "tokens": 10}'),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440020', 'expertise', 'AI/ML, Product Development', 85, 'enrichment', 'legitimate_interest', NOW(), '{"source": "enrichment", "provider": "linkedin", "reason": "relationship_building", "cost": 0.05, "tokens": 500}'),
('550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440021', 'title', 'Founder & CEO', 90, 'calendar', 'legitimate_interest', NOW(), '{"source": "calendar", "provider": "google", "reason": "meeting_attendee", "cost": 0.001, "tokens": 10}'),
('550e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440021', 'company', 'StartupHub', 95, 'calendar', 'legitimate_interest', NOW(), '{"source": "calendar", "provider": "google", "reason": "meeting_attendee", "cost": 0.001, "tokens": 10}'),
('550e8400-e29b-41d4-a716-446655440065', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'person', '550e8400-e29b-41d4-a716-446655440022', 'title', 'Head of Innovation', 90, 'voice', 'legitimate_interest', NOW(), '{"source": "voice", "provider": "whisper", "reason": "voice_note", "cost": 0.02, "tokens": 200}'),
('550e8400-e29b-41d4-a716-446655440066', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'person', '550e8400-e29b-41d4-a716-446655440022', 'company', 'Innovation Labs', 95, 'voice', 'legitimate_interest', NOW(), '{"source": "voice", "provider": "whisper", "reason": "voice_note", "cost": 0.02, "tokens": 200}'),
('550e8400-e29b-41d4-a716-446655440067', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440023', 'title', 'Senior Engineer', 90, 'enrichment', 'legitimate_interest', NOW(), '{"source": "enrichment", "provider": "linkedin", "reason": "relationship_building", "cost": 0.05, "tokens": 500}'),
('550e8400-e29b-41d4-a716-446655440068', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440023', 'company', 'TechCorp', 95, 'enrichment', 'legitimate_interest', NOW(), '{"source": "enrichment", "provider": "linkedin", "reason": "relationship_building", "cost": 0.05, "tokens": 500}'),
('550e8400-e29b-41d4-a716-446655440069', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'person', '550e8400-e29b-41d4-a716-446655440024', 'title', 'Product Manager', 90, 'enrichment', 'legitimate_interest', NOW(), '{"source": "enrichment", "provider": "linkedin", "reason": "relationship_building", "cost": 0.05, "tokens": 500}'),
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'person', '550e8400-e29b-41d4-a716-446655440024', 'company', 'StartupHub', 95, 'enrichment', 'legitimate_interest', NOW(), '{"source": "enrichment", "provider": "linkedin", "reason": "relationship_building", "cost": 0.05, "tokens": 500}'),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440020', 'location', 'San Francisco, CA', 90, 'calendar', 'legitimate_interest', NOW(), '{"source": "calendar", "provider": "google", "reason": "meeting_attendee", "cost": 0.001, "tokens": 10}'),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440021', 'location', 'New York, NY', 90, 'calendar', 'legitimate_interest', NOW(), '{"source": "calendar", "provider": "google", "reason": "meeting_attendee", "cost": 0.001, "tokens": 10}');

-- Create edges (relationships) with workspace_id
INSERT INTO edge (id, workspace_id, owner_id, a_id, b_id, kind, strength, last_signal_at, meta) VALUES 
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440023', 'colleague', 7, NOW(), '{"shared_projects": ["AI Platform"]}'),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440024', 'colleague', 6, NOW(), '{"shared_projects": ["Partnership Initiative"]}'),
('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440022', 'mentor', 8, NOW(), '{"mentorship_area": "AI Strategy"}');

-- Create suggestions with workspace_id
INSERT INTO suggestion (id, workspace_id, owner_id, kind, a_id, b_id, goal_id, score, why, draft, state, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'introduction', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440050', 85, '{"mutual_interests": ["AI/ML", "Product Development"], "complementary_skills": ["Engineering Leadership", "Business Strategy"], "network_overlap": "TechCorp alumni"}', '{"preIntroPing": "Hi Sarah, I think you and Michael would have a great conversation about AI strategy and product development. Would you be open to an intro?", "doubleOptIntro": "Sarah, meet Michael - he\'s building an AI platform and I think your engineering leadership experience would be valuable. Michael, Sarah leads engineering at TechCorp and has deep AI/ML expertise.", "estimatedCost": 0.05, "estimatedTokens": 500}', 'ready', NOW()),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'introduction', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440050', 78, '{"mutual_interests": ["Innovation", "Product Management"], "complementary_skills": ["Innovation Strategy", "Product Execution"], "network_overlap": "Startup ecosystem"}', '{"preIntroPing": "Hi Emily, I think you and Lisa would have a great conversation about innovation and product strategy. Would you be open to an intro?", "doubleOptIntro": "Emily, meet Lisa - she\'s leading product at StartupHub and I think your innovation expertise would be valuable. Lisa, Emily heads innovation at Innovation Labs and has deep strategic thinking.", "estimatedCost": 0.05, "estimatedTokens": 500}', 'ready', NOW()),
('550e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'introduction', '550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440050', 72, '{"mutual_interests": ["AI/ML", "Innovation"], "complementary_skills": ["Engineering", "Strategy"], "network_overlap": "Tech industry"}', '{"preIntroPing": "Hi David, I think you and Emily would have a great conversation about AI and innovation. Would you be open to an intro?", "doubleOptIntro": "David, meet Emily - she leads innovation at Innovation Labs and I think your engineering expertise would be valuable. Emily, David is a senior engineer at TechCorp with deep AI experience.", "estimatedCost": 0.05, "estimatedTokens": 500}', 'proposed', NOW());

-- Create tasks with workspace_id
INSERT INTO task (id, workspace_id, owner_id, title, due_at, data, completed) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'Follow up with Sarah about AI platform discussion', '2024-01-20 10:00:00', '{"person_id": "550e8400-e29b-41d4-a716-446655440020", "encounter_id": "550e8400-e29b-41d4-a716-446655440030"}', false),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'Schedule partnership meeting with Michael', '2024-01-22 14:00:00', '{"person_id": "550e8400-e29b-41d4-a716-446655440021", "encounter_id": "550e8400-e29b-41d4-a716-446655440031"}', false);

-- Create workspace activity feed
INSERT INTO workspace_activity (id, workspace_id, user_id, action, entity_type, entity_id, metadata, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'created_goal', 'goal', '550e8400-e29b-41d4-a716-446655440050', '{"goal_title": "Raise $2M Seed Round"}', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'added_person', 'person', '550e8400-e29b-41d4-a716-446655440020', '{"person_name": "Sarah Chen"}', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'added_person', 'person', '550e8400-e29b-41d4-a716-446655440022', '{"person_name": "Emily Johnson"}', NOW() - INTERVAL '12 hours'),
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'accepted_intro', 'suggestion', '550e8400-e29b-41d4-a716-446655440090', '{"suggestion_score": 85, "person_a": "Sarah Chen", "person_b": "Michael Rodriguez"}', NOW() - INTERVAL '6 hours');

-- Create notifications
INSERT INTO notification (id, workspace_id, user_id, type, message, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'new_suggestion', 'New introduction suggestion: Sarah Chen ↔ Michael Rodriguez (Score: 85)', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'new_suggestion', 'New introduction suggestion: Emily Johnson ↔ Lisa Wang (Score: 78)', NOW() - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'intro_accepted', 'Introduction accepted: Sarah Chen ↔ Michael Rodriguez', NOW() - INTERVAL '15 minutes');

-- Create event logs with workspace_id
INSERT INTO event_log (id, workspace_id, owner_id, event, entity_type, entity_id, metadata, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person_enriched', 'person', '550e8400-e29b-41d4-a716-446655440020', '{"provider": "linkedin", "claims_added": 3, "cost": 0.05}', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'intro_drafted', 'suggestion', '550e8400-e29b-41d4-a716-446655440090', '{"model": "gpt-4", "tokens_used": 500, "cost": 0.05}', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'voice_transcribed', 'encounter', '550e8400-e29b-41d4-a716-446655440032', '{"model": "whisper", "duration": 120, "cost": 0.02}', NOW() - INTERVAL '12 hours'),
('550e8400-e29b-41d4-a716-446655440133', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'intro_accepted', 'suggestion', '550e8400-e29b-41d4-a716-446655440090', '{"accepted_by": "alice-user-id", "accepted_at": "2024-01-17T15:30:00Z"}', NOW() - INTERVAL '15 minutes');
