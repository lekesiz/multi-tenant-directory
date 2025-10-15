# Round 4 Task Assignments 🚀

**Date:** 16 Octobre 2025, 02:45 GMT+2  
**Phase:** Production Launch & Optimization  
**Duration:** 1-2 days  
**Goal:** Launch platform, optimize performance, expand features

---

## 🎯 Round 4 Overview

**Status:** Round 3 ✅ COMPLETE (All tasks verified)

**Next Phase:** Production Launch & Feature Expansion

**Focus Areas:**
1. **Production Launch** (final checks, monitoring)
2. **Performance Optimization** (speed, SEO, Core Web Vitals)
3. **Feature Expansion** (missing features, enhancements)
4. **Marketing Preparation** (content, outreach, analytics)

---

## 👥 Team Assignments

### 🤖 Claude AI - Backend & Features

**TASK-R4-01: Advanced Review System**

**Priority:** 🟡 HIGH  
**Deadline:** 17 Octobre, 18:00  
**Estimate:** 6-8 hours

**Description:**
Enhance the review system with advanced features for better user engagement and trust.

**Deliverables:**

1. **Review Reply System** ✅
   - Business owners can reply to reviews
   - Reply API endpoint: `POST /api/business/reviews/{reviewId}/reply`
   - Reply UI in business dashboard
   - Email notification to reviewer (optional)

2. **Review Helpful Votes** ✅
   - Users can vote reviews as helpful/not helpful
   - API endpoint: `POST /api/reviews/{reviewId}/vote`
   - Display helpful count on reviews
   - Prevent duplicate votes (IP/session tracking)

3. **Review Reporting** ✅
   - Users can report inappropriate reviews
   - API endpoint: `POST /api/reviews/{reviewId}/report`
   - Report reasons: spam, offensive, fake, other
   - Admin moderation queue

4. **Review Verification Badge** ✅
   - "Verified Purchase" badge for confirmed customers
   - Manual verification by business owner
   - API endpoint: `PATCH /api/business/reviews/{reviewId}/verify`
   - Display badge on verified reviews

**Technical Requirements:**
- Prisma schema updates (Reply, Vote, Report models)
- API routes with authentication
- UI components (ReplyForm, VoteButtons, ReportModal)
- Email templates (Resend)

**Acceptance Criteria:**
- [x] Business owners can reply to reviews
- [x] Users can vote reviews as helpful
- [x] Users can report reviews
- [x] Verified badge system implemented
- [x] All features tested
- [x] Documentation updated

**Files to Create/Modify:**
- `prisma/schema.prisma` (add Reply, Vote, Report models)
- `src/app/api/business/reviews/[reviewId]/reply/route.ts`
- `src/app/api/reviews/[reviewId]/vote/route.ts`
- `src/app/api/reviews/[reviewId]/report/route.ts`
- `src/components/ReviewReply.tsx`
- `src/components/ReviewVoteButtons.tsx`
- `src/components/ReviewReportModal.tsx`

---

**TASK-R4-02: Email Notification System**

**Priority:** 🟡 HIGH  
**Deadline:** 17 Octobre, 18:00  
**Estimate:** 4-6 hours

**Description:**
Implement comprehensive email notification system using Resend.

**Deliverables:**

1. **Email Templates** ✅
   - Welcome email (new user registration)
   - Email verification
   - Password reset
   - New review notification (business owner)
   - Review reply notification (reviewer)
   - Contact form submission (business owner)
   - Weekly digest (business owner - optional)

2. **Email Service** ✅
   - Centralized email service (`src/lib/email.ts`)
   - Resend integration
   - Template rendering (React Email or HTML)
   - Error handling and logging
   - Queue system (optional - for high volume)

3. **Email Preferences** ✅
   - User can opt-in/opt-out of emails
   - Email preferences page in dashboard
   - Unsubscribe link in all emails
   - API endpoint: `PATCH /api/business/email-preferences`

**Technical Requirements:**
- Resend API integration
- React Email or HTML templates
- Email service with retry logic
- Database schema for email preferences
- Unsubscribe token generation

**Acceptance Criteria:**
- [x] 7 email templates created
- [x] Email service functional
- [x] Email preferences implemented
- [x] Unsubscribe links work
- [x] All emails tested
- [x] Documentation updated

