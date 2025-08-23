import { NextRequest, NextResponse } from 'next/server';
import { db, suggestion } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = params.id;
    
    // For demo purposes, use the demo user ID
    const ownerId = 'demo-user-id';
    
    // Update suggestion state to accepted
    const [updatedSuggestion] = await db
      .update(suggestion)
      .set({
        state: 'accepted',
      })
      .where(
        and(
          eq(suggestion.id, suggestionId),
          eq(suggestion.ownerId, ownerId)
        )
      )
      .returning();
    
    if (!updatedSuggestion) {
      return NextResponse.json(
        { success: false, error: 'Suggestion not found' },
        { status: 404 }
      );
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
