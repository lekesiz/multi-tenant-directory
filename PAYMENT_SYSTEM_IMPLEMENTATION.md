# Payment System Implementation - Phase 3.1

## Overview

Phase 3.1 of the haguenau.pro multi-tenant directory platform implements a complete payment and subscription management system using Stripe. This document outlines the architecture, implementation details, and usage instructions.

## Architecture

### Database Models

#### SubscriptionPlan
- Defines available subscription tiers (Basic, Pro, Premium)
- Stores pricing, features, trial duration, and display order
- Used to create Stripe products and prices dynamically

```
name: "Pro"
slug: "pro"
monthlyPrice: 9900 (€99/month)
yearlyPrice: 99900 (€999/year)
features: ["Everything in Basic", "AI Content Generator", "5 Featured Days/Month", ...]
maxListings: 3
maxFeaturedDays: 150
```

#### CompanySubscription
- Per-company subscription tracking
- Links company to selected plan
- Manages subscription lifecycle (active, canceled, expired, trialing)
- Stores Stripe subscription IDs for webhook integration

```
companyId → Company.id (one-to-one)
planId → SubscriptionPlan.id
status: "active" | "canceled" | "expired" | "past_due" | "trialing"
renewalDate: Date (next billing date)
stripeCustomerId, stripeSubscriptionId: Stripe integration
```

#### DomainPricing
- Domain-specific pricing overrides
- Allows different pricing per domain (haguenau.pro vs other domains)
- Supports featured listing upgrade pricing (bronze/silver/gold/platinum)

```
domainId: Int (unique)
basicMonthly: 4900 (€49)
proMonthly: 9900 (€99)
premiumMonthly: 19900 (€199)
featuredBronze: 2999 (7 days)
featuredSilver: 4999 (14 days)
...
discountPercent: 20 (first-year discount)
```

#### PaymentMethod
- Stores payment methods per company
- Supports cards, SEPA, bank transfers
- Encrypted Stripe payment method IDs

#### Company Model Additions
```
// Subscription fields
subscriptionTier: String ("free" | "basic" | "pro" | "premium")
subscriptionStatus: String ("active" | "canceled" | "past_due" | "trialing")
subscriptionStart/End: DateTime
stripeCustomerId/Id: String

// Featured listing
isFeatured: Boolean
featuredUntil: DateTime
featuredTier: String ("bronze" | "silver" | "gold" | "platinum")
```

## API Endpoints

### Public Endpoints

#### GET /api/plans
Returns all active subscription plans with pricing and features.

```json
{
  "plans": [
    {
      "id": "plan_123",
      "name": "Pro",
      "slug": "pro",
      "monthlyPrice": 9900,
      "yearlyPrice": 99900,
      "features": ["..."],
      "maxListings": 3
    }
  ]
}
```

### Authenticated Endpoints

#### POST /api/checkout/create-session
Create Stripe checkout session for a company.

**Request:**
```json
{
  "companyId": 123,
  "planSlug": "pro",
  "billingPeriod": "month",
  "domainId": 1
}
```

**Response:**
```json
{
  "sessionId": "cs_live_...",
  "clientSecret": "csc_live_..."
}
```

#### GET /api/subscriptions/[companyId]
Get subscription details for a company.

**Response:**
```json
{
  "companyId": 123,
  "tier": "pro",
  "status": "active",
  "renewalDate": "2025-01-17T...",
  "daysUntilRenewal": 7,
  "isFeatured": true,
  "featuredUntil": "2025-01-10T..."
}
```

#### PATCH /api/subscriptions/[companyId]
Manage subscription (cancel, reactivate, etc.).

**Request:**
```json
{
  "action": "cancel_at_period_end" | "cancel_immediately" | "reactivate"
}
```

### Admin Endpoints

#### GET /api/admin/subscriptions
List all subscriptions with optional filters.

**Query Parameters:**
- `status`: "active" | "canceled" | "expired"
- `tier`: "basic" | "pro" | "premium"
- `expiring_soon`: "true" (subscriptions expiring within 7 days)

#### POST /api/admin/subscriptions
Create a new subscription plan.

**Request:**
```json
{
  "name": "Enterprise",
  "slug": "enterprise",
  "description": "...",
  "monthlyPrice": 49900,
  "features": ["..."],
  "maxListings": 20
}
```