**Files to Create/Modify:**
- `src/lib/email.ts` (email service)
- `src/emails/WelcomeEmail.tsx` (React Email templates)
- `src/emails/VerificationEmail.tsx`
- `src/emails/PasswordResetEmail.tsx`
- `src/emails/NewReviewEmail.tsx`
- `src/emails/ReviewReplyEmail.tsx`
- `src/emails/ContactFormEmail.tsx`
- `src/app/api/business/email-preferences/route.ts`
- `src/app/business/dashboard/settings/page.tsx` (email preferences UI)

---

### 💻 VS Code Developer - Frontend & UX

**TASK-R4-03: Company Page Enhancements**

**Priority:** 🟡 HIGH  
**Deadline:** 17 Octobre, 18:00  
**Estimate:** 6-8 hours

**Description:**
Enhance company detail pages with missing features and better UX.

**Deliverables:**

1. **Photo Gallery Lightbox** ✅
   - Click photo to open lightbox
   - Navigate between photos (prev/next)
   - Zoom in/out
   - Close with ESC or click outside
   - Mobile-friendly (swipe gestures)
   - Library: `yet-another-react-lightbox` or custom

2. **Business Hours Display** ✅
   - Show weekly schedule
   - Highlight current day
   - "Open Now" / "Closed" indicator
   - "Opens at XX:XX" for closed businesses
   - Special hours display (holidays)
   - Collapsible on mobile

3. **Share Buttons** ✅
   - Share company profile on social media
   - Facebook, Twitter, LinkedIn, WhatsApp
   - Copy link button
   - Share modal or dropdown
   - Track shares in analytics (optional)

4. **Print-Friendly View** ✅
   - Print button
   - Optimized print stylesheet
   - Hide unnecessary elements (nav, footer, buttons)
   - Show all photos in grid
   - QR code with company URL (optional)

5. **Related Companies** ✅
   - "Similar Companies" section
   - Based on category and location
   - Show 3-6 related companies
   - Horizontal scroll on mobile
   - Link to company pages

**Technical Requirements:**
- Lightbox library integration
- Social share API integration
- Print CSS (@media print)
- Related companies algorithm
- Responsive design

**Acceptance Criteria:**
- [x] Photo lightbox functional
- [x] Business hours displayed correctly
- [x] Share buttons work
- [x] Print view optimized
- [x] Related companies shown
- [x] All features mobile-friendly
- [x] Performance optimized

**Files to Create/Modify:**
- `src/components/PhotoGalleryLightbox.tsx`
- `src/components/BusinessHoursDisplay.tsx`
- `src/components/ShareButtons.tsx`
- `src/components/RelatedCompanies.tsx`
- `src/app/companies/[slug]/page.tsx` (integrate components)
- `src/app/globals.css` (print styles)

---

**TASK-R4-04: Homepage & Directory Improvements**

**Priority:** 🟢 MEDIUM  
**Deadline:** 17 Octobre, 18:00  
**Estimate:** 4-6 hours

**Description:**
Improve homepage and directory with better UX and engagement features.

**Deliverables:**

1. **Homepage Hero Enhancements** ✅
   - Animated search bar (focus effect)
   - Popular searches suggestions
   - Category quick links (icons)
   - Featured companies carousel
   - Testimonials section (optional)

2. **Directory Filters Enhancement** ✅
   - Multi-select categories
   - Price range filter (if applicable)
   - Rating filter (4+ stars, 3+ stars, etc.)
   - "Open Now" filter
   - Distance filter (if geolocation enabled)
   - Clear all filters button

3. **Directory View Options** ✅
   - Grid view / List view toggle
   - Map view (show companies on map)
   - Sort options: Relevance, Distance, Rating, Name
   - Pagination or infinite scroll
   - Results count display

4. **Save Favorites** ✅
   - Heart icon on company cards
   - Save to favorites (local storage or database)
   - Favorites page in user dashboard
   - API endpoint: `POST /api/user/favorites/{companyId}`

**Technical Requirements:**
- Animation library (Framer Motion or CSS)
- Multi-select filter UI
- Map integration (Google Maps or Mapbox)
- Local storage or database for favorites
- Responsive design

**Acceptance Criteria:**
- [x] Homepage hero enhanced
- [x] Directory filters improved
- [x] View options implemented
- [x] Favorites system functional
- [x] All features mobile-friendly
- [x] Performance optimized

**Files to Create/Modify:**
- `src/app/page.tsx` (homepage hero)
- `src/components/HeroSearchBar.tsx`
- `src/components/PopularSearches.tsx`
- `src/components/FeaturedCompaniesCarousel.tsx`
- `src/app/annuaire/page.tsx` (directory filters)
- `src/components/DirectoryFilters.tsx`
- `src/components/DirectoryViewToggle.tsx`
- `src/components/FavoriteButton.tsx`
- `src/app/api/user/favorites/[companyId]/route.ts`

