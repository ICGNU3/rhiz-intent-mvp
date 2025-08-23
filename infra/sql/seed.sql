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
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440021', 'location', 'New York, NY', 90, 'calendar', 'legitimate_interest', NOW(), '{"source": "calendar", "provider": "google", "reason": "meeting_attendee", "cost": 0.001, "tokens": 10}'),

-- Add tag claims for graph visualization
('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440020', 'tag', 'engineer', 90, 'manual', 'legitimate_interest', NOW(), '{"source": "manual", "reason": "graph_tagging"}'),
('550e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440020', 'tag', 'investor', 85, 'enrichment', 'legitimate_interest', NOW(), '{"source": "enrichment", "reason": "graph_tagging"}'),
('550e8400-e29b-41d4-a716-446655440075', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440021', 'tag', 'investor', 90, 'manual', 'legitimate_interest', NOW(), '{"source": "manual", "reason": "graph_tagging"}'),
('550e8400-e29b-41d4-a716-446655440076', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'person', '550e8400-e29b-41d4-a716-446655440022', 'tag', 'advisor', 90, 'manual', 'legitimate_interest', NOW(), '{"source": "manual", "reason": "graph_tagging"}'),
('550e8400-e29b-41d4-a716-446655440077', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person', '550e8400-e29b-41d4-a716-446655440023', 'tag', 'engineer', 90, 'manual', 'legitimate_interest', NOW(), '{"source": "manual", "reason": "graph_tagging"}'),
('550e8400-e29b-41d4-a716-446655440078', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'person', '550e8400-e29b-41d4-a716-446655440024', 'tag', 'advisor', 85, 'manual', 'legitimate_interest', NOW(), '{"source": "manual", "reason": "graph_tagging"}');

-- Create graph edges with new structure
INSERT INTO edge (id, workspace_id, owner_id, from_id, to_id, type, strength, metadata, created_at) VALUES 
-- Encounter edges (people who met)
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440023', 'encounter', 5, '{"encounterId": "550e8400-e29b-41d4-a716-446655440030", "shared_projects": ["AI Platform"]}', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440024', 'encounter', 5, '{"encounterId": "550e8400-e29b-41d4-a716-446655440031", "shared_projects": ["Partnership Initiative"]}', NOW() - INTERVAL '1 day'),

-- Intro edges (accepted introductions)
('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440021', 'intro', 8, '{"suggestionId": "550e8400-e29b-41d4-a716-446655440090", "goalId": "550e8400-e29b-41d4-a716-446655440050", "score": 85, "why": {"mutual_interests": ["AI/ML", "Product Development"]}}', NOW() - INTERVAL '6 hours'),

-- Goal link edges (people connected to goals)
('550e8400-e29b-41d4-a716-446655440083', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440050', 'goal_link', 6, '{"goalId": "550e8400-e29b-41d4-a716-446655440050", "role": "potential_investor"}', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440084', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440050', 'goal_link', 6, '{"goalId": "550e8400-e29b-41d4-a716-446655440050", "role": "potential_investor"}', NOW() - INTERVAL '1 day');

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
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'new_suggestion', 'New introduction suggestion: Emily Johnson ↔ Lisa Wang (Score: 78)', NOW() - INTERVAL '30 minutes');

-- Create demo graph insights
INSERT INTO graph_insight (id, workspace_id, owner_id, type, title, detail, person_id, goal_id, score, provenance, state, created_at, expires_at) VALUES 
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'opportunity_gap', 'Dormant but valuable contact', 'Sarah Chen (high influence, 75 days since last activity). Suggest reactivation.', '550e8400-e29b-41d4-a716-446655440020', NULL, 85, '{"metric": "degree_centrality", "value": {"value": 0.8, "normalized": true}, "reason_generated": "High centrality (0.8) but dormant for 75 days"}', 'active', NOW(), NOW() + INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'bridge_builder', 'Bridge Builder', 'Michael Rodriguez connects different parts of your network. Consider leveraging his connections.', '550e8400-e29b-41d4-a716-446655440021', NULL, 78, '{"metric": "betweenness_centrality", "value": {"value": 0.6, "normalized": true}, "reason_generated": "High betweenness centrality (0.6) indicates bridge role"}', 'active', NOW(), NOW() + INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'cluster_insight', 'Large community detected', 'Community of 5 people including Sarah Chen, Michael Rodriguez, David Kim. Consider group engagement strategies.', NULL, NULL, 72, '{"metric": "community_id", "value": {"communityId": "cluster_1", "size": 5}, "reason_generated": "Large community (5 members) detected via Louvain algorithm"}', 'active', NOW(), NOW() + INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440133', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'goal_alignment_gap', 'Goal-relevant contact not engaged', 'Emily Johnson (Head of Innovation) appears relevant to goal "Raise $2M Seed Round" but is not connected.', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440050', 70, '{"metric": "goal_alignment", "value": {"goalId": "550e8400-e29b-41d4-a716-446655440050", "relevantClaim": {"key": "title", "value": "Head of Innovation"}}, "reason_generated": "Person has title=\"Head of Innovation\" relevant to goal \"Raise $2M Seed Round\""}', 'active', NOW(), NOW() + INTERVAL '30 days');

