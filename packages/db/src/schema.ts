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

// People table
export const person = pgTable('person', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(), // RLS partition key
  fullName: text('full_name').notNull(),
  primaryEmail: text('primary_email'),
  primaryPhone: text('primary_phone'), // Will be encrypted
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
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
  ownerId: text('owner_id').notNull(),
  kind: text('kind').notNull(), // 'meeting', 'call', 'voice_note', 'email'
  occurredAt: timestamp('occurred_at').notNull(),
  summary: text('summary'),
  raw: jsonb('raw'), // Raw event data
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
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
  ownerId: text('owner_id').notNull(),
  aId: uuid('a_id').references(() => person.id).notNull(),
  bId: uuid('b_id').references(() => person.id).notNull(),
  kind: text('kind').notNull(), // 'colleague', 'friend', 'mentor', 'investor'
  strength: integer('strength').notNull().default(1), // 1-10 scale
  lastSignalAt: timestamp('last_signal_at').defaultNow().notNull(),
  meta: jsonb('meta'), // Additional relationship metadata
}, (table) => ({
  ownerIdx: index('edge_owner_idx').on(table.ownerId),
  pairIdx: index('edge_pair_idx').on(table.aId, table.bId),
}));

// Claims table (facts about people/orgs)
export const claim = pgTable('claim', {
  id: uuid('id').primaryKey().defaultRandom(),
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
  ownerIdx: index('claim_owner_idx').on(table.ownerId),
  subjectIdx: index('claim_subject_idx').on(table.subjectType, table.subjectId),
  keyIdx: index('claim_key_idx').on(table.key),
}));

// Goals table (user intents)
export const goal = pgTable('goal', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(),
  kind: text('kind').notNull(), // 'raise_seed', 'hire_engineer', 'break_into_city'
  title: text('title').notNull(),
  details: text('details'),
  status: text('status').notNull().default('active'), // 'active', 'completed', 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index('goal_owner_idx').on(table.ownerId),
  kindIdx: index('goal_kind_idx').on(table.kind),
}));

// Suggestions table (intro recommendations)
export const suggestion = pgTable('suggestion', {
  id: uuid('id').primaryKey().defaultRandom(),
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
  ownerIdx: index('suggestion_owner_idx').on(table.ownerId),
  goalIdx: index('suggestion_goal_idx').on(table.goalId),
  stateIdx: index('suggestion_state_idx').on(table.state),
}));

// Consent table
export const consent = pgTable('consent', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(),
  subjectId: uuid('subject_id').references(() => person.id).notNull(),
  scope: text('scope').notNull(), // 'data_processing', 'communications'
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  policyVersion: text('policy_version').notNull(),
}, (table) => ({
  ownerIdx: index('consent_owner_idx').on(table.ownerId),
  subjectIdx: index('consent_subject_idx').on(table.subjectId),
}));

// Tasks table (follow-ups, reminders)
export const task = pgTable('task', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  dueAt: timestamp('due_at'),
  data: jsonb('data'), // Task-specific data
  completed: boolean('completed').notNull().default(false),
}, (table) => ({
  ownerIdx: index('task_owner_idx').on(table.ownerId),
  dueIdx: index('task_due_idx').on(table.dueAt),
}));

// Event log for audit trail
export const eventLog = pgTable('event_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(),
  event: text('event').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index('event_log_owner_idx').on(table.ownerId),
  eventIdx: index('event_log_event_idx').on(table.event),
}));

// Zod schemas for validation
export const insertPersonSchema = createInsertSchema(person);
export const selectPersonSchema = createSelectSchema(person);

export const insertGoalSchema = createInsertSchema(goal);
export const selectGoalSchema = createSelectSchema(goal);

export const insertSuggestionSchema = createInsertSchema(suggestion);
export const selectSuggestionSchema = createSelectSchema(suggestion);

// Types
export type Person = z.infer<typeof selectPersonSchema>;
export type Goal = z.infer<typeof selectGoalSchema>;
export type Suggestion = z.infer<typeof selectSuggestionSchema>;

// Encryption helpers
export const encryptPhone = (phone: string | null): string | null => {
  const key = process.env.ENCRYPTION_KEY;
  return encryptField(phone, key);
};

export const decryptPhone = (phone: string | null): string | null => {
  const key = process.env.ENCRYPTION_KEY;
  return decryptField(phone, key);
};
