# 🐛 Known Issues & TODOs

**Last Updated:** 21 Ekim 2025  
**Status:** Non-Critical Issues - Documented for Future Implementation

---

## 📋 Code TODOs

### 1. Analytics & Tracking

#### Web Vitals Storage
**File:** `src/app/api/analytics/vitals/route.ts:17`  
**Issue:** Web vitals data currently logged but not stored  
**TODO:** Store in database or send to analytics service (e.g., Vercel Analytics, Google Analytics)  
**Priority:** 🟡 Medium  
**Estimated Time:** 2 hours

```typescript
// Current: console.log only
// TODO: Store in database or send to analytics service
```

---

#### Analytics Grouping
**File:** `src/app/api/companies/[id]/analytics/route.ts:102`  
**Issue:** Analytics data not grouped by week/month  
**TODO:** Implement weekly/monthly grouping for better insights  
**Priority:** 🟡 Medium  
**Estimated Time:** 3 hours

```typescript
// TODO: Implement weekly/monthly grouping
// Example: Group by ISO week number or month
```

---

#### Unique Visitor Tracking
**File:** `src/app/api/companies/[id]/analytics/route.ts:195`  
**Issue:** Visitor tracking counts all visits, not unique visitors  
**TODO:** Track unique visitors using cookies/session  
**Priority:** 🟡 Medium  
**Estimated Time:** 2 hours

```typescript
// TODO: Track unique visitors using cookies/session
// Use cookie-based tracking or fingerprinting
```

---

### 2. Media Management

#### Cloudinary Photo Deletion
**File:** `src/app/api/companies/[id]/photos/route.ts:259`  
**Issue:** Photos deleted from database but not from Cloudinary  
**TODO:** Implement Cloudinary deletion when package is configured  
**Priority:** 🟡 Medium  
**Estimated Time:** 1 hour

```typescript
// TODO: Implement Cloudinary deletion when package is configured
// Use cloudinary.uploader.destroy(publicId)
```

**Solution:**
```typescript
import { v2 as cloudinary } from 'cloudinary';

// Extract public_id from URL
const publicId = extractPublicId(photoToDelete.url);

// Delete from Cloudinary
await cloudinary.uploader.destroy(publicId);
```

---

### 3. Notifications & Emails

#### Subscription Email Notifications
**Files:**
- `src/app/api/cron/subscriptions-check/route.ts:15`
- `src/app/api/cron/subscriptions-check/route.ts:83`
- `src/app/api/cron/subscriptions-check/route.ts:143`

**Issue:** Subscription expiration/reminder emails not implemented  
**TODO:** Add email notifications in Phase 3.2  
**Priority:** 🔴 High  
**Estimated Time:** 4 hours

**Required Emails:**
1. Subscription expiration warning (7 days before)
2. Subscription expired notification
3. Subscription renewal reminder

**Status:** Email service (Resend) is configured and working ✅  
**Next Step:** Implement email templates and sending logic

---

#### Mobile Push Notifications
**File:** `src/app/api/mobile/notifications/send/route.ts:165`  
**Issue:** Firebase Cloud Messaging not implemented  
**TODO:** Implement Firebase Cloud Messaging when ready  
**Priority:** 🟢 Low (Mobile app not yet developed)  
**Estimated Time:** 8 hours

---

#### Stripe Dispute Notifications
**Files:**
- `src/app/api/webhooks/stripe/route.ts:119`
- `src/app/api/webhooks/stripe/route.ts:126`

**Issue:** Dispute and subscription update notifications not sent  
**TODO:** Notify customer and business owner about disputes/updates  
**Priority:** 🟡 Medium  
**Estimated Time:** 2 hours

---

### 4. AI Features

#### Chatbot Prompt Configuration
**File:** `src/lib/ai.ts:359`  
**Issue:** Chatbot prompt not added to AI_PROMPTS config  
**TODO:** Add chatbot prompt to AI_PROMPTS config  
**Priority:** 🟢 Low  
**Estimated Time:** 30 minutes

---

### 5. Email Templates

#### Email Template Implementation
**File:** `src/lib/email-templates.ts:245`  
**Issue:** Some email templates not fully implemented  
**TODO:** Implement with SendGrid or Resend  
**Priority:** 🟡 Medium  
**Estimated Time:** 3 hours

**Status:** Resend is configured and working ✅  
**Next Step:** Complete remaining email templates

---

### 6. Lazy Loading

#### Component Lazy Loading
**Files:**
- `src/lib/lazy-load.tsx:40`
- `src/lib/lazy-load.tsx:52`

**Issue:** Some components and pages not added to lazy loading config  
**TODO:** Add when components/pages are created  
**Priority:** 🟢 Low  
**Estimated Time:** 1 hour

---

## 🔧 Configuration Issues

### ESLint Configuration
**Issue:** ESLint not configured (prompts for setup)  
**Status:** ⚠️ Needs configuration  
**Priority:** 🟡 Medium  
**Estimated Time:** 30 minutes

**Solution:**
```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

---

## 📊 Priority Summary

| Priority | Count | Total Time |
|----------|-------|------------|
| 🔴 High | 1 | 4 hours |
| 🟡 Medium | 8 | 16 hours |
| 🟢 Low | 3 | 9.5 hours |
| **Total** | **12** | **29.5 hours** |

---

## 🎯 Recommended Implementation Order

### Phase 1: Quick Wins (4.5 hours)
1. ✅ ESLint configuration (30 min)
2. ✅ Cloudinary photo deletion (1 hour)
3. ✅ Chatbot prompt config (30 min)
4. ✅ Stripe dispute notifications (2 hours)
5. ✅ Lazy loading updates (30 min)

### Phase 2: Analytics & Tracking (7 hours)
1. Web vitals storage (2 hours)
2. Analytics grouping (3 hours)
3. Unique visitor tracking (2 hours)

### Phase 3: Email Notifications (7 hours)
1. Subscription email notifications (4 hours)
2. Email template completion (3 hours)

### Phase 4: Future Features (11 hours)
1. Mobile push notifications (8 hours)
2. Advanced AI features (3 hours)

---

## 📝 Notes

- All issues are **non-critical** and don't block production deployment
- Most TODOs are **feature enhancements** rather than bug fixes
- Email service (Resend) is **configured and working** ✅
- Environment variables are **properly set up** ✅
- Core functionality is **stable and production-ready** ✅

---

## 🚀 Next Steps

1. **Immediate:** ESLint configuration
2. **This Week:** Quick wins (Phase 1)
3. **This Month:** Analytics & Email notifications (Phase 2-3)
4. **Future:** Mobile and advanced features (Phase 4)

---

**Last Review:** 21 Ekim 2025  
**Reviewer:** Manus AI  
**Status:** ✅ Documented and Prioritized

