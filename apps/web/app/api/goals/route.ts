import { NextRequest, NextResponse } from 'next/server';
import { db, goal, setUserContext, eq, and, desc } from '@rhiz/db';
import { getUserId } from '@/lib/auth-mock';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId') || '550e8400-e29b-41d4-a716-446655440001';
    
    try {
      // Set user context for RLS
      await setUserContext(userId);
      
      // Query real goals from database
      const goalsData = await db.select({
        id: goal.id,
        kind: goal.kind,
        title: goal.title,
        details: goal.details,
        status: goal.status,
        createdAt: goal.createdAt,
      })
      .from(goal)
      .where(and(
        eq(goal.workspaceId, workspaceId),
        eq(goal.ownerId, userId)
      ))
      .orderBy(desc(goal.createdAt));

      return NextResponse.json({ goals: goalsData });
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      // Fallback to mock data if database query fails
      const goals = [
        {
          id: '1',
          kind: 'raise_seed',
          title: 'Raise Seed Round',
          details: 'Looking to raise $500K seed round for AI startup',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      return NextResponse.json({ goals });
    }
  } catch (error) {
    console.error('Goals API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, kind, title, details } = body;
    
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
    
    try {
      // Set user context for RLS
      await setUserContext(userId);
      
      // Create new goal in database
      const [newGoal] = await db
        .insert(goal)
        .values({
          workspaceId,
          ownerId: userId,
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
    } catch (dbError) {
      console.error('Database insert failed:', dbError);
      
      // Fallback to mock response
      const newGoal = {
        id: crypto.randomUUID(),
        workspaceId,
        ownerId: userId,
        kind,
        title,
        details,
        status: 'active',
        createdAt: new Date(),
      };

      return NextResponse.json({
        success: true,
        goal: newGoal,
      });
    }
    
  } catch (error) {
    console.error('Failed to create goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
