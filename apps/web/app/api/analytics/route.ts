import { NextRequest, NextResponse } from 'next/server';
import { db, person, suggestion, goal, encounter, eventLog } from '@rhiz/db';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

// GET /api/analytics - Get workspace analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const period = searchParams.get('period') || '30'; // days

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Network Growth: contacts enriched over time
    const networkGrowth = await db
      .select({
        date: sql<string>`DATE(${eventLog.createdAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(eventLog)
      .where(
        and(
          eq(eventLog.workspaceId, workspaceId),
          eq(eventLog.event, 'person_enriched'),
          gte(eventLog.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${eventLog.createdAt})`)
      .orderBy(sql`DATE(${eventLog.createdAt})`);

    // Introductions Created: monthly counts, acceptance rates
    const introductionsData = await db
      .select({
        date: sql<string>`DATE(${suggestion.createdAt})`,
        total: sql<number>`COUNT(*)`,
        accepted: sql<number>`COUNT(CASE WHEN ${suggestion.state} = 'accepted' THEN 1 END)`,
        completed: sql<number>`COUNT(CASE WHEN ${suggestion.state} = 'completed' THEN 1 END)`,
      })
      .from(suggestion)
      .where(
        and(
          eq(suggestion.workspaceId, workspaceId),
          eq(suggestion.kind, 'introduction'),
          gte(suggestion.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${suggestion.createdAt})`)
      .orderBy(sql`DATE(${suggestion.createdAt})`);

    // Goal Progress: goals open vs completed
    const goalProgress = await db
      .select({
        status: goal.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(goal)
      .where(eq(goal.workspaceId, workspaceId))
      .groupBy(goal.status);

    // Dormant Relationships Reactivated
    const dormantRelationships = await db
      .select({
        date: sql<string>`DATE(${encounter.createdAt})`,
        count: sql<number>`COUNT(DISTINCT ${encounter.id})`,
      })
      .from(encounter)
      .where(
        and(
          eq(encounter.workspaceId, workspaceId),
          gte(encounter.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${encounter.createdAt})`)
      .orderBy(sql`DATE(${encounter.createdAt})`);

    // Key metrics
    const totalContacts = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(person)
      .where(eq(person.workspaceId, workspaceId));

    const totalSuggestions = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(suggestion)
      .where(eq(suggestion.workspaceId, workspaceId));

    const acceptedSuggestions = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(suggestion)
      .where(
        and(
          eq(suggestion.workspaceId, workspaceId),
          eq(suggestion.state, 'accepted')
        )
      );

    const activeGoals = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(goal)
      .where(
        and(
          eq(goal.workspaceId, workspaceId),
          eq(goal.status, 'active')
        )
      );

    const analytics = {
      networkGrowth,
      introductionsData,
      goalProgress,
      dormantRelationships,
      metrics: {
        totalContacts: totalContacts[0]?.count || 0,
        totalSuggestions: totalSuggestions[0]?.count || 0,
        acceptedSuggestions: acceptedSuggestions[0]?.count || 0,
        activeGoals: activeGoals[0]?.count || 0,
        acceptanceRate: totalSuggestions[0]?.count 
          ? Math.round((acceptedSuggestions[0]?.count || 0) / totalSuggestions[0]?.count * 100)
          : 0,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