## Webhook Handling

### Stripe Webhook Handler
**Endpoint:** POST `/api/webhooks/stripe`

Handles all Stripe events:
- `customer.subscription.created/updated` → Update company subscription status
- `customer.subscription.deleted` → Mark subscription as canceled
- `invoice.paid` → Reactivate past_due subscriptions
- `invoice.payment_failed` → Mark as past_due
- `payment_method.attached/detached` → Update payment methods

## Subscription Lifecycle

### Activation Flow
1. Company selects plan and billing period
2. Frontend creates checkout session via `/api/checkout/create-session`
3. User redirected to Stripe checkout
4. Stripe confirms payment and creates subscription
5. Webhook received: `customer.subscription.created`
6. Company activated with subscription status "active"
7. Trial period (14 days default) begins

### Renewal Flow
1. Stripe automatically charges on renewal date
2. Webhook received: `invoice.paid`
3. Subscription renewed for another period
4. Company remains active

### Cancellation Flow (At Period End)
1. Company requests cancellation via PATCH `/api/subscriptions/[id]` with action `cancel_at_period_end`
2. Subscription marked with `cancelAtPeriodEnd: true`
3. At renewal date, Stripe cancels and webhook received
4. Company deactivated automatically

### Cancellation Flow (Immediate)
1. Company requests immediate cancellation
2. Stripe subscription deleted immediately
3. Webhook received: `customer.subscription.deleted`
4. Company deactivated immediately, cannot be reactivated

## Cron Jobs

### Subscription Lifecycle Check
**Endpoint:** GET `/api/cron/subscriptions-check`
**Frequency:** Every 6 hours recommended
**Secret:** Requires `CRON_SECRET` environment variable

**Tasks:**
1. **Check Expired Subscriptions** - Deactivate companies with expired subscriptions
2. **Send Renewal Reminders** - Email notifications at 7, 3, and 1 day before expiration
3. **Reactivate After Payment** - Reactivate companies that were past_due and now paid

**Response:**
```json
{
  "success": true,
  "results": {
    "expiredCount": 2,
    "renewalRemindersSent": 5,
    "reactivatedCount": 1
  }
}
```

## Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cron Secret
CRON_SECRET=your_secure_cron_secret

# Email Configuration (for reminders)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@haguenau.pro
```

## Utilities

### Stripe Utils (`src/lib/stripe-utils.ts`)

**Main Functions:**
- `createStripeCustomer(companyId)` - Create Stripe customer
- `createCheckoutSession(params)` - Create checkout session
- `handleSubscriptionUpdate(payload)` - Process Stripe webhook
- `handleInvoicePayment(payload)` - Process payment events
- `cancelSubscriptionAtPeriodEnd(subscriptionId)` - Schedule cancellation
- `cancelSubscriptionImmediate(subscriptionId)` - Cancel immediately
- `reactivateSubscription(subscriptionId)` - Reactivate canceled subscription
- `createPaymentMethod(companyId, paymentMethodId)` - Add payment method

## Default Subscription Plans

Three tiers are seeded by default:

### Basic - €49/month
- Profile Setup
- Reviews Management
- 1 Featured Day/Month
- Basic Analytics
- Email Support

### Pro - €99/month (Most Popular)
- Everything in Basic
- AI Content Generator
- Video Gallery
- 5 Featured Days/Month
- Advanced Analytics
- Priority Support
- Custom Domain

### Premium - €199/month
- Everything in Pro
- Unlimited Featured Days
- Booking System
- E-commerce Integration
- API Access
- 24/7 Dedicated Support
- Multiple Domains

## Domain-Specific Pricing

Haguenau.pro domain has configured pricing:
```
Basic:   €49/month (€499/year - 17% discount)
Pro:     €99/month (€999/year - 17% discount)
Premium: €199/month (€1999/year - 17% discount)

Featured Listing Upgrades:
- Bronze:    €29.99 (7 days)
- Silver:    €49.99 (14 days)
- Gold:      €79.99 (30 days)
- Platinum:  €149.99 (60 days)

