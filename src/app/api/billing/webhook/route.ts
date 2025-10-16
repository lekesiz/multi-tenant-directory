import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/stripe';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/emails/send';
import { logger } from '@/lib/logger';
import type Stripe from 'stripe';

/**
 * POST /api/billing/webhook
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const businessOwnerId = session.metadata?.businessOwnerId;
  const planId = session.metadata?.planId;

  if (!businessOwnerId) {
    console.error('[Webhook] Missing businessOwnerId in session metadata');
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;

  await prisma.businessOwner.update({
    where: { id: businessOwnerId },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionTier: planId || 'basic',
      subscriptionStatus: 'active',
      subscriptionStart: new Date(),
    },
  });

  console.log(`[Webhook] Checkout completed for business owner: ${businessOwnerId}`);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const businessOwner = await prisma.businessOwner.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!businessOwner) {
    console.error(`[Webhook] Business owner not found for subscription: ${subscription.id}`);
    return;
  }

  // Map Stripe subscription status
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    trialing: 'trialing',
    incomplete: 'incomplete',
    unpaid: 'past_due',
  };

  await prisma.businessOwner.update({
    where: { id: businessOwner.id },
    data: {
      subscriptionStatus: statusMap[subscription.status] || 'active',
      currentPeriodStart: new Date((subscription.currentPeriodStart || subscription.current_period_start) * 1000),
      currentPeriodEnd: new Date((subscription.currentPeriodEnd || subscription.current_period_end) * 1000),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? subscription.cancel_at_period_end,
      trialStart: (subscription.trialStart || subscription.trial_start)
        ? new Date((subscription.trialStart || subscription.trial_start) * 1000)
        : null,
      trialEnd: (subscription.trialEnd || subscription.trial_end) ? new Date((subscription.trialEnd || subscription.trial_end) * 1000) : null,
    },
  });

  console.log(`[Webhook] Subscription updated for business owner: ${businessOwner.id}`);
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const businessOwner = await prisma.businessOwner.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!businessOwner) {
    return;
  }

  await prisma.businessOwner.update({
    where: { id: businessOwner.id },
    data: {
      subscriptionTier: 'free',
      subscriptionStatus: 'canceled',
      subscriptionEnd: new Date(),
    },
  });

  console.log(`[Webhook] Subscription canceled for business owner: ${businessOwner.id}`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const businessOwner = await prisma.businessOwner.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!businessOwner) {
    return;
  }

  // Send payment success email
  if (businessOwner.email && process.env.RESEND_API_KEY) {
    try {
      await sendPaymentSuccessEmail({
        email: businessOwner.email,
        firstName: businessOwner.firstName,
        planName: businessOwner.subscriptionTier,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        unsubscribeToken: businessOwner.unsubscribeToken,
      });
      logger.info('Payment success email sent', { businessOwnerId: businessOwner.id });
    } catch (error) {
      logger.error('Failed to send payment success email', error, { businessOwnerId: businessOwner.id });
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const businessOwner = await prisma.businessOwner.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!businessOwner) {
    return;
  }

  await prisma.businessOwner.update({
    where: { id: businessOwner.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  // Send payment failed email
  if (businessOwner.email && process.env.RESEND_API_KEY) {
    try {
      await sendPaymentFailedEmail({
        email: businessOwner.email,
        firstName: businessOwner.firstName,
        planName: businessOwner.subscriptionTier,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        unsubscribeToken: businessOwner.unsubscribeToken,
      });
      logger.warn('Payment failed email sent', { businessOwnerId: businessOwner.id });
    } catch (error) {
      logger.error('Failed to send payment failed email', error, { businessOwnerId: businessOwner.id });
    }
  }
}