---

### 🔧 Manus AI - DevOps & Optimization

**TASK-R4-05: Performance Optimization**

**Priority:** 🔴 CRITICAL  
**Deadline:** 17 Octobre, 12:00  
**Estimate:** 4-6 hours

**Description:**
Optimize platform performance for better user experience and SEO.

**Deliverables:**

1. **Lighthouse Audit** ✅
   - Run Lighthouse on all key pages
   - Target: 90+ score on all metrics
   - Identify bottlenecks
   - Create optimization plan

2. **Image Optimization** ✅
   - Convert images to WebP format
   - Implement lazy loading
   - Add blur placeholders
   - Optimize image sizes (responsive)
   - Use Next.js Image component

3. **Code Splitting** ✅
   - Dynamic imports for heavy components
   - Route-based code splitting
   - Lazy load modals and dialogs
   - Reduce initial bundle size

4. **Caching Strategy** ✅
   - Implement ISR (Incremental Static Regeneration)
   - Cache API responses (Redis or Vercel KV - optional)
   - Set proper Cache-Control headers
   - Optimize database queries

5. **Core Web Vitals** ✅
   - Optimize LCP (Largest Contentful Paint)
   - Optimize FID (First Input Delay)
   - Optimize CLS (Cumulative Layout Shift)
   - Monitor with Vercel Analytics

**Technical Requirements:**
- Lighthouse CLI
- Next.js Image optimization
- Dynamic imports
- ISR configuration
- Performance monitoring

**Acceptance Criteria:**
- [x] Lighthouse score 90+ on all pages
- [x] Images optimized (WebP, lazy loading)
- [x] Code splitting implemented
- [x] Caching strategy in place
- [x] Core Web Vitals green
- [x] Documentation updated

**Tools:**
- Lighthouse CI
- Next.js Image
- Vercel Analytics
- Chrome DevTools

---

**TASK-R4-06: SEO & Analytics Enhancement**

**Priority:** 🟡 HIGH  
**Deadline:** 17 Octobre, 18:00  
**Estimate:** 4-6 hours

**Description:**
Enhance SEO and setup comprehensive analytics tracking.

**Deliverables:**

1. **Google Search Console Setup** ✅
   - Verify all 21 domains
   - Submit sitemaps
   - Monitor indexing status
   - Fix crawl errors

2. **Google Analytics 4 Setup** ✅
   - Create GA4 property
   - Install tracking code
   - Setup custom events:
     - Company page view
     - Phone click
     - Email click
     - Website click
     - Contact form submission
     - Review submission
     - Photo view
   - Setup conversion goals

3. **Enhanced Structured Data** ✅
   - Add FAQPage schema (if FAQ section exists)
   - Add AggregateRating schema (category pages)
   - Add ImageObject schema (photos)
   - Add VideoObject schema (if videos added)
   - Validate with Google Rich Results Test

4. **Meta Tags Optimization** ✅
   - Review all meta tags
   - Optimize title lengths (50-60 chars)
   - Optimize description lengths (150-160 chars)
   - Add Twitter Card meta tags
   - Add Open Graph meta tags (already done, verify)

5. **Internal Linking** ✅
   - Add breadcrumbs to all pages
   - Add "Related Articles" or "Related Companies"
   - Add category links in footer
   - Add city links in footer
   - Optimize anchor text

**Technical Requirements:**
- Google Search Console access
- Google Analytics 4 account
- Schema.org structured data
- Meta tags optimization
- Internal linking strategy

**Acceptance Criteria:**
- [x] Google Search Console verified (21 domains)
- [x] Google Analytics 4 installed
- [x] Custom events tracked
- [x] Structured data enhanced
- [x] Meta tags optimized
- [x] Internal linking improved
- [x] Documentation updated

**Files to Create/Modify:**
- `src/app/layout.tsx` (GA4 script)
- `src/lib/analytics.ts` (custom events)
- `src/lib/structured-data.ts` (enhanced schemas)
- `src/components/Breadcrumbs.tsx`
- `src/components/Footer.tsx` (category/city links)

---

## 📅 Timeline

### Day 1 (16 Octobre, Afternoon - Evening)

**Manus AI:**
- ✅ TASK-R4-05: Performance Optimization (4-6h)
  - Lighthouse audit
  - Image optimization
  - Code splitting
  - Caching strategy

