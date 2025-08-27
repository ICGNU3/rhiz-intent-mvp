import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, subscription, eq, and } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Get the user's subscription
    const [userSubscription] = await db
      .select({
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelledAt: subscription.cancelledAt,
      })
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, userId),
          eq(subscription.workspaceId, workspaceId)
        )
      )
      .orderBy(subscription.createdAt)
      .limit(1);

    if (!userSubscription) {
      return NextResponse.json({
        tier: 'free',
        status: 'none',
      });
    }

    return NextResponse.json(userSubscription);
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}