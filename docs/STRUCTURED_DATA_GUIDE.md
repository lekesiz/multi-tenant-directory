# Structured Data Implementation Guide

**Date:** 15 Octobre 2025  
**Version:** 1.0  
**Status:** ✅ Complete

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Implemented Schemas](#implemented-schemas)
3. [Usage](#usage)
4. [Testing](#testing)
5. [SEO Benefits](#seo-benefits)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This project implements comprehensive Schema.org structured data (JSON-LD) for SEO optimization and rich results in Google Search.

### What is Structured Data?

Structured data is a standardized format for providing information about a page and classifying the page content. Google uses structured data to understand the content on your website and to display rich results in search.

### Why JSON-LD?

- **Recommended by Google**: JSON-LD is Google's preferred format
- **Easy to implement**: No need to modify HTML markup
- **Maintainable**: Separate from page content
- **Flexible**: Can include multiple schemas

---

## 📊 Implemented Schemas

### 1. Organization Schema

**Used on:** Homepage  
**Purpose:** Describe the directory platform as an organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Haguenau.PRO",
  "description": "Annuaire des professionnels de Haguenau",
  "url": "https://haguenau.pro",
  "logo": "https://haguenau.pro/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Haguenau",
    "addressCountry": "FR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://haguenau.pro/contact"
  }
}
```

**Benefits:**
- ✅ Brand recognition in search results
- ✅ Knowledge panel eligibility
- ✅ Sitelinks search box

---

### 2. LocalBusiness Schema

**Used on:** Company pages  
**Purpose:** Describe local businesses with detailed information

```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Organization"],
  "name": "NETZ Informatique",
  "description": "Services informatiques à Haguenau",
  "url": "https://haguenau.pro/companies/netz-informatique",
  "image": "https://example.com/logo.png",
  "telephone": "+33 3 88 93 00 00",
  "email": "contact@netz.fr",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1 a Rte de Schweighouse",
    "addressLocality": "Haguenau",
    "postalCode": "67500",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 48.8156,
    "longitude": 7.7889
  },
  "openingHours": "Mo-Fr 09:00-18:00",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": 5,
    "bestRating": 5,
    "worstRating": 1
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Jean Dupont"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": 5
      },
      "reviewBody": "Excellent service!",
      "datePublished": "2025-10-15"
    }
  ]
}
```

**Benefits:**
- ✅ Rich snippets with ratings
- ✅ Business hours display
- ✅ Map integration
- ✅ Contact information
- ✅ Review stars in search results

---

### 3. Review Schema

**Used on:** Company pages with reviews  
**Purpose:** Display review ratings in search results

```json
{
  "@type": "Review",
  "author": {
    "@type": "Person",
    "name": "Marie Martin"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 5,
    "bestRating": 5,
    "worstRating": 1
  },
  "reviewBody": "Service impeccable, je recommande vivement!",
  "datePublished": "2025-10-15",
  "publisher": {
    "@type": "Organization",
    "name": "Google"
  }
}
```

**Benefits:**
- ✅ Star ratings in search results
- ✅ Review count display
- ✅ Trust signals
- ✅ Higher CTR

---

### 4. ItemList Schema

**Used on:** Directory and category pages  
**Purpose:** List of businesses

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Annuaire des professionnels",
  "description": "Liste des professionnels disponibles",
  "numberOfItems": 334,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "LocalBusiness",
        "name": "NETZ Informatique",
        "url": "https://haguenau.pro/companies/netz-informatique"
      }
    }
  ]
}
```

**Benefits:**
- ✅ Carousel rich results
- ✅ Better category page indexing
- ✅ Improved navigation

---

### 5. BreadcrumbList Schema

**Used on:** All pages  
**Purpose:** Show navigation path

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://haguenau.pro"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Annuaire",
      "item": "https://haguenau.pro/annuaire"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "NETZ Informatique",
      "item": "https://haguenau.pro/companies/netz-informatique"
    }
  ]
}
```

**Benefits:**
- ✅ Breadcrumb display in search results
- ✅ Better site structure understanding
- ✅ Improved navigation UX

---

### 6. WebSite Schema

**Used on:** All pages  
**Purpose:** Enable sitelinks search box

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Haguenau.PRO",
  "url": "https://haguenau.pro",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://haguenau.pro/annuaire?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

**Benefits:**
- ✅ Sitelinks search box in Google
- ✅ Direct search from SERP
- ✅ Better user experience

---

### 7. FAQPage Schema

**Used on:** Company pages  
**Purpose:** Display FAQ rich results

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Comment contacter NETZ Informatique ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vous pouvez contacter NETZ Informatique par téléphone au +33 3 88 93 00 00"
      }
    }
  ]
}
```

**Benefits:**
- ✅ FAQ rich results
- ✅ More SERP real estate
- ✅ Answer common questions directly

---

## 🔧 Usage

### Basic Implementation

```tsx
import StructuredData from '@/components/StructuredData';

export default function Page() {
  return (
    <>
      <StructuredData
        domain="haguenau.pro"
        type="homepage"
        breadcrumbs={[
          { name: 'Accueil', url: 'https://haguenau.pro' }
        ]}
      />
      {/* Page content */}
    </>
  );
}
```

### Company Page

```tsx
<StructuredData
  domain={domain}
  type="company"
  company={companyData}
  reviews={reviews}
  breadcrumbs={[
    { name: 'Accueil', url: `https://${domain}` },
    { name: 'Annuaire', url: `https://${domain}/annuaire` },
    { name: company.name, url: `https://${domain}/companies/${company.slug}` },
  ]}
