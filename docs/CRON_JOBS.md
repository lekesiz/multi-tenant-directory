# Cron Jobs Documentation

This document describes all automated cron jobs in the application.

## Overview

The application uses **Vercel Cron** for scheduled tasks. Cron jobs are configured in `vercel.json`.

## Active Cron Jobs

### 1. Google Reviews Sync
**Endpoint:** `/api/cron/sync-google-reviews`  
**Schedule:** `0 2 * * *` (Daily at 2:00 AM UTC)  
**Purpose:** Synchronize Google reviews for all companies

**What it does:**
- Fetches latest reviews from Google Places API
- Updates existing reviews
- Adds new reviews
- Updates company ratings

**Environment Variables:**
- `GOOGLE_PLACES_API_KEY` - Google Places API key
- `CRON_SECRET` - Secret token for authentication

---

### 2. Newsletter Weekly Digest
**Endpoint:** `/api/cron/newsletter-digest`  
**Schedule:** `0 9 * * 1` (Every Monday at 9:00 AM UTC)  
**Purpose:** Send weekly newsletter digest to active subscribers

**What it does:**
- Processes all active domains
- Finds active subscribers with `weeklyDigest: true`
- Aggregates new companies (last 7 days)
- Aggregates top-rated companies (rating >= 4.5)
- Sends personalized digest emails
- Logs all email deliveries
- Handles errors gracefully

**Email Content:**
- New companies with details
- Top-rated companies
- Company logos, ratings, reviews
- Personalized greeting
- Unsubscribe/preferences links

**Environment Variables:**
- `CRON_SECRET` - Secret token for authentication
- `RESEND_API_KEY` - Email service API key
- `NEXTAUTH_URL` - Base URL for links

**Response Format:**
```json
{
  "success": true,
  "weekNumber": 43,
  "year": 2025,
  "totalDomains": 21,
  "totalEmailsSent": 1250,
  "totalErrors": 5,
  "results": [
    {
      "domain": "haguenau.pro",
      "subscribers": 150,
      "sent": 148,
      "errors": 2,
      "newCompanies": 5,
      "topRated": 5
    }
  ]
}
```

**Error Handling:**
- Individual email failures don't stop the batch
- All errors are logged to database
- Failed emails are marked in `emailLog` table
- Detailed error messages in response

**Performance:**
- Batch processing per domain
- 100ms delay between emails (rate limiting)
- Optimized database queries
- Efficient company aggregation

---

## Security

All cron endpoints are protected by a secret token.

### Authentication

Cron jobs require a `Bearer` token in the `Authorization` header:

```bash
Authorization: Bearer YOUR_CRON_SECRET
```

### Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```env
CRON_SECRET=your-secure-random-secret-here
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

---

## Manual Trigger

### For Development/Testing

You can manually trigger cron jobs using curl or Postman:

#### Newsletter Digest
```bash
curl -X POST https://haguenau.pro/api/cron/newsletter-digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Google Reviews Sync
```bash
curl -X GET https://haguenau.pro/api/cron/sync-google-reviews \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### From Vercel Dashboard

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Cron Jobs" tab
4. Click "Run Now" on the desired job

---

## Monitoring

### Logs

View cron job execution logs:

1. Vercel Dashboard → Logs
2. Filter by function: `/api/cron/*`
3. Check execution time, errors, response

### Email Logs

All sent emails are logged in the database:

```sql
SELECT * FROM "EmailLog" 
WHERE type = 'digest' 
ORDER BY "createdAt" DESC 
LIMIT 100;
```

### Metrics

Track cron job performance:

- **Execution time:** Check Vercel logs
- **Success rate:** Count sent vs failed emails
- **Open rate:** Track email opens (if tracking enabled)
- **Unsubscribe rate:** Monitor unsubscribes after digest

---

## Troubleshooting

### Cron Job Not Running

1. **Check Vercel Cron Configuration**
   - Verify `vercel.json` is correct
   - Ensure cron is enabled in Vercel project settings

2. **Check Authentication**
   - Verify `CRON_SECRET` is set in environment variables
   - Check authorization header format

3. **Check Logs**
   - Vercel Dashboard → Logs
   - Look for errors, timeouts

### Emails Not Sending

1. **Check Email Service**
   - Verify `RESEND_API_KEY` is valid
   - Check Resend dashboard for errors

2. **Check Subscribers**
   - Verify subscribers exist with `weeklyDigest: true`
   - Check subscriber status is `active`

3. **Check Content**
   - Ensure there are new companies or top-rated companies
   - Check company visibility on domain

4. **Check Email Logs**
   ```sql
   SELECT * FROM "EmailLog" 
   WHERE status = 'failed' 
   ORDER BY "createdAt" DESC;
   ```

### High Error Rate

1. **Rate Limiting**
   - Increase delay between emails (currently 100ms)
   - Implement exponential backoff

2. **Email Service Limits**
   - Check Resend monthly quota
   - Upgrade plan if needed

3. **Invalid Email Addresses**
   - Clean up bounced emails
   - Update subscriber status

---

## Best Practices

### Cron Schedule

- **Google Reviews:** Daily at low-traffic hours (2 AM)
- **Newsletter:** Weekly on Monday morning (9 AM)
- **Avoid peak hours:** Don't schedule during high traffic

### Error Handling

- **Graceful degradation:** Individual failures don't stop batch
- **Comprehensive logging:** Log all errors to database
- **Retry logic:** Implement for transient failures
- **Alerting:** Monitor error rate, alert if > 5%

### Performance

- **Batch processing:** Process in chunks
- **Rate limiting:** Delay between API calls
- **Optimize queries:** Use indexes, select only needed fields
- **Timeout handling:** Set reasonable timeouts

### Monitoring

- **Daily checks:** Review logs daily
- **Weekly metrics:** Track open rate, unsubscribe rate
- **Monthly review:** Analyze trends, optimize

---

## Future Enhancements

### Planned Features

1. **Retry Logic**
   - Automatic retry for failed emails
   - Exponential backoff
   - Max retry limit

2. **Segmentation**
   - Send digest based on user preferences
   - Category-specific digests
   - Location-based content

3. **A/B Testing**
   - Test subject lines
   - Test email content
   - Test send times

4. **Advanced Analytics**
   - Open rate tracking
   - Click tracking
   - Conversion tracking

5. **Smart Scheduling**
   - Send at optimal time per user
   - Timezone-aware scheduling
   - Frequency capping

---

## Configuration Reference

### Cron Schedule Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sunday=0)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Examples

```bash
0 9 * * 1      # Every Monday at 9:00 AM
0 2 * * *      # Every day at 2:00 AM
0 */6 * * *    # Every 6 hours
0 0 1 * *      # First day of every month at midnight
0 9 * * 1-5    # Weekdays at 9:00 AM
```

---

## Support

For issues or questions:
- Check logs in Vercel Dashboard
- Review email logs in database
- Contact development team

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0