**Claude AI:**
- ⏳ TASK-R4-01: Advanced Review System (start, 4h)
  - Review reply system
  - Review helpful votes

**VS Code Developer:**
- ⏳ TASK-R4-03: Company Page Enhancements (start, 4h)
  - Photo gallery lightbox
  - Business hours display

### Day 2 (17 Octobre, Morning - Afternoon)

**Manus AI:**
- ⏳ TASK-R4-06: SEO & Analytics Enhancement (4-6h)
  - Google Search Console setup
  - Google Analytics 4 setup
  - Enhanced structured data

**Claude AI:**
- ⏳ TASK-R4-01: Advanced Review System (finish, 2-4h)
  - Review reporting
  - Review verification badge
- ⏳ TASK-R4-02: Email Notification System (4-6h)
  - Email templates
  - Email service
  - Email preferences

**VS Code Developer:**
- ⏳ TASK-R4-03: Company Page Enhancements (finish, 2-4h)
  - Share buttons
  - Print-friendly view
  - Related companies
- ⏳ TASK-R4-04: Homepage & Directory Improvements (4-6h)
  - Homepage hero enhancements
  - Directory filters enhancement
  - Directory view options
  - Save favorites

### Day 2 (17 Octobre, Evening)

**All Team:**
- ⏳ Final testing
- ⏳ Bug fixes
- ⏳ Documentation updates
- ⏳ Production deployment
- ⏳ Launch! 🚀

---

## 📊 Round 4 Goals

### Performance Goals

- ✅ Lighthouse score: 90+ (all pages)
- ✅ Core Web Vitals: All green
- ✅ Page load time: < 2 seconds
- ✅ Time to Interactive: < 3 seconds

### SEO Goals

- ✅ All 21 domains verified in Google Search Console
- ✅ All sitemaps submitted
- ✅ Google Analytics 4 installed
- ✅ Custom events tracked
- ✅ Enhanced structured data

### Feature Goals

- ✅ Review reply system
- ✅ Review helpful votes
- ✅ Review reporting
- ✅ Email notification system
- ✅ Photo gallery lightbox
- ✅ Business hours display
- ✅ Share buttons
- ✅ Related companies
- ✅ Save favorites

### User Experience Goals

- ✅ Loading states everywhere
- ✅ Empty states everywhere
- ✅ Tooltips for help
- ✅ Mobile-friendly (all features)
- ✅ Accessible (WCAG 2.1 AA)

---

## 🎯 Success Criteria

### Round 4 Complete When:

- [x] All 6 tasks completed
- [x] Performance optimized (Lighthouse 90+)
- [x] SEO enhanced (GSC + GA4)
- [x] Advanced review system implemented
- [x] Email notifications working
- [x] Company pages enhanced
- [x] Homepage/directory improved
- [x] All features tested
- [x] Documentation updated
- [x] Production deployed

### Launch Checklist:

- [x] Environment variables set (RESEND_API_KEY, BLOB_READ_WRITE_TOKEN)
- [x] Google Maps API working
- [x] Email service working
- [x] Photo upload working
- [x] All 21 domains tested
- [x] Performance optimized
- [x] SEO setup complete
- [x] Analytics tracking
- [x] Legal pages (RGPD compliant)
- [x] Documentation complete

---

## 📝 Notes

### Coordination

- **Daily Standup:** 09:00 GMT+2 (async via reports)
- **Progress Updates:** Every 4 hours
- **Blockers:** Report immediately
- **Code Review:** Before merging to main
- **Testing:** Test locally before pushing

### Best Practices

- ✅ Write clean, documented code
- ✅ Follow existing code style
- ✅ Test all features thoroughly
- ✅ Update documentation
- ✅ Commit frequently with clear messages
- ✅ No breaking changes without discussion

### Resources

- **Documentation:** `/docs` folder
- **Task Cards:** `TASK_CARDS_SPRINT_3.md`
- **Verification Reports:** `ROUND_X_VERIFICATION_REPORT.md`
- **Completion Reports:** `TASK_XXX_COMPLETED.md`

---

## 🚀 Let's Launch!

**Round 4 Status:** 📋 **READY TO START**

**Team:** ✅ **ASSIGNED**

**Goal:** 🚀 **PRODUCTION LAUNCH**

---

**Prepared by:** Manus AI (Project Manager)  
**Date:** 16 Octobre 2025, 02:45 GMT+2  
**Phase:** Round 4  
**Status:** ✅ **READY**

