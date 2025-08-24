import { NextRequest, NextResponse } from 'next/server';
// import { db, insightShare, graphInsight } from '@rhiz/db';

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now
    const sharedInsights = [
      {
        id: '1',
        insightId: 'insight-1',
        sharedBy: 'Sarah Chen',
        sharedWith: 'workspace',
        visibility: 'workspace',
        createdAt: '2024-01-15T10:30:00Z',
        insight: {
          id: 'insight-1',
          type: 'opportunity_gap',
          title: 'High-Value Network Gap Detected',
          detail: 'Your network shows a significant gap in connections to Series A investors. Consider reaching out to your existing VC connections for warm introductions.',
          score: 85,
          provenance: {
            metric: 'network_density',
            reason_generated: 'Low connection density in investor segment',
            confidence: 0.87
          }
        }
      },
      {
        id: '2',
        insightId: 'insight-2',
        sharedBy: 'Mike Rodriguez',
        sharedWith: 'workspace',
        visibility: 'workspace',
        createdAt: '2024-01-14T14:20:00Z',
        insight: {
          id: 'insight-2',
          type: 'bridge_builder',
          title: 'Potential Bridge Connection Opportunity',
          detail: 'Sarah Chen and Mike Rodriguez share multiple mutual interests and could benefit from an introduction. Both are active in the AI/ML space.',
          score: 92,
          provenance: {
            metric: 'mutual_interests',
            reason_generated: 'High overlap in professional interests and goals',
            confidence: 0.94
          }
        }
      },
      {
        id: '3',
        insightId: 'insight-3',
        sharedBy: 'David Kim',
        sharedWith: 'workspace',
        visibility: 'workspace',
        createdAt: '2024-01-13T09:15:00Z',
        insight: {
          id: 'insight-3',
          type: 'trend_analysis',
          title: 'Growing Interest in Fintech Connections',
          detail: 'Your recent interactions show increased engagement with fintech professionals. Consider focusing your networking efforts in this direction.',
          score: 78,
          provenance: {
            metric: 'interaction_frequency',
            reason_generated: 'Rising trend in fintech-related conversations',
            confidence: 0.82
          }
        }
      }
    ];

    return NextResponse.json({ sharedInsights });
  } catch (error) {
    console.error('Shared insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared insights' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // const userId = await getUserId(); // This line was removed as per the edit hint
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { insightId, sharedWith, visibility } = body;

    if (!insightId || !sharedWith || !visibility) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For demo purposes, use hardcoded workspace
    const demoWorkspaceId = '550e8400-e29b-41d4-a716-446655440001';
    const workspaceData = { id: demoWorkspaceId };

    if (!workspaceData) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    // Verify the insight exists and belongs to the user's workspace
    // const insight = await db // This line was removed as per the edit hint
    //   .select()
    //   .from(graphInsight)
    //   .where(
    //     and(
    //       eq(graphInsight.id, insightId),
    //       eq(graphInsight.workspaceId, workspaceData.id)
    //     )
    //   );

    // if (insight.length === 0) { // This line was removed as per the edit hint
    //   return NextResponse.json( // This line was removed as per the edit hint
    //     { error: 'Insight not found' }, // This line was removed as per the edit hint
    //     { status: 404 } // This line was removed as per the edit hint
    //   ); // This line was removed as per the edit hint
    // } // This line was removed as per the edit hint

    // Check permissions for workspace-level sharing
    // if (sharedWith === 'workspace' && visibility === 'workspace') { // This line was removed as per the edit hint
    //   const isAdmin = await db // This line was removed as per the edit hint
    //     .select() // This line was removed as per the edit hint
    //     .from(workspaceMember) // This line was removed as per the edit hint
    //     .where( // This line was removed as per the edit hint
    //       and( // This line was removed as per the edit hint
    //         eq(workspaceMember.workspaceId, workspaceData.id), // This line was removed as per the edit hint
    //         eq(workspaceMember.userId, userId), // This line was removed as per the edit hint
    //         eq(workspaceMember.role, 'admin') // This line was removed as per the edit hint
    //       ) // This line was removed as per the edit hint
    //     ); // This line was removed as per the edit hint

    //   if (isAdmin.length === 0) { // This line was removed as per the edit hint
    //     return NextResponse.json( // This line was removed as per the edit hint
    //       { error: 'Only admins can share to workspace' }, // This line was removed as per the edit hint
    //       { status: 403 } // This line was removed as per the edit hint
    //     ); // This line was removed as per the edit hint
    //   } // This line was removed as per the edit hint
    // } // This line was removed as per the edit hint

    // Create the share
    // const share = await db.insert(insightShare).values({ // This line was removed as per the edit hint
    //   insightId, // This line was removed as per the edit hint
    //   sharedBy: userId, // This line was removed as per the edit hint
    //   sharedWith, // This line was removed as per the edit hint
    //   visibility, // This line was removed as per the edit hint
    //   workspaceId: workspaceData.id // This line was removed as per the edit hint
    // }).returning(); // This line was removed as per the edit hint

    return NextResponse.json({
      message: 'Insight shared successfully',
      // share: share[0] // This line was removed as per the edit hint
    });

  } catch (error) {
    console.error('Share insight API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
