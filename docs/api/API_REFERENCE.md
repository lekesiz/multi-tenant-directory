# 🔌 API Reference - Directory Platform

**Version:** 1.0.0
**Base URL:** `https://your-domain.com/api`
**Last Updated:** 16 Octobre 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Pagination](#pagination)
6. [Companies API](#companies-api)
7. [Reviews API](#reviews-api)
8. [Search API](#search-api)
9. [Admin API](#admin-api)
10. [Status Codes](#status-codes)

---

## Overview

The Directory Platform API provides RESTful endpoints for managing businesses, reviews, and search functionality. All responses are in JSON format.

### Base URLs

```
Production:  https://your-domain.com/api
Staging:     https://staging.your-domain.com/api
Development: http://localhost:3000/api
```

### API Principles

- **RESTful Design** - Standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Format** - All requests and responses use JSON
- **HTTPS Only** - Production requires HTTPS
- **Versioning** - API version in URL path (future: `/api/v1/`)
- **Idempotency** - Safe methods are idempotent
- **Authentication** - JWT tokens or API keys

---

## Authentication

### Overview

The API supports two authentication methods:

1. **JWT Tokens** - For user/business owner/admin authentication
2. **API Keys** - For server-to-server integration

### JWT Authentication

**How to authenticate:**

```bash
# 1. Login to get token
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "BUSINESS_OWNER"
    }
  }
}

# 2. Use token in subsequent requests
curl -X GET https://your-domain.com/api/companies/my-company \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Token Expiration:**
- Access tokens expire after 24 hours
- Refresh tokens expire after 30 days
- Refresh endpoint: `POST /api/auth/refresh`

### API Key Authentication

**For server-to-server integration:**

```bash
curl -X GET https://your-domain.com/api/companies \
  -H "X-API-Key: your-api-key-here"
```

**Getting an API Key:**
1. Log in to admin dashboard
2. Navigate to Settings → API Keys
3. Click "Generate New API Key"
4. Copy and securely store the key

**Security:**
- ⚠️ Never expose API keys in client-side code
- ✅ Store keys in environment variables
- ✅ Rotate keys regularly (recommended: every 90 days)
- ✅ Use different keys for staging and production

---

## Rate Limiting

### Limits

| User Type | Requests/Hour | Requests/Day |
|-----------|---------------|--------------|
| Anonymous | 100 | 1,000 |
| Authenticated | 1,000 | 10,000 |
| Business Owner | 2,000 | 20,000 |
| Admin | 5,000 | 50,000 |
| API Key | 10,000 | 100,000 |

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699564800
```

### Exceeding Rate Limits

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again in 3600 seconds.",
  "retryAfter": 3600
}
```

**Status Code:** `429 Too Many Requests`

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific error details"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_ERROR` | Rate limit exceeded |
| `SERVER_ERROR` | Internal server error |

### Validation Errors

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "rating": "Rating must be between 1 and 5"
  }
}
```

---

## Pagination

### Request Parameters

```bash
GET /api/companies?page=1&limit=20
```

**Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Companies API

### List Companies

Get a list of companies with optional filtering.

**Endpoint:** `GET /api/companies`

**Authentication:** Optional (required for private listings)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20) |
| `category` | string | No | Filter by category |
| `city` | string | No | Filter by city |
| `verified` | boolean | No | Show only verified businesses |
| `search` | string | No | Search in name/description |
| `sort` | string | No | Sort by (rating, name, date) |
| `order` | string | No | asc or desc (default: desc) |

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/companies?category=Restaurant&city=Haguenau&verified=true&limit=10"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "Restaurant Au Cerf",
      "slug": "restaurant-au-cerf-haguenau",
      "categories": ["Restaurant"],
      "address": "16 Place de la République",
      "city": "Haguenau",
      "postalCode": "67500",
      "phone": "03 88 93 07 10",
      "website": "https://www.au-cerf.fr/",
      "latitude": 48.817433,
      "longitude": 7.790052,
      "rating": 4.8,
      "reviewCount": 24,
      "verified": true,
      "description": "Restaurant gastronomique...",
      "photos": ["url1.jpg", "url2.jpg"],
      "hours": {
        "monday": { "open": false },
        "tuesday": { "open": true, "openTime": "12:00", "closeTime": "14:00" }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Get Company by Slug

Get detailed information about a specific company.

**Endpoint:** `GET /api/companies/[slug]`

**Authentication:** Optional

**Path Parameters:**
- `slug` - Company slug (e.g., "restaurant-au-cerf-haguenau")

**Query Parameters:**
- `includeReviews` - Include reviews in response (default: false)

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/companies/restaurant-au-cerf-haguenau?includeReviews=true"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "name": "Restaurant Au Cerf",
    "slug": "restaurant-au-cerf-haguenau",
    "categories": ["Restaurant"],
    "address": "16 Place de la République",
    "city": "Haguenau",
    "postalCode": "67500",
    "phone": "03 88 93 07 10",
    "email": "contact@au-cerf.fr",
    "website": "https://www.au-cerf.fr/",
    "latitude": 48.817433,
    "longitude": 7.790052,
    "rating": 4.8,
    "reviewCount": 24,
    "verified": true,
    "description": "Restaurant gastronomique proposant une cuisine française raffinée...",
    "descriptionShort": "Restaurant gastronomique proposant une cuisine française raffinée.",
    "keywords": ["restaurant", "gastronomique", "français", "haguenau"],
    "photos": [
      "https://example.com/restaurant-1.jpg",
      "https://example.com/restaurant-2.jpg"
    ],
    "hours": {
      "monday": { "open": false },
      "tuesday": { "open": true, "openTime": "12:00", "closeTime": "14:00" },
      "wednesday": { "open": true, "openTime": "12:00", "closeTime": "14:00" },
      "thursday": { "open": true, "openTime": "12:00", "closeTime": "14:00" },
      "friday": { "open": true, "openTime": "12:00", "closeTime": "14:00" },
      "saturday": { "open": true, "openTime": "12:00", "closeTime": "14:00" },
      "sunday": { "open": false }
    },
    "reviews": [
      {
        "id": 201,
        "authorName": "Marie Dupont",
        "rating": 5,
        "comment": "Excellent!",
        "createdAt": "2025-10-01T10:00:00Z",
        "photos": []
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-10-15T12:00:00Z"
  }
}
```

---

### Create Company (Admin)

Create a new company listing.

**Endpoint:** `POST /api/companies`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "name": "New Business",
  "slug": "new-business-haguenau",
  "categories": ["Services"],
  "address": "1 Rue Example",
  "city": "Haguenau",
  "postalCode": "67500",
  "phone": "03 88 00 00 00",
  "email": "contact@newbusiness.com",
  "website": "https://newbusiness.com",
  "latitude": 48.816,
  "longitude": 7.789,
  "description": "Description of the business...",
  "hours": {
    "monday": { "open": true, "openTime": "09:00", "closeTime": "18:00" }
  }
}
```

**Example Request:**

```bash
curl -X POST https://your-domain.com/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Business",
    "slug": "new-business-haguenau",
    "categories": ["Services"],
    "address": "1 Rue Example",
    "city": "Haguenau",
    "postalCode": "67500",
    "phone": "03 88 00 00 00"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": 150,
    "name": "New Business",
    "slug": "new-business-haguenau",
    "verified": false,
    "createdAt": "2025-10-16T14:30:00Z"
  }
}
```

**Status Code:** `201 Created`

---

### Update Company

Update company information.

**Endpoint:** `PUT /api/companies/[id]`

**Authentication:** Required (Admin or Business Owner)

**Path Parameters:**
- `id` - Company ID

**Request Body:** (Same as Create, all fields optional)

```json
{
  "phone": "03 88 11 22 33",
  "description": "Updated description...",
  "hours": {
    "monday": { "open": false }
  }
}
```

**Example Request:**

```bash
curl -X PUT https://your-domain.com/api/companies/150 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "03 88 11 22 33"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": 150,
    "name": "New Business",
    "phone": "03 88 11 22 33",
    "updatedAt": "2025-10-16T15:00:00Z"
  }
}
```

---

### Delete Company (Admin)

Delete a company listing.

**Endpoint:** `DELETE /api/companies/[id]`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `id` - Company ID

**Example Request:**

```bash
curl -X DELETE https://your-domain.com/api/companies/150 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Status Code:** `200 OK`

