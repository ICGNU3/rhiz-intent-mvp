-- Migration: Add Agent System Tables
-- Date: 2025-01-25
-- Description: Adds signals, agent_events, and people_embedding tables for the four-agent system

-- Signals table for agent system
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    contact_id UUID NOT NULL REFERENCES person(id),
    last_interaction_at TIMESTAMPTZ,
    interactions_90d INTEGER NOT NULL DEFAULT 0,
    reciprocity_ratio INTEGER NOT NULL DEFAULT 0, -- Scaled 0-100
    sentiment_avg INTEGER NOT NULL DEFAULT 0, -- Scaled 0-100
    decay_days INTEGER NOT NULL DEFAULT 0,
    role_tags JSONB NOT NULL DEFAULT '[]', -- Array of strings
    shared_context_tags JSONB NOT NULL DEFAULT '[]', -- Array of strings
    goal_alignment_score INTEGER NOT NULL DEFAULT 0, -- Scaled 0-100
    capacity_cost INTEGER NOT NULL DEFAULT 100, -- Scaled 0-100, 100 = normal cost
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for signals table
CREATE INDEX signals_user_idx ON signals(user_id);
CREATE INDEX signals_contact_idx ON signals(contact_id);
CREATE UNIQUE INDEX signals_user_contact_unique_idx ON signals(user_id, contact_id);
CREATE INDEX signals_updated_idx ON signals(updated_at);

-- Agent events table for audit trail
CREATE TABLE agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    goal_id UUID REFERENCES goal(id),
    agent TEXT NOT NULL, -- 'mapper', 'sensemaker', 'strategist', 'storyweaver'
    action TEXT NOT NULL, -- Action type from schema
    payload JSONB NOT NULL, -- Full action payload
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for agent_events table
CREATE INDEX agent_events_user_idx ON agent_events(user_id);
CREATE INDEX agent_events_goal_idx ON agent_events(goal_id);
CREATE INDEX agent_events_agent_idx ON agent_events(agent);
CREATE INDEX agent_events_action_idx ON agent_events(action);
CREATE INDEX agent_events_created_idx ON agent_events(created_at);

-- People embeddings table for semantic similarity (optional)
CREATE TABLE people_embedding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL UNIQUE REFERENCES person(id),
    embedding JSONB NOT NULL, -- Vector embedding as JSON array
    model TEXT NOT NULL DEFAULT 'text-embedding-3-small', -- Embedding model used
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for people_embedding table
CREATE INDEX people_embedding_contact_idx ON people_embedding(contact_id);
CREATE INDEX people_embedding_model_idx ON people_embedding(model);

-- RLS policies for new tables
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_embedding ENABLE ROW LEVEL SECURITY;

-- RLS policies for signals table
CREATE POLICY signals_user_policy ON signals FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- RLS policies for agent_events table
CREATE POLICY agent_events_user_policy ON agent_events FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- RLS policies for people_embedding table
CREATE POLICY people_embedding_user_policy ON people_embedding FOR ALL USING (
    contact_id IN (
        SELECT id FROM person WHERE owner_id = current_setting('app.current_user_id', true)
    )
);