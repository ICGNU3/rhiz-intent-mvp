import { NextRequest, NextResponse } from 'next/server';
// import { db, goal, suggestion, workspaceActivity } from '@rhiz/db';
// import { eq, and, desc } from 'drizzle-orm';
// import { getUserId, requireUser } from '@rhiz/shared';

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now
    const goals = [
      {
        id: '1',
        kind: 'raise_seed',
        title: 'Raise Seed Round',
        details: 'Looking to raise $500K seed round for AI startup',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        kind: 'hire_engineer',
        title: 'Hire Senior Engineer',
        details: 'Need a senior full-stack engineer with React/Node experience',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ goals });
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
    // const userId = await requireUser(); // This line was removed as per the edit hint
    const body = await request.json();
    const { kind, title, details } = body;
    
    // For demo purposes, use hardcoded workspace
    const demoWorkspaceId = '550e8400-e29b-41d4-a716-446655440001';
    const workspaceId = demoWorkspaceId;
    
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
    // const [newGoal] = await db // This line was removed as per the edit hint
    //   .insert(goal)
    //   .values({
    //     workspaceId,
    //     ownerId: userId,
    //     kind,
    //     title,
    //     details,
    //     status: 'active',
    //   })
    //   .returning();
    
    // Log activity
    // await db.insert(workspaceActivity).values({ // This line was removed as per the edit hint
    //   workspaceId,
    //   userId: userId,
    //   action: 'created_goal',
    //   entityType: 'goal',
    //   entityId: newGoal.id,
    //   metadata: { goal_title: title },
    // });
    
    // return NextResponse.json({ // This line was removed as per the edit hint
    //   success: true,
    //   goal: newGoal,
    // });

    // Return mock data for now
    const newGoal = {
      id: '3', // Mock ID
      workspaceId: workspaceId,
      ownerId: 'mock_user_id', // Mock owner ID
      kind,
      title,
      details,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

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
