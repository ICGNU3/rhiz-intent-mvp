-- Migration: Add referral system tables
-- Created: 2024-01-XX

-- Referral code table
CREATE TABLE referral_code (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    creator_id TEXT NOT NULL,
    max_uses INTEGER,
    used INTEGER NOT NULL DEFAULT 0,
    reward_type TEXT NOT NULL,
    reward_value INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Referral edge table (invite tree)
CREATE TABLE referral_edge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id TEXT NOT NULL,
    invitee_id TEXT NOT NULL,
    referral_code_id UUID REFERENCES referral_code(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Growth event table (viral analytics)
CREATE TABLE growth_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    meta JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX referral_code_code_idx ON referral_code(code);
CREATE INDEX referral_code_creator_idx ON referral_code(creator_id);
CREATE INDEX referral_code_used_idx ON referral_code(used);

CREATE INDEX referral_edge_inviter_idx ON referral_edge(inviter_id);
CREATE INDEX referral_edge_invitee_idx ON referral_edge(invitee_id);
CREATE INDEX referral_edge_code_idx ON referral_edge(referral_code_id);

CREATE INDEX growth_event_user_idx ON growth_event(user_id);
CREATE INDEX growth_event_type_idx ON growth_event(type);
CREATE INDEX growth_event_created_idx ON growth_event(created_at);

-- RLS policies for referral_code
ALTER TABLE referral_code ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral codes" ON referral_code
    FOR SELECT USING (creator_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create their own referral codes" ON referral_code
    FOR INSERT WITH CHECK (creator_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own referral codes" ON referral_code
    FOR UPDATE USING (creator_id = current_setting('app.current_user_id', true));

-- RLS policies for referral_edge
ALTER TABLE referral_edge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invite tree" ON referral_edge
    FOR SELECT USING (
        inviter_id = current_setting('app.current_user_id', true) OR 
        invitee_id = current_setting('app.current_user_id', true)
    );

CREATE POLICY "Users can create referral edges" ON referral_edge
    FOR INSERT WITH CHECK (
        inviter_id = current_setting('app.current_user_id', true)
    );

-- RLS policies for growth_event
ALTER TABLE growth_event ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own growth events" ON growth_event
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can create their own growth events" ON growth_event
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Admin can view all growth events for analytics
CREATE POLICY "Admins can view all growth events" ON growth_event
    FOR SELECT USING (
        current_setting('app.current_user_role', true) = 'admin'
    );
