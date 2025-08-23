import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@rhiz/db';
import { workspace, graphInsight, insightShare, workspaceMember } from '@rhiz/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get('visibility') || 'workspace'; // 'private', 'workspace', 'public'

    // Get user's workspace
    const workspaceData = await db.query.workspace.findFirst({
      where: (workspace, { eq }) => eq(workspace.ownerId, userId),
    });

    if (!workspaceData) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Get shared insights based on visibility
    let sharedInsightsQuery = db
      .select({
        id: insightShare.id,
        insightId: insightShare.insightId,
        sharedBy: insightShare.sharedBy,
        sharedWith: insightShare.sharedWith,
        visibility: insightShare.visibility,
        createdAt: insightShare.createdAt,
        insight: {
          id: graphInsight.id,
          type: graphInsight.type,
          title: graphInsight.title,
          detail: graphInsight.detail,
          personId: graphInsight.personId,
          goalId: graphInsight.goalId,
          score: graphInsight.score,
          provenance: graphInsight.provenance
        }
      })
      .from(insightShare)
      .innerJoin(graphInsight, eq(insightShare.insightId, graphInsight.id))
      .where(eq(insightShare.workspaceId, workspaceData.id))
      .orderBy(desc(insightShare.createdAt));

    // Apply visibility filter
    if (visibility === 'private') {
      sharedInsightsQuery = sharedInsightsQuery.where(eq(insightShare.sharedWith, userId));
    } else if (visibility === 'workspace') {
      // Get workspace members
      const workspaceMembers = await db
        .select({ userId: workspaceMember.userId })
        .from(workspaceMember)
        .where(eq(workspaceMember.workspaceId, workspaceData.id));

      const memberIds = workspaceMembers.map(m => m.userId);
      memberIds.push('workspace'); // Include workspace-level shares

      sharedInsightsQuery = sharedInsightsQuery.where(
        inArray(insightShare.sharedWith, memberIds)
      );
    }
    // For 'public', no additional filter needed

    const sharedInsights = await sharedInsightsQuery;

    return NextResponse.json({
      sharedInsights: sharedInsights.map(item => ({
        id: item.id,
        insight: item.insight,
        sharedBy: item.sharedBy,
        sharedWith: item.sharedWith,
        visibility: item.visibility,
        createdAt: item.createdAt
      }))
    });

  } catch (error) {
    console.error('Shared insights API error:', error);
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

    const body = await request.json();
    const { insightId, sharedWith, visibility } = body;

    if (!insightId || !sharedWith || !visibility) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's workspace
    const workspaceData = await db.query.workspace.findFirst({
      where: (workspace, { eq }) => eq(workspace.ownerId, userId),
    });

    if (!workspaceData) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Verify the insight exists and belongs to the user's workspace
    const insight = await db
      .select()
      .from(graphInsight)
      .where(
        and(
          eq(graphInsight.id, insightId),
          eq(graphInsight.workspaceId, workspaceData.id)
        )
      );

    if (insight.length === 0) {
      return NextResponse.json(
        { error: 'Insight not found' },
        { status: 404 }
      );
    }

    // Check permissions for workspace-level sharing
    if (sharedWith === 'workspace' && visibility === 'workspace') {
      const isAdmin = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, workspaceData.id),
            eq(workspaceMember.userId, userId),
            eq(workspaceMember.role, 'admin')
          )
        );

      if (isAdmin.length === 0) {
        return NextResponse.json(
          { error: 'Only admins can share to workspace' },
          { status: 403 }
        );
      }
    }

    // Create the share
    const share = await db.insert(insightShare).values({
      insightId,
      sharedBy: userId,
      sharedWith,
      visibility,
      workspaceId: workspaceData.id
    }).returning();

    return NextResponse.json({
      message: 'Insight shared successfully',
      share: share[0]
    });

  } catch (error) {
    console.error('Share insight API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
