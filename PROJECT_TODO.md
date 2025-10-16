# 📋 Haguenau.pro - Unified Project TODO

**Last Updated:** 2025-10-16
**Project Status:** Pre-Production (Database Setup Needed)
**Target Launch:** 4 weeks from today

> **⚠️ IMPORTANT:** This is the single source of truth for all project tasks. All other TODO files are archived.

---

## 🎯 CURRENT SPRINT: Critical Infrastructure (Week 1)

**Goal:** Get basic infrastructure running
**Estimated Time:** 20 hours
**Deadline:** End of Week 1

---

## ✅ PHASE 1: CRITICAL INFRASTRUCTURE (Week 1)

### 🔴 P0: Database Setup (Blocks Everything)
- [ ] **Set up PostgreSQL database**
  - [ ] Sign up for Neon (https://neon.tech) or Supabase
  - [ ] Create new project: "haguenau-pro"
  - [ ] Copy connection string
  - [ ] Test connection with Prisma Studio
  - **Time:** 1-2 hours
  - **Blocker:** None

- [ ] **Configure DATABASE_URL**
  - [ ] Add to .env.local: `DATABASE_URL="postgresql://..."`
  - [ ] Verify connection: `npx prisma db pull`
  - **Time:** 15 min
  - **Blocker:** Needs database

- [ ] **Run Prisma migrations**
  - [ ] Execute: `npx prisma migrate deploy`
  - [ ] Verify tables created
  - **Time:** 30 min
  - **Blocker:** Needs DATABASE_URL

- [ ] **Seed database**
  - [ ] Run: `npm run db:seed`
  - [ ] Verify domains created (20 domains)
  - **Time:** 15 min
  - **Blocker:** Needs migrations

- [ ] **Import Haguenau businesses**
  - [ ] Run: `npm run import:all`
  - [ ] Verify 50 businesses imported
  - **Time:** 1-2 hours
  - **Blocker:** Needs seed data

**Total Time:** 3-4 hours

---

### 🔴 P0: Environment Variables (32 Required)

- [ ] **Core Settings**
  ```bash
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NODE_ENV=development
  ```
  **Time:** 2 min

- [ ] **Authentication**
  ```bash
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=[Run: openssl rand -base64 32]
  ```
  **Time:** 5 min

- [ ] **Stripe (Test Mode)**
  - [ ] Sign up: https://stripe.com
  - [ ] Get publishable key: Dashboard → API keys
  - [ ] Get secret key: Dashboard → API keys
  - [ ] Create products: Basic ($29), Pro ($99), Enterprise ($299)
  - [ ] Copy price IDs
  ```bash
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=[After webhook setup]
  STRIPE_BASIC_PRICE_ID=price_...
  STRIPE_PRO_PRICE_ID=price_...
  STRIPE_ENTERPRISE_PRICE_ID=price_...
  ```
  **Time:** 1 hour

- [ ] **Email Service (Resend)**
  - [ ] Sign up: https://resend.com
  - [ ] Verify domain or use resend.dev
  - [ ] Get API key
  ```bash
  RESEND_API_KEY=re_...
  RESEND_FROM_EMAIL=noreply@yourdomain.com
  ```
  **Time:** 15 min

- [ ] **AI Provider (Choose One)**

  **Option A: OpenAI**
  - [ ] Sign up: https://platform.openai.com
  - [ ] Add $5 credit
  - [ ] Get API key
  ```bash
  AI_PROVIDER=openai
  OPENAI_API_KEY=sk-...
  ```

  **Option B: Anthropic (Recommended - Cheaper)**
  - [ ] Sign up: https://console.anthropic.com
  - [ ] Add $5 credit
  - [ ] Get API key
  ```bash
  AI_PROVIDER=anthropic
  ANTHROPIC_API_KEY=sk-ant-...
  ```
  **Time:** 15 min

- [ ] **Image Upload (Cloudinary)**
  - [ ] Sign up: https://cloudinary.com
  - [ ] Get cloud name from dashboard
  - [ ] Get API key & secret
  ```bash
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=123456789
  CLOUDINARY_API_SECRET=abc123...
  ```
  **Time:** 15 min

- [ ] **Google Maps**
  - [ ] Go to: https://console.cloud.google.com
  - [ ] Enable Maps JavaScript API
  - [ ] Enable Places API
  - [ ] Get API key
  - [ ] Enable billing (required)
  ```bash
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
  ```
  **Time:** 30 min

**Total Time:** 2.5 hours

---

### 🔴 P0: TypeScript Errors (322 Errors)

- [ ] **Fix Jest type definitions**
  - [ ] Update tsconfig.json:
  ```json
  {
    "compilerOptions": {
      "types": ["jest", "@testing-library/jest-dom", "node"]
    }
  }
  ```
  - [ ] Run: `npm run type-check`
  - **Time:** 30 min
  - **Expected:** Reduces to ~50 errors

- [ ] **Fix critical errors (non-test files)**
  - [ ] Review output of: `npx tsc --noEmit | grep -v "__tests__"`
  - [ ] Fix errors in src/app and src/components
  - **Time:** 2-3 hours
  - **Expected:** 0 errors in production code

- [ ] **Document remaining test errors**
  - [ ] Create: `docs/KNOWN_ISSUES.md`
  - [ ] List non-critical test file errors
  - **Time:** 15 min

**Total Time:** 3-4 hours

---

### 🔴 P0: Security Essentials

- [ ] **Implement CSRF Protection**
  - [ ] Install: `npm install csrf`
  - [ ] Add middleware: `src/middleware/csrf.ts`
  - [ ] Apply to all POST/PUT/DELETE routes
  - **Time:** 2 hours
  - **File:** Create `src/middleware/csrf.ts`

- [ ] **Add Rate Limiting (Critical Routes)**
  - [ ] Auth routes: `/api/auth/*` (5 req/min)
  - [ ] Review routes: `/api/companies/*/reviews` (10 req/hour)
  - [ ] Contact form: `/api/contact` (3 req/hour)
  - **Time:** 2 hours
  - **File:** Update `src/lib/rate-limiter.ts`

- [ ] **Brute Force Protection**
  - [ ] Login: Lock after 5 failed attempts (15 min)
  - [ ] Password reset: Max 3 requests/hour
  - **Time:** 2 hours
  - **File:** Create `src/lib/brute-force-protection.ts`

**Total Time:** 6 hours

---

### 🔴 P0: Email Testing

- [ ] **Test all email templates**
  - [ ] Welcome email (new user)
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Payment success
  - [ ] Payment failed
  - [ ] Review alert
  - [ ] Weekly digest
  - **Time:** 1 hour
  - **Blocker:** Needs RESEND_API_KEY

- [ ] **Verify email deliverability**
  - [ ] Check spam score: https://www.mail-tester.com
  - [ ] Set up SPF record
  - [ ] Set up DKIM record
  - **Time:** 1 hour
  - **Blocker:** Needs domain

**Total Time:** 2 hours

---

## ✅ PHASE 2: TESTING & QUALITY (Week 2)

**Total Time:** 34 hours

### 🟡 P1: Code Cleanup

- [ ] **Replace console.log with logger (14 remaining)**
  - [ ] `src/app/api/business/verify-email/route.ts:122`
  - [ ] `src/app/api/business/register/route.ts:73,91`
  - [ ] `src/app/api/mobile/notifications/send/route.ts:164`
  - [ ] `src/app/api/analytics/vitals/route.ts:16`
  - [ ] Find all: `grep -r "console.log" src/app --include="*.ts" --exclude-dir=__tests__`
  - **Time:** 1 hour

- [ ] **Implement remaining code TODOs**

  **Photos API** (`src/app/api/companies/[id]/photos/route.ts:235`)
  ```typescript
  // TODO: Delete from Vercel Blob storage
  await del(photoToDelete.url);
  ```

  **Analytics API** (`src/app/api/companies/[id]/analytics/route.ts:101,194`)
  ```typescript
  // TODO: Implement weekly/monthly grouping
  // TODO: Track unique visitors using cookies/session
  ```

  **Web Vitals** (`src/app/api/analytics/vitals/route.ts:16`)
  ```typescript
  // TODO: Store in database or send to analytics service
  ```

  - **Time:** 3 hours

- [ ] **Run ESLint and fix warnings**
  ```bash
  npm run lint:fix
  ```
  - **Time:** 30 min

**Total Time:** 4.5 hours

---

### 🟡 P1: Integration Tests

- [ ] **Set up Jest properly**
  - [ ] Install missing types: `@types/jest`
  - [ ] Configure test database
  - [ ] Create test utilities: `src/tests/utils.ts`
  - **Time:** 2 hours

- [ ] **Auth Flow Tests**
  ```typescript
  // src/__tests__/integration/auth.test.ts
  describe('Authentication', () => {
    it('should register new user', ...)
    it('should verify email', ...)
    it('should login user', ...)
    it('should reset password', ...)
  })
  ```
  - **Time:** 4 hours

- [ ] **Payment Flow Tests**
  ```typescript
  // src/__tests__/integration/payment.test.ts
  describe('Stripe Integration', () => {
    it('should create checkout session', ...)
    it('should handle webhook events', ...)
    it('should upgrade subscription', ...)
    it('should cancel subscription', ...)
  })
  ```
  - **Time:** 4 hours

- [ ] **AI Features Tests**
  ```typescript
  // src/__tests__/integration/ai.test.ts
  describe('AI Integration', () => {
    it('should generate business description', ...)
    it('should analyze review sentiment', ...)
    it('should generate review response', ...)
  })
  ```
  - **Time:** 3 hours

- [ ] **Review System Tests**
  ```typescript
  // src/__tests__/integration/reviews.test.ts
  describe('Review System', () => {
    it('should submit review', ...)
    it('should moderate review', ...)
    it('should notify business owner', ...)
  })
  ```
  - **Time:** 3 hours

**Total Time:** 16 hours

---

### 🟡 P1: E2E Tests (Playwright)

- [ ] **Set up Playwright**
  ```bash
  npx playwright install
  ```
  - [ ] Configure: `playwright.config.ts`
  - [ ] Create: `e2e/` directory
  - **Time:** 1 hour

- [ ] **User Registration Flow**
  ```typescript
  // e2e/registration.spec.ts
  test('complete registration flow', async ({ page }) => {
    // Fill form → Verify email → Login
  })
  ```
  - **Time:** 2 hours

- [ ] **Business Owner Dashboard**
  ```typescript
  // e2e/dashboard.spec.ts
  test('business owner can manage listing', ...)
  ```
  - **Time:** 2 hours

- [ ] **Payment Flow**
  ```typescript
  // e2e/payment.spec.ts
  test('user can subscribe to pro plan', ...)
  ```
  - **Time:** 2 hours

**Total Time:** 7 hours

---

### 🟡 P1: Monitoring & Documentation

- [ ] **Set up Sentry**
  - [ ] Sign up: https://sentry.io
  - [ ] Install: `npm install @sentry/nextjs`
  - [ ] Configure: `sentry.client.config.ts`
  - [ ] Add `SENTRY_DSN` to env
  - [ ] Test error reporting
  - **Time:** 2 hours

- [ ] **Configure Uptime Monitoring**
  - [ ] Sign up: https://uptimerobot.com (free)
  - [ ] Add monitor: https://haguenau.pro
  - [ ] Set up email alerts
  - **Time:** 30 min

- [ ] **Set up Database Backups**
  - [ ] Enable automatic backups (Neon/Supabase)
  - [ ] Test restoration process
  - [ ] Document in README
  - **Time:** 1 hour

- [ ] **Complete API Documentation**
  - [ ] Install: `npm install swagger-ui-react`
  - [ ] Create: `docs/API.md`
  - [ ] Document all 99 endpoints
  - **Time:** 4 hours

**Total Time:** 7.5 hours

---

## ✅ PHASE 3: PERFORMANCE (Week 3)

**Total Time:** 41 hours

### 🟢 P2: Performance Optimization

- [ ] **Run Lighthouse Audit**
  ```bash
  npm run build
  npm run start
  # Open DevTools → Lighthouse
  ```
  - [ ] Target: All scores > 90
  - **Time:** 1 hour

- [ ] **Image Optimization**
  - [ ] Convert all images to WebP
  - [ ] Use next/image for all images
  - [ ] Add blur placeholders
  - **Time:** 2 hours

- [ ] **Implement Redis Caching**
  - [ ] Sign up: https://upstash.com
  - [ ] Install: `npm install @upstash/redis`
  - [ ] Cache company listings (5 min TTL)
  - [ ] Cache search results (1 min TTL)
  - **Time:** 4 hours

- [ ] **Database Query Optimization**
  - [ ] Add missing indexes
  - [ ] Use select to limit fields
  - [ ] Implement pagination everywhere
  - **Time:** 4 hours

- [ ] **Bundle Size Optimization**
  ```bash
  npm run build
  npx @next/bundle-analyzer
  ```
  - [ ] Remove unused dependencies
  - [ ] Lazy load heavy components
  - [ ] Target: < 500KB gzipped
  - **Time:** 3 hours

**Total Time:** 14 hours

---

### 🟢 P2: PWA Enhancements

- [ ] **Implement Push Notifications**
  - [ ] Install: `npm install web-push`
  - [ ] Generate VAPID keys
  - [ ] Update service worker
  - [ ] Add subscription UI
  - [ ] Test on iOS/Android
  - **Time:** 6 hours

- [ ] **Background Sync**
  - [ ] Implement for review submissions
  - [ ] Implement for contact form
  - [ ] Test offline submission
  - **Time:** 4 hours

- [ ] **Convert SVG Icons to PNG**
  - [ ] Generate 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
  - [ ] Update manifest.json
  - **Time:** 1 hour

- [ ] **Test PWA Installation**
  - [ ] iOS Safari
  - [ ] Android Chrome
  - [ ] Desktop Chrome
  - [ ] Verify offline mode
  - **Time:** 2 hours

**Total Time:** 13 hours

---

### 🟢 P2: AI Feature Enhancements

- [ ] **Bulk Review Analysis**
  - [ ] Create: `src/app/api/ai/bulk-analyze/route.ts`
  - [ ] UI: Analyze all reviews button
  - [ ] Queue system for large batches
  - **Time:** 4 hours

- [ ] **Competitor Analysis Dashboard**
  - [ ] Compare with similar businesses
  - [ ] Show market insights
  - [ ] Create: `src/components/CompetitorAnalysis.tsx`
  - **Time:** 6 hours

- [ ] **Weekly Insights Report (Cron Job)**
  - [ ] Use Vercel Cron or GitHub Actions
  - [ ] Generate weekly summary
  - [ ] Email to business owners
  - **Time:** 4 hours

**Total Time:** 14 hours

---

## ✅ PHASE 4: CI/CD & DEPLOYMENT (Week 4)

**Total Time:** 12 hours

### 🟢 P2: CI/CD Pipeline

- [ ] **GitHub Actions Setup**
  - [ ] Create: `.github/workflows/ci.yml`
  - [ ] Run tests on PR
  - [ ] Run type checking
  - [ ] Run linting
  - **Time:** 3 hours

- [ ] **Automated Deployment**
  - [ ] Create: `.github/workflows/deploy.yml`
  - [ ] Deploy to Vercel on merge to main
  - [ ] Deploy to staging on PR
  - **Time:** 2 hours

- [ ] **Code Quality Checks**
  - [ ] Install: `npm install husky lint-staged`
  - [ ] Pre-commit hooks: ESLint + Prettier
  - [ ] Pre-push hooks: Type check + tests
  - **Time:** 1 hour

- [ ] **Security Scanning**
  - [ ] Add Dependabot
  - [ ] Add Snyk security scanning
  - **Time:** 2 hours

**Total Time:** 8 hours

---

### 🟢 P2: Staging & Production

- [ ] **Create Staging Environment**
  - [ ] Deploy to Vercel (staging)
  - [ ] Use staging database
  - [ ] Test all features manually
  - **Time:** 2 hours

- [ ] **Production Deployment**
  - [ ] Configure custom domain
  - [ ] Set up DNS records
  - [ ] Enable SSL (automatic on Vercel)
  - [ ] Deploy to production
  - **Time:** 1 hour

- [ ] **Post-Launch Monitoring**
  - [ ] Monitor errors (Sentry)
  - [ ] Monitor uptime
  - [ ] Check performance metrics
  - [ ] Verify email delivery
  - [ ] Test payment flow
  - **Time:** 1 hour

**Total Time:** 4 hours

---

## 🔵 PHASE 5: POST-LAUNCH (Month 2+)

**Total Time:** 308 hours (not urgent)

### Low Priority Features

- [ ] Dark mode implementation (8 hours)
- [ ] Multi-language support: EN, DE, TR (24 hours)
- [ ] Mobile app with React Native (160 hours)
- [ ] WhatsApp Business integration (12 hours)
- [ ] SMS notifications (8 hours)
- [ ] A/B testing framework (12 hours)
- [ ] Referral program completion (16 hours)
- [ ] GDPR compliance features (12 hours)
- [ ] Custom analytics dashboards (16 hours)
- [ ] Advanced features (40 hours)

---

## 📊 PROGRESS TRACKING

### Overall Progress

**Total Tasks:** 154
**Completed:** 21 (13.6%)
**Remaining:** 133 (86.4%)

### By Phase

| Phase | Tasks | Completed | Remaining | Progress |
|-------|-------|-----------|-----------|----------|
| Phase 1: Critical | 18 | 0 | 18 | 0% |
| Phase 2: Testing | 16 | 2 | 14 | 12.5% |
| Phase 3: Performance | 11 | 0 | 11 | 0% |
| Phase 4: CI/CD | 6 | 0 | 6 | 0% |
| Phase 5: Post-Launch | 24 | 0 | 24 | 0% |

### By Priority

| Priority | Tasks | Completed | Remaining |
|----------|-------|-----------|-----------|
| P0 (Critical) | 18 | 0 | 18 |
| P1 (High) | 21 | 2 | 19 |
| P2 (Medium) | 30 | 0 | 30 |
| P3 (Low) | 24 | 0 | 24 |

---

## 🎯 SUCCESS CRITERIA

### Production Ready Checklist

**Infrastructure:**
- [ ] Database connected and seeded
- [ ] All 32 environment variables configured
- [ ] Stripe products created
- [ ] Email delivery verified

**Security:**
- [ ] 0 critical TypeScript errors
- [ ] CSRF protection implemented
- [ ] Rate limiting on all routes
- [ ] Brute force protection active

**Quality:**
- [ ] Test coverage > 70%
- [ ] All integration tests passing
- [ ] E2E tests for critical flows

**Performance:**
- [ ] Lighthouse score > 90 (all metrics)
- [ ] Bundle size < 500KB gzipped
- [ ] Response time < 500ms (p95)

**Monitoring:**
- [ ] Sentry configured
- [ ] Uptime monitoring active
- [ ] Database backups automated

---

## 📅 TIMELINE

| Week | Phase | Focus | Hours | Deliverable |
|------|-------|-------|-------|-------------|
| **Week 1** | Phase 1 | Infrastructure | 20h | Database + Environment + Security |
| **Week 2** | Phase 2 | Testing | 34h | Tests + Monitoring + Docs |
| **Week 3** | Phase 3 | Performance | 41h | Optimization + PWA + AI |
| **Week 4** | Phase 4 | Deployment | 12h | CI/CD + Staging + Production |
| **Month 2+** | Phase 5 | Features | 308h | Dark mode + i18n + Mobile app |

**Total Time to Production:** 4 weeks (107 hours)

---

## 🚨 BLOCKERS

### Current Blockers

1. ❌ **No Database** - Blocks 80% of testing
2. ❌ **No API Keys** - Blocks email, AI, maps, payments
3. ⚠️ **TypeScript Errors (322)** - May cause runtime issues
4. ⚠️ **No Tests** - Risk of regression bugs

### Unblocking Strategy

**This Week:**
1. Set up database (Day 1)
2. Configure API keys (Day 2)
3. Fix TypeScript errors (Day 3)
4. Start testing (Day 4-5)

---

## 💰 COST ESTIMATE

### Development Cost

| Phase | Hours | Rate | Cost |
|-------|-------|------|------|
| Phase 1: Critical | 20h | $50/hr | $1,000 |
| Phase 2: Testing | 34h | $50/hr | $1,700 |
| Phase 3: Performance | 41h | $50/hr | $2,050 |
| Phase 4: Deployment | 12h | $50/hr | $600 |
| **Total (Production)** | **107h** | **$50/hr** | **$5,350** |

### Monthly Infrastructure Cost

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20/mo |
| Neon/Supabase | Pro | $25/mo |
| Upstash Redis | Free | $0/mo |
| Resend | Free (3k emails) | $0/mo |
| Sentry | Free | $0/mo |
| **Total** | | **$45/mo** |

### API Usage (Variable)

| Service | Usage | Estimated Cost |
|---------|-------|---------------|
| OpenAI/Anthropic | ~1000 requests/mo | $5-10/mo |
| Cloudinary | Free tier | $0/mo |
| Google Maps | $200 free credit | $0/mo |
| Stripe | 2.9% + $0.30/tx | Pay as you go |
| **Total** | | **$5-10/mo** |

**Grand Total:** ~$50-55/month

---

## 📞 SUPPORT & RESOURCES

### External Services

- **Database:** [Neon](https://neon.tech) or [Supabase](https://supabase.com)
- **Email:** [Resend](https://resend.com)
- **AI:** [OpenAI](https://platform.openai.com) or [Anthropic](https://console.anthropic.com)
- **Payments:** [Stripe](https://stripe.com)
- **Images:** [Cloudinary](https://cloudinary.com)
- **Maps:** [Google Cloud](https://console.cloud.google.com)
- **Monitoring:** [Sentry](https://sentry.io)
- **Uptime:** [UptimeRobot](https://uptimerobot.com)

### Documentation

- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **Stripe:** https://stripe.com/docs
- **Resend:** https://resend.com/docs
- **OpenAI:** https://platform.openai.com/docs
- **Anthropic:** https://docs.anthropic.com

---

## ✅ NEXT ACTIONS (Today)

### Immediate (Next 4 Hours)

1. **Set Up Database (2 hours)**
   ```bash
   # Go to neon.tech or supabase.com
   # Create project: "haguenau-pro"
   # Copy DATABASE_URL
   # Add to .env.local
   # Run: npx prisma migrate deploy
   ```

2. **Configure Critical Env Vars (1 hour)**
   ```bash
   # Copy .env.local.example to .env.local
   # Generate NEXTAUTH_SECRET
   # Sign up for Resend (free tier)
   # Add RESEND_API_KEY
   ```

3. **Test Basic Flow (1 hour)**
   ```bash
   npm run dev
   # Test: User registration
   # Test: Company listing
   # Test: Database connection
   ```

---

**Last Updated:** 2025-10-16
**Owner:** Development Team
**Next Review:** After Phase 1 completion
