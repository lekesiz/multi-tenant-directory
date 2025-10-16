# 🚀 Setup Guide - Multi-Tenant Directory Platform

**Quick Start:** Get the platform running locally in 15 minutes!

---

## ✅ Prerequisites

- Node.js 20+ (check: `node --version`)
- PostgreSQL 14+ (or use cloud database)
- Git
- Stripe account (free test mode)

---

## 📦 Step 1: Installation

```bash
# Clone repository
git clone https://github.com/yourusername/multi-tenant-directory.git
cd multi-tenant-directory

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

---

## 🔐 Step 2: Environment Variables

```bash
# Copy example file
cp .env.local.example .env.local

# Edit with your values
nano .env.local
```

**Minimum Required:**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 💳 Step 3: Stripe Setup (Test Mode)

### 3.1 Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Click "Developers" → "API keys"
3. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
4. Add to `.env.local`

### 3.2 Create Products & Prices

```bash
# Option 1: Using Stripe Dashboard (Recommended)
```

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click "Add product"

**Product 1: Basic Plan**
- Name: "Basic Plan"
- Description: "Perfect for small businesses"
- Pricing: €29.00 / month
- Copy the Price ID → `STRIPE_BASIC_PRICE_ID`

**Product 2: Pro Plan**
- Name: "Pro Plan"
- Description: "For growing businesses"
- Pricing: €79.00 / month
- Copy the Price ID → `STRIPE_PRO_PRICE_ID`

**Product 3: Enterprise Plan**
- Name: "Enterprise Plan"
- Description: "For large organizations"
- Pricing: €199.00 / month
- Copy the Price ID → `STRIPE_ENTERPRISE_PRICE_ID`

```bash
# Option 2: Using Stripe CLI (Advanced)
stripe products create \
  --name="Basic Plan" \
  --description="Perfect for small businesses"

stripe prices create \
  --product=prod_xxx \
  --unit-amount=2900 \
  --currency=eur \
  --recurring[interval]=month
```

### 3.3 Setup Webhooks

#### Development (Stripe CLI):

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/billing/webhook

# Copy webhook signing secret (starts with whsec_)
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

#### Production (Stripe Dashboard):

1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/billing/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

---

## 🗄️ Step 4: Database Setup

```bash
# Create database (if not exists)
createdb multi_tenant_directory

# Run migrations
npx prisma migrate dev

# Seed initial data (optional)
npm run db:seed
```

**Database connection string format:**
```
postgresql://username:password@host:port/database?schema=public
```

**Cloud Database Options:**
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Free tier)
- [Supabase](https://supabase.com/) (Free tier)
- [Neon](https://neon.tech/) (Free tier)

---

## 🏃 Step 5: Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🧪 Step 6: Test Stripe Integration

### Test Credit Cards (Stripe Test Mode):

**Success:**
- `4242 4242 4242 4242` - Visa
- Any future expiry (e.g., `12/34`)
- Any 3-digit CVC (e.g., `123`)

**Failed Payment:**
- `4000 0000 0000 0002` - Card declined

**3D Secure:**
- `4000 0025 0000 3155` - Requires authentication

### Testing Checkout Flow:

1. Go to http://localhost:3000/pricing
2. Click "Choisir ce plan" on Basic/Pro
3. (Login if needed)
4. Fill test credit card
5. Complete checkout
6. Check database: subscription status updated
7. Go to `/business/dashboard/billing` - see active subscription

### Testing Webhooks:

```bash
# In separate terminal, listen for events
stripe listen --forward-to localhost:3000/api/billing/webhook

# Trigger test event
stripe trigger customer.subscription.created

# Check logs in terminal
```

---

## 📧 Step 7: Email Setup (Optional)

### Option 1: SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get API key
3. Verify sender email
4. Add to `.env.local`:
   ```env
   SENDGRID_API_KEY="SG...."
   SENDGRID_FROM_EMAIL="notifications@yourdomain.com"
   ```

### Option 2: Resend

1. Sign up at [Resend](https://resend.com/)
2. Get API key
3. Verify domain
4. Add to `.env.local`:
   ```env
   RESEND_API_KEY="re_..."
   RESEND_FROM_EMAIL="notifications@yourdomain.com"
   ```

---

## 🛠️ Additional Configuration

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps JavaScript API" and "Places API"
3. Create API key
4. Restrict to your domain
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
   ```

### Cloudinary (Image Upload)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get credentials from Dashboard
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   ```

---

## 🧪 Testing Checklist

- [ ] Server starts without errors
- [ ] Pricing page loads (`/pricing`)
- [ ] Can register new business owner
- [ ] Checkout flow redirects to Stripe
- [ ] Test payment completes successfully
- [ ] Webhook updates subscription status
- [ ] Billing dashboard shows active plan
- [ ] Can access billing portal
- [ ] Feature restrictions work (e.g., photo upload limit)

---

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](docs/deployment/DEPLOYMENT_GUIDE.md) for production deployment.

**Quick Deploy to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Update webhook URL in Stripe dashboard
```

---

## 🐛 Troubleshooting

### Database Connection Error

```
Error: P1001: Can't reach database server
```

**Solution:**
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running: `pg_ctl status`
- Test connection: `psql $DATABASE_URL`

### Stripe Webhook Not Working

**Solution:**
- Check Stripe CLI is running: `stripe listen`
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check webhook logs in Stripe dashboard
- Ensure endpoint is publicly accessible (production)

### Prisma Schema Changes

```bash
# After modifying schema.prisma
npx prisma migrate dev --name description_of_change
npx prisma generate
```

### Clear Database (Development)

```bash
npx prisma migrate reset # WARNING: Deletes all data
npm run db:seed
```

---

## 📚 Next Steps

1. **Configure Features:**
   - [ ] Email templates
   - [ ] Referral program
   - [ ] PWA manifest
   - [ ] Analytics tracking

2. **Content:**
   - [ ] Add your domain to database
   - [ ] Import initial businesses
   - [ ] Create legal pages
   - [ ] Setup admin account

3. **Production:**
   - [ ] Switch to production Stripe keys
   - [ ] Configure production webhooks
   - [ ] Setup monitoring (Sentry)
   - [ ] Enable rate limiting (Redis)

---

## 🆘 Need Help?

- **Documentation:** [docs/](docs/)
- **GitHub Issues:** https://github.com/yourusername/multi-tenant-directory/issues
- **Stripe Docs:** https://stripe.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Happy Building! 🚀**
