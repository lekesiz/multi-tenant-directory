/**
 * Stripe Webhook Handler
 * Handles subscription and payment events from Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import {
  handleSubscriptionUpdate,
  handleInvoicePayment,
} from '@/lib/stripe-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Parse and verify Stripe webhook
 */
async function verifyStripeWebhook(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  if (!sig || !webhookSecret) {
    throw new Error('Missing signature or webhook secret');
  }

  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  return event;
}

export async function POST(request: NextRequest) {
  try {
    const event = await verifyStripeWebhook(request);

    console.log(`📨 Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        await handleSubscriptionUpdate({
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
          status: subscription.status as any,
          currentPeriodStart: subscription.current_period_start || 0,
          currentPeriodEnd: subscription.current_period_end || 0,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          trialEndDate: subscription.trial_end || undefined,
        });

        console.log(`✅ Subscription ${event.type} processed`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark subscription as canceled
        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (company) {
          await prisma.company.update({
            where: { id: company.id },
            data: { subscriptionStatus: 'canceled' },
          });

          const companySubscription = await prisma.companySubscription.findUnique({
            where: { companyId: company.id },
          });

          if (companySubscription) {
            await prisma.companySubscription.update({
              where: { id: companySubscription.id },
              data: {
                status: 'canceled',
                cancelDate: new Date(),
              },
            });
          }

          console.log(`✅ Subscription deleted for company ${company.id}`);
        }
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.customer && invoice.subscription) {
          await handleInvoicePayment({
            id: invoice.id,
            customerId: invoice.customer as string,
            subscriptionId: invoice.subscription as string,
            status: invoice.status || 'unknown',
            amountPaid: invoice.amount_paid || 0,
            currency: invoice.currency || 'eur',
            paid: event.type === 'invoice.paid',
            created: invoice.created || 0,
          });
        }

        console.log(`✅ Invoice event ${event.type} processed`);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.warn(`⚠️ Dispute created: ${dispute.id}`);
        // TODO: Notify customer and business owner about dispute
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`💰 Refund processed: ${charge.id}`);
        // TODO: Update subscription status and notify customer
        break;
      }

      // Payment method events
      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log(`✅ Payment method attached: ${paymentMethod.id}`);
        break;
      }

      case 'payment_method.detached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        // Mark as expired/removed
        await prisma.paymentMethod.updateMany({
          where: { stripePaymentMethodId: paymentMethod.id },
          data: { isExpired: true },
        });
        console.log(`✅ Payment method detached: ${paymentMethod.id}`);
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json(
      { received: true, eventType: event.type },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message);

    if (error.message.includes('No matching signing secret')) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
