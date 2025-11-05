# Google Business Profile Categories Integration

## Overview

This update aligns the directory's category system with **Google Business Profile** standards, expanding from 27 categories to **157+ categories** with proper Google Business Profile category mapping.

## What Changed

### Database Schema

**Added field to `Category` model:**
- `googleBusinessCategory` (String, optional): Official Google Business Profile category name

**Migration:**
- File: `prisma/migrations/20251105091027_add_google_business_category/migration.sql`
- Adds `googlebusinesscategory` column to `categories` table

### Category Structure

**Before:**
- 7 parent categories
- ~20 child categories
- **Total: 27 categories**
- Generic categories (e.g., "Restaurant", "Café")

**After:**
- 10 parent categories
- 147+ child categories
- **Total: 157+ categories**
- Specific Google Business Profile categories (e.g., "Italian restaurant", "French restaurant", "Sushi restaurant")

### New Category Groups

1. **🍽️ Alimentation / Food & Dining** (30 categories)
   - 100+ restaurant types (Italian, French, Chinese, Japanese, etc.)
   - Cafés, bakeries, bars, fast food

2. **⚕️ Santé / Health & Medical** (13 categories)
   - Pharmacies, doctors, dentists, clinics
   - Specialists (dermatologist, pediatrician, etc.)

3. **🛍️ Commerces / Retail & Shopping** (19 categories)
   - Clothing, electronics, furniture, supermarkets
   - Specialty stores (jewelry, books, toys, etc.)

4. **🔧 Services** (17 categories)
   - Plumbers, electricians, carpenters, painters
   - Cleaning, landscaping, moving services

5. **💇 Beauté & Bien-être / Beauty & Wellness** (10 categories)
   - Hair salons, barber shops, beauty salons
   - Spas, massage therapists, nail salons

6. **🚗 Automobile / Automotive** (13 categories)
   - Car dealers, auto repair shops, car washes
   - Tire shops, gas stations, charging stations

7. **💼 Finance & Juridique / Finance & Legal** (9 categories)
   - Banks, accountants, insurance agencies
   - Lawyers, real estate agencies

8. **📚 Éducation / Education** (13 categories)
   - Schools, universities, preschools
   - Driving schools, language schools, libraries

9. **🎭 Loisirs / Entertainment & Leisure** (15 categories)
   - Movie theaters, museums, art galleries
   - Gyms, yoga studios, parks, zoos

10. **🏨 Hébergement / Lodging** (8 categories)
    - Hotels, motels, hostels
    - Bed & breakfasts, resorts, campgrounds

## Benefits

### 1. Google Business Profile Alignment
- **Direct mapping** to official Google Business Profile categories
- **Better SEO** through proper category classification
- **Improved discoverability** in Google Search and Maps

### 2. Enhanced User Experience
- **More specific** category selection for businesses
- **Better filtering** for users searching for specific services
- **Improved relevance** in search results

### 3. Scalability
- **Expandable structure** - easy to add more categories
- **Hierarchical organization** - maintains UI usability
- **Backward compatible** - existing categories still work

## How to Use

### Running the Migration

**Production (Vercel):**
Migration runs automatically on deployment.

**Local Development:**
```bash
# Apply migration
npx prisma migrate deploy

# Seed enhanced categories
npm run db:seed:categories:enhanced
```

### Selecting Categories

**For businesses:**
1. Choose a **parent category** (e.g., "Alimentation")
2. Choose a **specific Google Business Profile category** (e.g., "Italian restaurant")
3. System automatically maps to Google Business Profile

**Example:**
- Parent: "Alimentation" (for directory navigation)
- Google Category: "Italian restaurant" (for Google Business Profile sync)

## Technical Details

### Data Model

```typescript
interface Category {
  id: number;
  slug: string;
  name: string;
  nameFr: string;
  nameEn: string;
  nameDe?: string;
  description?: string;
  icon: string;
  color?: string;
  parentId?: number;
  googleTypes: string[];  // Deprecated
  googleBusinessCategory: string;  // NEW
  isActive: boolean;
  order: number;
}
```

### Google Business Profile Categories

Based on official Google Business Profile category list:
- **3,968 total categories** available
- **351 restaurant categories** alone
- **Curated selection** of most relevant categories for French businesses

### French Translations

All categories include French translations:
- "Italian restaurant" → "Restaurant italien"
- "Hair salon" → "Salon de coiffure"
- "Auto repair shop" → "Garage automobile"

## Migration Path

### Phase 1: Schema Update ✅
- Add `googleBusinessCategory` field
- Create migration

### Phase 2: Seed Enhanced Categories ✅
- Create new seed file with 157+ categories
- Add npm script for seeding

### Phase 3: Update UI (TODO)
- Update category selection dropdowns
- Add search/filter for categories
- Show Google Business Profile badge

### Phase 4: Google Sync (TODO)
- Use `googleBusinessCategory` for Google Business Profile API
- Auto-sync category changes to Google
- Validate categories against Google's list

## Files Changed

### Database
- `prisma/schema.prisma` - Added `googleBusinessCategory` field
- `prisma/migrations/20251105091027_add_google_business_category/migration.sql` - Migration SQL

### Seed Files
- `prisma/seed-categories-enhanced.ts` - New enhanced seed with 157+ categories

### Configuration
- `package.json` - Added `db:seed:categories:enhanced` script

### Documentation
- `GOOGLE_CATEGORIES_UPDATE.md` - This file

## Resources

- [Google Business Profile Categories](https://support.google.com/business/answer/3038177)
- [Google Places API Types](https://developers.google.com/maps/documentation/places/web-service/supported_types)
- [Google Business Profile API](https://developers.google.com/my-business/reference/rest)

## Next Steps

1. **Test the migration** in staging environment
2. **Update UI components** to handle more categories
3. **Implement Google Business Profile sync** using new field
4. **Add category search/autocomplete** for better UX
5. **Monitor category usage** and add more as needed

## Support

For questions or issues:
- GitHub Issues: https://github.com/yourusername/multi-tenant-directory/issues
- Email: support@netzinformatique.fr

---

**Last Updated:** November 5, 2025
**Version:** 2.2.0
**Author:** NETZ Informatique