First-year discount: 20% for all plans
```

## Database Schema Changes

### New Tables
- `subscription_plans` - Available subscription tiers
- `company_subscriptions` - Per-company subscription tracking
- `domain_pricing` - Domain-specific pricing
- `payment_methods` - Payment methods per company

### Modified Tables
- `companies` - Added subscription fields (subscriptionTier, subscriptionStatus, stripeCustomerId, etc.)
- `company_subscriptions` relation added to companies

### Indexes Added
```
companies:
  - (subscriptionStatus, subscriptionEnd)
  - (isFeatured)

company_subscriptions:
  - (status, renewalDate)
  - (companyId, status)
  - (planId)

subscription_plans:
  - (slug)
  - (isActive)

domain_pricing:
  - (domainId - UNIQUE)

payment_methods:
  - (companyId)
  - (stripePaymentMethodId - UNIQUE)
```

## Testing

### Test Stripe Webhook
```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: t=...,v1=..." \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Test Cron Job
```bash
curl -X GET http://localhost:3000/api/cron/subscriptions-check \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test Checkout Session Creation
```bash
curl -X POST http://localhost:3000/api/checkout/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "planSlug": "pro",
    "billingPeriod": "month"
  }'
```

## Files Created/Modified

### New Files
- `src/lib/payment-types.ts` - TypeScript types for payment system
- `src/lib/stripe-utils.ts` - Stripe integration utilities
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- `src/app/api/checkout/create-session/route.ts` - Checkout creation
- `src/app/api/subscriptions/[companyId]/route.ts` - Subscription management
- `src/app/api/admin/subscriptions/route.ts` - Admin subscription API
- `src/app/api/plans/route.ts` - Public plans endpoint
- `src/app/api/cron/subscriptions-check/route.ts` - Cron job for subscription lifecycle
- `prisma/seed-subscriptions.ts` - Seed script for default plans

### Modified Files
- `prisma/schema.prisma` - Added subscription models and fields
- `src/lib/prisma.ts` - Already configured (no changes needed)

## Next Steps

### Phase 3.2 - Subscription Management UI
- Dashboard subscription status component
- Billing history and invoices
- Payment method management
- Plan upgrade/downgrade flow

### Phase 3.3 - Featured Listings
- Featured listing purchase flow
- Featured display on marketplace
- Featured listing management dashboard

### Phase 4 - Homepage Development
- Pricing page with PricingPlans component
- Featured businesses carousel
- Call-to-action sections
- SEO optimization

## Migration Guide

### For Existing Deployments
1. Run `npx prisma db push --accept-data-loss`
2. Set environment variables in Vercel
3. Run seed script: `npx tsx prisma/seed-subscriptions.ts`
4. Configure Stripe webhook in Stripe dashboard to point to `/api/webhooks/stripe`
5. Set up cron job (Vercel Crons or EasyCron) for `/api/cron/subscriptions-check`

### Local Development
```bash
# 1. Install Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Start Stripe listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 3. Get webhook signing secret from output and set in .env.local
STRIPE_WEBHOOK_SECRET=whsec_...

# 4. Run seed
npx tsx prisma/seed-subscriptions.ts

# 5. Start dev server
npm run dev
```

## Support & Troubleshooting

### Common Issues

**Payment Failed:**
- Check Stripe account configuration
- Verify API keys in environment
- Check webhook delivery in Stripe dashboard

**Subscription Not Updating:**
- Verify webhook is configured
- Check cron job is running
- Review database records

**Email Reminders Not Sent:**
- Check SendGrid configuration
- Verify email templates exist
- Review email logs

## Security Considerations

1. **API Keys**: Never expose `STRIPE_SECRET_KEY` or `CRON_SECRET`
2. **Webhook Verification**: All webhooks verified with Stripe signature
3. **Authentication**: All endpoints require appropriate authentication
4. **PCI Compliance**: Sensitive payment data handled only by Stripe
5. **Data Loss Prevention**: Database transaction handling for consistency

## Performance Optimization

- Indexed subscriptions by status and renewal date for quick queries
- Batch processing for renewal reminders
- Async webhook handling to prevent blocking
- Cron job runs every 6 hours (configurable)

---

**Last Updated:** 2025-01-17
**Status:** ✅ Phase 3.1 Complete
**Next Phase:** Phase 3.2 - Subscription Management UI
