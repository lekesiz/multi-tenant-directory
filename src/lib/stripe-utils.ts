/**
 * Stripe Payment Utility Functions
 */

import { logger } from '@/lib/logger';
import Stripe from 'stripe';
import { prisma } from './prisma';
import {
  CreateCheckoutSessionParams,
  SubscriptionUpdatePayload,
  InvoicePayload,
  SubscriptionStatus,
} from './payment-types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover' as any,
});

/**
 * Create Stripe customer for company
 */
export async function createStripeCustomer(companyId: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error(`Company ${companyId} not found`);
  }

  // Check if customer already exists
  if (company.stripeCustomerId) {
    return company.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: company.email || `company-${companyId}@haguenau.pro`,
    name: company.name,
    metadata: {
      companyId: companyId.toString(),
      companyName: company.name,
    },
  });

  // Update company with stripe customer ID
  await prisma.company.update({
    where: { id: companyId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const {
    companyId,
    planSlug,
    billingPeriod,
    domainId,
    successUrl,
    cancelUrl,
    trialDays,
  } = params;

  // Get plan
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { slug: planSlug },
  });

  if (!plan) {
    throw new Error(`Plan ${planSlug} not found`);
  }

  // Get domain pricing if applicable
  let price = billingPeriod === 'month' ? plan.monthlyPrice : plan.yearlyPrice;

  if (domainId) {
    const domainPricing = await prisma.domainPricing.findUnique({
      where: { domainId },
    });

    if (domainPricing) {
      if (billingPeriod === 'month') {
        price = planSlug === 'basic'
          ? domainPricing.basicMonthly
          : planSlug === 'pro'
          ? domainPricing.proMonthly
          : domainPricing.premiumMonthly;
      } else {
        price = planSlug === 'basic'
          ? domainPricing.basicYearly || plan.yearlyPrice
          : planSlug === 'pro'
          ? domainPricing.proYearly || plan.yearlyPrice
          : domainPricing.premiumYearly || plan.yearlyPrice;
      }
    }
  }

  // Create or get stripe customer
  const customerId = await createStripeCustomer(companyId);

  // Create product if doesn't exist
  const productId = `plan_${planSlug}`;
  let product = await stripe.products.retrieve(productId).catch(() => null);

  if (!product) {
    product = await stripe.products.create({
      id: productId,
      name: plan.name,
      description: plan.description,
      type: 'service',
    });
  }

  // Create price if doesn't exist
  const priceId = `price_${planSlug}_${billingPeriod}`;
  let stripPrice = await stripe.prices.retrieve(priceId).catch(() => null);

  if (!stripPrice) {
    stripPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: price || 0,
      currency: 'eur',
      recurring: {
        interval: billingPeriod === 'month' ? 'month' : 'year',
        trial_period_days: (trialDays ?? plan.trialDays) || undefined,
      },
      metadata: {
        planSlug,
        billingPeriod,
      },
    } as any);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: stripPrice.id,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      companyId: companyId.toString(),
      planSlug,
      billingPeriod,
    },
  });

  return session;
}

/**
 * Handle subscription update from Stripe
 */
export async function handleSubscriptionUpdate(payload: SubscriptionUpdatePayload) {
  const { customerId, subscriptionId, status, currentPeriodStart, currentPeriodEnd } = payload;

  // Find company by stripe customer ID
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!company) {
    logger.warn(`Company not found for customer ${customerId}`);
    return;
  }

  const subscriptionStatus: SubscriptionStatus =
    status === 'active' ? 'active' :
    status === 'canceled' ? 'canceled' :
    status === 'past_due' ? 'past_due' :
    status === 'trialing' ? 'trialing' :
    'active';

  // Calculate renewal date
  const renewalDate = new Date(currentPeriodEnd * 1000);

  // Update company subscription status
  await prisma.company.update({
    where: { id: company.id },
    data: {
      subscriptionStatus,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: new Date(currentPeriodStart * 1000),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      cancelAtPeriodEnd: payload.cancelAtPeriodEnd || false,
      trialEnd: payload.trialEndDate ? new Date(payload.trialEndDate * 1000) : null,
      isActive: subscriptionStatus === 'active' || subscriptionStatus === 'trialing',
    },
  });

  // Update company subscription record
  const companySubscription = await prisma.companySubscription.findUnique({
    where: { companyId: company.id },
  });

  if (companySubscription) {
    await prisma.companySubscription.update({
      where: { id: companySubscription.id },
      data: {
        status: subscriptionStatus,
        renewalDate,
      },
    });
  }

  return { success: true, company };
}

/**
 * Handle invoice payment from Stripe
 */
export async function handleInvoicePayment(payload: InvoicePayload) {
  const { customerId, subscriptionId, status, amountPaid, paid } = payload;

  // Find company by stripe customer ID
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!company) {
    logger.warn(`Company not found for customer ${customerId}`);
    return;
  }

  // If payment failed, mark subscription as past_due
  if (!paid && status === 'open') {
    await prisma.company.update({
      where: { id: company.id },
      data: { subscriptionStatus: 'past_due' },
    });
  }

  // If payment succeeded, reactivate subscription
  if (paid) {
    const subscription = await prisma.companySubscription.findUnique({
      where: { companyId: company.id },
    });

    if (subscription?.status === 'past_due') {
      await prisma.company.update({
        where: { id: company.id },
        data: { subscriptionStatus: 'active' },
      });

      await prisma.companySubscription.update({
        where: { id: subscription.id },
        data: { status: 'active' },
      });
    }
  }

  return { success: true, company };
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Cancel subscription immediately
 */
export async function cancelSubscriptionImmediate(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return subscription;
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!subscription.items.data[0]) {
    throw new Error('No items in subscription');
  }

  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });

  return updated;
}

/**
 * Create payment method
 */
export async function createPaymentMethod(
  companyId: number,
  paymentMethodId: string
) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error(`Company ${companyId} not found`);
  }

  const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

  let paymentRecord = await prisma.paymentMethod.create({
    data: {
      companyId,
      type: 'card',
      stripePaymentMethodId: paymentMethodId,
      cardBrand: stripePaymentMethod.card?.brand,
      cardLast4: stripePaymentMethod.card?.last4,
      cardExpMonth: stripePaymentMethod.card?.exp_month,
      cardExpYear: stripePaymentMethod.card?.exp_year,
      isDefault: false,
    },
  });

  // If first payment method, set as default
  const otherMethods = await prisma.paymentMethod.count({
    where: { companyId },
  });

  if (otherMethods === 1) {
    paymentRecord = await prisma.paymentMethod.update({
      where: { id: paymentRecord.id },
      data: { isDefault: true },
    });
  }

  return paymentRecord;
}

/**
 * Get Stripe API key for frontend
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set');
  }
  return key;
}

export default {
  createStripeCustomer,
  createCheckoutSession,
  handleSubscriptionUpdate,
  handleInvoicePayment,
  getSubscriptionDetails,
  cancelSubscriptionAtPeriodEnd,
  cancelSubscriptionImmediate,
  reactivateSubscription,
  updateSubscriptionPlan,
  createPaymentMethod,
  getStripePublishableKey,
};
