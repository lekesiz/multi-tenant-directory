# Stripe Payment System Setup Guide

## 🚀 Quick Setup Overview

This guide will walk you through setting up the complete Stripe payment system for the multi-tenant directory application.

## 📋 Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Test Environment**: Start with test keys for development
3. **Database**: Ensure PostgreSQL database is running
4. **Environment Variables**: Configure all required Stripe environment variables

## 🔑 Step 1: Get Stripe API Keys

### Development (Test Keys)
1. Log into your Stripe Dashboard
2. Go to **Developers > API Keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### Add to Environment Variables
```bash
# .env.local
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 💰 Step 2: Create Subscription Products & Prices

### Create Products in Stripe Dashboard

1. Go to **Products** in Stripe Dashboard
2. Create the following products:

#### Basic Plan
- **Name**: "Plan Basique"
- **Description**: "Plan de base pour petites entreprises"

#### Pro Plan
- **Name**: "Plan Professionnel" 
- **Description**: "Plan avancé avec toutes les fonctionnalités"

#### Enterprise Plan
- **Name**: "Plan Entreprise"
- **Description**: "Solution complète pour grandes entreprises"

### Create Prices for Each Product

For each product, create **both monthly and yearly prices**:

#### Basic Plan Prices
- **Monthly**: €19.99/month → Copy the Price ID
- **Yearly**: €199.99/year → Copy the Price ID

#### Pro Plan Prices  
- **Monthly**: €49.99/month → Copy the Price ID
- **Yearly**: €499.99/year → Copy the Price ID

#### Enterprise Plan Prices
- **Monthly**: €199.99/month → Copy the Price ID  
- **Yearly**: €1999.99/year → Copy the Price ID

### Add Price IDs to Environment Variables
```bash
# .env.local
STRIPE_PRICE_ID_BASIC_MONTHLY=price_1ABC123...
STRIPE_PRICE_ID_BASIC_YEARLY=price_1DEF456...
STRIPE_PRICE_ID_PRO_MONTHLY=price_1GHI789...
STRIPE_PRICE_ID_PRO_YEARLY=price_1JKL012...
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_1MNO345...
STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_1PQR678...
```

## 🔗 Step 3: Configure Webhooks

### Create Webhook Endpoint
1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Events to send**: Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.created`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.payment_action_required`
   - `payment_method.attached`

### Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add to environment variables:

```bash
# .env.local
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🗄️ Step 4: Database Migration

Run the Prisma migration to ensure all Stripe-related tables are created:

```bash
npx prisma db push
```

This creates the following tables:
- `StripeEvent` - Webhook event tracking
- `SubscriptionHistory` - Subscription change history  
- `Invoice` - Invoice and billing records

## 🧪 Step 5: Test the Integration

### 1. Test Checkout Flow
- Visit `/pricing` page
- Select a plan and click "Commencer"
- Use Stripe test cards:
  - **Success**: `4242 4242 4242 4242`
  - **Declined**: `4000 0000 0000 0002`

### 2. Test Webhooks
- Use Stripe CLI to forward webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. Verify Database Records
After successful checkout, verify:
- BusinessOwner subscription fields are updated
- StripeEvent records are created
- Invoice records are created

## 🔒 Step 6: Production Setup

### Before Going Live:
1. **Replace test keys** with live keys from Stripe Dashboard
2. **Update webhook URL** to production domain
3. **Test all payment flows** thoroughly
4. **Set up monitoring** for failed payments

### Live Environment Variables:
```bash
# .env.production
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📊 Step 7: Features Included

### ✅ Implemented Features
- [x] Subscription checkout with 14-day free trial
- [x] Monthly and yearly billing options
- [x] Automatic plan upgrades/downgrades with proration
- [x] Billing portal for customers
- [x] Webhook event processing
- [x] Invoice tracking and management
- [x] Referral code discounts
- [x] Subscription history tracking
- [x] Payment failure handling
- [x] Trial period management

### 🎯 Pricing Plans Structure
```typescript
// Plan Features Matrix
FREE: Basic profile, limited photos, standard support
BASIC: €19.99/month - Enhanced profile, more photos, analytics
PRO: €49.99/month - All features, priority support, AI tools  
ENTERPRISE: €199.99/month - White label, API access, dedicated support
```

## 🛠️ API Endpoints

### Checkout
- `POST /api/stripe/create-checkout-session`
- Creates Stripe checkout session with trial and referral support

### Subscription Management  
- `GET /api/stripe/subscription` - Get current subscription
- `PUT /api/stripe/subscription` - Update subscription plan
- `DELETE /api/stripe/subscription` - Cancel subscription

### Billing Portal
- `POST /api/stripe/billing-portal` - Create billing portal session

### Webhooks
- `POST /api/stripe/webhook` - Process Stripe webhook events

## 🔍 Troubleshooting

### Common Issues:

1. **Webhook signature verification failed**
   - Verify `STRIPE_WEBHOOK_SECRET` is correct
   - Check webhook endpoint URL matches exactly

2. **Price ID not found**
   - Ensure price IDs in environment variables match Stripe Dashboard
   - Verify prices are active in Stripe

3. **Subscription not updating**
   - Check webhook events are being received
   - Verify database connection and Prisma schema

### Debug Mode:
Enable verbose logging by setting:
```bash
DEBUG_STRIPE=true
```

## 📞 Support

For issues with this integration:
1. Check webhook logs in Stripe Dashboard
2. Review application logs for errors
3. Verify all environment variables are set correctly
4. Test with Stripe CLI in development

## 🔐 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** 
3. **Use HTTPS** for all webhook endpoints
4. **Regularly rotate** API keys
5. **Monitor** for suspicious activity in Stripe Dashboard

---

✅ **Integration Complete!** Your Stripe payment system is now ready for production use.