import { NextRequest, NextResponse } from 'next/server';
import { db, workspaceActivity } from '@rhiz/db';
import { eq, desc } from 'drizzle-orm';

// GET /api/workspaces/activity - Get workspace activity feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    const activities = await db
      .select()
      .from(workspaceActivity)
      .where(eq(workspaceActivity.workspaceId, workspaceId))
      .orderBy(desc(workspaceActivity.createdAt))
      .limit(limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching workspace activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace activity' },
      { status: 500 }
    );
  }
}
