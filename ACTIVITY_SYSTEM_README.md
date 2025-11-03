# Activity/Blog System Documentation

## Overview

A comprehensive Activity/Blog system for business owners in the multi-tenant directory. This system allows businesses to create, manage, and share activities/blog posts with AI-powered content generation, image/video generation, and social media integration.

## Features

- **Activity Management**: Create, update, delete, and publish activities
- **AI Content Generation**: Generate content using Gemini AI
- **Image Generation**: Generate images using Gemini Nano
- **Video Generation**: Generate videos using Veo 3 (Google's video AI)
- **Social Media Sharing**: Share to Facebook, Twitter, LinkedIn, and Instagram
- **Scheduling**: Schedule activities for future publishing
- **Analytics**: Track views, likes, shares, and comments
- **SEO Optimization**: Built-in meta tags and SEO fields
- **Rate Limiting**: Tier-based rate limits for fair usage

## Database Schema

### Activity Model

```prisma
model Activity {
  id                String    @id @default(cuid())
  companyId         Int
  title             String
  slug              String
  content           String    @db.Text
  excerpt           String?
  type              String    // announcement|event|offer|update|story|news
  postType          String    @default("daily") // daily|weekly|monthly
  status            String    @default("draft") // draft|scheduled|published|archived
  imageUrl          String?
  videoUrl          String?
  tags              String[]
  views             Int       @default(0)
  likes             Int       @default(0)
  shares            Int       @default(0)
  publishedAt       DateTime?
  authorId          String
  company           Company   @relation(...)
  // ... more fields
}
```

## API Routes

### 1. Create Activity
**POST** `/api/business/activities`

Create a new activity/blog post.

**Request Body:**
```json
{
  "title": "Summer Sale Announcement",
  "content": "We're excited to announce our biggest summer sale...",
  "excerpt": "Big summer sale with up to 50% off!",
  "type": "announcement",
  "postType": "daily",
  "status": "draft",
  "tags": ["sale", "summer", "promotion"],
  "imageUrl": "https://example.com/image.jpg",
  "metaTitle": "Summer Sale - Company Name",
  "metaDescription": "Check out our amazing summer sale offers"
}
```

**Response:**
```json
{
  "activity": {
    "id": "clxxx...",
    "title": "Summer Sale Announcement",
    "slug": "summer-sale-announcement",
    "status": "draft",
    "...": "..."
  },
  "success": true,
  "message": "Activity created successfully"
}
```

**Rate Limits:**
- Free: 5 activities/day
- Basic: 20 activities/day
- Pro: 100 activities/day
- Premium: Unlimited

---

### 2. List Activities
**GET** `/api/business/activities`

List all activities for the authenticated business owner.

**Query Parameters:**
- `status`: Filter by status (draft|scheduled|published|archived)
- `type`: Filter by type (announcement|event|offer|update|story|news)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `sortBy`: Sort field (createdAt|publishedAt|views|likes|shares)
- `sortOrder`: Sort direction (asc|desc)
- `search`: Search in title/content
- `tags[]`: Filter by tags
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end

**Response:**
```json
{
  "activities": [
    { "id": "...", "title": "...", "..." : "..." }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "success": true
}
```

---

### 3. Get Single Activity
**GET** `/api/business/activities/[id]`

Get details of a specific activity.

**Response:**
```json
{
  "activity": {
    "id": "clxxx...",
    "title": "Summer Sale Announcement",
    "content": "...",
    "company": {
      "id": 1,
      "name": "My Business",
      "slug": "my-business"
    },
    "engagementRate": 5.2,
    "isScheduled": false,
    "canEdit": true
  },
  "success": true
}
```

---

### 4. Update Activity
**PUT** `/api/business/activities/[id]`

Update an existing activity (only draft/scheduled activities).

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "draft",
  "tags": ["updated", "tags"]
}
```

**Note:** Published activities cannot be edited.

---

### 5. Delete Activity
**DELETE** `/api/business/activities/[id]`

Delete an activity.

**Response:**
```json
{
  "success": true,
  "message": "Activity deleted successfully"
}
```

---

### 6. Publish Activity
**POST** `/api/business/activities/[id]/publish`

Publish a draft activity or schedule for later.

**Request Body:**
```json
{
  "publishNow": true
}
```

**OR**

```json
{
  "publishNow": false,
  "scheduledFor": "2024-12-25T10:00:00Z"
}
```

**Response:**
```json
{
  "activity": { "...": "..." },
  "success": true,
  "message": "Activity published successfully"
}
```

---

### 7. Generate Content with AI
**POST** `/api/business/activities/generate`

Generate activity content using AI.

**Request Body:**
```json
{
  "companyId": 1,
  "type": "announcement",
  "topic": "New product launch",
  "tone": "professional",
  "length": "medium"
}
```

**Response:**
```json
{
  "content": "Generated content in markdown...",
  "title": "Exciting New Product Launch",
  "excerpt": "We're thrilled to introduce...",
  "tags": ["product", "launch", "news"],
  "success": true,
  "model": "gemini"
}
```

**Rate Limits:**
- Free: 10 generations/day
- Basic: 50 generations/day
- Pro: 200 generations/day
- Premium: Unlimited

---

### 8. Generate Image
**POST** `/api/business/activities/[id]/generate-image`

Generate an image for the activity using Gemini.

**Request Body:**
```json
{
  "prompt": "Professional business announcement image",
  "style": "realistic",
  "aspectRatio": "16:9"
}
```

**Response:**
```json
{
  "imageUrl": "https://storage.example.com/generated-image.jpg",
  "success": true,
  "model": "gemini"
}
```

**Rate Limits:**
- Free: 5 images/day
- Basic: 20 images/day
- Pro: 100 images/day
- Premium: Unlimited

---

### 9. Generate Video
**POST** `/api/business/activities/[id]/generate-video`

Generate a video for the activity using Veo 3.

**Request Body:**
```json
{
  "prompt": "Professional promotional video",
  "duration": 15,
  "style": "promotional",
  "aspectRatio": "16:9"
}
```

**Response:**
```json
{
  "videoUrl": "https://storage.example.com/generated-video.mp4",
  "success": true,
  "model": "veo-3"
}
```

**Note:** Veo 3 API integration needs to be configured with Google Cloud credentials.

**Rate Limits:**
- Free: 2 videos/day
- Basic: 10 videos/day
- Pro: 50 videos/day
- Premium: Unlimited

---

### 10. Share to Social Media
**POST** `/api/business/activities/[id]/share`

Share activity to social media platforms.

**Request Body:**
```json
{
  "platforms": ["facebook", "twitter", "linkedin"],
  "customMessage": "Check out our latest announcement!"
}
```

**Response:**
```json
{
  "activityId": "clxxx...",
  "shares": [
    {
      "platform": "facebook",
      "success": true,
      "shareUrl": "https://facebook.com/post/123",
      "sharedAt": "2024-01-15T10:00:00Z"
    },
    {
      "platform": "twitter",
      "success": false,
      "error": "Twitter API not configured"
    }
  ],
  "success": true,
  "message": "Successfully shared to 1 platform(s)"
}
```

**Note:** Requires social media API credentials to be configured.

---

### 11. Public Activities Feed
**GET** `/api/companies/[id]/activities`

Get public feed of published activities for a company.

**Query Parameters:**
- `type`: Filter by activity type
- `tags[]`: Filter by tags
- `search`: Search term
- `page`: Page number
- `limit`: Results per page (max 50)

**Response:**
```json
{
  "activities": [
    {
      "id": "clxxx...",
      "title": "Summer Sale",
      "excerpt": "...",
      "imageUrl": "...",
      "publishedAt": "2024-01-15T10:00:00Z",
      "company": {
        "id": 1,
        "name": "My Business",
        "slug": "my-business",
        "logoUrl": "..."
      }
    }
  ],
  "pagination": { "...": "..." },
  "success": true
}
```

**Caching:** Results are cached for 5 minutes.

---

## Setup Instructions

### 1. Database Migration

Run the Prisma migration:

```bash
# Generate Prisma client
npx prisma generate

