import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return demo data that shows immediate value
    const demoData = {
      networkInsights: {
        totalConnections: 127,
        activeConnections: 89,
        dormantConnections: 38,
        industries: ['Technology', 'Finance', 'Healthcare', 'Education'],
        topConnections: [
          {
            name: 'Sarah Chen',
            company: 'Sequoia Capital',
            role: 'Partner',
            strength: 95,
            lastContact: '2 days ago',
            mutualConnections: 12
          },
          {
            name: 'Mike Rodriguez',
            company: 'TechCorp',
            role: 'CTO',
            strength: 87,
            lastContact: '1 week ago',
            mutualConnections: 8
          },
          {
            name: 'David Kim',
            company: 'Stripe',
            role: 'VP Engineering',
            strength: 82,
            lastContact: '3 weeks ago',
            mutualConnections: 15
          }
        ]
      },
      opportunities: [
        {
          id: '1',
          type: 'introduction',
          title: 'Sarah Chen ↔ Mike Rodriguez',
          description: 'Both are interested in AI/ML investments and could benefit from connecting',
          score: 94,
          reason: 'High mutual interest in AI, complementary expertise'
        },
        {
          id: '2',
          type: 'reconnection',
          title: 'Reconnect with David Kim',
          description: 'David was recently promoted to VP at Stripe - great time to congratulate',
          score: 88,
          reason: 'Career milestone, strong previous relationship'
        },
        {
          id: '3',
          type: 'goal_alignment',
          title: 'Fundraising Goal Support',
          description: '3 people in your network can help with Series A fundraising',
          score: 91,
          reason: 'Direct experience with fundraising, relevant industry'
        }
      ],
      goals: [
        {
          id: '1',
          title: 'Raise Series A Funding',
          status: 'active',
          progress: 35,
          targetDate: '2024-06-01',
          relatedConnections: 12
        },
        {
          id: '2',
          title: 'Build Advisory Board',
          status: 'active',
          progress: 60,
          targetDate: '2024-04-15',
          relatedConnections: 8
        },
        {
          id: '3',
          title: 'Expand to European Market',
          status: 'planning',
          progress: 15,
          targetDate: '2024-09-01',
          relatedConnections: 5
        }
      ],
      recentActivity: [
        {
          type: 'meeting',
          title: 'Coffee with Sarah Chen',
          date: '2024-01-15',
          outcome: 'Discussed AI investment thesis'
        },
        {
          type: 'introduction',
          title: 'Introduced Mike to David',
          date: '2024-01-12',
          outcome: 'Successful connection made'
        },
        {
          type: 'goal_update',
          title: 'Updated fundraising goal',
          date: '2024-01-10',
          outcome: 'Target increased to $5M'
        }
      ]
    };

    return NextResponse.json(demoData);
  } catch (error) {
    console.error('Demo data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo data' },
      { status: 500 }
    );
  }
}
