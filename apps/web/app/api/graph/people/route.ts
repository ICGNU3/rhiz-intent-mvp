import { NextRequest, NextResponse } from 'next/server';
// import { db, person, edge, claim, goal } from '@rhiz/db';
// import { eq, and, inArray, desc, sql } from 'drizzle-orm';
// import { getUserId } from '@rhiz/shared';

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now
    const nodes = [
      {
        id: '1',
        label: 'John Doe',
        tags: ['investor', 'tech'],
        location: 'San Francisco, CA',
        email: 'john@example.com',
      },
      {
        id: '2',
        label: 'Jane Smith',
        tags: ['founder', 'ai'],
        location: 'New York, NY',
        email: 'jane@example.com',
      }
    ];

    const edges = [
      {
        from: '1',
        to: '2',
        type: 'introduction',
        strength: 0.8,
        metadata: { source: 'mutual_interest' }
      }
    ];

    return NextResponse.json({
      nodes,
      edges,
    });

  } catch (error) {
    console.error('Graph API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
