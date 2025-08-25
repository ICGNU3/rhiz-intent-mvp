import { NextRequest, NextResponse } from 'next/server';
// import { db, growthEvent } from '@rhiz/db';
// import { sql } from 'drizzle-orm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';

    // Return mock data for now
    const growthData = {
      events: [
        { date: '2024-01-01', type: 'signup', count: 5 },
        { date: '2024-01-02', type: 'invite_sent', count: 12 },
        { date: '2024-01-03', type: 'invite_redeemed', count: 3 }
      ],
      totalSignups: 25,
      totalInvites: 48,
      conversionRate: 12.5
    };

    return NextResponse.json(growthData);
  } catch (error) {
    console.error('Growth analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch growth analytics' },
      { status: 500 }
    );
  }
}
