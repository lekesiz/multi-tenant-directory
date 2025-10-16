# 🚀 Production Deployment Checklist

Complete this checklist before deploying to production.

## ✅ Phase 1: Setup (2-4 hours)

### Database
- [ ] PostgreSQL database created (Neon/Supabase)
- [ ] DATABASE_URL configured in environment
- [ ] Prisma migrations executed: `npx prisma migrate deploy`
- [ ] Database seeded: `npm run db:seed`
- [ ] Test database connection
- [ ] Backup strategy configured

### Environment Variables
- [ ] Copy .env.local.example to .env.local
- [ ] All 32 environment variables configured
- [ ] NEXTAUTH_SECRET generated: `openssl rand -base64 32`
- [ ] Stripe keys configured (test mode first)
- [ ] Email service configured (Resend)
- [ ] AI provider configured (OpenAI or Anthropic)
- [ ] Cloudinary configured
- [ ] Google Maps API key configured
- [ ] Verify all keys are working

### Stripe Setup
- [ ] Products created in Stripe Dashboard
- [ ] Price IDs configured (Basic, Pro, Enterprise)
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to env vars
- [ ] Test payment flow in test mode
- [ ] Switch to live mode

## ✅ Phase 2: Testing (4-8 hours)

### Manual Testing
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Company listing works
- [ ] Review submission works
- [ ] Payment flow works end-to-end
- [ ] AI features work (with API keys)
- [ ] PWA installation works
- [ ] Mobile responsiveness verified

### Integration Tests
- [ ] Run: `npm run test`
- [ ] All tests passing
- [ ] Coverage > 50%

### TypeScript Check
- [ ] Run: `npm run type-check`
- [ ] Critical errors fixed (ignore test file errors)

### Build Test
- [ ] Run: `npm run build`
- [ ] Build succeeds without errors
- [ ] Bundle size acceptable (<500KB gzipped)

## ✅ Phase 3: Security (2-3 hours)

### Authentication & Authorization
- [ ] NEXTAUTH_SECRET is strong (32+ chars)
- [ ] Password requirements enforced
- [ ] Email verification required
- [ ] Ownership checks in all API routes
- [ ] Admin routes protected

### API Security
- [ ] Rate limiting configured
- [ ] CORS headers set correctly
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

### Data Protection
- [ ] Sensitive data not logged
- [ ] PII properly handled
- [ ] GDPR compliance checked
- [ ] Cookie banner working
- [ ] Privacy policy updated

## ✅ Phase 4: Performance (2-3 hours)

### Lighthouse Audit
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### Optimizations
- [ ] Images optimized (WebP format)
- [ ] Code splitting configured
- [ ] Lazy loading implemented
- [ ] Font optimization done
- [ ] Critical CSS inlined

### Caching
- [ ] Static assets cached (CDN)
- [ ] API responses cached where appropriate
- [ ] Redis configured (if using)
- [ ] Browser caching headers set

## ✅ Phase 5: Monitoring (1-2 hours)

### Error Tracking
- [ ] Sentry configured (optional)
- [ ] Error alerts set up
- [ ] Error logging tested

### Analytics
- [ ] Google Analytics configured
- [ ] Vercel Analytics enabled
- [ ] Custom events tracked
- [ ] Conversion tracking set up

### Uptime Monitoring
- [ ] Pingdom/Better Uptime configured
- [ ] Alert emails configured
- [ ] Status page created (optional)

### Logging
- [ ] Structured logging implemented
- [ ] Log retention policy set
- [ ] Log analysis tool configured (optional)

## ✅ Phase 6: Deployment (1-2 hours)

### Vercel Setup
- [ ] Project connected to GitHub
- [ ] Environment variables added in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate verified
- [ ] Edge functions configured (if using)

### DNS Configuration
- [ ] A/AAAA records configured
- [ ] WWW redirect configured
- [ ] DNS propagation verified
- [ ] Email DNS records configured (SPF, DKIM)

### Pre-Launch
- [ ] Staging deployment tested
- [ ] Smoke tests passed
- [ ] Team walkthrough completed
- [ ] Rollback plan documented

### Launch
- [ ] Deploy to production
- [ ] Monitor errors for 1 hour
- [ ] Test critical flows
- [ ] Verify emails sending
- [ ] Verify payments working

## ✅ Phase 7: Post-Launch (24 hours)

### Monitoring
- [ ] Check error logs every 4 hours
- [ ] Monitor performance metrics
- [ ] Watch for spike in errors
- [ ] Verify email delivery
- [ ] Check payment success rate

### Communication
- [ ] Announce launch
- [ ] Update social media
- [ ] Send email to early users
- [ ] Update documentation

### Iteration
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Plan next iteration
- [ ] Update roadmap

---

## 🚨 Emergency Contacts

**Database:** [Neon/Supabase Support]
**Stripe:** support@stripe.com
**Email:** Resend Support
**Hosting:** Vercel Support
**Domain:** Domain registrar support

---

## 🔄 Rollback Plan

If critical issues arise:

1. **Immediate:**
   - Revert to previous Vercel deployment
   - Check error logs
   - Notify team

2. **Within 5 minutes:**
   - Identify root cause
   - Fix or rollback database if needed
   - Test fix in staging

3. **Within 30 minutes:**
   - Deploy fix
   - Monitor for 1 hour
   - Document incident

---

## 📊 Success Metrics

Track these metrics post-launch:

- **Uptime:** > 99.9%
- **Response Time:** < 500ms (p95)
- **Error Rate:** < 0.1%
- **User Registration:** Track daily
- **Payment Success Rate:** > 95%
- **AI Usage:** Track daily quota usage

---

**Estimated Total Time:** 12-24 hours
**Recommended Timeline:** 2-3 days
**Minimum Team:** 1-2 developers
