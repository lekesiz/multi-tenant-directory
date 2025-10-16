/**
 * Stripe Configuration and Subscription Plans
 * Complete payment system setup with plans, pricing, and features
 */

import Stripe from 'stripe';
import { stripe } from './stripe';

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    description: 'Plan de base pour commencer',
    price: 0,
    currency: 'eur',
    interval: 'month',
    stripePriceId: null,
    features: {
      companies: 1,
      reviews: 50,
      photos: 10,
      analytics: false,
      customization: false,
      priority_support: false,
      ai_features: false,
      marketing_automation: false,
      api_access: false,
      white_label: false,
    },
    limits: {
      monthly_views: 1000,
      monthly_emails: 100,
      storage_mb: 100,
    },
  },
  
  basic: {
    id: 'basic',
    name: 'Basique',
    description: 'Pour les petites entreprises',
    price: 19.99,
    currency: 'eur',
    interval: 'month',
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID,
    stripeProductId: process.env.STRIPE_BASIC_PRODUCT_ID,
    features: {
      companies: 3,
      reviews: 500,
      photos: 50,
      analytics: true,
      customization: true,
      priority_support: false,
      ai_features: false,
      marketing_automation: false,
      api_access: false,
      white_label: false,
    },
    limits: {
      monthly_views: 10000,
      monthly_emails: 1000,
      storage_mb: 1000,
    },
  },
  
  pro: {
    id: 'pro',
    name: 'Professionnel',
    description: 'Pour les entreprises en croissance',
    price: 49.99,
    currency: 'eur',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID,
    features: {
      companies: 10,
      reviews: 2000,
      photos: 200,
      analytics: true,
      customization: true,
      priority_support: true,
      ai_features: true,
      marketing_automation: true,
      api_access: true,
      white_label: false,
    },
    limits: {
      monthly_views: 50000,
      monthly_emails: 5000,
      storage_mb: 5000,
    },
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Entreprise',
    description: 'Solution complète pour les grandes entreprises',
    price: 199.99,
    currency: 'eur',
    interval: 'month',
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    stripeProductId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID,
    features: {
      companies: -1, // Unlimited
      reviews: -1, // Unlimited
      photos: -1, // Unlimited
      analytics: true,
      customization: true,
      priority_support: true,
      ai_features: true,
      marketing_automation: true,
      api_access: true,
      white_label: true,
    },
    limits: {
      monthly_views: -1, // Unlimited
      monthly_emails: -1, // Unlimited
      storage_mb: -1, // Unlimited
    },
  },
} as const;

// Annual pricing (20% discount)
export const ANNUAL_PLANS = {
  basic: {
    ...SUBSCRIPTION_PLANS.basic,
    price: 191.90, // 19.99 * 12 * 0.8
    interval: 'year' as const,
    stripePriceId: process.env.STRIPE_BASIC_ANNUAL_PRICE_ID,
    savings: 20,
  },
  pro: {
    ...SUBSCRIPTION_PLANS.pro,
    price: 479.90, // 49.99 * 12 * 0.8
    interval: 'year' as const,
    stripePriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    savings: 20,
  },
  enterprise: {
    ...SUBSCRIPTION_PLANS.enterprise,
    price: 1919.90, // 199.99 * 12 * 0.8
    interval: 'year' as const,
    stripePriceId: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
    savings: 20,
  },
};

// Addon Products
export const ADDON_PRODUCTS = {
  extra_companies: {
    id: 'extra_companies',
    name: 'Entreprises supplémentaires',
    description: 'Ajoutez plus d\'entreprises à votre compte',
    price: 9.99,
    currency: 'eur',
    stripePriceId: process.env.STRIPE_EXTRA_COMPANIES_PRICE_ID,
    unit: 'par entreprise/mois',
  },
  extra_storage: {
    id: 'extra_storage',
    name: 'Stockage supplémentaire',
    description: 'Augmentez votre limite de stockage',
    price: 4.99,
    currency: 'eur',
    stripePriceId: process.env.STRIPE_EXTRA_STORAGE_PRICE_ID,
    unit: 'par GB/mois',
  },
  premium_support: {
    id: 'premium_support',
    name: 'Support Premium',
    description: 'Support prioritaire 24/7',
    price: 29.99,
    currency: 'eur',
    stripePriceId: process.env.STRIPE_PREMIUM_SUPPORT_PRICE_ID,
    unit: 'par mois',
  },
};

