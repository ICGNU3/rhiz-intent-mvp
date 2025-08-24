-- Migration: Add conversation tables for chat interface
-- Created: 2024-01-01

-- Create conversation table
CREATE TABLE IF NOT EXISTS "conversation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "created_by" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create message table
CREATE TABLE IF NOT EXISTS "message" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL REFERENCES "conversation"("id") ON DELETE CASCADE,
  "sender_type" text NOT NULL CHECK ("sender_type" IN ('user', 'contact', 'agent', 'system')),
  "sender_id" text,
  "text" text NOT NULL,
  "data" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create message_link table
CREATE TABLE IF NOT EXISTS "message_link" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL REFERENCES "message"("id") ON DELETE CASCADE,
  "subject_type" text NOT NULL CHECK ("subject_type" IN ('person', 'goal', 'encounter', 'suggestion')),
  "subject_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "conversation_workspace_idx" ON "conversation"("workspace_id");
CREATE INDEX IF NOT EXISTS "conversation_created_by_idx" ON "conversation"("created_by");
CREATE INDEX IF NOT EXISTS "conversation_updated_idx" ON "conversation"("updated_at");

CREATE INDEX IF NOT EXISTS "message_conversation_idx" ON "message"("conversation_id");
CREATE INDEX IF NOT EXISTS "message_sender_type_idx" ON "message"("sender_type");
CREATE INDEX IF NOT EXISTS "message_created_idx" ON "message"("created_at");
CREATE INDEX IF NOT EXISTS "message_conversation_created_idx" ON "message"("conversation_id", "created_at");

CREATE INDEX IF NOT EXISTS "message_link_message_idx" ON "message_link"("message_id");
CREATE INDEX IF NOT EXISTS "message_link_subject_idx" ON "message_link"("subject_type", "subject_id");

-- Enable RLS
ALTER TABLE "conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_link" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation
CREATE POLICY "conversation_workspace_access" ON "conversation"
  FOR ALL USING (
    "workspace_id" IN (
      SELECT "workspace_id" FROM "workspace_member" 
      WHERE "user_id" = auth.jwt() ->> 'sub'
    )
  );

-- RLS Policies for message
CREATE POLICY "message_conversation_access" ON "message"
  FOR ALL USING (
    "conversation_id" IN (
      SELECT "id" FROM "conversation" 
      WHERE "workspace_id" IN (
        SELECT "workspace_id" FROM "workspace_member" 
        WHERE "user_id" = auth.jwt() ->> 'sub'
      )
    )
  );

-- RLS Policies for message_link
CREATE POLICY "message_link_message_access" ON "message_link"
  FOR ALL USING (
    "message_id" IN (
      SELECT "id" FROM "message" 
      WHERE "conversation_id" IN (
        SELECT "id" FROM "conversation" 
        WHERE "workspace_id" IN (
          SELECT "workspace_id" FROM "workspace_member" 
          WHERE "user_id" = auth.jwt() ->> 'sub'
        )
      )
    )
  );
