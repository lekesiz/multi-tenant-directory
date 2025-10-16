/**
 * Stripe Configuration and Service
 * Re-exports from stripe.ts for compatibility
 */

export * from './stripe';

// Additional exports for Claude's code
export { stripe as stripeService } from './stripe';
export { getPlanDetails as getPlanById } from './stripe';

// Webhook events configuration
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
} as const;

// Helper functions for plan management
export function canUpgrade(currentTier: string, targetTier: string): boolean {
  const tiers = ['FREE', 'PREMIUM', 'ENTERPRISE'];
  const currentIndex = tiers.indexOf(currentTier.toUpperCase());
  const targetIndex = tiers.indexOf(targetTier.toUpperCase());
  
  return targetIndex > currentIndex;
}

export function canDowngrade(currentTier: string, targetTier: string): boolean {
  const tiers = ['FREE', 'PREMIUM', 'ENTERPRISE'];
  const currentIndex = tiers.indexOf(currentTier.toUpperCase());
  const targetIndex = tiers.indexOf(targetTier.toUpperCase());
  
  return targetIndex < currentIndex && targetIndex >= 0;
}

