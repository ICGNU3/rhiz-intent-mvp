import { NextRequest, NextResponse } from 'next/server';
import { db, collectiveOpportunity, workspace } from '@rhiz/db';
import { eq, and, desc } from 'drizzle-orm';
import { sql } from '@rhiz/db';
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
              // Query real opportunities from database
        const opportunitiesData = await db
          .select({
            id: collectiveOpportunity.id,
            title: collectiveOpportunity.title,
            description: collectiveOpportunity.description,
            type: collectiveOpportunity.type,
            score: collectiveOpportunity.score,
            status: collectiveOpportunity.status,
            createdAt: collectiveOpportunity.createdAt,
            workspaces: collectiveOpportunity.workspaces,
            clusters: collectiveOpportunity.clusters,
          })
          .from(collectiveOpportunity)
          .limit(10);

      return NextResponse.json({ opportunities: opportunitiesData });
    } catch (dbError) {
      console.log('Database query failed, falling back to mock data:', dbError);
      
      // Fallback to mock data
    const opportunities = [
      {
        id: '1',
        title: 'Investor-Founder Match',
        description: 'Potential match between startup founders and investors across multiple workspaces. High-value opportunity for fundraising.',
        type: 'investor_founder_match',
        score: 85,
        status: 'proposed',
        createdAt: '2024-01-15T10:30:00Z',
        workspaces: [
          { id: 'workspace-1', name: 'TechCorp Team' },
          { id: 'workspace-2', name: 'StartupXYZ' }
        ],
        clusters: [
          { id: 'cluster-1', name: 'AI/ML Founders' },
          { id: 'cluster-2', name: 'Series A Investors' }
        ]
      },
      {
        id: '2',
        title: 'Cross-Industry Collaboration',
        description: 'Opportunity for collaboration between fintech and design professionals across workspaces.',
        type: 'cross_industry_collaboration',
        score: 78,
        status: 'proposed',
        createdAt: '2024-01-14T14:20:00Z',
        workspaces: [
          { id: 'workspace-1', name: 'TechCorp Team' },
          { id: 'workspace-3', name: 'Venture Capital' },
          { id: 'workspace-4', name: 'Design Studio' }
        ],
        clusters: [
          { id: 'cluster-3', name: 'Fintech Professionals' },
          { id: 'cluster-4', name: 'UX Designers' }
        ]
      }
    ];

    return NextResponse.json({ opportunities });
    }
  } catch (error) {
    console.error('Opportunities API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // const userId = await getUserId();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { title, description, type, workspaces, clusters } = body;

    // Mock response
    return NextResponse.json({
      success: true,
      opportunity: {
        id: 'mock-opportunity-id',
        title,
        description,
        type,
        workspaces,
        clusters,
        score: 75,
        status: 'proposed',
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Opportunities API error:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