---

## Reviews API

### List Reviews

Get reviews for a company or all reviews.

**Endpoint:** `GET /api/reviews`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyId` | integer | No | Filter by company ID |
| `approved` | boolean | No | Show only approved reviews |
| `page` | integer | No | Page number |
| `limit` | integer | No | Items per page |
| `sort` | string | No | Sort by (date, rating) |

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/reviews?companyId=101&approved=true&limit=10"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 201,
      "companyId": 101,
      "authorName": "Marie Dupont",
      "authorEmail": "marie@example.com",
      "rating": 5,
      "comment": "Excellent service!",
      "photos": [],
      "isApproved": true,
      "businessReply": null,
      "businessReplyAt": null,
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3
  }
}
```

---

### Submit Review

Submit a new review for a company.

**Endpoint:** `POST /api/reviews/submit`

**Authentication:** Optional (email verification required)

**Request Body:**

```json
{
  "companyId": 101,
  "authorName": "Jean Martin",
  "authorEmail": "jean@example.com",
  "rating": 5,
  "comment": "Great experience! Highly recommended.",
  "photos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

**Validation Rules:**
- `companyId` - Required, must exist
- `authorName` - Required, 2-100 characters
- `authorEmail` - Required, valid email format
- `rating` - Required, integer 1-5
- `comment` - Required, 10-1000 characters
- `photos` - Optional, max 5 URLs

**Example Request:**

```bash
curl -X POST https://your-domain.com/api/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 101,
    "authorName": "Jean Martin",
    "authorEmail": "jean@example.com",
    "rating": 5,
    "comment": "Great experience! Highly recommended."
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "review": {
      "id": 250,
      "companyId": 101,
      "authorName": "Jean Martin",
      "rating": 5,
      "comment": "Great experience! Highly recommended.",
      "isApproved": false,
      "createdAt": "2025-10-16T14:30:00Z"
    },
    "message": "Review submitted successfully. It will be published after moderation."
  }
}
```

**Status Code:** `201 Created`

---

### Reply to Review (Business Owner)

Post a reply to a customer review.

**Endpoint:** `PUT /api/reviews/[reviewId]/reply`

**Authentication:** Required (Business Owner)

**Path Parameters:**
- `reviewId` - Review ID

**Request Body:**

```json
{
  "reply": "Thank you for your feedback! We're glad you enjoyed your visit."
}
```

**Validation Rules:**
- `reply` - Required, 10-500 characters

**Example Request:**

```bash
curl -X PUT https://your-domain.com/api/reviews/250/reply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reply": "Thank you for your feedback!"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": 250,
    "businessReply": "Thank you for your feedback!",
    "businessReplyAt": "2025-10-16T15:00:00Z"
  }
}
```

---

### Approve Review (Admin)

Approve a pending review.

**Endpoint:** `PUT /api/admin/reviews/[reviewId]/approve`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `reviewId` - Review ID

**Example Request:**

```bash
curl -X PUT https://your-domain.com/api/admin/reviews/250/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": 250,
    "isApproved": true,
    "approvedAt": "2025-10-16T15:30:00Z"
  }
}
```

---

### Delete Review (Admin)

Delete an inappropriate review.

**Endpoint:** `DELETE /api/admin/reviews/[reviewId]`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `reviewId` - Review ID

**Example Request:**

```bash
curl -X DELETE https://your-domain.com/api/admin/reviews/250 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Search API