// Payment Methods
export const PAYMENT_METHODS = {
  card: {
    type: 'card',
    name: 'Carte bancaire',
    description: 'Visa, Mastercard, American Express',
    icon: '💳',
    enabled: true,
  },
  sepa_debit: {
    type: 'sepa_debit',
    name: 'Prélèvement SEPA',
    description: 'Prélèvement automatique sur compte bancaire européen',
    icon: '🏦',
    enabled: true,
  },
  paypal: {
    type: 'paypal',
    name: 'PayPal',
    description: 'Paiement via PayPal',
    icon: '🅿️',
    enabled: false, // To be implemented
  },
};

// Webhook Events Configuration
export const STRIPE_WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.created',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'payment_method.attached',
  'payment_method.detached',
  'setup_intent.succeeded',
  'checkout.session.completed',
  'checkout.session.expired',
] as const;

// Tax Configuration
export const TAX_RATES = {
  fr: {
    rate: 0.20, // 20% TVA
    name: 'TVA France',
    description: 'Taxe sur la valeur ajoutée française',
    stripeTaxRateId: process.env.STRIPE_FR_TAX_RATE_ID,
  },
  eu: {
    rate: 0.21, // Average EU VAT
    name: 'TVA Europe',
    description: 'Taxe sur la valeur ajoutée européenne',
    stripeTaxRateId: process.env.STRIPE_EU_TAX_RATE_ID,
  },
  default: {
    rate: 0,
    name: 'Aucune taxe',
    description: 'Aucune taxe applicable',
    stripeTaxRateId: null,
  },
};

// Trial Configuration
export const TRIAL_CONFIG = {
  duration_days: 14,
  plans_with_trial: ['basic', 'pro', 'enterprise'],
  features_during_trial: {
    full_access: true,
    support_level: 'standard',
    usage_limits: false,
  },
};

// Proration and Billing Configuration
export const BILLING_CONFIG = {
  proration_behavior: 'create_prorations' as const,
  billing_cycle_anchor: 'now' as const,
  collection_method: 'charge_automatically' as const,
  payment_behavior: 'default_incomplete' as const,
  invoice_settings: {
    days_until_due: 30,
    default_payment_method: true,
  },
};

// Discount and Coupon Configuration
export const DISCOUNT_CONFIG = {
  referral_discount: {
    type: 'percent',
    value: 50, // 50% off first month
    duration: 'once',
    max_redemptions: 1,
  },
  annual_discount: {
    type: 'percent',
    value: 20, // 20% off annual plans
    duration: 'forever',
  },
  startup_discount: {
    type: 'amount',
    value: 1000, // €10 off in cents
    duration: 'repeating',
    duration_in_months: 3,
  },
};

