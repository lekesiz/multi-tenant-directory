import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripeService } from '@/lib/stripe-config';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { trackReferralConversion } from '@/lib/referral';

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

    // Log the event for tracking
    await logStripeEvent(event);

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
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
        
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'invoice.payment_action_required':
        await handleInvoicePaymentActionRequired(event.data.object);
        break;
        
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
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

    // Track referral conversion if user was referred
    try {
      await trackReferralConversion(businessOwnerId);
      console.log('✅ Referral conversion tracked for business owner:', businessOwnerId);
    } catch (error) {
      console.error('⚠️ Error tracking referral conversion:', error);
      // Don't fail the webhook if referral tracking fails
    }

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

    // Update invoice record in database
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'paid',
        amountPaid: invoice.amount_paid,
        paidAt: new Date(invoice.status_transitions?.paid_at * 1000 || Date.now()),
        paymentStatus: 'succeeded',
        paymentMethod: invoice.payment_intent?.payment_method_types?.[0] || 'unknown',
      },
    });

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

// Log Stripe events for audit trail
async function logStripeEvent(event: any) {
  try {
    // Extract business owner ID from metadata if available
    let businessOwnerId = null;
    if (event.data.object.metadata?.businessOwnerId) {
      businessOwnerId = event.data.object.metadata.businessOwnerId;
    } else if (event.data.object.customer) {
      // Try to find business owner by Stripe customer ID
      const businessOwner = await prisma.businessOwner.findUnique({
        where: { stripeCustomerId: event.data.object.customer },
        select: { id: true },
      });
      if (businessOwner) {
        businessOwnerId = businessOwner.id;
      }
    }

    await prisma.stripeEvent.create({
      data: {
        eventType: event.type,
        stripeId: event.id,
        businessOwnerId,
        data: event.data.object,
        processed: false,
      },
    });
  } catch (error) {
    console.error('Error logging Stripe event:', error);
  }
}

// Handle trial will end notification
async function handleTrialWillEnd(subscription: any) {
  const customerId = subscription.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    // Send trial ending notification email
    // This would integrate with your email service
    console.log(`Trial ending soon for business owner: ${businessOwner.id}`);
    
    // Record in subscription history
    await prisma.subscriptionHistory.create({
      data: {
        businessOwnerId: businessOwner.id,
        action: 'trial_ending',
        effectiveDate: new Date(subscription.trial_end * 1000),
        stripeEventId: subscription.id,
      },
    });

  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}

// Handle invoice creation
async function handleInvoiceCreated(invoice: any) {
  const customerId = invoice.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    // Create invoice record in database
    await prisma.invoice.create({
      data: {
        businessOwnerId: businessOwner.id,
        stripeInvoiceId: invoice.id,
        number: invoice.number,
        status: invoice.status,
        description: invoice.description,
        subtotal: invoice.subtotal,
        tax: invoice.tax || 0,
        total: invoice.total,
        amountDue: invoice.amount_due,
        currency: invoice.currency,
        invoiceDate: new Date(invoice.created * 1000),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
        metadata: invoice.metadata || {},
      },
    });

    console.log(`Invoice created for business owner: ${businessOwner.id}`);

  } catch (error) {
    console.error('Error handling invoice created:', error);
  }
}

// Handle payment action required
async function handleInvoicePaymentActionRequired(invoice: any) {
  const customerId = invoice.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    // Update invoice status
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: invoice.status,
        paymentStatus: 'requires_action',
      },
    });

    // Send payment action required notification
    console.log(`Payment action required for business owner: ${businessOwner.id}`);

  } catch (error) {
    console.error('Error handling payment action required:', error);
  }
}

// Handle payment method attached
async function handlePaymentMethodAttached(paymentMethod: any) {
  const customerId = paymentMethod.customer;
  
  try {
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!businessOwner) {
      console.error(`Business owner not found for customer: ${customerId}`);
      return;
    }

    console.log(`Payment method attached for business owner: ${businessOwner.id}`);
    
    // Record in subscription history
    await prisma.subscriptionHistory.create({
      data: {
        businessOwnerId: businessOwner.id,
        action: 'payment_method_added',
        effectiveDate: new Date(),
        stripeEventId: paymentMethod.id,
      },
    });

  } catch (error) {
    console.error('Error handling payment method attached:', error);
  }
}