### Search Companies

Advanced search with multiple filters.

**Endpoint:** `POST /api/search`

**Authentication:** Optional

**Request Body:**

```json
{
  "query": "restaurant",
  "filters": {
    "category": "Restaurant",
    "city": "Haguenau",
    "verified": true,
    "minRating": 4.0,
    "openNow": true
  },
  "location": {
    "latitude": 48.816,
    "longitude": 7.789,
    "radius": 5
  },
  "sort": "rating",
  "order": "desc",
  "page": 1,
  "limit": 20
}
```

**Example Request:**

```bash
curl -X POST https://your-domain.com/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "restaurant",
    "filters": {
      "city": "Haguenau",
      "minRating": 4.0
    },
    "limit": 10
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 101,
        "name": "Restaurant Au Cerf",
        "slug": "restaurant-au-cerf-haguenau",
        "rating": 4.8,
        "distance": 0.5,
        "relevance": 0.95
      }
    ],
    "filters": {
      "applied": {
        "city": "Haguenau",
        "minRating": 4.0
      },
      "available": {
        "categories": ["Restaurant", "Boulangerie", "Café"],
        "cities": ["Haguenau", "Strasbourg"],
        "ratingRanges": ["4+", "3+", "All"]
      }
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

---

### Google Maps Search

Search using Google Places API integration.

**Endpoint:** `GET /api/google-maps/search`

**Authentication:** Optional

**Query Parameters:**
- `query` - Search query
- `location` - Lat,Lng coordinates
- `radius` - Search radius in meters

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/google-maps/search?query=restaurant&location=48.816,7.789&radius=5000"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "place_id": "ChIJ...",
        "name": "Restaurant Name",
        "formatted_address": "Address",
        "geometry": {
          "location": {
            "lat": 48.816,
            "lng": 7.789
          }
        },
        "rating": 4.5,
        "user_ratings_total": 120
      }
    ]
  }
}
```

