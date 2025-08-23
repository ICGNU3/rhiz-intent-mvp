import { NextRequest, NextResponse } from 'next/server';
import { db } from '@rhiz/db';
import { person, edge, claim, goal } from '@rhiz/db/schema';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goal');
    const tag = searchParams.get('tag');
    const timeWindow = searchParams.get('timeWindow'); // '7d', '30d', '90d'
    const depth = parseInt(searchParams.get('depth') || '1');

    // Get user's workspace
    const workspace = await db.query.workspace.findFirst({
      where: (workspace, { eq }) => eq(workspace.ownerId, userId),
    });

    if (!workspace) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Build base query for people
    let peopleQuery = db
      .select()
      .from(person)
      .where(eq(person.workspaceId, workspace.id));

    // Apply filters
    if (goalId) {
      // Get people related to this goal
      const goalPeople = await db
        .select({ personId: edge.fromId })
        .from(edge)
        .where(
          and(
            eq(edge.workspaceId, workspace.id),
            eq(edge.type, 'goal_link'),
            eq(edge.toId, goalId)
          )
        );
      
      const personIds = goalPeople.map(p => p.personId);
      if (personIds.length > 0) {
        peopleQuery = peopleQuery.where(inArray(person.id, personIds));
      }
    }

    if (tag) {
      // Get people with this tag
      const taggedPeople = await db
        .select({ personId: claim.subjectId })
        .from(claim)
        .where(
          and(
            eq(claim.workspaceId, workspace.id),
            eq(claim.key, 'tag'),
            eq(claim.value, tag)
          )
        );
      
      const personIds = taggedPeople.map(p => p.personId);
      if (personIds.length > 0) {
        peopleQuery = peopleQuery.where(inArray(person.id, personIds));
      }
    }

    const people = await peopleQuery;

    // Get edges for these people
    const personIds = people.map(p => p.id);
    let edgesQuery = db
      .select()
      .from(edge)
      .where(
        and(
          eq(edge.workspaceId, workspace.id),
          inArray(edge.fromId, personIds)
        )
      );

    if (timeWindow) {
      const days = timeWindow === '7d' ? 7 : timeWindow === '30d' ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      edgesQuery = edgesQuery.where(
        sql`${edge.createdAt} >= ${cutoffDate}`
      );
    }

    const edges = await edgesQuery;

    // If depth > 1, expand to include connected people
    if (depth > 1) {
      const connectedPersonIds = edges.map(e => e.toId);
      const additionalPeople = await db
        .select()
        .from(person)
        .where(
          and(
            eq(person.workspaceId, workspace.id),
            inArray(person.id, connectedPersonIds)
          )
        );
      
      people.push(...additionalPeople);

      // Get edges for the additional people
      const additionalEdges = await db
        .select()
        .from(edge)
        .where(
          and(
            eq(edge.workspaceId, workspace.id),
            inArray(edge.fromId, connectedPersonIds)
          )
        );

      edges.push(...additionalEdges);
    }

    // Get claims for people to build tags
    const claims = await db
      .select()
      .from(claim)
      .where(
        and(
          eq(claim.workspaceId, workspace.id),
          inArray(claim.subjectId, people.map(p => p.id))
        )
      );

    // Build nodes with tags
    const nodes = people.map(p => {
      const personClaims = claims.filter(c => c.subjectId === p.id);
      const tags = personClaims
        .filter(c => c.key === 'tag')
        .map(c => c.value);
      
      return {
        id: p.id,
        label: p.fullName,
        tags,
        location: p.location,
        email: p.primaryEmail,
      };
    });

    // Build edges
    const graphEdges = edges.map(e => ({
      from: e.fromId,
      to: e.toId,
      type: e.type,
      strength: e.strength / 10, // Normalize to 0-1
      metadata: e.metadata,
    }));

    return NextResponse.json({
      nodes,
      edges: graphEdges,
    });

  } catch (error) {
    console.error('Graph API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
