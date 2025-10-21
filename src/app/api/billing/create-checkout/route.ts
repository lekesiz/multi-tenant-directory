import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe';
import { PLANS, type PlanId } from '@/config/pricing';
import { TRIAL_CONFIG } from '@/config/pricing';

/**
 * POST /api/billing/create-checkout
 * Create Stripe Checkout session for subscription
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body as { planId: PlanId };

    // Validate plan
    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = PLANS[planId];

    // Free plan doesn't need checkout
    if (planId === 'free') {
      return NextResponse.json({ error: 'Free plan does not require checkout' }, { status: 400 });
    }

    // Get business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: session.user.email },
    });

    if (!businessOwner) {
      return NextResponse.json({ error: 'Business owner not found' }, { status: 404 });
    }

    // Check if already subscribed to this plan
    if (businessOwner.subscriptionTier === planId && businessOwner.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: 'Already subscribed to this plan' },
        { status: 400 }
      );
    }

    let customerId = businessOwner.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createStripeCustomer({
        email: businessOwner.email,
        name: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim(),
        metadata: {
          businessOwnerId: businessOwner.id,
        },
      });

      customerId = customer.id;

      // Update business owner with Stripe customer ID
      await prisma.businessOwner.update({
        where: { id: businessOwner.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Determine if trial should be offered
    const shouldOfferTrial =
      TRIAL_CONFIG.enabled &&
      TRIAL_CONFIG.plans.includes(planId) &&
      !businessOwner.trialEnd; // Haven't used trial before

    const trialDays = shouldOfferTrial ? TRIAL_CONFIG.durationDays : undefined;

    // Create checkout session
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId: plan.stripePriceId!,
      successUrl: `${baseUrl}/business/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
      trialPeriodDays: trialDays,
      metadata: {
        businessOwnerId: businessOwner.id,
        planId,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    logger.error('[Billing] Create checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
