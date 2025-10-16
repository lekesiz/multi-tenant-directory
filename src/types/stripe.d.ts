/**
 * Stripe Type Definitions Extension
 * Fixes TypeScript compatibility issues with Stripe SDK
 */

import Stripe from 'stripe';

declare module 'stripe' {
  namespace Stripe {
    /**
     * Extended Subscription with both snake_case and camelCase properties
     * Stripe API returns snake_case but TS definitions might use camelCase
     */
    interface Subscription {
      current_period_start?: number;
      currentPeriodStart?: number;
      current_period_end?: number;
      currentPeriodEnd?: number;
      cancel_at_period_end?: boolean;
      cancelAtPeriodEnd?: boolean;
      trial_start?: number | null;
      trialStart?: number | null;
      trial_end?: number | null;
      trialEnd?: number | null;
    }

    /**
     * Extended Invoice with subscription property
     */
    interface Invoice {
      subscription?: string | Subscription | null;
      amount_paid?: number;
      amountPaid?: number;
      amount_due?: number;
      amountDue?: number;
    }

    /**
     * Extended Customer
     */
    interface Customer {
      metadata?: Metadata;
    }

    /**
     * Checkout Session extensions
     */
    interface Checkout {
      namespace Session {
        interface Session {
          subscription?: string | Subscription | null;
          customer?: string | Customer | null;
          metadata?: Metadata;
        }
      }
    }
  }
}

/**
 * Helper type for safe access to Stripe properties
 */
export type SafeStripeSubscription = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
};

export type SafeStripeInvoice = Stripe.Invoice & {
  subscription: string | Stripe.Subscription;
  amount_paid: number;
  amount_due: number;
};
