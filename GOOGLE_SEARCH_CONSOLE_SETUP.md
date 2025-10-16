# 🔍 Google Search Console Setup Guide

## Overview
This guide will help you set up Google Search Console for haguenau.pro and other domain properties.

---

## Step 1: Access Google Search Console

1. Go to: https://search.google.com/search-console
2. Sign in with your Google account
3. Click **"Add property"**

---

## Step 2: Add Domain Property

### Option A: Domain Property (Recommended)
```
Domain: haguenau.pro
```

**Verification Method:** DNS TXT Record

1. Google will provide a TXT record like:
   ```
   google-site-verification=ABC123XYZ456
   ```

2. Add this to your domain DNS settings:
   - **Type:** TXT
   - **Host:** @ (or leave empty)
   - **Value:** google-site-verification=ABC123XYZ456
   - **TTL:** 3600

3. Click **"Verify"**

### Option B: URL Prefix (Easier but less complete)
```
URL Prefix: https://haguenau.pro
```

**Verification Methods:**
- HTML file upload
- HTML tag
- Google Analytics
- Google Tag Manager

---

## Step 3: Submit Sitemap

Once verified:

1. Go to **"Sitemaps"** in the left menu
2. Add sitemap URL:
   ```
   https://haguenau.pro/sitemap.xml
   ```
3. Click **"Submit"**

Expected result:
```
✅ Sitemap submitted successfully
Status: Success
URLs discovered: ~15-20 (will grow as you add companies)
```

---

## Step 4: Verify robots.txt

1. Go to **"Settings"** → **"Crawling"** → **"robots.txt Tester"**
2. Check that your robots.txt is accessible:
   ```
   https://haguenau.pro/robots.txt
   ```

Expected content:
```
# Sitemap
Sitemap: https://haguenau.pro/sitemap.xml

# Allow all
User-agent: *
Allow: /

# Disallow admin pages
Disallow: /admin/
Disallow: /business/
Disallow: /api/
```

---

## Step 5: Request Indexing

For important pages, request immediate indexing:

1. Go to **"URL Inspection"** in the left menu
2. Enter URL:
   ```
   https://haguenau.pro
   https://haguenau.pro/companies/boulangerie-schneider-haguenau
   ```
3. Click **"Request Indexing"**

---

## Step 6: Monitor Performance

### Check After 7 Days

1. **Coverage Report**
   - Valid pages: Should show all public pages
   - Errors: Should be 0
   - Excluded: Admin and API routes (expected)

2. **Performance Report**
   - Impressions: Website views in Google Search
   - Clicks: Actual visits from Google
   - CTR: Click-through rate
   - Position: Average ranking position

### Expected Metrics (After 1 Month)
```
Impressions: 500-2000/month
Clicks: 50-200/month
CTR: 5-15%
Average Position: 10-30 (will improve over time)
```

---

## Step 7: Enhance Search Appearance

### Enable Rich Results

1. **Schema.org Structured Data** (Already implemented ✅)
   - LocalBusiness schema for companies
   - BreadcrumbList for navigation
   - Review/Rating schema

2. **Test Rich Results**
   - Go to: https://search.google.com/test/rich-results
   - Enter URL: `https://haguenau.pro/companies/boulangerie-schneider-haguenau`
   - Should show:
     - ✅ LocalBusiness
     - ✅ AggregateRating
     - ✅ Organization

---

## Step 8: Setup for Other Domains

Repeat Steps 1-6 for each domain:
- bischwiller.pro
- bouxwiller.pro
- brumath.pro
- hoerdt.pro
- ingwiller.pro
- saverne.pro
- schiltigheim.pro
- schweighouse.pro
- souffelweyersheim.pro
- soufflenheim.pro
- wissembourg.pro

**Time per domain:** 5-10 minutes

---

## Troubleshooting

### Issue: Sitemap not found
**Solution:** Ensure sitemap.xml route is working:
```bash
curl https://haguenau.pro/sitemap.xml
# Should return XML with URLs
```

### Issue: Pages not indexed
**Reasons:**
- New website (wait 1-2 weeks)
- robots.txt blocking (check settings)
- Low quality content (add more text)
- No backlinks (share on social media)

**Solutions:**
1. Submit URLs manually via URL Inspection
2. Share URLs on social media
3. Add more content to pages
4. Get backlinks from local directories

### Issue: Duplicate content
**Solution:** Already implemented with canonical URLs ✅

---

## Monitoring Checklist

### Weekly
- [ ] Check Coverage report for errors
- [ ] Review new indexed pages
- [ ] Check for manual actions

### Monthly
- [ ] Analyze performance trends
- [ ] Review top queries
- [ ] Check mobile usability
- [ ] Update sitemaps if needed

---

## Advanced Features

### 1. Enable Email Notifications
Settings → Users and Permissions → Add email for alerts

### 2. International Targeting
Settings → International Targeting
- Country: France
- Language: French (fr)

### 3. Mobile Usability
Check "Mobile Usability" report
- All pages should pass mobile-friendly test ✅

---

## SEO Tips

### Improve Rankings

1. **Local SEO**
   - Add "Haguenau" to titles and descriptions ✅
   - Include local landmarks in content
   - Get reviews from real customers

2. **Content Quality**
   - Add blog posts about local businesses
   - Create "Best of Haguenau" guides
   - Interview business owners

3. **Technical SEO**
   - Maintain fast loading times (currently excellent ✅)
   - Keep mobile-friendly design ✅
   - Use structured data ✅

4. **Backlinks**
   - Submit to local directories
   - Partner with Haguenau tourism office
   - Get mentioned in local news

---

## Expected Timeline

| Timeframe | Expected Results |
|-----------|------------------|
| **Week 1** | Sitemap submitted, first pages indexed |
| **Week 2-4** | 50-80% of pages indexed |
| **Month 2** | First impressions and clicks |
| **Month 3** | Regular organic traffic (100-500 visits/month) |
| **Month 6** | Established presence (500-2000 visits/month) |
| **Year 1** | Strong local SEO (2000-5000 visits/month) |

---

## Resources

- **Google Search Console Help:** https://support.google.com/webmasters
- **Rich Results Test:** https://search.google.com/test/rich-results
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- **PageSpeed Insights:** https://pagespeed.web.dev

---

**Setup Date:** _____________
**Verified By:** _____________
**Notes:**

_____________________
_____________________
_____________________

---

**Status:** 📝 Ready for implementation
**Priority:** 🔴 High (do after production deployment)
