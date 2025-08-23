import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@rhiz/db';
import { edge, person, claim, goal } from '@rhiz/db/schema';
import { GraphBuilder } from '@rhiz/workers/src/agents/graph-builder';
import { eq } from 'drizzle-orm';

describe('Graph API', () => {
  const testWorkspaceId = 'test-workspace-id';
  const testOwnerId = 'test-owner-id';

  beforeEach(async () => {
    // Clean up test data
    await db.delete(edge);
    await db.delete(claim);
    await db.delete(person);
    await db.delete(goal);
  });

  afterEach(async () => {
    // Clean up after tests
    await db.delete(edge);
    await db.delete(claim);
    await db.delete(person);
    await db.delete(goal);
  });

  describe('GraphBuilder', () => {
    it('should create encounter edges when people meet', async () => {
      // Create test people
      const person1 = await db.insert(person).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fullName: 'Alice Johnson',
        primaryEmail: 'alice@test.com',
      }).returning();

      const person2 = await db.insert(person).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fullName: 'Bob Smith',
        primaryEmail: 'bob@test.com',
      }).returning();

      // Create encounter relationship
      await db.insert(edge).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fromId: person1[0].id,
        toId: person2[0].id,
        type: 'encounter',
        strength: 5,
        metadata: { encounterId: 'test-encounter' },
      });

      // Verify edge was created
      const edges = await db.select().from(edge).where(eq(edge.workspaceId, testWorkspaceId));
      expect(edges).toHaveLength(1);
      expect(edges[0].type).toBe('encounter');
      expect(edges[0].strength).toBe(5);
    });

    it('should create intro edges when suggestions are accepted', async () => {
      // Create test people
      const person1 = await db.insert(person).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fullName: 'Alice Johnson',
        primaryEmail: 'alice@test.com',
      }).returning();

      const person2 = await db.insert(person).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fullName: 'Bob Smith',
        primaryEmail: 'bob@test.com',
      }).returning();

      // Create intro edge
      await db.insert(edge).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fromId: person1[0].id,
        toId: person2[0].id,
        type: 'intro',
        strength: 8,
        metadata: { suggestionId: 'test-suggestion' },
      });

      // Verify edge was created
      const edges = await db.select().from(edge).where(eq(edge.workspaceId, testWorkspaceId));
      expect(edges).toHaveLength(1);
      expect(edges[0].type).toBe('intro');
      expect(edges[0].strength).toBe(8);
    });

    it('should create goal link edges', async () => {
      // Create test person and goal
      const testPerson = await db.insert(person).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fullName: 'Alice Johnson',
        primaryEmail: 'alice@test.com',
      }).returning();

      const testGoal = await db.insert(goal).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        kind: 'raise_seed',
        title: 'Raise Seed Round',
        details: 'Looking to raise $2M',
      }).returning();

      // Create goal link edge
      await db.insert(edge).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fromId: testPerson[0].id,
        toId: testGoal[0].id,
        type: 'goal_link',
        strength: 6,
        metadata: { goalId: testGoal[0].id },
      });

      // Verify edge was created
      const edges = await db.select().from(edge).where(eq(edge.workspaceId, testWorkspaceId));
      expect(edges).toHaveLength(1);
      expect(edges[0].type).toBe('goal_link');
      expect(edges[0].strength).toBe(6);
    });
  });

  describe('Graph Data Structure', () => {
    it('should return correct node and edge structure', async () => {
      // Create test people with tags
      const person1 = await db.insert(person).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fullName: 'Alice Johnson',
        primaryEmail: 'alice@test.com',
        location: 'San Francisco, CA',
      }).returning();

      const person2 = await db.insert(person).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fullName: 'Bob Smith',
        primaryEmail: 'bob@test.com',
        location: 'New York, NY',
      }).returning();

      // Add tags
      await db.insert(claim).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        subjectType: 'person',
        subjectId: person1[0].id,
        key: 'tag',
        value: 'engineer',
        confidence: 90,
        source: 'manual',
        lawfulBasis: 'legitimate_interest',
      });

      await db.insert(claim).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        subjectType: 'person',
        subjectId: person2[0].id,
        key: 'tag',
        value: 'investor',
        confidence: 90,
        source: 'manual',
        lawfulBasis: 'legitimate_interest',
      });

      // Create edge between them
      await db.insert(edge).values({
        workspaceId: testWorkspaceId,
        ownerId: testOwnerId,
        fromId: person1[0].id,
        toId: person2[0].id,
        type: 'intro',
        strength: 8,
        metadata: { suggestionId: 'test-suggestion' },
      });

      // Verify data structure
      const people = await db.select().from(person).where(eq(person.workspaceId, testWorkspaceId));
      const edges = await db.select().from(edge).where(eq(edge.workspaceId, testWorkspaceId));
      const claims = await db.select().from(claim).where(eq(claim.workspaceId, testWorkspaceId));

      expect(people).toHaveLength(2);
      expect(edges).toHaveLength(1);
      expect(claims).toHaveLength(2);

      // Verify edge structure
      const edgeData = edges[0];
      expect(edgeData.fromId).toBe(person1[0].id);
      expect(edgeData.toId).toBe(person2[0].id);
      expect(edgeData.type).toBe('intro');
      expect(edgeData.strength).toBe(8);
    });
  });
});