# Run migration
npx prisma db push

# OR create a new migration
npx prisma migrate dev --name add_activity_system
```

Alternatively, run the SQL directly:

```bash
psql -d your_database -f prisma/migrations/create_activity_system.sql
```

### 2. Environment Variables

Add to your `.env` file:

```env
# AI Services
GOOGLE_AI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id
VERTEX_AI_LOCATION=us-central1

# Social Media APIs (optional)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
INSTAGRAM_ACCESS_TOKEN=your_access_token

# App URL (for activity links)
NEXT_PUBLIC_APP_URL=https://haguenau.pro
```

### 3. Configure AI Services

#### Gemini AI Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `GOOGLE_AI_API_KEY=xxx`

#### Veo 3 Video Generation
1. Enable Vertex AI API in Google Cloud Console
2. Set up authentication with service account
3. Configure project ID and location in `.env`

### 4. Test the API

```bash
# Create a test activity
curl -X POST http://localhost:3000/api/business/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Activity",
    "content": "This is a test",
    "type": "announcement"
  }'

# List activities
curl http://localhost:3000/api/business/activities?page=1&limit=10

# Generate content
curl -X POST http://localhost:3000/api/business/activities/generate \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "type": "announcement",
    "topic": "New product",
    "tone": "professional"
  }'
