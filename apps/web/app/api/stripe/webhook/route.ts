import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, retrieveCheckoutSession } from '@/lib/stripe';
import { db, subscription, workspaceActivity, eq, and } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(stripeSubscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(stripeSubscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { client_reference_id: userId, customer, subscription: stripeSubId, payment_intent } = session;
  const { tier, workspaceId } = session.metadata || {};

  if (!userId || !tier) {
    console.error('Missing required metadata in checkout session');
    return;
  }

  // Find the pending subscription
  const [existingSubscription] = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.userId, userId),
        eq(subscription.workspaceId, workspaceId),
        eq(subscription.status, 'pending')
      )
    )
    .limit(1);

  if (existingSubscription) {
    // Update existing subscription
    await db
      .update(subscription)
      .set({
        stripeCustomerId: customer as string,
        stripeSubscriptionId: stripeSubId as string | null,
        stripePaymentIntentId: payment_intent as string | null,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: tier === 'root_alpha' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year for beta
        metadata: {
          ...(existingSubscription.metadata as any || {}),
          checkoutSessionId: session.id,
          activatedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(subscription.id, existingSubscription.id));
  } else {
    // Create new subscription if not found
    await db.insert(subscription).values({
      workspaceId,
      userId,
      tier,
      stripeCustomerId: customer as string,
      stripeSubscriptionId: stripeSubId as string | null,
      stripePaymentIntentId: payment_intent as string | null,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: tier === 'root_alpha' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      metadata: {
        checkoutSessionId: session.id,
        activatedAt: new Date().toISOString(),
      },
    });
  }

  // Log activity
  await db.insert(workspaceActivity).values({
    workspaceId,
    userId,
    action: `purchased_${tier}`,
    entityType: 'subscription',
    entityId: existingSubscription?.id,
    metadata: {
      tier,
      amount: session.amount_total,
      currency: session.currency,
    },
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { userId } = paymentIntent.metadata || {};
  
  if (!userId) return;

  // Update subscription payment status
  const [existingSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (existingSub) {
    await db
      .update(subscription)
      .set({
        metadata: {
          ...existingSub.metadata as any,
          lastPaymentStatus: 'succeeded',
        },
        updatedAt: new Date(),
      })
      .where(eq(subscription.stripePaymentIntentId, paymentIntent.id));
  }
}

async function handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription) {
  const { userId } = stripeSubscription.metadata || {};
  
  if (!userId) return;

  const [existingSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  if (existingSub) {
    await db
      .update(subscription)
      .set({
        status: mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        metadata: {
          ...existingSub.metadata as any,
          stripeStatus: stripeSubscription.status,
        },
        updatedAt: new Date(),
      })
      .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id));
  }
}

async function handleSubscriptionCancelled(stripeSubscription: Stripe.Subscription) {
  const { userId } = stripeSubscription.metadata || {};
  
  if (!userId) return;

  const [existingSub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  if (existingSub) {
    await db
      .update(subscription)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        metadata: {
          ...existingSub.metadata as any,
          cancelledAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id));
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  // Additional invoice handling if needed
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  // Handle failed payments - send notifications, update status, etc.
}

function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'past_due': 'active', // Still active but payment is late
    'unpaid': 'pending',
    'canceled': 'cancelled',
    'incomplete': 'pending',
    'incomplete_expired': 'expired',
    'trialing': 'active',
    'paused': 'active',
  };
  
  return statusMap[stripeStatus] || 'pending';
}