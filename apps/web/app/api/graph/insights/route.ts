import { NextRequest, NextResponse } from 'next/server';
import { db } from '@rhiz/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getUserId } from '@/lib/auth-mock';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');

    // For now, return structured mock data that matches the database schema
    // This will be replaced with actual database queries once the graphInsight table is properly set up
    const insights = [
      {
        id: '1',
        type: 'opportunity_gap',
        title: 'High-Value Network Gap Detected',
        detail: 'Your network shows a significant gap in connections to Series A investors. Consider reaching out to your existing VC connections for warm introductions.',
        personId: null,
        goalId: null,
        score: 85,
        provenance: {
          metric: 'network_density',
          reason_generated: 'Low connection density in investor segment',
          confidence: 0.87
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'bridge_builder',
        title: 'Potential Bridge Connection Opportunity',
        detail: 'Sarah Chen and Mike Rodriguez share multiple mutual interests and could benefit from an introduction. Both are active in the AI/ML space.',
        personId: 'person-1',
        goalId: null,
        score: 92,
        provenance: {
          metric: 'mutual_interests',
          reason_generated: 'High overlap in professional interests and goals',
          confidence: 0.94
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'trend_analysis',
        title: 'Growing Interest in Fintech Connections',
        detail: 'Your recent interactions show increased engagement with fintech professionals. Consider focusing your networking efforts in this direction.',
        personId: null,
        goalId: null,
        score: 78,
        provenance: {
          metric: 'interaction_frequency',
          reason_generated: 'Rising trend in fintech-related conversations',
          confidence: 0.82
        },
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ insights });

  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { workspaceId, insightType, title, detail, personId, goalId, score = 75 } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Generate a proper insight with provenance
    const newInsight = {
      id: crypto.randomUUID(),
      workspaceId,
      type: insightType,
      title,
      detail,
      personId: personId || null,
      goalId: goalId || null,
      score,
      provenance: {
        metric: 'user_generated',
        reason_generated: 'Manual insight creation',
        confidence: 1.0
      },
      createdAt: new Date().toISOString()
    };

    // TODO: When graphInsight table is available, insert into database:
    // const [insight] = await db.insert(graphInsight).values(newInsight).returning();

    return NextResponse.json({
      success: true,
      insight: newInsight
    });

  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
