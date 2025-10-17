/**
 * Payment & Subscription Type Definitions
 */

// Subscription Plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: 'basic' | 'pro' | 'premium';
  description: string;
  monthlyPrice: number; // in cents
  yearlyPrice?: number; // in cents
  trialDays: number;
  features: string[];
  maxListings: number;
  maxFeaturedDays: number;
  isActive: boolean;
  displayOrder: number;
}

// Company Subscription Status
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due' | 'trialing';

export interface CompanySubscription {
  id: string;
  companyId: number;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  renewalDate: Date;
  cancelDate?: Date | null;
  trialEndDate?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  autoRenew: boolean;
  pricePaid?: number | null; // in cents
  billingCycleStart: Date;
  billingCycleEnd: Date;
}

// Pricing by domain
export interface DomainPricing {
  id: string;
  domainId: number;
  basicMonthly: number;
  basicYearly?: number;
  proMonthly: number;
  proYearly?: number;
  premiumMonthly: number;
  premiumYearly?: number;
  discountPercent: number;
  discountCode?: string;
  featuredBronze?: number;
  featuredSilver?: number;
  featuredGold?: number;
  featuredPlatinum?: number;
}

// Payment method
export interface PaymentMethod {
  id: string;
  companyId: number;
  type: 'card' | 'sepa_debit' | 'bank_transfer';
  stripePaymentMethodId?: string;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  isDefault: boolean;
  isExpired: boolean;
}

// Featured tier
export type FeaturedTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// Stripe checkout session params
export interface CreateCheckoutSessionParams {
  companyId: number;
  planSlug: 'basic' | 'pro' | 'premium';
  billingPeriod: 'month' | 'year';
  domainId?: number;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}

// Stripe webhook event payload
export interface StripeWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: any;
    previous_attributes?: any;
  };
}

// Subscription update event
export interface SubscriptionUpdatePayload {
  customerId: string;
  subscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd?: boolean;
  trialEndDate?: number;
}

// Invoice payload
export interface InvoicePayload {
  id: string;
  customerId: string;
  subscriptionId: string;
  status: string;
  amountPaid: number;
  currency: string;
  paid: boolean;
  created: number;
}
