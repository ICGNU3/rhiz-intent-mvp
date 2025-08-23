import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@rhiz/db';
import { workspace, collectiveOpportunity } from '@rhiz/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    // Get opportunities for this workspace
    const opportunities = await db
      .select()
      .from(collectiveOpportunity)
      .where(eq(collectiveOpportunity.status, 'proposed'))
      .orderBy(desc(collectiveOpportunity.score));

    // Filter opportunities that involve the user's workspace
    const relevantOpportunities = opportunities.filter(opportunity => 
      opportunity.workspaces.includes(workspaceData.id)
    );

    return NextResponse.json({
      opportunities: relevantOpportunities.map(opportunity => ({
        id: opportunity.id,
        title: opportunity.title,
        description: opportunity.description,
        type: opportunity.type,
        workspaces: opportunity.workspaces,
        clusters: opportunity.clusters,
        score: opportunity.score,
        status: opportunity.status,
        createdBy: opportunity.createdBy,
        createdAt: opportunity.createdAt,
        expiresAt: opportunity.expiresAt
      }))
    });

  } catch (error) {
    console.error('Opportunities API error:', error);
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
    const { opportunityId, action } = body; // action: 'activate', 'dismiss'

    if (!opportunityId || !action) {
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

    // Update opportunity status
    const newStatus = action === 'activate' ? 'active' : 'dismissed';
    
    await db
      .update(collectiveOpportunity)
      .set({ status: newStatus })
      .where(eq(collectiveOpportunity.id, opportunityId));

    return NextResponse.json({
      message: `Opportunity ${action}d successfully`,
      status: newStatus
    });

  } catch (error) {
    console.error('Update opportunity API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