```

---

## File Structure

```
src/
├── types/
│   └── activity.ts                          # TypeScript type definitions
├── lib/
│   ├── activity-helpers.ts                  # Helper utilities
│   └── validations/
│       └── activity.ts                      # Zod validation schemas
└── app/
    └── api/
        ├── business/
        │   └── activities/
        │       ├── route.ts                 # POST (create), GET (list)
        │       ├── [id]/
        │       │   ├── route.ts             # GET, PUT, DELETE
        │       │   ├── publish/
        │       │   │   └── route.ts         # POST (publish)
        │       │   ├── generate-image/
        │       │   │   └── route.ts         # POST (generate image)
        │       │   ├── generate-video/
        │       │   │   └── route.ts         # POST (generate video)
        │       │   └── share/
        │       │       └── route.ts         # POST (share to social)
        │       └── generate/
        │           └── route.ts             # POST (generate content)
        └── companies/
            └── [id]/
                └── activities/
                    └── route.ts             # GET (public feed)

prisma/
├── schema.prisma                            # Updated with Activity model
└── migrations/
    └── create_activity_system.sql           # Migration SQL
```

---

## Security & Authentication

All business owner endpoints (`/api/business/*`) require:
- Valid NextAuth session
- Business owner role
- Verified company ownership

Public endpoints (`/api/companies/[id]/activities`) are read-only and only show published, non-expired activities.

---

## Rate Limiting

Rate limits are enforced based on subscription tier:

| Tier    | Activities/Day | AI Generations/Day | Images/Day | Videos/Day |
|---------|----------------|-------------------|------------|------------|
| Free    | 5              | 10                | 5          | 2          |
| Basic   | 20             | 50                | 20         | 10         |
| Pro     | 100            | 200               | 100        | 50         |
| Premium | Unlimited      | Unlimited         | Unlimited  | Unlimited  |

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "issues": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden (access denied)
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error
- `503`: Service Unavailable (AI service down)

---

## Future Enhancements

- [ ] Activity comments system
- [ ] Activity likes/reactions
- [ ] Advanced analytics dashboard
- [ ] Activity templates
- [ ] Bulk import/export
- [ ] Multi-language support
- [ ] Activity scheduling calendar view
- [ ] Email notifications for new activities
- [ ] RSS feed generation
- [ ] Activity categories/folders
- [ ] Collaboration features (multiple authors)

---

## Support

For issues or questions:
1. Check the API documentation above
2. Review error messages and logs
3. Ensure all environment variables are set
4. Verify database migrations are applied
5. Check authentication and permissions

---

## License

This Activity System is part of the Haguenau.pro multi-tenant directory project.

---

**Created by:** Claude AI
**Date:** 2025-01-03
**Version:** 1.0.0
