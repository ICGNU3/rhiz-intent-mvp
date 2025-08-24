CREATE TABLE IF NOT EXISTS "claim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"confidence" integer DEFAULT 50 NOT NULL,
	"source" text NOT NULL,
	"lawful_basis" text NOT NULL,
	"observed_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"provenance" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collective_opportunity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"workspaces" jsonb NOT NULL,
	"clusters" jsonb NOT NULL,
	"score" integer DEFAULT 50 NOT NULL,
	"status" text DEFAULT 'proposed' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"subject_id" uuid NOT NULL,
	"scope" text NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"policy_version" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_contact_sync" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"crm_id" text NOT NULL,
	"rhiz_person_id" uuid NOT NULL,
	"crm_provider" text NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"sync_status" text DEFAULT 'synced' NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cross_workspace_overlap" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"workspaces" jsonb NOT NULL,
	"overlap_type" text NOT NULL,
	"confidence" integer DEFAULT 80 NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"state" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"from_id" uuid NOT NULL,
	"to_id" uuid NOT NULL,
	"type" text NOT NULL,
	"strength" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "encounter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"kind" text NOT NULL,
	"occurred_at" timestamp NOT NULL,
	"summary" text,
	"raw" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"event" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "graph_insight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"detail" text NOT NULL,
	"person_id" uuid,
	"goal_id" uuid,
	"score" integer DEFAULT 50 NOT NULL,
	"provenance" jsonb,
	"state" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "graph_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"person_id" uuid NOT NULL,
	"metric" text NOT NULL,
	"value" jsonb NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "growth_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insight_share" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insight_id" uuid NOT NULL,
	"shared_by" text NOT NULL,
	"shared_with" text NOT NULL,
	"visibility" text DEFAULT 'workspace' NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'disconnected' NOT NULL,
	"config" jsonb,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"scope" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"full_name" text NOT NULL,
	"primary_email" text,
	"primary_phone" text,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person_encounter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"encounter_id" uuid NOT NULL,
	"role" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referral_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"creator_id" text NOT NULL,
	"max_uses" integer,
	"used" integer DEFAULT 0 NOT NULL,
	"reward_type" text NOT NULL,
	"reward_value" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "referral_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referral_edge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_id" text NOT NULL,
	"invitee_id" text NOT NULL,
	"referral_code_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "suggestion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"kind" text NOT NULL,
	"a_id" uuid NOT NULL,
	"b_id" uuid NOT NULL,
	"goal_id" uuid,
	"score" integer NOT NULL,
	"why" jsonb,
	"draft" jsonb,
	"state" text DEFAULT 'proposed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"due_at" timestamp,
	"data" jsonb,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"slack_user_id" text,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claim_workspace_idx" ON "claim" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claim_owner_idx" ON "claim" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claim_subject_idx" ON "claim" ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "claim_key_idx" ON "claim" ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collective_opportunity_type_idx" ON "collective_opportunity" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collective_opportunity_status_idx" ON "collective_opportunity" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collective_opportunity_created_by_idx" ON "collective_opportunity" ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "consent_workspace_idx" ON "consent" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "consent_owner_idx" ON "consent" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "consent_subject_idx" ON "consent" ("subject_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crm_contact_sync_workspace_idx" ON "crm_contact_sync" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crm_contact_sync_crm_id_idx" ON "crm_contact_sync" ("crm_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crm_contact_sync_person_idx" ON "crm_contact_sync" ("rhiz_person_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crm_contact_sync_provider_idx" ON "crm_contact_sync" ("crm_provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cross_workspace_overlap_person_idx" ON "cross_workspace_overlap" ("person_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cross_workspace_overlap_type_idx" ON "cross_workspace_overlap" ("overlap_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cross_workspace_overlap_state_idx" ON "cross_workspace_overlap" ("state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edge_workspace_idx" ON "edge" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edge_owner_idx" ON "edge" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edge_from_idx" ON "edge" ("from_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edge_to_idx" ON "edge" ("to_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edge_type_idx" ON "edge" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "encounter_workspace_idx" ON "encounter" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "encounter_owner_idx" ON "encounter" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "encounter_occurred_idx" ON "encounter" ("occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_log_workspace_idx" ON "event_log" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_log_owner_idx" ON "event_log" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_log_event_idx" ON "event_log" ("event");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_workspace_idx" ON "goal" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_owner_idx" ON "goal" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goal_kind_idx" ON "goal" ("kind");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_insight_workspace_idx" ON "graph_insight" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_insight_owner_idx" ON "graph_insight" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_insight_type_idx" ON "graph_insight" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_insight_person_idx" ON "graph_insight" ("person_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_insight_goal_idx" ON "graph_insight" ("goal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_insight_state_idx" ON "graph_insight" ("state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_metrics_workspace_idx" ON "graph_metrics" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_metrics_owner_idx" ON "graph_metrics" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_metrics_person_idx" ON "graph_metrics" ("person_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_metrics_metric_idx" ON "graph_metrics" ("metric");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "graph_metrics_unique_idx" ON "graph_metrics" ("person_id","metric");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "growth_event_user_idx" ON "growth_event" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "growth_event_type_idx" ON "growth_event" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "growth_event_created_idx" ON "growth_event" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insight_share_insight_idx" ON "insight_share" ("insight_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insight_share_shared_by_idx" ON "insight_share" ("shared_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insight_share_shared_with_idx" ON "insight_share" ("shared_with");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insight_share_workspace_idx" ON "insight_share" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "insight_share_visibility_idx" ON "insight_share" ("visibility");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_workspace_idx" ON "integration" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_provider_idx" ON "integration" ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_status_idx" ON "integration" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_workspace_idx" ON "notification" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_user_idx" ON "notification" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_read_idx" ON "notification" ("read_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_token_workspace_idx" ON "oauth_token" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_token_provider_idx" ON "oauth_token" ("provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_domain_idx" ON "org" ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "person_workspace_idx" ON "person" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "person_owner_idx" ON "person" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "person_email_idx" ON "person" ("primary_email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "person_encounter_person_idx" ON "person_encounter" ("person_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "person_encounter_encounter_idx" ON "person_encounter" ("encounter_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referral_code_code_idx" ON "referral_code" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referral_code_creator_idx" ON "referral_code" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referral_code_used_idx" ON "referral_code" ("used");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referral_edge_inviter_idx" ON "referral_edge" ("inviter_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referral_edge_invitee_idx" ON "referral_edge" ("invitee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referral_edge_code_idx" ON "referral_edge" ("referral_code_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "suggestion_workspace_idx" ON "suggestion" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "suggestion_owner_idx" ON "suggestion" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "suggestion_goal_idx" ON "suggestion" ("goal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "suggestion_state_idx" ON "suggestion" ("state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_workspace_idx" ON "task" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_owner_idx" ON "task" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_due_idx" ON "task" ("due_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_owner_idx" ON "workspace" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_activity_workspace_idx" ON "workspace_activity" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_activity_user_idx" ON "workspace_activity" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_activity_created_idx" ON "workspace_activity" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_member_workspace_idx" ON "workspace_member" ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_member_user_idx" ON "workspace_member" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_member_slack_user_idx" ON "workspace_member" ("slack_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_member_unique_idx" ON "workspace_member" ("workspace_id","user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claim" ADD CONSTRAINT "claim_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consent" ADD CONSTRAINT "consent_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consent" ADD CONSTRAINT "consent_subject_id_person_id_fk" FOREIGN KEY ("subject_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_contact_sync" ADD CONSTRAINT "crm_contact_sync_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_contact_sync" ADD CONSTRAINT "crm_contact_sync_rhiz_person_id_person_id_fk" FOREIGN KEY ("rhiz_person_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cross_workspace_overlap" ADD CONSTRAINT "cross_workspace_overlap_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edge" ADD CONSTRAINT "edge_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edge" ADD CONSTRAINT "edge_from_id_person_id_fk" FOREIGN KEY ("from_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edge" ADD CONSTRAINT "edge_to_id_person_id_fk" FOREIGN KEY ("to_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encounter" ADD CONSTRAINT "encounter_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_log" ADD CONSTRAINT "event_log_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal" ADD CONSTRAINT "goal_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "graph_insight" ADD CONSTRAINT "graph_insight_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "graph_insight" ADD CONSTRAINT "graph_insight_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "graph_insight" ADD CONSTRAINT "graph_insight_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "goal"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "graph_metrics" ADD CONSTRAINT "graph_metrics_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "graph_metrics" ADD CONSTRAINT "graph_metrics_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insight_share" ADD CONSTRAINT "insight_share_insight_id_graph_insight_id_fk" FOREIGN KEY ("insight_id") REFERENCES "graph_insight"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insight_share" ADD CONSTRAINT "insight_share_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integration" ADD CONSTRAINT "integration_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_token" ADD CONSTRAINT "oauth_token_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person" ADD CONSTRAINT "person_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_encounter" ADD CONSTRAINT "person_encounter_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_encounter" ADD CONSTRAINT "person_encounter_encounter_id_encounter_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "encounter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referral_edge" ADD CONSTRAINT "referral_edge_referral_code_id_referral_code_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "referral_code"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_a_id_person_id_fk" FOREIGN KEY ("a_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_b_id_person_id_fk" FOREIGN KEY ("b_id") REFERENCES "person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_goal_id_goal_id_fk" FOREIGN KEY ("goal_id") REFERENCES "goal"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_activity" ADD CONSTRAINT "workspace_activity_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
