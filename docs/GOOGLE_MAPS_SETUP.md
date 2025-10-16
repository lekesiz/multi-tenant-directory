# Google Maps API Setup Guide

## 🗺️ Google Maps & Places API Configuration

This guide explains how to set up Google Maps API for the multi-tenant directory platform, including server-side review syncing.

---

## 📋 Prerequisites

- Google Cloud Console account
- Active Google Cloud project with billing enabled
- Admin access to your Vercel project

---

## 🔧 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable billing (required for API usage)

---

## 🔑 Step 2: Enable Required APIs

Enable the following APIs in your project:

1. **Maps JavaScript API** (for frontend map display)
   - Go to: APIs & Services → Library
   - Search: "Maps JavaScript API"
   - Click "Enable"

2. **Places API** (for review syncing)
   - Go to: APIs & Services → Library
   - Search: "Places API"
   - Click "Enable"

3. **Geocoding API** (optional, for address validation)
   - Go to: APIs & Services → Library
   - Search: "Geocoding API"
   - Click "Enable"

---

## 🔐 Step 3: Create API Keys

You need **TWO** separate API keys:

### 3.1 Frontend API Key (with Referer Restrictions)

**Purpose:** Used in browser for map display (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

**Steps:**
1. Go to: APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Click "Edit API Key" (restriction settings)
4. **Application restrictions:**
   - Select "HTTP referrers (websites)"
   - Add your domains:
     ```
     https://haguenau.pro/*
     https://bas-rhin.pro/*
     https://*.vercel.app/*
     http://localhost:3000/*
     ```
5. **API restrictions:**
   - Select "Restrict key"
   - Select: Maps JavaScript API, Geocoding API
6. Save

### 3.2 Server-Side API Key (No Restrictions)

**Purpose:** Used for backend review syncing (GOOGLE_MAPS_API_KEY)

**Steps:**
1. Go to: APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Click "Edit API Key"
4. **Application restrictions:**
   - Select "None" OR "IP addresses" (add your server IPs)
5. **API restrictions:**
   - Select "Restrict key"
   - Select: **Places API** only
6. Save

> ⚠️ **Security Note:** Keep this key secret! Never expose it in frontend code.

---

## 🔌 Step 4: Add API Keys to Environment Variables

### 4.1 Local Development (.env)

```bash
# Frontend - Public key (with referer restrictions)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza...your_frontend_key"

# Backend - Server-side key (no restrictions)
GOOGLE_MAPS_API_KEY="AIza...your_server_key"
```

### 4.2 Vercel Production

1. Go to your Vercel project dashboard
2. Navigate to: Settings → Environment Variables
3. Add both variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your frontend API key | Production, Preview, Development |
| `GOOGLE_MAPS_API_KEY` | Your server-side API key | Production, Preview, Development |

4. Click "Save"
5. Redeploy your application

---

## 🧪 Step 5: Test the Setup

### Test Frontend (Map Display)
1. Visit any company page: `https://haguenau.pro/companies/[slug]`
2. Check if Google Map loads correctly
3. Open browser console for any API errors

### Test Backend (Review Sync)
1. Go to Admin Panel: `https://haguenau.pro/admin/companies`
2. Find a company with Google Place ID
3. Click "Sync" button next to the company
4. Check if reviews are fetched successfully

---

## 📊 Monitoring API Usage

### Check Quota and Billing
1. Go to: APIs & Services → Dashboard
2. Monitor your API usage
3. Set up billing alerts (recommended)

### Free Tier Limits (as of 2024)
- **$200/month free credit** (covers ~28,500 API calls)
- Places API: $17 per 1,000 requests
- Maps JavaScript API: $7 per 1,000 map loads

**Estimated costs for 1,000 companies:**
- Initial sync: ~1,000 Places API calls = $17
- Monthly updates: ~1,000 calls = $17
- Map views: ~10,000 loads = $70

**Total: ~$104/month (still within $200 free credit)**

---

## 🔄 Step 6: Set Up Automated Review Sync (Optional)

### Option A: Cron Job (Vercel Cron)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-google-reviews",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Option B: Manual Sync

1. Admin Panel → Companies
2. Click "Sync Tous" button (top right)
3. All companies with Google Place ID will be synced

---

## 🐛 Troubleshooting

### Error: "API keys with referer restrictions cannot be used with this API"
**Solution:** You're using the frontend key for backend calls. Use the server-side key (GOOGLE_MAPS_API_KEY) instead.

### Error: "REQUEST_DENIED"
**Solution:**
- Check if Places API is enabled
- Verify API key restrictions
- Check billing is enabled

### Error: "OVER_QUERY_LIMIT"
**Solution:**
- You've exceeded your quota
- Check usage in Google Cloud Console
- Enable billing or reduce API calls

### Error: "INVALID_REQUEST"
**Solution:**
- Check if Google Place ID is correct
- Verify the place exists in Google Maps

---

## 📚 Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Reference](https://developers.google.com/maps/documentation/places/web-service)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)

---

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] Billing enabled
- [ ] Maps JavaScript API enabled
- [ ] Places API enabled
- [ ] Frontend API key created (with referer restrictions)
- [ ] Server-side API key created (no restrictions)
- [ ] Both keys added to .env
- [ ] Both keys added to Vercel environment variables
- [ ] Application redeployed
- [ ] Frontend map tested
- [ ] Backend review sync tested
- [ ] Billing alerts set up

---

**Last updated:** 2025-01-16
**Version:** 1.0.0
