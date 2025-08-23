-- Migration: Add graph insights and cross-workspace features
-- Created: 2024-01-15

-- Graph metrics table
CREATE TABLE IF NOT EXISTS graph_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL,
    person_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    metric TEXT NOT NULL,
    value JSONB NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Graph insights table
CREATE TABLE IF NOT EXISTS graph_insight (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    person_id UUID REFERENCES person(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goal(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 50,
    provenance JSONB,
    state TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Insight sharing table
CREATE TABLE IF NOT EXISTS insight_share (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_id UUID NOT NULL REFERENCES graph_insight(id) ON DELETE CASCADE,
    shared_by TEXT NOT NULL,
    shared_with TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'workspace',
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cross-workspace overlaps table
CREATE TABLE IF NOT EXISTS cross_workspace_overlap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    workspaces JSONB NOT NULL,
    overlap_type TEXT NOT NULL,
    confidence INTEGER NOT NULL DEFAULT 80,
    detected_at TIMESTAMP NOT NULL DEFAULT NOW(),
    state TEXT NOT NULL DEFAULT 'active'
);

-- Collective opportunities table
CREATE TABLE IF NOT EXISTS collective_opportunity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    workspaces JSONB NOT NULL,
    clusters JSONB NOT NULL,
    score INTEGER NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'proposed',
    created_by TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS graph_metrics_workspace_idx ON graph_metrics(workspace_id);
CREATE INDEX IF NOT EXISTS graph_metrics_owner_idx ON graph_metrics(owner_id);
CREATE INDEX IF NOT EXISTS graph_metrics_person_idx ON graph_metrics(person_id);
CREATE INDEX IF NOT EXISTS graph_metrics_metric_idx ON graph_metrics(metric);
CREATE UNIQUE INDEX IF NOT EXISTS graph_metrics_unique_idx ON graph_metrics(person_id, metric);

CREATE INDEX IF NOT EXISTS graph_insight_workspace_idx ON graph_insight(workspace_id);
CREATE INDEX IF NOT EXISTS graph_insight_owner_idx ON graph_insight(owner_id);
CREATE INDEX IF NOT EXISTS graph_insight_type_idx ON graph_insight(type);
CREATE INDEX IF NOT EXISTS graph_insight_person_idx ON graph_insight(person_id);
CREATE INDEX IF NOT EXISTS graph_insight_goal_idx ON graph_insight(goal_id);
CREATE INDEX IF NOT EXISTS graph_insight_state_idx ON graph_insight(state);

CREATE INDEX IF NOT EXISTS insight_share_insight_idx ON insight_share(insight_id);
CREATE INDEX IF NOT EXISTS insight_share_shared_by_idx ON insight_share(shared_by);
CREATE INDEX IF NOT EXISTS insight_share_shared_with_idx ON insight_share(shared_with);
CREATE INDEX IF NOT EXISTS insight_share_workspace_idx ON insight_share(workspace_id);
CREATE INDEX IF NOT EXISTS insight_share_visibility_idx ON insight_share(visibility);

CREATE INDEX IF NOT EXISTS cross_workspace_overlap_person_idx ON cross_workspace_overlap(person_id);
CREATE INDEX IF NOT EXISTS cross_workspace_overlap_type_idx ON cross_workspace_overlap(overlap_type);
CREATE INDEX IF NOT EXISTS cross_workspace_overlap_state_idx ON cross_workspace_overlap(state);

CREATE INDEX IF NOT EXISTS collective_opportunity_type_idx ON collective_opportunity(type);
CREATE INDEX IF NOT EXISTS collective_opportunity_status_idx ON collective_opportunity(status);
CREATE INDEX IF NOT EXISTS collective_opportunity_created_by_idx ON collective_opportunity(created_by);

-- Add RLS policies
ALTER TABLE graph_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_insight ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_share ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_workspace_overlap ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_opportunity ENABLE ROW LEVEL SECURITY;

-- Graph metrics policies
CREATE POLICY "Users can view their own graph metrics" ON graph_metrics
    FOR SELECT USING (owner_id = current_user);

CREATE POLICY "Users can insert their own graph metrics" ON graph_metrics
    FOR INSERT WITH CHECK (owner_id = current_user);

CREATE POLICY "Users can update their own graph metrics" ON graph_metrics
    FOR UPDATE USING (owner_id = current_user);

CREATE POLICY "Users can delete their own graph metrics" ON graph_metrics
    FOR DELETE USING (owner_id = current_user);

-- Graph insights policies
CREATE POLICY "Users can view their own graph insights" ON graph_insight
    FOR SELECT USING (owner_id = current_user);

CREATE POLICY "Users can insert their own graph insights" ON graph_insight
    FOR INSERT WITH CHECK (owner_id = current_user);

CREATE POLICY "Users can update their own graph insights" ON graph_insight
    FOR UPDATE USING (owner_id = current_user);

CREATE POLICY "Users can delete their own graph insights" ON graph_insight
    FOR DELETE USING (owner_id = current_user);

-- Insight share policies
CREATE POLICY "Users can view shared insights in their workspace" ON insight_share
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspace WHERE owner_id = current_user
        )
    );

CREATE POLICY "Users can share insights in their workspace" ON insight_share
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT id FROM workspace WHERE owner_id = current_user
        )
    );

-- Cross-workspace overlap policies (read-only for now)
CREATE POLICY "Users can view overlaps" ON cross_workspace_overlap
    FOR SELECT USING (true);

-- Collective opportunity policies (read-only for now)
CREATE POLICY "Users can view opportunities" ON collective_opportunity
    FOR SELECT USING (true);
