import { NextRequest, NextResponse } from 'next/server';
import { db, goal, suggestion } from '@rhiz/db';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, use the demo user ID
    const ownerId = 'demo-user-id';
    
    // Get all goals for the owner
    const goals = await db
      .select()
      .from(goal)
      .where(eq(goal.ownerId, ownerId))
      .orderBy(desc(goal.createdAt));
    
    // Get suggestion counts for each goal
    const allSuggestions = await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.ownerId, ownerId));
    
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
    const { kind, title, details } = body;
    
    // For demo purposes, use the demo user ID
    const ownerId = 'demo-user-id';
    
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
        ownerId,
        kind,
        title,
        details,
        status: 'active',
      })
      .returning();
    
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
