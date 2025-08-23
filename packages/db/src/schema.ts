import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { pgVector } from 'pgvector/drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { createCipherGCM, createDecipherGCM, randomBytes } from 'crypto';

// Encryption helpers with AES-256-GCM
const encryptField = (value: string | null, encryptionKey?: string): string | null => {
  if (!value || !encryptionKey) return value;
  
  try {
    const iv = randomBytes(16);
    const cipher = createCipherGCM('aes-256-gcm', encryptionKey);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

const decryptField = (value: string | null, encryptionKey?: string): string | null => {
  if (!value || !encryptionKey) return value;
  
  try {
    const parts = value.split(':');
    if (parts.length !== 3) {
      // Fallback for old base64 format
      return Buffer.from(value, 'base64').toString();
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipherGCM('aes-256-gcm', encryptionKey);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Workspace table
export const workspace = pgTable('workspace', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: text('owner_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index('workspace_owner_idx').on(table.ownerId),
}));

// Workspace members table
export const workspaceMember = pgTable('workspace_member', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  userId: text('user_id').notNull(),
  slackUserId: text('slack_user_id'), // Slack user ID for notifications
  role: text('role').notNull().default('member'), // 'admin', 'member'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('workspace_member_workspace_idx').on(table.workspaceId),
  userIdx: index('workspace_member_user_idx').on(table.userId),
  slackUserIdx: index('workspace_member_slack_user_idx').on(table.slackUserId),
  uniqueMember: index('workspace_member_unique_idx').on(table.workspaceId, table.userId),
}));

// Workspace activity feed
export const workspaceActivity = pgTable('workspace_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(), // 'created_goal', 'accepted_intro', 'added_person'
  entityType: text('entity_type'), // 'goal', 'suggestion', 'person'
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'), // Additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('workspace_activity_workspace_idx').on(table.workspaceId),
  userIdx: index('workspace_activity_user_idx').on(table.userId),
  createdIdx: index('workspace_activity_created_idx').on(table.createdAt),
}));

// Notifications table
export const notification = pgTable('notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'new_suggestion', 'intro_accepted', 'goal_completed'
  message: text('message').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('notification_workspace_idx').on(table.workspaceId),
  userIdx: index('notification_user_idx').on(table.userId),
  readIdx: index('notification_read_idx').on(table.readAt),
}));

// People table
export const person = pgTable('person', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(), // RLS partition key
  fullName: text('full_name').notNull(),
  primaryEmail: text('primary_email'),
  primaryPhone: text('primary_phone'), // Will be encrypted
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('person_workspace_idx').on(table.workspaceId),
  ownerIdx: index('person_owner_idx').on(table.ownerId),
  emailIdx: index('person_email_idx').on(table.primaryEmail),
}));

// Organizations table
export const org = pgTable('org', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  domain: text('domain'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  domainIdx: index('org_domain_idx').on(table.domain),
}));

// Encounters table (meetings, calls, etc.)
export const encounter = pgTable('encounter', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  kind: text('kind').notNull(), // 'meeting', 'call', 'voice_note', 'email'
  occurredAt: timestamp('occurred_at').notNull(),
  summary: text('summary'),
  raw: jsonb('raw'), // Raw event data
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('encounter_workspace_idx').on(table.workspaceId),
  ownerIdx: index('encounter_owner_idx').on(table.ownerId),
  occurredIdx: index('encounter_occurred_idx').on(table.occurredAt),
}));

// Person-Encounter relationships
export const personEncounter = pgTable('person_encounter', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id').references(() => person.id).notNull(),
  encounterId: uuid('encounter_id').references(() => encounter.id).notNull(),
  role: text('role').notNull(), // 'attendee', 'organizer', 'mentioned'
}, (table) => ({
  personIdx: index('person_encounter_person_idx').on(table.personId),
  encounterIdx: index('person_encounter_encounter_idx').on(table.encounterId),
}));

