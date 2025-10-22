# Production Setup Guide

Complete guide for setting up production environment for haguenau.pro multi-tenant directory.

**Estimated Time:** 1-2 hours  
**Last Updated:** October 22, 2025

---

## Prerequisites

- Vercel account with project deployed
- Database access (Neon/Supabase/PostgreSQL)
- Email service account (Resend recommended)
- Domain configured and working

---

## 1. Database Migration (15 minutes)

### Newsletter System Tables

The newsletter system requires 3 new tables:
- `newsletter_subscribers`
- `email_campaigns`
- `email_logs`

### Option A: Using Prisma Migrate (Recommended)

```bash
# 1. Connect to your database
export DATABASE_URL="your-production-database-url"

# 2. Run pending migrations
npx prisma migrate deploy

# 3. Verify tables created
npx prisma db pull
```

### Option B: Manual SQL Execution

If Prisma migrate fails, run this SQL directly on your database:

```sql
-- Create newsletter_subscribers table
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "firstName" TEXT,
    "lastName" TEXT,
    "domainId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT,
    "preferences" JSONB DEFAULT '{"weeklyDigest": true, "newBusinesses": true, "specialOffers": false}',
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "unsubscribeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_subscribers_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers"("email");
CREATE INDEX "newsletter_subscribers_domainId_idx" ON "newsletter_subscribers"("domainId");
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");
CREATE INDEX "newsletter_subscribers_createdAt_idx" ON "newsletter_subscribers"("createdAt" DESC);

-- Create email_campaigns table
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER DEFAULT 0,
    "openCount" INTEGER DEFAULT 0,
    "clickCount" INTEGER DEFAULT 0,
    "bounceCount" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "email_campaigns_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "email_campaigns_domainId_idx" ON "email_campaigns"("domainId");
CREATE INDEX "email_campaigns_status_idx" ON "email_campaigns"("status");
CREATE INDEX "email_campaigns_scheduledAt_idx" ON "email_campaigns"("scheduledAt");
CREATE INDEX "email_campaigns_createdAt_idx" ON "email_campaigns"("createdAt" DESC);

-- Create email_logs table
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriberId" TEXT,
    "email" TEXT NOT NULL,
    "campaignId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "email_logs_subscriberId_idx" ON "email_logs"("subscriberId");
CREATE INDEX "email_logs_email_idx" ON "email_logs"("email");
CREATE INDEX "email_logs_campaignId_idx" ON "email_logs"("campaignId");
CREATE INDEX "email_logs_type_idx" ON "email_logs"("type");
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt" DESC);

-- Add newsletter relation to domains table (if not exists)
ALTER TABLE "domains" ADD COLUMN IF NOT EXISTS "newsletterEnabled" BOOLEAN DEFAULT true;
```

### Verification

```bash
# Check if tables exist
psql $DATABASE_URL -c "\dt newsletter_*"
psql $DATABASE_URL -c "\dt email_*"

# Check indexes
psql $DATABASE_URL -c "\di newsletter_*"
psql $DATABASE_URL -c "\di email_*"
```

---

## 2. Upstash Redis Setup (30 minutes)

### Why Redis?

Redis is used for:
- AI response caching (70-80% cost reduction)
- API response caching
- Rate limiting
- Session storage

### Step 1: Create Upstash Account

1. Go to https://upstash.com
2. Sign up (free tier: 10,000 commands/day)
3. Click "Create Database"

### Step 2: Configure Database

**Settings:**
- Name: `haguenau-pro-cache`
- Region: **Europe (Frankfurt)** or closest to your Vercel region
- Type: **Regional** (faster, recommended)
- Eviction: **allkeys-lru** (recommended for cache)

### Step 3: Get Credentials

After creation, go to database details:

1. **REST API** tab
2. Copy these values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 4: Add to Vercel

```bash
# Via Vercel CLI
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN

# Or via Vercel Dashboard:
# Settings → Environment Variables → Add
```