/>
```

### Directory Page

```tsx
<StructuredData
  domain={domain}
  type="directory"
  companies={companies}
  breadcrumbs={[
    { name: 'Accueil', url: `https://${domain}` },
    { name: 'Annuaire', url: `https://${domain}/annuaire` },
  ]}
/>
```

### Category Page

```tsx
<StructuredData
  domain={domain}
  type="category"
  categoryName="Informatique"
  companies={companies}
  breadcrumbs={[
    { name: 'Accueil', url: `https://${domain}` },
    { name: 'Catégories', url: `https://${domain}/categories` },
    { name: 'Informatique', url: `https://${domain}/categories/informatique` },
  ]}
/>
```

---

## 🧪 Testing

### 1. Google Rich Results Test

**URL:** https://search.google.com/test/rich-results

**Steps:**
1. Go to the Rich Results Test
2. Enter your page URL (e.g., `https://haguenau.pro`)
3. Click "Test URL"
4. Check for errors and warnings

**Expected Results:**
- ✅ All schemas valid
- ✅ No errors
- ✅ Rich results eligible

### 2. Schema Markup Validator

**URL:** https://validator.schema.org/

**Steps:**
1. Go to Schema.org Validator
2. Enter your page URL
3. Click "Run Test"
4. Review validation results

### 3. Manual Testing Script

```bash
# Run the test script
node scripts/test-structured-data.js
```

**Output:**
```
🧪 Testing Structured Data for all domains...

📊 Summary:
  ✅ Successful: 21/21
  ❌ Failed: 0/21

📋 Detailed Results:

✅ haguenau.pro
   Schemas: 3
   Types: Organization, WebSite, BreadcrumbList

✅ mutzig.pro
   Schemas: 3
   Types: Organization, WebSite, BreadcrumbList

...
```

### 4. Browser DevTools

```javascript
// In browser console
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
scripts.forEach((script, index) => {
  console.log(`Schema ${index + 1}:`, JSON.parse(script.textContent));
});
```

---

## 📈 SEO Benefits

### Before Implementation

- ❌ No rich results
- ❌ Plain blue links in SERP
- ❌ No ratings display
- ❌ No business hours
- ❌ Lower CTR

### After Implementation

- ✅ Rich snippets with ratings
- ✅ Business information display
- ✅ Breadcrumbs in SERP
- ✅ FAQ accordion
- ✅ Sitelinks search box
- ✅ Knowledge panel eligibility

### Expected Improvements

**Click-Through Rate (CTR):**
- ⬆️ +30% CTR for company pages
- ⬆️ +20% CTR for category pages
- ⬆️ +15% CTR for homepage

**Visibility:**
- ⬆️ +50% rich result appearances
- ⬆️ Better rankings for local searches
- ⬆️ More SERP real estate

**Trust Signals:**
- ⬆️ Star ratings visible
- ⬆️ Review count displayed
- ⬆️ Business information prominent

---

## 🔍 Troubleshooting

### Issue: No JSON-LD in page source

**Cause:** Component not rendering  
**Solution:**
1. Check if `<StructuredData>` component is imported
2. Verify props are passed correctly
3. Check browser console for errors
4. Ensure `'use client'` directive is present

### Issue: Invalid schema errors

**Cause:** Missing required fields  
**Solution:**
1. Check Google Rich Results Test
2. Review error messages
3. Ensure all required fields are populated
4. Validate data types (string, number, etc.)

### Issue: Schemas not appearing in Google

**Cause:** Indexing delay or validation errors  
**Solution:**
1. Wait 1-2 weeks for indexing
2. Submit sitemap to Google Search Console
3. Request indexing for important pages
4. Check for validation errors

### Issue: Multiple schemas conflicting

**Cause:** Duplicate schema definitions  
**Solution:**
1. Use `@graph` to combine schemas
2. Remove duplicate `@context` declarations
3. Ensure only one `<StructuredData>` component per page

---

## 📚 Resources

### Official Documentation

- [Schema.org](https://schema.org/)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [JSON-LD Specification](https://json-ld.org/)

### Testing Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Google Search Console](https://search.google.com/search-console)

### Schema Types

- [LocalBusiness](https://schema.org/LocalBusiness)
- [Organization](https://schema.org/Organization)
- [Review](https://schema.org/Review)
- [BreadcrumbList](https://schema.org/BreadcrumbList)
- [ItemList](https://schema.org/ItemList)
- [WebSite](https://schema.org/WebSite)
- [FAQPage](https://schema.org/FAQPage)

---

## 🎉 Summary

### Implementation Status

- [x] Organization schema
- [x] LocalBusiness schema
- [x] Review schema
- [x] BreadcrumbList schema
- [x] ItemList schema
- [x] WebSite schema
- [x] FAQPage schema
- [x] StructuredData component
- [x] Multi-tenant support
- [x] Testing script
- [x] Documentation

### Coverage

- ✅ **21 domains** supported
- ✅ **7 schema types** implemented
- ✅ **All page types** covered
- ✅ **Rich results** eligible

### Next Steps

1. ✅ Monitor Google Search Console for rich results
2. ✅ Track CTR improvements
3. ✅ Add more schema types as needed (Event, Product, etc.)
4. ✅ Keep schemas updated with new features

---

**Last Updated:** 15 Octobre 2025  
**Maintained by:** Manus AI  
**Version:** 1.0