// Edges table (relationships between people)
export const edge = pgTable('edge', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  fromId: uuid('from_id').references(() => person.id).notNull(),
  toId: uuid('to_id').references(() => person.id).notNull(),
  type: text('type').notNull(), // 'encounter', 'intro', 'goal_link'
  strength: integer('strength').notNull().default(1), // 0-10 scale
  metadata: jsonb('metadata'), // Additional relationship metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('edge_workspace_idx').on(table.workspaceId),
  ownerIdx: index('edge_owner_idx').on(table.ownerId),
  fromIdx: index('edge_from_idx').on(table.fromId),
  toIdx: index('edge_to_idx').on(table.toId),
  typeIdx: index('edge_type_idx').on(table.type),
}));

// Claims table (facts about people/orgs)
export const claim = pgTable('claim', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  subjectType: text('subject_type').notNull(), // 'person', 'org'
  subjectId: uuid('subject_id').notNull(),
  key: text('key').notNull(), // 'title', 'company', 'location', 'expertise'
  value: text('value').notNull(),
  confidence: integer('confidence').notNull().default(50), // 0-100
  source: text('source').notNull(), // 'calendar', 'voice', 'enrichment', 'manual'
  lawfulBasis: text('lawful_basis').notNull(), // 'consent', 'legitimate_interest'
  observedAt: timestamp('observed_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  provenance: jsonb('provenance'), // How we got this information
}, (table) => ({
  workspaceIdx: index('claim_workspace_idx').on(table.workspaceId),
  ownerIdx: index('claim_owner_idx').on(table.ownerId),
  subjectIdx: index('claim_subject_idx').on(table.subjectType, table.subjectId),
  keyIdx: index('claim_key_idx').on(table.key),
}));

// Goals table (user intents)
export const goal = pgTable('goal', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  kind: text('kind').notNull(), // 'raise_seed', 'hire_engineer', 'break_into_city'
  title: text('title').notNull(),
  details: text('details'),
  status: text('status').notNull().default('active'), // 'active', 'completed', 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('goal_workspace_idx').on(table.workspaceId),
  ownerIdx: index('goal_owner_idx').on(table.ownerId),
  kindIdx: index('goal_kind_idx').on(table.kind),
}));

// Suggestions table (intro recommendations)
export const suggestion = pgTable('suggestion', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  kind: text('kind').notNull(), // 'introduction', 'follow_up', 'reconnect'
  aId: uuid('a_id').references(() => person.id).notNull(),
  bId: uuid('b_id').references(() => person.id).notNull(),
  goalId: uuid('goal_id').references(() => goal.id),
  score: integer('score').notNull(), // 1-100
  why: jsonb('why'), // Explanation of why this match makes sense
  draft: jsonb('draft'), // Draft messages
  state: text('state').notNull().default('proposed'), // 'proposed', 'accepted', 'sent', 'completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('suggestion_workspace_idx').on(table.workspaceId),
  ownerIdx: index('suggestion_owner_idx').on(table.ownerId),
  goalIdx: index('suggestion_goal_idx').on(table.goalId),
  stateIdx: index('suggestion_state_idx').on(table.state),
}));

// Consent table
export const consent = pgTable('consent', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  subjectId: uuid('subject_id').references(() => person.id).notNull(),
  scope: text('scope').notNull(), // 'data_processing', 'communications'
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  policyVersion: text('policy_version').notNull(),
}, (table) => ({
  workspaceIdx: index('consent_workspace_idx').on(table.workspaceId),
  ownerIdx: index('consent_owner_idx').on(table.ownerId),
  subjectIdx: index('consent_subject_idx').on(table.subjectId),
}));

// Tasks table (follow-ups, reminders)
export const task = pgTable('task', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  dueAt: timestamp('due_at'),
  data: jsonb('data'), // Task-specific data
  completed: boolean('completed').notNull().default(false),
}, (table) => ({
  workspaceIdx: index('task_workspace_idx').on(table.workspaceId),
  ownerIdx: index('task_owner_idx').on(table.ownerId),
  dueIdx: index('task_due_idx').on(table.dueAt),
}));

// Event log for audit trail
export const eventLog = pgTable('event_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  event: text('event').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('event_log_workspace_idx').on(table.workspaceId),
  ownerIdx: index('event_log_owner_idx').on(table.ownerId),
  eventIdx: index('event_log_event_idx').on(table.event),
}));

