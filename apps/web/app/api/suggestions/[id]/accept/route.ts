import { NextRequest, NextResponse } from 'next/server';
import { db, suggestion, workspaceActivity, notification, workspaceMember } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = params.id;
    const { workspaceId } = await request.json();
    const userId = 'alice-user-id'; // TODO: Get from auth context
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    // Update suggestion state to accepted
    const [updatedSuggestion] = await db
      .update(suggestion)
      .set({
        state: 'accepted',
      })
      .where(
        and(
          eq(suggestion.id, suggestionId),
          eq(suggestion.workspaceId, workspaceId)
        )
      )
      .returning();
    
    if (!updatedSuggestion) {
      return NextResponse.json(
        { success: false, error: 'Suggestion not found' },
        { status: 404 }
      );
    }
    
    // Log activity
    await db.insert(workspaceActivity).values({
      workspaceId,
      userId,
      action: 'accepted_intro',
      entityType: 'suggestion',
      entityId: suggestionId,
      metadata: {
        suggestion_score: updatedSuggestion.score,
        person_a: updatedSuggestion.aId,
        person_b: updatedSuggestion.bId,
      },
    });
    
    // Create notification for workspace members
    const workspaceMembers = await db
      .select({ userId: workspaceMember.userId })
      .from(workspaceMember)
      .where(eq(workspaceMember.workspaceId, workspaceId));
    
    for (const member of workspaceMembers) {
      if (member.userId !== userId) {
        await db.insert(notification).values({
          workspaceId,
          userId: member.userId,
          type: 'intro_accepted',
          message: `Introduction accepted: ${updatedSuggestion.aId} ↔ ${updatedSuggestion.bId}`,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      suggestion: updatedSuggestion,
    });
    
  } catch (error) {
    console.error('Failed to accept suggestion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept suggestion' },
      { status: 500 }
    );
  }
}
