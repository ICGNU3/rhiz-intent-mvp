import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@rhiz/db';
import { workspace, graphInsight } from '@rhiz/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { GraphInsightAgent } from '@rhiz/core/graph/insights';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goal');
    const cluster = searchParams.get('cluster');
    const limit = parseInt(searchParams.get('limit') || '5');

    // Get user's workspace
    const workspaceData = await db.query.workspace.findFirst({
      where: (workspace, { eq }) => eq(workspace.ownerId, userId),
    });

    if (!workspaceData) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Build query for insights
    let insightsQuery = db
      .select()
      .from(graphInsight)
      .where(
        and(
          eq(graphInsight.workspaceId, workspaceData.id),
          eq(graphInsight.state, 'active')
        )
      )
      .orderBy(desc(graphInsight.score))
      .limit(limit);

    // Apply filters
    if (goalId) {
      insightsQuery = insightsQuery.where(eq(graphInsight.goalId, goalId));
    }

    if (cluster) {
      // Filter by cluster (this would need to be implemented based on community_id)
      // For now, we'll skip cluster filtering
    }

    const insights = await insightsQuery;

    return NextResponse.json({
      insights: insights.map(insight => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        detail: insight.detail,
        personId: insight.personId,
        goalId: insight.goalId,
        score: insight.score,
        provenance: insight.provenance,
        createdAt: insight.createdAt
      }))
    });

  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace
    const workspaceData = await db.query.workspace.findFirst({
      where: (workspace, { eq }) => eq(workspace.ownerId, userId),
    });

    if (!workspaceData) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Generate fresh insights
    const insights = await GraphInsightAgent.generateInsights(workspaceData.id, userId);

    return NextResponse.json({
      message: 'Insights generated successfully',
      count: insights.length,
      insights: insights.map(insight => ({
        type: insight.type,
        title: insight.title,
        detail: insight.detail,
        score: insight.score
      }))
    });

  } catch (error) {
    console.error('Generate insights API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