// Integration tables
export const integration = pgTable('integration', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  provider: text('provider').notNull(), // 'slack', 'google', 'hubspot', 'salesforce'
  status: text('status').notNull().default('disconnected'), // 'connected', 'disconnected', 'error'
  config: jsonb('config'), // Provider-specific configuration
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('integration_workspace_idx').on(table.workspaceId),
  providerIdx: index('integration_provider_idx').on(table.provider),
  statusIdx: index('integration_status_idx').on(table.status),
}));

// OAuth tokens table (encrypted at rest)
export const oauthToken = pgTable('oauth_token', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  provider: text('provider').notNull(), // 'google', 'slack', 'hubspot'
  accessToken: text('access_token').notNull(), // Encrypted
  refreshToken: text('refresh_token'), // Encrypted
  expiresAt: timestamp('expires_at'),
  scope: text('scope').notNull(), // OAuth scopes granted
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('oauth_token_workspace_idx').on(table.workspaceId),
  providerIdx: index('oauth_token_provider_idx').on(table.provider),
}));

// CRM contact sync table
export const crmContactSync = pgTable('crm_contact_sync', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  crmId: text('crm_id').notNull(), // External CRM contact ID
  rhizPersonId: uuid('rhiz_person_id').references(() => person.id).notNull(),
  crmProvider: text('crm_provider').notNull(), // 'hubspot', 'salesforce'
  lastSyncedAt: timestamp('last_synced_at').defaultNow().notNull(),
  syncStatus: text('sync_status').notNull().default('synced'), // 'synced', 'pending', 'error'
  metadata: jsonb('metadata'), // Additional sync metadata
}, (table) => ({
  workspaceIdx: index('crm_contact_sync_workspace_idx').on(table.workspaceId),
  crmIdIdx: index('crm_contact_sync_crm_id_idx').on(table.crmId),
  personIdx: index('crm_contact_sync_person_idx').on(table.rhizPersonId),
  providerIdx: index('crm_contact_sync_provider_idx').on(table.crmProvider),
}));

// Referral code table
export const referralCode = pgTable('referral_code', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  creatorId: text('creator_id').notNull(), // User who created the code
  maxUses: integer('max_uses'), // null = unlimited
  used: integer('used').notNull().default(0),
  rewardType: text('reward_type').notNull(), // 'credit', 'upgrade', 'invite'
  rewardValue: integer('reward_value'), // Amount of reward (credits, days, invites)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // null = never expires
}, (table) => ({
  codeIdx: index('referral_code_code_idx').on(table.code),
  creatorIdx: index('referral_code_creator_idx').on(table.creatorId),
  usedIdx: index('referral_code_used_idx').on(table.used),
}));

// Referral edge table (invite tree)
export const referralEdge = pgTable('referral_edge', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviterId: text('inviter_id').notNull(), // User who sent the invite
  inviteeId: text('invitee_id').notNull(), // User who was invited
  referralCodeId: uuid('referral_code_id').references(() => referralCode.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  inviterIdx: index('referral_edge_inviter_idx').on(table.inviterId),
  inviteeIdx: index('referral_edge_invitee_idx').on(table.inviteeId),
  codeIdx: index('referral_edge_code_idx').on(table.referralCodeId),
}));

// Growth event table (viral analytics)
export const growthEvent = pgTable('growth_event', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'signup', 'invite_sent', 'invite_redeemed', 'share_clicked'
  meta: jsonb('meta'), // Additional event metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('growth_event_user_idx').on(table.userId),
  typeIdx: index('growth_event_type_idx').on(table.type),
  createdIdx: index('growth_event_created_idx').on(table.createdAt),
}));

// Graph metrics table (computed metrics for each person)
export const graphMetrics = pgTable('graph_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  personId: uuid('person_id').references(() => person.id).notNull(),
  metric: text('metric').notNull(), // 'degree_centrality', 'betweenness_centrality', 'community_id', 'edge_freshness'
  value: jsonb('value').notNull(), // Can be number, string, or object depending on metric
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
}, (table) => ({
  workspaceIdx: index('graph_metrics_workspace_idx').on(table.workspaceId),
  ownerIdx: index('graph_metrics_owner_idx').on(table.ownerId),
  personIdx: index('graph_metrics_person_idx').on(table.personId),
  metricIdx: index('graph_metrics_metric_idx').on(table.metric),
  uniqueMetric: index('graph_metrics_unique_idx').on(table.personId, table.metric),
}));

