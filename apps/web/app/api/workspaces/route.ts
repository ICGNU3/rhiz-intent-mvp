import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  // Return the demo workspace for now
  const workspaces = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Rhiz Demo Workspace',
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  return NextResponse.json({ workspaces });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, ownerId } = body;

    if (!name || !ownerId) {
      return NextResponse.json(
        { error: 'Name and ownerId are required' },
        { status: 400 }
      );
    }

    // Create a new workspace (mock implementation)
    const workspace = {
      id: `workspace-${Date.now()}`,
      name,
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Workspace creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
