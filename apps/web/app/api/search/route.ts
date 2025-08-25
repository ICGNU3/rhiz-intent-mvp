import { NextRequest, NextResponse } from 'next/server';
// import { db, person, goal, suggestion } from '@rhiz/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    // Return mock search results
    const results = {
      people: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          relevance: 85
        }
      ],
      goals: [
        {
          id: '1',
          title: 'Raise Seed Round',
          status: 'active',
          relevance: 75
        }
      ],
      tags: [
        {
          tag: 'investor',
          count: 5,
          relevance: 80
        }
      ]
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