// Graph insights table (AI-generated insights)
export const graphInsight = pgTable('graph_insight', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  ownerId: text('owner_id').notNull(),
  type: text('type').notNull(), // 'opportunity_gap', 'bridge_builder', 'cluster_insight', 'goal_alignment_gap'
  title: text('title').notNull(),
  detail: text('detail').notNull(),
  personId: uuid('person_id').references(() => person.id),
  goalId: uuid('goal_id').references(() => goal.id),
  score: integer('score').notNull().default(50), // 1-100 relevance score
  provenance: jsonb('provenance'), // {metric, value, reason_generated}
  state: text('state').notNull().default('active'), // 'active', 'dismissed', 'acted_upon'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // When insight becomes stale
}, (table) => ({
  workspaceIdx: index('graph_insight_workspace_idx').on(table.workspaceId),
  ownerIdx: index('graph_insight_owner_idx').on(table.ownerId),
  typeIdx: index('graph_insight_type_idx').on(table.type),
  personIdx: index('graph_insight_person_idx').on(table.personId),
  goalIdx: index('graph_insight_goal_idx').on(table.goalId),
  stateIdx: index('graph_insight_state_idx').on(table.state),
}));

// Insight sharing table
export const insightShare = pgTable('insight_share', {
  id: uuid('id').primaryKey().defaultRandom(),
  insightId: uuid('insight_id').references(() => graphInsight.id).notNull(),
  sharedBy: text('shared_by').notNull(), // User who shared the insight
  sharedWith: text('shared_with').notNull(), // 'workspace' or specific user_id
  visibility: text('visibility').notNull().default('workspace'), // 'private', 'workspace', 'public'
  workspaceId: uuid('workspace_id').references(() => workspace.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  insightIdx: index('insight_share_insight_idx').on(table.insightId),
  sharedByIdx: index('insight_share_shared_by_idx').on(table.sharedBy),
  sharedWithIdx: index('insight_share_shared_with_idx').on(table.sharedWith),
  workspaceIdx: index('insight_share_workspace_idx').on(table.workspaceId),
  visibilityIdx: index('insight_share_visibility_idx').on(table.visibility),
}));

// Cross-workspace overlaps table
export const crossWorkspaceOverlap = pgTable('cross_workspace_overlap', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id').references(() => person.id).notNull(),
  workspaces: jsonb('workspaces').notNull(), // Array of workspace IDs
  overlapType: text('overlap_type').notNull(), // 'email', 'linkedin', 'phone'
  confidence: integer('confidence').notNull().default(80), // 0-100
  detectedAt: timestamp('detected_at').defaultNow().notNull(),
  state: text('state').notNull().default('active'), // 'active', 'resolved', 'ignored'
}, (table) => ({
  personIdx: index('cross_workspace_overlap_person_idx').on(table.personId),
  overlapTypeIdx: index('cross_workspace_overlap_type_idx').on(table.overlapType),
  stateIdx: index('cross_workspace_overlap_state_idx').on(table.state),
}));

// Collective opportunities table
export const collectiveOpportunity = pgTable('collective_opportunity', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // 'investor_founder_match', 'skill_exchange', 'resource_sharing'
  workspaces: jsonb('workspaces').notNull(), // Array of workspace IDs involved
  clusters: jsonb('clusters').notNull(), // Array of cluster descriptions
  score: integer('score').notNull().default(50), // 1-100 opportunity score
  status: text('status').notNull().default('proposed'), // 'proposed', 'active', 'completed', 'dismissed'
  createdBy: text('created_by').notNull(), // System or user who created it
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // When opportunity becomes stale
}, (table) => ({
  typeIdx: index('collective_opportunity_type_idx').on(table.type),
  statusIdx: index('collective_opportunity_status_idx').on(table.status),
  createdByIdx: index('collective_opportunity_created_by_idx').on(table.createdBy),
}));

// Zod schemas for validation
export const insertWorkspaceSchema = createInsertSchema(workspace);
export const selectWorkspaceSchema = createSelectSchema(workspace);

export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMember);
export const selectWorkspaceMemberSchema = createSelectSchema(workspaceMember);

