# 🔄 Google Reviews Sync Implementation

**Implementation Date:** 16 October 2025  
**Implemented by:** Claude AI  
**Feature:** Automatic Google Reviews synchronization with database

---

## 📋 Overview

This feature enables automatic synchronization of Google Reviews from Google Places API to the local database. It includes both manual and automated sync capabilities with a complete admin interface.

## 🏗️ Architecture

### 1. **Core Service**
- **File:** `/src/lib/google-places.ts`
- **Purpose:** Google Places API integration service
- **Key Features:**
  - Automatic Place ID detection
  - Review fetching and formatting
  - Duplicate prevention
  - Rate limiting (100ms between calls)

### 2. **API Endpoints**

#### Single Company Sync
- **Route:** `/api/admin/companies/[id]/sync-reviews`
- **Method:** POST
- **Auth:** Admin only
- **Purpose:** Sync reviews for a specific company

#### Batch Sync
- **Route:** `/api/admin/sync-all-reviews`
- **Methods:** GET, POST
- **Auth:** Admin only
- **Purpose:** 
  - POST: Sync all companies
  - GET: Check sync status and configuration

#### Cron Endpoint
- **Route:** `/api/cron/sync-google-reviews`
- **Method:** GET
- **Auth:** CRON_SECRET bearer token
- **Purpose:** Automated daily sync (2:00 AM UTC)

### 3. **Admin Interface**
- **Route:** `/admin/reviews/sync`
- **Features:**
  - Real-time sync status display
  - Individual company sync buttons
  - Batch sync functionality
  - Configuration status indicators
  - Progress feedback

### 4. **Cron Configuration**
- **File:** `vercel.json`
- **Schedule:** Daily at 2:00 AM UTC
- **Entry:**
```json
{
  "path": "/api/cron/sync-google-reviews",
  "schedule": "0 2 * * *"
}
```

## 🔧 Configuration

### Required Environment Variables

```bash
# Google Maps API Key (Server-side)
GOOGLE_MAPS_API_KEY="your-api-key"

# Cron Job Settings
GOOGLE_SYNC_CRON_ENABLED="true"  # Enable/disable cron
CRON_SECRET="your-secret-key"     # Secure cron endpoints
```

### Google Cloud Console Setup

1. Enable Google Places API (New)
2. Create API Key with restrictions:
   - Application restrictions: IP addresses (server IPs)
   - API restrictions: Places API only
3. Set quota limits as needed

## 📊 Database Integration

### Review Storage
- Reviews stored in `Review` model
- Fields mapped:
  - `authorName` - Google reviewer name
  - `authorPhoto` - Profile photo URL
  - `rating` - 1-5 star rating
  - `comment` - Review text
  - `source` - Set to "google"
  - `reviewDate` - Converted from Unix timestamp
  - `isApproved` - Auto-approved (true)

### Company Updates
- `rating` - Updated with Google's average
- `reviewCount` - Total review count
- `googlePlaceId` - Stored for future syncs

## 🚀 Usage

### Manual Sync (Admin Panel)

1. Navigate to `/admin/reviews/sync`
2. Click "Synchroniser" for individual companies
3. Or use "Synchroniser toutes les entreprises" for batch

### API Usage

```bash
# Single company sync
curl -X POST https://yourdomain.com/api/admin/companies/123/sync-reviews \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"

# Batch sync
curl -X POST https://yourdomain.com/api/admin/sync-all-reviews \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"
```

### Monitoring

Check sync status:
```bash
curl https://yourdomain.com/api/admin/sync-all-reviews \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"
```

## ⚡ Performance Considerations

1. **Rate Limiting:** 100ms delay between API calls
2. **Batch Processing:** Processes companies sequentially
3. **Error Handling:** Continues on individual failures
4. **Duplicate Prevention:** Checks by author + timestamp

## 🔒 Security

1. **Admin Authentication:** All endpoints require admin role
2. **Cron Authentication:** Bearer token validation
3. **API Key Protection:** Server-side only, never exposed to client

## 📈 Future Enhancements

1. **Webhook Support:** Real-time sync on new reviews
2. **Language Detection:** Multi-language review support
3. **Sentiment Analysis:** AI-powered review analysis
4. **Review Response:** Auto-generate responses
5. **Analytics Dashboard:** Review trends and insights

## 🐛 Troubleshooting

### Common Issues

1. **"Google Maps API key not configured"**
   - Add GOOGLE_MAPS_API_KEY to environment variables

2. **"Could not find place on Google Maps"**
   - Ensure company name and address are accurate
   - Manually search and add googlePlaceId

3. **No reviews synced**
   - Check if place has reviews on Google
   - Verify API key has Places API enabled

### Debug Mode

Enable logging by setting:
```bash
DEBUG=google-sync
```

---

**Note:** This feature requires an active Google Cloud account with billing enabled and appropriate API quotas.