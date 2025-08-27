import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

// Pricing configuration
export const PRICING = {
  ROOT_ALPHA: {
    name: 'Root Alpha',
    description: 'Lifetime membership with concierge access',
    priceId: process.env.STRIPE_ROOT_ALPHA_PRICE_ID!,
    amount: 77700, // $777.00 in cents
    currency: 'usd',
    type: 'one_time' as const,
    features: [
      'Concierge-level access with Israel Wilson himself',
      '10 guest passes for annual invitations',
      'Mystery box, exclusive events, private channels',
      'White glove service at the center of Rhiz',
      'Lifetime access - no recurring fees',
    ],
    metadata: {
      tier: 'root_alpha',
      limit: 150,
    },
  },
  ROOT_BETA: {
    name: 'Root Beta',
    description: 'Early adopter annual membership',
    priceId: process.env.STRIPE_ROOT_BETA_PRICE_ID!,
    amount: 15000, // $150.00 in cents
    currency: 'usd',
    type: 'split_payment' as const,
    initialAmount: 7500, // $75.00 now
    finalAmount: 7500, // $75.00 in 6 months
    features: [
      'Pre-pay for one year before public launch',
      'Help test security, scaling, and features',
      'Direct input into the product roadmap',
      'Bridge to scale the ecosystem',
      'Split payment: $75 now, $75 in 6 months',
    ],
    metadata: {
      tier: 'root_beta',
      validUntil: '2024-10-06', // Oct 6 launch window
    },
  },
};

// Helper to create Stripe checkout session
export async function createCheckoutSession({
  userId,
  email,
  tier,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  tier: 'root_alpha' | 'root_beta';
  successUrl: string;
  cancelUrl: string;
}) {
  const pricing = PRICING[tier === 'root_alpha' ? 'ROOT_ALPHA' : 'ROOT_BETA'];
  
  // For Root Beta, we'll create a subscription with trial period for split payment
  if (tier === 'root_beta') {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: pricing.priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId,
        ...pricing.metadata,
        tier,
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
        },
        // Trial period for 6 months before second payment
        trial_period_days: 180,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });
    
    return session;
  }
  
  // For Root Alpha, create a one-time payment session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price: pricing.priceId,
        quantity: 1,
      },
    ],
    customer_email: email,
    client_reference_id: userId,
    metadata: {
      userId,
      ...pricing.metadata,
      tier,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });
  
  return session;
}

// Helper to verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Helper to retrieve session
export async function retrieveCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['customer', 'subscription'],
  });
}

// Helper to create customer portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}