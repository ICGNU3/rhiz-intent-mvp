import { NextRequest, NextResponse } from 'next/server';
import { db, workspaceMember, workspace } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

// POST /api/workspaces/invite - Invite user to workspace
export async function POST(request: NextRequest) {
  try {
    const userId = 'alice-user-id'; // TODO: Get from auth context
    const { workspaceId, email, role = 'member' } = await request.json();

    if (!workspaceId || !email) {
      return NextResponse.json(
        { error: 'Workspace ID and email are required' },
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
        { error: 'Only workspace admins can invite members' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, email) // Using email as userId for demo
        )
      );

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this workspace' },
        { status: 409 }
      );
    }

    // Add member to workspace
    const [newMember] = await db
      .insert(workspaceMember)
      .values({
        workspaceId,
        userId: email, // Using email as userId for demo
        role,
      })
      .returning();

    // TODO: Send invitation email in production

    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error('Error inviting user to workspace:', error);
    return NextResponse.json(
      { error: 'Failed to invite user to workspace' },
      { status: 500 }
    );
  }
}
