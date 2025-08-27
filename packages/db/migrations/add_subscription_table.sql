-- Create subscription table for Stripe billing
CREATE TABLE IF NOT EXISTS subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id),
    user_id TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_payment_intent_id TEXT, -- For one-time payments
    tier TEXT NOT NULL, -- 'root_alpha', 'root_beta', 'free'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'cancelled', 'expired'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS subscription_workspace_idx ON subscription(workspace_id);
CREATE INDEX IF NOT EXISTS subscription_user_idx ON subscription(user_id);
CREATE INDEX IF NOT EXISTS subscription_stripe_customer_idx ON subscription(stripe_customer_id);
CREATE INDEX IF NOT EXISTS subscription_tier_idx ON subscription(tier);
CREATE INDEX IF NOT EXISTS subscription_status_idx ON subscription(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_updated_at_trigger
    BEFORE UPDATE ON subscription
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();