/**
 * Stripe Service Class
 */
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  /**
   * Create checkout session
   */
  async createCheckoutSession({
    priceId,
    customerId,
    businessOwnerId,
    successUrl,
    cancelUrl,
    trial = false,
    couponId,
    metadata = {},
  }: {
    priceId: string;
    customerId?: string;
    businessOwnerId: string;
    successUrl: string;
    cancelUrl: string;
    trial?: boolean;
    couponId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        businessOwnerId,
        ...metadata,
      },
      subscription_data: {
        metadata: {
          businessOwnerId,
          ...metadata,
        },
      },
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    };

    // Add customer if provided
    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_creation = 'always';
    }

    // Add trial if enabled
    if (trial) {
      sessionConfig.subscription_data = {
        ...sessionConfig.subscription_data,
        trial_period_days: TRIAL_CONFIG.duration_days,
      };
    }

    // Add coupon if provided
    if (couponId) {
      sessionConfig.discounts = [
        {
          coupon: couponId,
        },
      ];
    }

    return await this.stripe.checkout.sessions.create(sessionConfig);
  }

  /**
   * Create customer
   */
  async createCustomer({
    email,
    name,
    businessOwnerId,
    metadata = {},
  }: {
    email: string;
    name?: string;
    businessOwnerId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
      metadata: {
        businessOwnerId,
        ...metadata,
      },
    });
  }

  /**
   * Update subscription
   */
  async updateSubscription({
    subscriptionId,
    priceId,
    prorationBehavior = 'create_prorations',
  }: {
    subscriptionId: string;
    priceId: string;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
  }): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
    return await this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: prorationBehavior,
    });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription({
    subscriptionId,
    immediately = false,
  }: {
    subscriptionId: string;
    immediately?: boolean;
  }): Promise<Stripe.Subscription> {
    if (immediately) {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  /**
   * Create billing portal session
   */
  async createBillingPortalSession({
    customerId,
    returnUrl,
  }: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    return await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  /**
   * Create coupon
   */
  async createCoupon({
    name,
    percentOff,
    amountOff,
    currency = 'eur',
    duration,
    durationInMonths,
    maxRedemptions,
  }: {
    name: string;
    percentOff?: number;
    amountOff?: number;
    currency?: string;
    duration: 'forever' | 'once' | 'repeating';
    durationInMonths?: number;
    maxRedemptions?: number;
  }): Promise<Stripe.Coupon> {
    const couponData: Stripe.CouponCreateParams = {
      name,
      duration,
    };

    if (percentOff) {
      couponData.percent_off = percentOff;
    } else if (amountOff) {
      couponData.amount_off = amountOff;
      couponData.currency = currency;
    }

    if (duration === 'repeating' && durationInMonths) {
      couponData.duration_in_months = durationInMonths;
    }

    if (maxRedemptions) {
      couponData.max_redemptions = maxRedemptions;
    }

    return await this.stripe.coupons.create(couponData);
  }

  /**
   * Get subscription with details
   */
  async getSubscriptionDetails(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'customer', 'items.data.price'],
    });
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices({
    customerId,
    limit = 10,
  }: {
    customerId: string;
    limit?: number;
  }): Promise<Stripe.Invoice[]> {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit,
      expand: ['data.subscription', 'data.payment_intent'],
    });
    
    return invoices.data;
  }

  /**
   * Calculate subscription price with taxes
   */
  calculatePriceWithTax(price: number, countryCode: string): {
    subtotal: number;
    tax: number;
    total: number;
    taxRate: number;
  } {
    const taxConfig = TAX_RATES[countryCode as keyof typeof TAX_RATES] || TAX_RATES.default;
    const tax = price * taxConfig.rate;
    
    return {
      subtotal: price,
      tax,
      total: price + tax,
      taxRate: taxConfig.rate,
    };
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Helper functions
export function getPlanById(planId: string) {
  return SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
}

export function getAnnualPlanById(planId: string) {
  return ANNUAL_PLANS[planId as keyof typeof ANNUAL_PLANS];
}

export function getAllPlans() {
  return Object.values(SUBSCRIPTION_PLANS);
}

export function getPlansWithPricing() {
  return Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
    ...plan,
    key,
    annual: ANNUAL_PLANS[key as keyof typeof ANNUAL_PLANS],
  }));
}

export function isFeatureAvailable(planId: string, feature: string): boolean {
  const plan = getPlanById(planId);
  if (!plan) return false;
  
  return plan.features[feature as keyof typeof plan.features] === true;
}

export function getUsageLimit(planId: string, limitType: string): number {
  const plan = getPlanById(planId);
  if (!plan) return 0;
  
  return plan.limits[limitType as keyof typeof plan.limits] || 0;
}

export function canUpgrade(currentPlan: string, targetPlan: string): boolean {
  const planOrder = ['free', 'basic', 'pro', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  
  return targetIndex > currentIndex;
}

export function canDowngrade(currentPlan: string, targetPlan: string): boolean {
  const planOrder = ['free', 'basic', 'pro', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  
  return targetIndex < currentIndex;
}