export const insertPersonSchema = createInsertSchema(person);
export const selectPersonSchema = createSelectSchema(person);

export const insertGoalSchema = createInsertSchema(goal);
export const selectGoalSchema = createSelectSchema(goal);

export const insertSuggestionSchema = createInsertSchema(suggestion);
export const selectSuggestionSchema = createSelectSchema(suggestion);

export const insertIntegrationSchema = createInsertSchema(integration);
export const selectIntegrationSchema = createSelectSchema(integration);

export const insertOauthTokenSchema = createInsertSchema(oauthToken);
export const selectOauthTokenSchema = createSelectSchema(oauthToken);

export const insertCrmContactSyncSchema = createInsertSchema(crmContactSync);
export const selectCrmContactSyncSchema = createSelectSchema(crmContactSync);

export const insertReferralCodeSchema = createInsertSchema(referralCode);
export const selectReferralCodeSchema = createSelectSchema(referralCode);

export const insertReferralEdgeSchema = createInsertSchema(referralEdge);
export const selectReferralEdgeSchema = createSelectSchema(referralEdge);

export const insertGrowthEventSchema = createInsertSchema(growthEvent);
export const selectGrowthEventSchema = createSelectSchema(growthEvent);

export const insertEdgeSchema = createInsertSchema(edge);
export const selectEdgeSchema = createSelectSchema(edge);

export const insertGraphMetricsSchema = createInsertSchema(graphMetrics);
export const selectGraphMetricsSchema = createSelectSchema(graphMetrics);

export const insertGraphInsightSchema = createInsertSchema(graphInsight);
export const selectGraphInsightSchema = createSelectSchema(graphInsight);

export const insertInsightShareSchema = createInsertSchema(insightShare);
export const selectInsightShareSchema = createSelectSchema(insightShare);

export const insertCrossWorkspaceOverlapSchema = createInsertSchema(crossWorkspaceOverlap);
export const selectCrossWorkspaceOverlapSchema = createSelectSchema(crossWorkspaceOverlap);

export const insertCollectiveOpportunitySchema = createInsertSchema(collectiveOpportunity);
export const selectCollectiveOpportunitySchema = createSelectSchema(collectiveOpportunity);

// Types
export type Workspace = z.infer<typeof selectWorkspaceSchema>;
export type WorkspaceMember = z.infer<typeof selectWorkspaceMemberSchema>;
export type Person = z.infer<typeof selectPersonSchema>;
export type Goal = z.infer<typeof selectGoalSchema>;
export type Suggestion = z.infer<typeof selectSuggestionSchema>;
export type Integration = z.infer<typeof selectIntegrationSchema>;
export type OauthToken = z.infer<typeof selectOauthTokenSchema>;
export type CrmContactSync = z.infer<typeof selectCrmContactSyncSchema>;
export type ReferralCode = z.infer<typeof selectReferralCodeSchema>;
export type ReferralEdge = z.infer<typeof selectReferralEdgeSchema>;
export type GrowthEvent = z.infer<typeof selectGrowthEventSchema>;
export type Edge = z.infer<typeof selectEdgeSchema>;
export type GraphMetrics = z.infer<typeof selectGraphMetricsSchema>;
export type GraphInsight = z.infer<typeof selectGraphInsightSchema>;
export type InsightShare = z.infer<typeof selectInsightShareSchema>;
export type CrossWorkspaceOverlap = z.infer<typeof selectCrossWorkspaceOverlapSchema>;
export type CollectiveOpportunity = z.infer<typeof selectCollectiveOpportunitySchema>;

// Encryption helpers
export const encryptPhone = (phone: string | null): string | null => {
  const key = process.env.ENCRYPTION_KEY;
  return encryptField(phone, key);
};

export const decryptPhone = (phone: string | null): string | null => {
  const key = process.env.ENCRYPTION_KEY;
  return decryptField(phone, key);
};

export const encryptOAuthToken = (token: string | null): string | null => {
  const key = process.env.ENCRYPTION_KEY;
  return encryptField(token, key);
};

export const decryptOAuthToken = (token: string | null): string | null => {
  const key = process.env.ENCRYPTION_KEY;
  return decryptField(token, key);
};