**Environment Variables:**
```
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Important:** Add to all environments (Production, Preview, Development)

### Step 5: Redeploy

```bash
# Trigger redeploy to apply new env vars
vercel --prod
```

### Verification

After deployment, test Redis:

```bash
curl https://haguenau.pro/api/health
# Should show: "redis": "ok"
```

### Cost Estimation

**Free Tier:**
- 10,000 commands/day
- 256 MB storage
- Sufficient for ~1,000 daily users

**Paid Tier (if needed):**
- $10/month: 100,000 commands/day
- $20/month: 1,000,000 commands/day

**Expected Usage:**
- AI caching: ~500 commands/day
- API caching: ~2,000 commands/day
- Total: ~2,500 commands/day (well within free tier)

---

## 3. Sentry Error Tracking (20 minutes)

### Why Sentry?

Sentry provides:
- Real-time error tracking
- Performance monitoring
- User session replay
- Release tracking
- Alert notifications

### Step 1: Create Sentry Account

1. Go to https://sentry.io
2. Sign up (free tier: 5,000 errors/month)
3. Create new project

### Step 2: Configure Project

**Settings:**
- Platform: **Next.js**
- Project name: `haguenau-pro`
- Team: Your team name

### Step 3: Get DSN

After project creation:

1. Go to **Settings** → **Client Keys (DSN)**
2. Copy the DSN URL (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

### Step 4: Add to Vercel

```bash
# Via Vercel CLI
vercel env add NEXT_PUBLIC_SENTRY_DSN
vercel env add SENTRY_AUTH_TOKEN  # Optional, for source maps