-- Create demo shared insights
INSERT INTO insight_share (id, insight_id, shared_by, shared_with, visibility, workspace_id, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440140', '550e8400-e29b-41d4-a716-446655440130', 'alice-user-id', 'workspace', 'workspace', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440141', '550e8400-e29b-41d4-a716-446655440131', 'alice-user-id', 'bob-user-id', 'private', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 hour');

-- Create demo cross-workspace overlaps
INSERT INTO cross_workspace_overlap (id, person_id, workspaces, overlap_type, confidence, detected_at, state) VALUES 
('550e8400-e29b-41d4-a716-446655440150', '550e8400-e29b-41d4-a716-446655440020', '["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]', 'email', 95, NOW() - INTERVAL '1 day', 'active');

-- Create demo collective opportunities
INSERT INTO collective_opportunity (id, title, description, type, workspaces, clusters, score, status, created_by, created_at, expires_at) VALUES 
('550e8400-e29b-41d4-a716-446655440160', 'Investor-Founder Match Opportunity', 'Match 3 investors from TechCorp cluster with 2 founders from StartupHub cluster', 'investor_founder_match', '["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]', '[{"workspaceId": "550e8400-e29b-41d4-a716-446655440001", "clusterId": "investors", "size": 3, "description": "Sarah Chen, Michael Rodriguez, David Kim", "tags": ["investor", "ai", "tech"]}, {"workspaceId": "550e8400-e29b-41d4-a716-446655440002", "clusterId": "founders", "size": 2, "description": "Emily Johnson, Lisa Wang", "tags": ["founder", "startup", "innovation"]}]', 82, 'proposed', 'system', NOW(), NOW() + INTERVAL '90 days');
('550e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'intro_accepted', 'Introduction accepted: Sarah Chen ↔ Michael Rodriguez', NOW() - INTERVAL '15 minutes');

-- Create event logs with workspace_id
INSERT INTO event_log (id, workspace_id, owner_id, event, entity_type, entity_id, metadata, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'person_enriched', 'person', '550e8400-e29b-41d4-a716-446655440020', '{"provider": "linkedin", "claims_added": 3, "cost": 0.05}', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'intro_drafted', 'suggestion', '550e8400-e29b-41d4-a716-446655440090', '{"model": "gpt-4", "tokens_used": 500, "cost": 0.05}', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440001', 'bob-user-id', 'voice_transcribed', 'encounter', '550e8400-e29b-41d4-a716-446655440032', '{"model": "whisper", "duration": 120, "cost": 0.02}', NOW() - INTERVAL '12 hours'),
('550e8400-e29b-41d4-a716-446655440133', '550e8400-e29b-41d4-a716-446655440001', 'alice-user-id', 'intro_accepted', 'suggestion', '550e8400-e29b-41d4-a716-446655440090', '{"accepted_by": "alice-user-id", "accepted_at": "2024-01-17T15:30:00Z"}', NOW() - INTERVAL '15 minutes');

-- Add Slack user IDs to workspace members
UPDATE workspace_member SET slack_user_id = 'U1234567890' WHERE user_id = 'alice-user-id';
UPDATE workspace_member SET slack_user_id = 'U0987654321' WHERE user_id = 'bob-user-id';

-- Create integration records for demo
INSERT INTO integration (id, workspace_id, provider, status, config, last_sync_at, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440140', '550e8400-e29b-41d4-a716-446655440001', 'slack', 'connected', '{"teamId": "T1234567890", "teamName": "Demo Workspace"}', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440141', '550e8400-e29b-41d4-a716-446655440001', 'google', 'connected', '{"type": "calendar", "calendarId": "primary"}', NOW() - INTERVAL '1 day', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440142', '550e8400-e29b-41d4-a716-446655440001', 'hubspot', 'disconnected', NULL, NULL, NOW(), NOW());

-- Create demo OAuth tokens (encrypted)
INSERT INTO oauth_token (id, workspace_id, provider, access_token, refresh_token, expires_at, scope, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440150', '550e8400-e29b-41d4-a716-446655440001', 'google', 'encrypted_access_token_here', 'encrypted_refresh_token_here', NOW() + INTERVAL '1 hour', 'calendar.readonly calendar.events.readonly', NOW(), NOW());

-- Create demo CRM contact sync records
INSERT INTO crm_contact_sync (id, workspace_id, crm_id, rhiz_person_id, crm_provider, last_synced_at, sync_status, metadata) VALUES 
('550e8400-e29b-41d4-a716-446655440160', '550e8400-e29b-41d4-a716-446655440001', 'hubspot_contact_123', '550e8400-e29b-41d4-a716-446655440020', 'hubspot', NOW() - INTERVAL '1 day', 'synced', '{"last_sync_direction": "to_crm", "sync_errors": []}'),
('550e8400-e29b-41d4-a716-446655440161', '550e8400-e29b-41d4-a716-446655440001', 'hubspot_contact_456', '550e8400-e29b-41d4-a716-446655440021', 'hubspot', NOW() - INTERVAL '2 days', 'synced', '{"last_sync_direction": "to_crm", "sync_errors": []}');

-- Referral System Seed Data

-- Create referral codes for demo users
INSERT INTO referral_code (id, code, creator_id, max_uses, used, reward_type, reward_value, created_at, expires_at) VALUES 
('550e8400-e29b-41d4-a716-446655440170', 'ALICE123', 'alice-user-id', 10, 3, 'upgrade', 30, NOW() - INTERVAL '7 days', NULL),
('550e8400-e29b-41d4-a716-446655440171', 'BOB456', 'bob-user-id', 5, 2, 'invite', 1, NOW() - INTERVAL '5 days', NULL),
('550e8400-e29b-41d4-a716-446655440172', 'CAROL789', 'carol-user-id', 15, 1, 'credit', 100, NOW() - INTERVAL '3 days', NULL);

-- Create referral edges (invite tree) - Alice has 3 direct invites, 2 of which have their own invites
INSERT INTO referral_edge (id, inviter_id, invitee_id, referral_code_id, created_at) VALUES 
-- Alice's direct invitees
('550e8400-e29b-41d4-a716-446655440180', 'alice-user-id', 'david-user-id', '550e8400-e29b-41d4-a716-446655440170', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440181', 'alice-user-id', 'emma-user-id', '550e8400-e29b-41d4-a716-446655440170', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440182', 'alice-user-id', 'frank-user-id', '550e8400-e29b-41d4-a716-446655440170', NOW() - INTERVAL '4 days'),

-- David's invitees (level 2 from Alice)
('550e8400-e29b-41d4-a716-446655440183', 'david-user-id', 'grace-user-id', '550e8400-e29b-41d4-a716-446655440170', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440184', 'david-user-id', 'henry-user-id', '550e8400-e29b-41d4-a716-446655440170', NOW() - INTERVAL '2 days'),

-- Emma's invitees (level 2 from Alice)
('550e8400-e29b-41d4-a716-446655440185', 'emma-user-id', 'iris-user-id', '550e8400-e29b-41d4-a716-446655440170', NOW() - INTERVAL '1 day'),

-- Bob's direct invitees
('550e8400-e29b-41d4-a716-446655440186', 'bob-user-id', 'jack-user-id', '550e8400-e29b-41d4-a716-446655440171', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440187', 'bob-user-id', 'kate-user-id', '550e8400-e29b-41d4-a716-446655440171', NOW() - INTERVAL '3 days'),

-- Carol's direct invitee
('550e8400-e29b-41d4-a716-446655440188', 'carol-user-id', 'leo-user-id', '550e8400-e29b-41d4-a716-446655440172', NOW() - INTERVAL '2 days');

-- Create growth events for viral analytics
INSERT INTO growth_event (id, user_id, type, meta, created_at) VALUES 
-- Alice's events
('550e8400-e29b-41d4-a716-446655440190', 'alice-user-id', 'invite_sent', '{"code": "ALICE123", "rewardType": "upgrade"}', NOW() - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440191', 'alice-user-id', 'invite_redeemed', '{"code": "ALICE123", "inviteeId": "david-user-id"}', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440192', 'alice-user-id', 'invite_redeemed', '{"code": "ALICE123", "inviteeId": "emma-user-id"}', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440193', 'alice-user-id', 'invite_redeemed', '{"code": "ALICE123", "inviteeId": "frank-user-id"}', NOW() - INTERVAL '4 days'),

-- David's events
('550e8400-e29b-41d4-a716-446655440194', 'david-user-id', 'signup', '{"referredBy": "alice-user-id", "code": "ALICE123"}', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440195', 'david-user-id', 'invite_sent', '{"code": "DAVID456", "rewardType": "upgrade"}', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440196', 'david-user-id', 'invite_redeemed', '{"code": "DAVID456", "inviteeId": "grace-user-id"}', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440197', 'david-user-id', 'invite_redeemed', '{"code": "DAVID456", "inviteeId": "henry-user-id"}', NOW() - INTERVAL '2 days'),

-- Emma's events
('550e8400-e29b-41d4-a716-446655440198', 'emma-user-id', 'signup', '{"referredBy": "alice-user-id", "code": "ALICE123"}', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440199', 'emma-user-id', 'invite_sent', '{"code": "EMMA789", "rewardType": "upgrade"}', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440200', 'emma-user-id', 'invite_redeemed', '{"code": "EMMA789", "inviteeId": "iris-user-id"}', NOW() - INTERVAL '1 day'),

-- Frank's events
('550e8400-e29b-41d4-a716-446655440201', 'frank-user-id', 'signup', '{"referredBy": "alice-user-id", "code": "ALICE123"}', NOW() - INTERVAL '4 days'),

-- Grace's events
('550e8400-e29b-41d4-a716-446655440202', 'grace-user-id', 'signup', '{"referredBy": "david-user-id", "code": "DAVID456"}', NOW() - INTERVAL '3 days'),

-- Henry's events
('550e8400-e29b-41d4-a716-446655440203', 'henry-user-id', 'signup', '{"referredBy": "david-user-id", "code": "DAVID456"}', NOW() - INTERVAL '2 days'),

-- Iris's events
('550e8400-e29b-41d4-a716-446655440204', 'iris-user-id', 'signup', '{"referredBy": "emma-user-id", "code": "EMMA789"}', NOW() - INTERVAL '1 day'),

-- Bob's events
('550e8400-e29b-41d4-a716-446655440205', 'bob-user-id', 'invite_sent', '{"code": "BOB456", "rewardType": "invite"}', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440206', 'bob-user-id', 'invite_redeemed', '{"code": "BOB456", "inviteeId": "jack-user-id"}', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440207', 'bob-user-id', 'invite_redeemed', '{"code": "BOB456", "inviteeId": "kate-user-id"}', NOW() - INTERVAL '3 days'),

-- Jack's events
('550e8400-e29b-41d4-a716-446655440208', 'jack-user-id', 'signup', '{"referredBy": "bob-user-id", "code": "BOB456"}', NOW() - INTERVAL '4 days'),

-- Kate's events
('550e8400-e29b-41d4-a716-446655440209', 'kate-user-id', 'signup', '{"referredBy": "bob-user-id", "code": "BOB456"}', NOW() - INTERVAL '3 days'),

-- Carol's events
('550e8400-e29b-41d4-a716-446655440210', 'carol-user-id', 'invite_sent', '{"code": "CAROL789", "rewardType": "credit"}', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440211', 'carol-user-id', 'invite_redeemed', '{"code": "CAROL789", "inviteeId": "leo-user-id"}', NOW() - INTERVAL '2 days'),

-- Leo's events
('550e8400-e29b-41d4-a716-446655440212', 'leo-user-id', 'signup', '{"referredBy": "carol-user-id", "code": "CAROL789"}', NOW() - INTERVAL '2 days');
