import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, PRICING } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { db, subscription, eq, and } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tier, workspaceId } = body;

    // Validate tier
    if (!tier || (tier !== 'root_alpha' && tier !== 'root_beta')) {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
    }

    // Check if user already has an active subscription for this workspace
    const existingSubscription = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, userId),
          eq(subscription.workspaceId, workspaceId),
          eq(subscription.status, 'active')
        )
      )
      .limit(1);

    if (existingSubscription.length > 0) {
      return NextResponse.json(
        { error: 'You already have an active subscription for this workspace' },
        { status: 400 }
      );
    }

    // Check Root Alpha availability (limited to 150 members)
    if (tier === 'root_alpha') {
      const alphaCount = await db
        .select()
        .from(subscription)
        .where(
          and(
            eq(subscription.tier, 'root_alpha'),
            eq(subscription.status, 'active')
          )
        );

      if (alphaCount.length >= 150) {
        return NextResponse.json(
          { error: 'Root Alpha membership is sold out (150 members limit reached)' },
          { status: 400 }
        );
      }
    }

    // Get user email from Clerk
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await response.json();
    const email = userData.email_addresses?.[0]?.email_address;

    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Create a pending subscription record
    const [pendingSubscription] = await db
      .insert(subscription)
      .values({
        workspaceId,
        userId,
        tier,
        status: 'pending',
        metadata: {
          createdVia: 'checkout_session',
          timestamp: new Date().toISOString(),
        },
      })
      .returning();

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
    const session = await createCheckoutSession({
      userId,
      email,
      tier,
      successUrl: `${baseUrl}/dashboard?payment=success&tier=${tier}`,
      cancelUrl: `${baseUrl}/?payment=cancelled`,
    });

    // Update subscription with Stripe session ID
    await db
      .update(subscription)
      .set({
        metadata: {
          ...(pendingSubscription.metadata as any || {}),
          stripeSessionId: session.id,
        },
      })
      .where(eq(subscription.id, pendingSubscription.id));

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}