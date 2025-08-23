import { NextRequest, NextResponse } from 'next/server';
import { db, goal, suggestion, workspaceActivity } from '@rhiz/db';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const ownerId = 'alice-user-id'; // TODO: Get from auth context
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    // Get all goals for the workspace
    const goals = await db
      .select()
      .from(goal)
      .where(eq(goal.workspaceId, workspaceId))
      .orderBy(desc(goal.createdAt));
    
    // Get suggestion counts for each goal
    const allSuggestions = await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.workspaceId, workspaceId));
    
    // Build response with goals and suggestion counts
    const goalsWithCounts = goals.map(g => {
      const suggestionCount = allSuggestions.filter(s => s.goalId === g.id).length;
      
      return {
        id: g.id,
        kind: g.kind,
        title: g.title,
        details: g.details,
        status: g.status,
        createdAt: g.createdAt,
        ownerId: g.ownerId,
        suggestionsCount: suggestionCount,
      };
    });
    
    return NextResponse.json({
      success: true,
      goals: goalsWithCounts,
    });
    
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kind, title, details, workspaceId } = body;
    const ownerId = 'alice-user-id'; // TODO: Get from auth context
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!kind || !title) {
      return NextResponse.json(
        { success: false, error: 'Kind and title are required' },
        { status: 400 }
      );
    }
    
    // Create new goal
    const [newGoal] = await db
      .insert(goal)
      .values({
        workspaceId,
        ownerId,
        kind,
        title,
        details,
        status: 'active',
      })
      .returning();
    
    // Log activity
    await db.insert(workspaceActivity).values({
      workspaceId,
      userId: ownerId,
      action: 'created_goal',
      entityType: 'goal',
      entityId: newGoal.id,
      metadata: { goal_title: title },
    });
    
    return NextResponse.json({
      success: true,
      goal: newGoal,
    });
    
  } catch (error) {
    console.error('Failed to create goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
