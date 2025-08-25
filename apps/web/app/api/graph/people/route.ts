import { NextRequest, NextResponse } from 'next/server';
import { db, person, edge, claim, goal } from '@rhiz/db';
import { inArray } from 'drizzle-orm';
import { and, eq, sql, desc } from '@rhiz/db';
import { getUserId } from '@/lib/auth-mock';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId');
    
    // Try to fetch real data from database
    try {
      if (workspaceId) {
        // Fetch people from the workspace
        const people = await db
          .select({
            id: person.id,
            fullName: person.fullName,
            primaryEmail: person.primaryEmail,
            location: person.location,
          })
          .from(person)
          .where(sql`${person.workspaceId} = ${workspaceId}`)
          .limit(20);
        
        // Fetch edges (relationships) between people
        const edges = await db
          .select({
            id: edge.id,
            fromId: edge.fromId,
            toId: edge.toId,
            type: edge.type,
            strength: edge.strength,
            metadata: edge.metadata,
          })
          .from(edge)
          .where(sql`${edge.workspaceId} = ${workspaceId}`)
          .limit(50);
        
        // Transform to graph format
        const nodes = people.map(p => ({
          id: p.id,
          label: p.fullName,
          tags: p.location ? [p.location.split(',')[0].trim()] : [],
          location: p.location,
          email: p.primaryEmail,
        }));
        
        const graphEdges = edges.map(e => ({
          from: e.fromId,
          to: e.toId,
          type: e.type,
          strength: e.strength / 10, // Normalize to 0-1 scale
          metadata: e.metadata || { source: 'database' }
        }));
        
        return NextResponse.json({
          nodes,
          edges: graphEdges,
        });
      }
    } catch (dbError) {
      console.log('Database query failed, falling back to mock data:', dbError);
    }
    
    // Fallback to mock data if database fails
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
