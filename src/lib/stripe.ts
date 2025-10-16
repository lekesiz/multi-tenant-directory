/**
 * Stripe Integration
 * Handles subscription management, checkout, and webhooks
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

/**
 * Create Stripe customer
 */
export async function createStripeCustomer({
  email,
  name,
  metadata,
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });

  return customer;
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  trialPeriodDays,
  metadata,
}: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  };

  if (customerId) {
    sessionParams.customer = customerId;
  }

  if (trialPeriodDays) {
    sessionParams.subscription_data = {
      trial_period_days: trialPeriodDays,
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session;
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  return subscription;
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

/**
 * Apply discount/coupon to subscription
 */
export async function applyDiscount({
  subscriptionId,
  couponId,
}: {
  subscriptionId: string;
  couponId: string;
}) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    coupon: couponId,
  });

  return subscription;
}

/**
 * Create Stripe coupon for referral rewards
 */
export async function createStripeCoupon({
  id,
  percentOff,
  duration,
  durationInMonths,
}: {
  id: string;
  percentOff?: number;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
}) {
  const coupon = await stripe.coupons.create({
    id,
    percent_off: percentOff,
    duration,
    duration_in_months: durationInMonths,
  });

  return coupon;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${(err as Error).message}`);
  }
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'eur',
    interval: null,
    stripePriceId: null,
    features: [
      'Profil professionnel complet',
      'Informations de contact',
      'Horaires d\'ouverture',
      'Catégories (jusqu\'à 3)',
      'Visibilité dans l\'annuaire',
      'Avis clients',
    ],
    limits: {
      photos: 5,
      categories: 3,
      featured: false,
      analytics: 'basic',
      support: 'standard',
    },
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 2900, // 29.00 EUR in cents
    currency: 'eur',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_ID_PREMIUM,
    features: [
      'Tout du plan Gratuit',
      'Badge "Premium"',
      'Mise en avant sur la page d\'accueil',
      'Photos illimitées',
      'Promotions et offres spéciales',
      'Statistiques détaillées',
      'Support prioritaire',
    ],
    limits: {
      photos: -1, // unlimited
      categories: -1, // unlimited
      featured: true,
      analytics: 'advanced',
      support: 'priority',
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Entreprise',
    price: null, // Custom pricing
    currency: 'eur',
    interval: null,
    stripePriceId: null,
    features: [
      'Tout du plan Premium',
      'Plusieurs emplacements',
      'API d\'intégration',
      'Gestion multi-utilisateurs',
      'Campagnes publicitaires',
      'Accompagnement personnalisé',
      'Contrat sur mesure',
    ],
    limits: {
      photos: -1,
      categories: -1,
      locations: -1,
      featured: true,
      analytics: 'enterprise',
      support: 'dedicated',
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;

// Trial period configuration
export const TRIAL_PERIOD_DAYS = 14;

// Helper function to get plan details
export function getPlanDetails(tier: string) {
  const planKey = tier.toUpperCase() as SubscriptionTier;
  return SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.FREE;
}

// Helper function to check if user has access to feature
export function hasFeatureAccess(tier: string, feature: string): boolean {
  const plan = getPlanDetails(tier);
  
  switch (feature) {
    case 'unlimited_photos':
      return plan.limits.photos === -1;
    case 'unlimited_categories':
      return plan.limits.categories === -1;
    case 'featured_listing':
      return plan.limits.featured;
    case 'advanced_analytics':
      return plan.limits.analytics === 'advanced' || plan.limits.analytics === 'enterprise';
    case 'priority_support':
      return plan.limits.support === 'priority' || plan.limits.support === 'dedicated';
    default:
      return false;
  }
}

// Helper function to format price
export function formatPrice(price: number | null, currency: string = 'EUR'): string {
  if (price === null || price === 0) return 'Gratuit';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100);
}

// Helper function to check if user is on trial
export function isOnTrial(businessOwner: { trialStart?: Date | null; trialEnd?: Date | null }): boolean {
  if (!businessOwner.trialStart || !businessOwner.trialEnd) return false;
  
  const now = new Date();
  return now >= businessOwner.trialStart && now <= businessOwner.trialEnd;
}

// Helper function to get days left in trial
export function getTrialDaysLeft(businessOwner: { trialEnd?: Date | null }): number {
  if (!businessOwner.trialEnd) return 0;
  
  const now = new Date();
  const diffTime = businessOwner.trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

// Helper function to check if subscription is active
export function isSubscriptionActive(businessOwner: {
  subscriptionStatus?: string | null;
  subscriptionEnd?: Date | null;
}): boolean {
  if (businessOwner.subscriptionStatus !== 'active') return false;
  if (!businessOwner.subscriptionEnd) return false;
  
  return new Date() <= businessOwner.subscriptionEnd;
}