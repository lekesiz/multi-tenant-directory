# Activity System Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migration
```bash
# Generate Prisma client with new Activity model
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 2: Add Environment Variables
Add to your `.env` file:
```env
# Required for AI features
GOOGLE_AI_API_KEY=your_api_key_here

# Required for activity links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Restart Your Development Server
```bash
npm run dev
```

### Step 4: Test the API

#### Create Your First Activity
```bash
curl -X POST http://localhost:3000/api/business/activities \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Welcome to Our Store!",
    "content": "We are excited to announce the opening of our new location...",
    "excerpt": "Grand opening announcement",
    "type": "announcement",
    "tags": ["announcement", "grand-opening"]
  }'
```

#### Generate Content with AI
```bash
curl -X POST http://localhost:3000/api/business/activities/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "companyId": 1,
    "type": "announcement",
    "topic": "Summer sale",
    "tone": "enthusiastic",
    "length": "medium"
  }'
```

#### View Public Feed
```bash
curl http://localhost:3000/api/companies/1/activities
```

---

## 📋 Common Operations

### List All Activities
```javascript
const response = await fetch('/api/business/activities?page=1&limit=20');
const data = await response.json();
console.log(data.activities);
```

### Publish an Activity
```javascript
const response = await fetch('/api/business/activities/ACTIVITY_ID/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ publishNow: true })
});
```

### Schedule for Later
```javascript
const response = await fetch('/api/business/activities/ACTIVITY_ID/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    publishNow: false,
    scheduledFor: '2024-12-25T10:00:00Z'
  })
});
```

### Generate Image
```javascript
const response = await fetch('/api/business/activities/ACTIVITY_ID/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    style: 'realistic',
    aspectRatio: '16:9'
  })
});
```

---

## 🎯 Activity Types

Choose the right type for your content:

- **announcement** - Company news, updates
- **event** - Upcoming events, workshops
- **offer** - Special deals, promotions
- **update** - General business updates
- **story** - Success stories, case studies
- **news** - Industry news, articles

---

## 📊 Rate Limits

| Tier | Activities | AI Gen | Images | Videos |
|------|-----------|---------|---------|---------|
| Free | 5/day | 10/day | 5/day | 2/day |
| Basic | 20/day | 50/day | 20/day | 10/day |
| Pro | 100/day | 200/day | 100/day | 50/day |
| Premium | ∞ | ∞ | ∞ | ∞ |

---

## 🔐 Authentication

All business routes require authentication:

```javascript
// Using next-auth session
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return { error: 'Unauthorized' };
}
```

---

## 🎨 Frontend Integration Example

### React Component
```typescript
'use client';

import { useState } from 'react';

export function ActivityCreator() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const createActivity = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/business/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          type: 'announcement',
          status: 'draft'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Activity created!');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />
      <button onClick={createActivity} disabled={loading}>
        {loading ? 'Creating...' : 'Create Activity'}
      </button>
    </div>
  );
}
```

### Activity List Component
```typescript
'use client';

import { useEffect, useState } from 'react';

export function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/business/activities')
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {activities.map(activity => (
        <div key={activity.id}>
          <h3>{activity.title}</h3>
          <p>{activity.excerpt}</p>
          <span>{activity.status}</span>
          <span>{activity.views} views</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### "Activity not found"
- Check activity ID is correct
- Verify you own the activity
- Ensure activity hasn't been deleted

### "Rate limit exceeded"
- Wait for reset time (shown in error)
- Upgrade subscription tier
- Check `aiUsageCount` in database

### "Validation failed"
- Check required fields: title, content, type
- Ensure title is 3-200 characters
- Verify content is at least 10 characters

### "Cannot edit published activity"
- Published activities are read-only
- Create new activity instead
- Or update while in draft status

---

## 📚 Full Documentation

For complete API documentation, see:
- `ACTIVITY_SYSTEM_README.md` - Complete guide
- `ACTIVITY_SYSTEM_SUMMARY.md` - Implementation summary
- `/src/types/activity.ts` - TypeScript types
- `/src/lib/validations/activity.ts` - Validation schemas

---

## 💡 Tips & Best Practices

### 1. Use Drafts
Create activities as drafts first, review, then publish.

### 2. Leverage AI
Use AI generation for initial content, then customize.

### 3. Optimize Images
- Use compressed images for faster loading
- Generate thumbnails for video content
- Use appropriate aspect ratios

### 4. Schedule Strategically
- Schedule posts for peak audience times
- Plan content calendar in advance
- Use scheduling for consistent posting

### 5. Track Analytics
- Monitor views and engagement
- Identify popular content types
- Adjust strategy based on metrics

### 6. SEO Optimization
- Always provide meta title and description
- Use relevant keywords
- Include descriptive image alt text

---

## 🔄 Workflow Examples

### Basic Publishing Workflow
```
1. Create activity (draft)
2. Generate AI content (optional)
3. Add images/videos
4. Preview and edit
5. Publish or schedule
6. Share to social media
```

### AI-Powered Workflow
```
1. Generate content with AI
2. Review and customize
3. Generate matching image
4. Create activity with AI content
5. Publish immediately
6. Track performance
```

### Scheduled Campaign
```
1. Create multiple activities
2. Schedule over time
3. Generate images for all
4. Set up social sharing
5. Monitor performance
6. Adjust based on analytics
```

---

## 🚦 Next Steps

1. ✅ Complete database setup
2. ✅ Test API endpoints
3. ⬜ Create frontend components
4. ⬜ Configure social media APIs
5. ⬜ Set up Veo 3 for videos
6. ⬜ Add analytics dashboard
7. ⬜ Test in production

---

## 📞 Need Help?

- Check error messages in console
- Review API documentation
- Verify authentication
- Check rate limits
- Ensure environment variables are set

---

**Quick Start Version:** 1.0.0
**Last Updated:** 2025-01-03
**For:** Haguenau.pro Multi-Tenant Directory
