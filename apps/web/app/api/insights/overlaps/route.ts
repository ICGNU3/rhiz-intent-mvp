import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@rhiz/db';
import { workspace, crossWorkspaceOverlap } from '@rhiz/db/schema';
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

    // Get overlaps for this workspace
    const overlaps = await db
      .select()
      .from(crossWorkspaceOverlap)
      .where(eq(crossWorkspaceOverlap.state, 'active'))
      .orderBy(desc(crossWorkspaceOverlap.detectedAt));

    // Filter overlaps that involve the user's workspace
    const relevantOverlaps = overlaps.filter(overlap => 
      overlap.workspaces.includes(workspaceData.id)
    );

    return NextResponse.json({
      overlaps: relevantOverlaps.map(overlap => ({
        id: overlap.id,
        person: overlap.personId,
        workspaces: overlap.workspaces,
        overlapType: overlap.overlapType,
        confidence: overlap.confidence,
        detectedAt: overlap.detectedAt,
        state: overlap.state
      }))
    });

  } catch (error) {
    console.error('Overlaps API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
