import { NextRequest, NextResponse } from 'next/server';
import { db, workspace, workspaceMember } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

// GET /api/workspaces - List workspaces for current user
export async function GET(request: NextRequest) {
  try {
    const userId = 'alice-user-id'; // TODO: Get from auth context
    
    // Get workspaces where user is a member
    const workspaces = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        role: workspaceMember.role,
      })
      .from(workspace)
      .innerJoin(workspaceMember, eq(workspace.id, workspaceMember.workspaceId))
      .where(eq(workspaceMember.userId, userId))
      .orderBy(workspace.createdAt);

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Create new workspace
export async function POST(request: NextRequest) {
  try {
    const userId = 'alice-user-id'; // TODO: Get from auth context
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      );
    }

    // Create workspace
    const [newWorkspace] = await db
      .insert(workspace)
      .values({
        name,
        ownerId: userId,
      })
      .returning();

    // Add creator as admin member
    await db.insert(workspaceMember).values({
      workspaceId: newWorkspace.id,
      userId,
      role: 'admin',
    });

    return NextResponse.json({ workspace: newWorkspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
