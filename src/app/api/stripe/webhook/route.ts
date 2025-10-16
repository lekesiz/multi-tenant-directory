import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook signature missing' },
        { status: 400 }
      );
    }

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const businessOwnerId = session.metadata?.businessOwnerId;
  const planId = session.metadata?.planId;

  if (!businessOwnerId) {
    console.error('No businessOwnerId in checkout session metadata');
    return;
  }

  try {
    // Update business owner with subscription info
    await prisma.businessOwner.update({
      where: { id: businessOwnerId },
      data: {
        subscriptionTier: planId || 'premium',
        subscriptionStatus: 'active',
        stripeCustomerId: session.customer,
        subscriptionStart: new Date(),
        // Trial period
        trialStart: new Date(),
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    console.log(`Checkout completed for business owner: ${businessOwnerId}`);
  } catch (error) {
    console.error('Error updating business owner after checkout:', error);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  const customerId = subscription.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    console.log(`Subscription created for business owner: ${businessOwner.id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: {
        subscriptionStatus: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    console.log(`Subscription updated for business owner: ${businessOwner.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        subscriptionEnd: new Date(),
        stripeSubscriptionId: null,
        cancelAtPeriodEnd: false,
      },
    });

    console.log(`Subscription canceled for business owner: ${businessOwner.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    // If this is the first payment, end the trial period
    if (businessOwner.trialEnd && new Date() < businessOwner.trialEnd) {
      await prisma.businessOwner.update({
        where: { id: businessOwner.id },
        data: {
          trialEnd: new Date(), // End trial immediately
        },
      });
    }

    console.log(`Payment succeeded for business owner: ${businessOwner.id}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    // Suspend subscription on payment failure
    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: {
        subscriptionStatus: 'suspended',
      },
    });

    console.log(`Payment failed for business owner: ${businessOwner.id}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}