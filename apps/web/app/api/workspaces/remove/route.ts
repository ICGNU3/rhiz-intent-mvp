import { NextRequest, NextResponse } from 'next/server';
import { db, workspaceMember } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

// POST /api/workspaces/remove - Remove user from workspace
export async function POST(request: NextRequest) {
  try {
    const userId = 'alice-user-id'; // TODO: Get from auth context
    const { workspaceId, memberId } = await request.json();

    if (!workspaceId || !memberId) {
      return NextResponse.json(
        { error: 'Workspace ID and member ID are required' },
        { status: 400 }
      );
    }

    // Check if user is admin of the workspace
    const [membership] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
          eq(workspaceMember.role, 'admin')
        )
      );

    if (!membership) {
      return NextResponse.json(
        { error: 'Only workspace admins can remove members' },
        { status: 403 }
      );
    }

    // Check if trying to remove the last admin
    const [memberToRemove] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, memberId)
        )
      );

    if (!memberToRemove) {
      return NextResponse.json(
        { error: 'Member not found in workspace' },
        { status: 404 }
      );
    }

    if (memberToRemove.role === 'admin') {
      // Count admins in workspace
      const admins = await db
        .select()
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, workspaceId),
            eq(workspaceMember.role, 'admin')
          )
        );

      if (admins.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin from workspace' },
          { status: 400 }
        );
      }
    }

    // Remove member from workspace
    await db
      .delete(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, memberId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing user from workspace:', error);
    return NextResponse.json(
      { error: 'Failed to remove user from workspace' },
      { status: 500 }
    );
  }
}
