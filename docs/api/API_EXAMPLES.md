# API Examples Guide

**Version:** 2.1.0
**Last Updated:** 25 November 2025

Practical examples for integrating with the Multi-Tenant Directory API.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Companies](#companies)
3. [Categories](#categories)
4. [Reviews](#reviews)
5. [Search](#search)
6. [Business Owner API](#business-owner-api)
7. [Admin API](#admin-api)

---

## Base Configuration

### Base URL

```
Production: https://haguenau.pro/api
Development: http://localhost:3000/api
```

### Headers

```http
Content-Type: application/json
Authorization: Bearer <token>  # For authenticated endpoints
```

---

## Authentication

### Login (Business Owner)

```bash
curl -X POST https://haguenau.pro/api/business/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "secure-password"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123abc",
    "email": "owner@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

### Register (Business Owner)

```bash
curl -X POST https://haguenau.pro/api/business/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newowner@example.com",
    "password": "secure-password",
    "firstName": "Marie",
    "lastName": "Martin",
    "phone": "+33 6 12 34 56 78"
  }'
```

---

## Companies

### List Companies

```bash
# Basic list
curl https://haguenau.pro/api/companies

# With filters
curl "https://haguenau.pro/api/companies?city=Haguenau&category=Restaurant&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Café du Marché",
      "slug": "cafe-du-marche-haguenau",
      "address": "1 Place du Marché",
      "city": "Haguenau",
      "postalCode": "67500",
      "phone": "03 88 00 00 00",
      "rating": 4.5,
      "reviewCount": 42,
      "categories": ["Restaurant", "Café"]
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### Get Company by Slug

```bash
curl https://haguenau.pro/api/companies/cafe-du-marche-haguenau
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Café du Marché",
    "slug": "cafe-du-marche-haguenau",
    "description": "Un café traditionnel au coeur de Haguenau...",
    "address": "1 Place du Marché",
    "city": "Haguenau",
    "postalCode": "67500",
    "phone": "03 88 00 00 00",
    "email": "contact@cafe-marche.fr",
    "website": "https://cafe-marche.fr",
    "latitude": 48.8156,
    "longitude": 7.7889,
    "rating": 4.5,
    "reviewCount": 42,
    "categories": ["Restaurant", "Café"],
    "photos": [
      {
        "url": "https://...",
        "isPrimary": true,
        "type": "cover"
      }
    ],
    "hours": {
      "monday": { "open": "08:00", "close": "19:00" },
      "tuesday": { "open": "08:00", "close": "19:00" },
      "sunday": { "closed": true }
    }
  }
}
```

### Create Company (Admin)

```bash
curl -X POST https://haguenau.pro/api/admin/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Nouvelle Entreprise",
    "address": "10 Rue Example",
    "city": "Haguenau",
    "postalCode": "67500",
    "categories": ["Services"],
    "phone": "03 88 00 00 00"
  }'
```

---

## Categories

### List Categories

```bash
curl https://haguenau.pro/api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Restaurants",
      "slug": "restaurants",
      "icon": "utensils",
      "color": "#FF5733",
      "companyCount": 45,
      "children": [
        {
          "id": 10,
          "name": "Pizzerias",
          "slug": "pizzerias",
          "parentId": 1
        }
      ]
    }
  ]
}
```

### Get Category with Companies

```bash
curl https://haguenau.pro/api/categories/restaurants
```

---

## Reviews

### List Company Reviews

```bash
curl https://haguenau.pro/api/reviews?companyId=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "authorName": "Jean D.",
      "rating": 5,
      "comment": "Excellent café, service impeccable!",
      "reviewDate": "2025-11-20T10:30:00Z",
      "isVerified": true,
      "reply": {
        "content": "Merci pour votre avis!",
        "createdAt": "2025-11-21T09:00:00Z"
      }
    }
  ],
  "stats": {
    "average": 4.5,
    "total": 42,
    "distribution": {
      "5": 20,
      "4": 15,
      "3": 5,
      "2": 1,
      "1": 1
    }
  }
}
```

### Submit Review

```bash
curl -X POST https://haguenau.pro/api/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "authorName": "Marie M.",
    "authorEmail": "marie@example.com",
    "rating": 5,
    "comment": "Service excellent, je recommande vivement!"
  }'
```

---

## Search

### Basic Search

```bash
curl "https://haguenau.pro/api/search?q=restaurant"
```

### Advanced Search

```bash
curl "https://haguenau.pro/api/search?q=restaurant&city=Haguenau&minRating=4&category=Restaurant&sortBy=rating&order=desc&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20
  },
  "facets": {
    "categories": [
      { "name": "Restaurant", "count": 15 },
      { "name": "Café", "count": 10 }
    ],
    "cities": [
      { "name": "Haguenau", "count": 20 },
      { "name": "Strasbourg", "count": 5 }
    ]
  }
}
```

### Search Suggestions (Autocomplete)

```bash
curl "https://haguenau.pro/api/search/suggestions?q=rest"
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "Restaurant",
    "Restaurant italien",
    "Restaurant du Parc"
  ]
}
```

---

## Business Owner API

### Get My Companies

```bash
curl https://haguenau.pro/api/companies/my-companies \
  -H "Authorization: Bearer <token>"
```

### Update Company Profile

```bash
curl -X PUT https://haguenau.pro/api/business/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "companyId": 1,
    "description": "Updated description...",
    "phone": "03 88 11 22 33",
    "email": "new@email.com"
  }'
```

### Upload Photo

```bash
curl -X POST https://haguenau.pro/api/business/photos \
  -H "Authorization: Bearer <token>" \
  -F "companyId=1" \
  -F "type=gallery" \
  -F "image=@photo.jpg"
```

### Update Business Hours

```bash
curl -X PUT https://haguenau.pro/api/business/hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "companyId": 1,
    "timezone": "Europe/Paris",
    "monday": [
      { "open": "09:00", "close": "12:00" },
      { "open": "14:00", "close": "18:00" }
    ],
    "tuesday": [
      { "open": "09:00", "close": "18:00" }
    ],
    "sunday": { "closed": true }
  }'
```

### Reply to Review

```bash
curl -X POST https://haguenau.pro/api/business/reviews/101/reply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "content": "Merci beaucoup pour votre avis!"
  }'
```

### Get Analytics

```bash
curl "https://haguenau.pro/api/business/analytics?companyId=1&period=30d" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "profileViews": 1250,
      "uniqueVisitors": 890,
      "phoneClicks": 45,
      "websiteClicks": 120,
      "directionsClicks": 67
    },
    "trends": {
      "viewsChange": 15.5,
      "clicksChange": -2.3
    },
    "daily": [
      {
        "date": "2025-11-25",
        "views": 42,
        "clicks": 8
      }
    ]
  }
}
```

---

## Admin API

### List All Companies (Admin)

```bash
curl https://haguenau.pro/api/admin/companies \
  -H "Authorization: Bearer <admin-token>"
```

### Moderate Review

```bash
curl -X PUT https://haguenau.pro/api/admin/reviews/101 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "isApproved": true
  }'
```

### Sync Google Reviews

```bash
curl -X POST https://haguenau.pro/api/admin/sync-all-reviews \
  -H "Authorization: Bearer <admin-token>"
```

### Export Leads (CSV)

```bash
curl "https://haguenau.pro/api/admin/leads/export?format=csv" \
  -H "Authorization: Bearer <admin-token>" \
  -o leads.csv
```

---

## Error Handling

All API errors return consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public | 100 requests | 15 minutes |
| Authenticated | 1000 requests | 15 minutes |
| Admin | 5000 requests | 15 minutes |

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// API Client
const API_BASE = 'https://haguenau.pro/api';

async function searchCompanies(query: string) {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return response.json();
}

async function submitReview(data: ReviewData) {
  const response = await fetch(`${API_BASE}/reviews/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### Python

```python
import requests

API_BASE = 'https://haguenau.pro/api'

def search_companies(query):
    response = requests.get(f'{API_BASE}/search', params={'q': query})
    return response.json()

def submit_review(data):
    response = requests.post(f'{API_BASE}/reviews/submit', json=data)
    return response.json()
```

---

## Interactive Documentation

For interactive API testing, visit:

**Swagger UI:** [https://haguenau.pro/docs](https://haguenau.pro/docs)