---

## Admin API

### Get Companies (Admin)

Get all companies including unverified.

**Endpoint:** `GET /api/admin/companies`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `verified` - Filter by verification status
- `pending` - Show pending verification
- `page` - Page number
- `limit` - Items per page

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/admin/companies?pending=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 150,
      "name": "Pending Business",
      "verified": false,
      "verificationStatus": "pending",
      "submittedAt": "2025-10-15T10:00:00Z",
      "documents": [
        {
          "type": "business_registration",
          "url": "https://...",
          "status": "pending"
        }
      ]
    }
  ]
}
```

---

### Get Analytics (Admin)

Get platform-wide analytics.

**Endpoint:** `GET /api/admin/analytics`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `metrics` - Comma-separated metrics to include

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/admin/analytics?startDate=2025-10-01&endDate=2025-10-16" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCompanies": 150,
      "verifiedCompanies": 120,
      "totalReviews": 1250,
      "averageRating": 4.3,
      "totalViews": 50000,
      "newCompanies": 10,
      "newReviews": 85
    },
    "trends": {
      "views": [
        { "date": "2025-10-01", "count": 3200 },
        { "date": "2025-10-02", "count": 3500 }
      ],
      "reviews": [
        { "date": "2025-10-01", "count": 5 },
        { "date": "2025-10-02", "count": 8 }
      ]
    },
    "topCategories": [
      { "category": "Restaurant", "count": 45 },
      { "category": "Boulangerie", "count": 32 }
    ]
  }
}
```

---

## Status Codes

### Success Codes

| Code | Description |
|------|-------------|
| `200 OK` | Request successful |
| `201 Created` | Resource created successfully |
| `204 No Content` | Request successful, no content to return |

### Client Error Codes

| Code | Description |
|------|-------------|
| `400 Bad Request` | Invalid request format or parameters |
| `401 Unauthorized` | Authentication required or failed |
| `403 Forbidden` | Insufficient permissions |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Resource conflict (e.g., duplicate) |
| `422 Unprocessable Entity` | Validation failed |
| `429 Too Many Requests` | Rate limit exceeded |

### Server Error Codes

| Code | Description |
|------|-------------|
| `500 Internal Server Error` | Unexpected server error |
| `502 Bad Gateway` | Upstream service error |
| `503 Service Unavailable` | Service temporarily unavailable |
| `504 Gateway Timeout` | Upstream service timeout |

---

## Webhook Integration

### Coming Soon

Webhook support for real-time notifications:
- New reviews
- Review replies
- Company updates
- Verification status changes

**Documentation:** See [WEBHOOKS.md](WEBHOOKS.md) (coming soon)

---

## Support

**Questions or Issues?**
- Email: api-support@example.com
- Documentation: https://docs.your-domain.com
- GitHub Issues: https://github.com/your-org/repo/issues

---

**Last Updated:** 16 Octobre 2025
**Version:** 1.0.0