# Or via Vercel Dashboard:
# Settings → Environment Variables → Add
```

**Environment Variables:**
```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=haguenau-pro
```

**Important:** Add to all environments

### Step 5: Redeploy

```bash
vercel --prod
```

### Verification

1. Trigger a test error:
   ```bash
   curl https://haguenau.pro/api/test-error
   ```

2. Check Sentry dashboard for the error

### Cost Estimation

**Free Tier:**
- 5,000 errors/month
- 10,000 transactions/month
- Sufficient for small-medium traffic

**Paid Tier (if needed):**
- $26/month: 50,000 errors/month
- $80/month: 200,000 errors/month

**Expected Usage:**
- ~100-500 errors/month (well within free tier)

---

## 4. Cron Secret (5 minutes)

### Why Cron Secret?

Protects cron job endpoints from unauthorized access.

### Step 1: Generate Secret

```bash
# Generate a secure random secret
openssl rand -base64 32
# Or use: https://generate-secret.vercel.app/32
```

### Step 2: Add to Vercel

```bash
vercel env add CRON_SECRET
# Paste the generated secret
```

**Environment Variable:**
```
CRON_SECRET=your-secure-random-secret-here
```

**Important:** Add to Production only (cron jobs run in production)

### Step 3: Verify Cron Jobs

After deployment, cron jobs will run automatically:

1. **Google Reviews Sync:** Daily at 2:00 AM UTC
2. **Newsletter Digest:** Every Monday at 9:00 AM UTC

Check logs in Vercel Dashboard → Logs → Filter by `/api/cron/`

---

## 5. Email Service (Already Configured)

### Resend API

Already configured in your project. Verify:

```bash
# Check if RESEND_API_KEY is set
vercel env ls | grep RESEND
```

If not set:

1. Go to https://resend.com
2. Get API key
3. Add to Vercel:
   ```bash
   vercel env add RESEND_API_KEY
   ```

---

## 6. Environment Variables Checklist

### Required (Must Have)

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NEXTAUTH_SECRET` - Authentication secret
- ✅ `NEXTAUTH_URL` - Base URL (https://haguenau.pro)
- ✅ `RESEND_API_KEY` - Email service API key

### Recommended (High Priority)

- 🟡 `UPSTASH_REDIS_REST_URL` - Redis cache URL
- 🟡 `UPSTASH_REDIS_REST_TOKEN` - Redis cache token
- 🟡 `NEXT_PUBLIC_SENTRY_DSN` - Error tracking DSN
- 🟡 `CRON_SECRET` - Cron job authentication

### Optional (Nice to Have)

- 🟢 `GOOGLE_PLACES_API_KEY` - Google reviews sync
- 🟢 `CLOUDINARY_CLOUD_NAME` - Image hosting
- 🟢 `CLOUDINARY_API_KEY` - Image upload
- 🟢 `CLOUDINARY_API_SECRET` - Image management
- 🟢 `ANTHROPIC_API_KEY` - AI description generation

### Verification

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

---

## 7. Post-Setup Verification

### 1. Health Check

```bash
curl https://haguenau.pro/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "ok",
  "redis": "ok",
  "timestamp": "2025-10-22T10:00:00.000Z"
}
```

### 2. Newsletter Subscription Test

```bash
curl -X POST https://haguenau.pro/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "domainName": "haguenau.pro",
    "preferences": {
      "weeklyDigest": true,
      "newBusinesses": true,
      "specialOffers": false
    }
  }'
```

Expected: Welcome email sent + subscriber created

### 3. AI Description Test

1. Login to admin panel: https://haguenau.pro/admin
2. Edit a company
3. Go to "Domain Yönetimi" tab
4. Click "✨ Générer avec l'IA"
5. Verify description generated

### 4. Cron Job Manual Trigger

```bash
# Trigger newsletter digest manually
curl -X POST https://haguenau.pro/api/cron/newsletter-digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected: Digest emails sent to subscribers

### 5. Error Tracking Test

1. Go to Sentry dashboard
2. Trigger test error: https://haguenau.pro/api/test-error
3. Verify error appears in Sentry

---

## 8. Monitoring & Maintenance

### Daily Checks

- ✅ Check Vercel deployment status
- ✅ Review Sentry errors (if any)
- ✅ Monitor email delivery rate
- ✅ Check cron job execution logs

### Weekly Checks

- ✅ Review newsletter open rates
- ✅ Check Redis cache hit rate
- ✅ Monitor database performance
- ✅ Review user feedback

### Monthly Checks

- ✅ Update dependencies (`npm update`)
- ✅ Review and optimize slow queries
- ✅ Check service costs (Upstash, Sentry, Resend)
- ✅ Backup database

---

## 9. Troubleshooting

### Redis Not Working

**Symptoms:** AI descriptions slow, cache not working

**Solutions:**
1. Check environment variables are set
2. Verify Upstash database is active
3. Check Redis connection in health endpoint
4. Review Vercel logs for Redis errors

### Emails Not Sending

**Symptoms:** Welcome emails not received, digest not sent

**Solutions:**
1. Check RESEND_API_KEY is valid
2. Verify email domain is verified in Resend
3. Check email logs in database
4. Review Vercel logs for email errors

### Cron Jobs Not Running

**Symptoms:** No digest emails, reviews not synced

**Solutions:**
1. Check CRON_SECRET is set in Production
2. Verify cron jobs in vercel.json
3. Check Vercel logs for cron execution
4. Manually trigger cron job to test

### Build Failures

**Symptoms:** Deployment fails, TypeScript errors

**Solutions:**
1. Check build logs in Vercel
2. Run `npm run build` locally
3. Fix TypeScript errors
4. Clear Vercel cache (redeploy)

---

## 10. Cost Summary

### Monthly Costs (Estimated)

| Service | Free Tier | Paid (if needed) | Expected |
|---------|-----------|------------------|----------|
| Vercel | $0 (Hobby) | $20 (Pro) | $0 |
| Database (Neon) | $0 (Free) | $19 (Pro) | $0 |
| Upstash Redis | $0 (10K/day) | $10 (100K/day) | $0 |
| Sentry | $0 (5K errors) | $26 (50K errors) | $0 |
| Resend | $0 (100/day) | $20 (10K/month) | $0-20 |
| **Total** | **$0** | **$95** | **$0-20** |

### Cost Optimization Tips

1. **Redis:** Use free tier, monitor usage
2. **Sentry:** Filter out noise, focus on real errors
3. **Emails:** Batch sending, optimize frequency
4. **Database:** Use indexes, optimize queries
5. **AI:** Use caching (70-80% cost reduction)

---

## 11. Next Steps

After production setup:

1. ✅ Monitor for 24 hours
2. ✅ Test all features end-to-end
3. ✅ Configure UptimeRobot (21 domains)
4. ✅ Set up backup strategy
5. ✅ Document any issues
6. ✅ Plan next sprint features

---

## Support

For issues or questions:
- Check Vercel logs
- Review Sentry errors
- Check database logs
- Contact development team

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

