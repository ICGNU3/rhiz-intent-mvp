import { NextRequest, NextResponse } from 'next/server';
// import { db, collectiveOpportunity } from '@rhiz/db';
// import { collectiveOpportunitySchema } from '@rhiz/db/schema';


export async function GET(request: NextRequest) {
  try {
    // Return mock data for now
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
