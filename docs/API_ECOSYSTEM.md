# NETZ Directory API Ecosystem

## 🚀 Complete Developer Integration Guide

This document provides comprehensive documentation for the NETZ Directory API ecosystem, including REST APIs, webhooks, third-party integrations, and developer tools.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [REST API Reference](#rest-api-reference)
4. [Webhooks](#webhooks)
5. [Third-Party Integrations](#third-party-integrations)
6. [Rate Limiting](#rate-limiting)
7. [SDKs & Code Examples](#sdks--code-examples)
8. [Error Handling](#error-handling)
9. [Testing](#testing)

## 🔑 Getting Started

### Developer Account Setup

1. **Apply for API Access**
   - Log into your business owner dashboard
   - Navigate to Developer Console
   - Submit application with business details
   - Wait for approval (usually 24-48 hours)

2. **Generate API Keys**
   - Once approved, create API keys in Developer Console
   - Set appropriate permissions (read, write, webhooks)
   - Store keys securely (never commit to version control)

### Base URLs

```
Production: https://api.netz.directory/v1
Staging: https://staging-api.netz.directory/v1
```

## 🔐 Authentication

### API Key Authentication

Include your API key in the request header:

```http
X-API-Key: netz_your_api_key_here
```

### Permissions

API keys support the following permissions:
- `read`: Access to GET endpoints
- `write`: Access to POST, PUT, DELETE endpoints  
- `webhooks`: Ability to create and manage webhooks
- `analytics`: Access to analytics endpoints

## 📊 REST API Reference

### Base Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {...},
  "pagination": {...},
  "meta": {...}
}
```

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Companies API

#### GET /v1/companies

List companies with filtering options.

**Parameters:**
- `city` (string): Filter by city
- `category` (string): Filter by category
- `search` (string): Search in name and address
- `limit` (integer): Results per page (max 100, default 50)
- `offset` (integer): Pagination offset (default 0)

**Response:**
```json
{
  "companies": [
    {
      "id": 123,
      "name": "Café de la Place",
      "slug": "cafe-de-la-place",
      "address": "1 Place de la République",
      "city": "Haguenau",
      "postalCode": "67500",
      "phone": "+33 3 88 93 70 00",
      "email": "contact@cafedelaplace.fr",
      "website": "https://cafedelaplace.fr",
      "latitude": 48.8156,
      "longitude": 7.7894,
      "categories": ["restaurant", "cafe"],
      "logoUrl": "https://example.com/logo.jpg",
      "rating": 4.5,
      "reviewCount": 127,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T12:30:00Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /v1/companies/{id}

Get detailed company information including reviews, photos, and analytics.

**Response:**
```json
{
  "company": {
    "id": 123,
    "name": "Café de la Place",
    // ... basic company info
    "businessHours": {
      "monday": {"open": "08:00", "close": "18:00", "closed": false},
      "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
      // ... other days
      "timezone": "Europe/Paris"
    },
    "recentReviews": [
      {
        "id": 456,
        "authorName": "Jean D.",
        "rating": 5,
        "comment": "Excellent café et service !",
        "reviewDate": "2025-01-15T10:30:00Z",
        "isVerified": true,
        "helpfulCount": 3,
        "reply": {
          "content": "Merci pour votre retour !",
          "createdAt": "2025-01-15T14:00:00Z"
        }
      }
    ],
    "photos": [
      {
        "id": 789,
        "url": "https://example.com/photo.jpg",
        "thumbnail": "https://example.com/thumb.jpg",
        "caption": "Terrasse du café",
        "type": "interior"
      }
    ],
    "analytics": {
      "totalViews": 1234,
      "totalPhoneClicks": 89,
      "totalWebsiteClicks": 156,
      "totalEmailClicks": 23,
      "totalDirectionsClicks": 267
    }
  }
}
```

### Reviews API

#### GET /v1/companies/{id}/reviews

Get reviews for a specific company.

**Parameters:**
- `limit` (integer): Number of reviews (max 100, default 20)
- `offset` (integer): Pagination offset
- `rating` (integer): Filter by rating (1-5)

### Products API (E-commerce)

#### GET /v1/companies/{id}/products

Get products for a company.

#### POST /v1/companies/{id}/products

Create a new product (requires `write` permission).

### Bookings API

#### GET /v1/companies/{id}/bookings

Get bookings for a company.

#### POST /v1/companies/{id}/bookings

Create a new booking.

## 🪝 Webhooks

Webhooks allow you to receive real-time notifications when events occur in the NETZ Directory platform.

### Supported Events

- `company.created` - New company added
- `company.updated` - Company information updated
- `review.created` - New review posted
- `review.updated` - Review modified or replied to
- `booking.created` - New booking made
- `booking.updated` - Booking status changed
- `order.created` - New order placed
- `order.updated` - Order status changed
- `product.created` - New product added
- `product.updated` - Product information updated

### Webhook Registration

```http
POST /api/developer/webhooks
Content-Type: application/json
X-API-Key: your_api_key

{
  "url": "https://yourdomain.com/webhooks/netz",
  "events": ["review.created", "booking.created"],
  "description": "Handle new reviews and bookings"
}
```

### Webhook Payload

```json
{
  "id": "webhook_event_12345",
  "type": "review.created",
  "data": {
    "review": {
      "id": 789,
      "companyId": 123,
      "authorName": "Marie L.",
      "rating": 5,
      "comment": "Service excellent !",
      "reviewDate": "2025-01-15T15:30:00Z"
    }
  },
  "timestamp": "2025-01-15T15:30:15Z"
}
```

### Webhook Security

Verify webhook signatures using the secret provided during registration:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### Testing Webhooks

```http
POST /api/developer/webhooks/{webhook_id}/test
X-API-Key: your_api_key
```

## 🔗 Third-Party Integrations

### Google My Business

Sync your Google My Business data:

```http
POST /api/integrations/google-mybusiness/sync
X-API-Key: your_api_key
```

### Mailchimp

Sync contacts to Mailchimp lists:

```http
POST /api/integrations/mailchimp/sync
X-API-Key: your_api_key
Content-Type: application/json

{
  "listId": "your_mailchimp_list_id",
  "contacts": [
    {
      "email": "customer@example.com",
      "firstName": "Jean",
      "lastName": "Dupont"
    }
  ]
}
```

### Zapier

Connect with 5000+ apps through Zapier webhooks:

```http
POST /api/integrations/zapier/trigger
X-API-Key: your_api_key
Content-Type: application/json

{
  "event": "new_customer",
  "data": {
    "customerEmail": "new@customer.com",
    "source": "website"
  }
}
```

### Slack Notifications

Send notifications to Slack channels:

```http
POST /api/integrations/slack/notify
X-API-Key: your_api_key
Content-Type: application/json

{
  "channel": "#general",
  "message": "New review received: 5 stars!"
}
```

### WhatsApp Business

Send WhatsApp messages to customers:

```http
POST /api/integrations/whatsapp/send
X-API-Key: your_api_key
Content-Type: application/json

{
  "to": "+33123456789",
  "message": "Votre réservation est confirmée pour demain à 14h."
}
```

## ⚡ Rate Limiting

### Limits

- **Free Plan**: 1,000 requests/hour
- **Basic Plan**: 5,000 requests/hour  
- **Pro Plan**: 10,000 requests/hour
- **Enterprise Plan**: 50,000 requests/hour

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642680000
```

### Handling Rate Limits

```javascript
const response = await fetch('/api/v1/companies', {
  headers: { 'X-API-Key': 'your_key' }
});

if (response.status === 429) {
  const resetTime = response.headers.get('X-RateLimit-Reset');
  const waitTime = (parseInt(resetTime) * 1000) - Date.now();
  console.log(`Rate limited. Retry after ${waitTime}ms`);
}
```

## 💻 SDKs & Code Examples

### JavaScript/Node.js

```javascript
class NetzAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.netz.directory/v1';
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getCompanies(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/companies?${params}`);
  }

  async getCompany(id) {
    return this.request(`/companies/${id}`);
  }
}

// Usage
const api = new NetzAPI('your_api_key');
const companies = await api.getCompanies({ city: 'Haguenau' });
```

### Python

```python
import requests

class NetzAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.netz.directory/v1'
        self.headers = {
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        }

    def request(self, endpoint, method='GET', data=None):
        url = f"{self.base_url}{endpoint}"
        response = requests.request(
            method, url, headers=self.headers, json=data
        )
        response.raise_for_status()
        return response.json()

    def get_companies(self, **filters):
        params = '&'.join([f"{k}={v}" for k, v in filters.items()])
        endpoint = f"/companies?{params}" if params else "/companies"
        return self.request(endpoint)

    def get_company(self, company_id):
        return self.request(f"/companies/{company_id}")

# Usage
api = NetzAPI('your_api_key')
companies = api.get_companies(city='Haguenau')
```

### PHP

```php
<?php
class NetzAPI {
    private $apiKey;
    private $baseUrl = 'https://api.netz.directory/v1';

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    private function request($endpoint, $method = 'GET', $data = null) {
        $headers = [
            'X-API-Key: ' . $this->apiKey,
            'Content-Type: application/json'
        ];

        $context = stream_context_create([
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", $headers),
                'content' => $data ? json_encode($data) : null
            ]
        ]);

        $response = file_get_contents($this->baseUrl . $endpoint, false, $context);
        return json_decode($response, true);
    }

    public function getCompanies($filters = []) {
        $params = http_build_query($filters);
        $endpoint = '/companies' . ($params ? '?' . $params : '');
        return $this->request($endpoint);
    }

    public function getCompany($id) {
        return $this->request("/companies/{$id}");
    }
}

// Usage
$api = new NetzAPI('your_api_key');
$companies = $api->getCompanies(['city' => 'Haguenau']);
?>
```

## ❌ Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Invalid API key",
  "code": "UNAUTHORIZED",
  "details": {
    "timestamp": "2025-01-15T15:30:00Z",
    "requestId": "req_12345"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid API key
- `RATE_LIMITED` - Too many requests
- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `PERMISSION_DENIED` - Insufficient permissions

## 🧪 Testing

### Test API Keys

Use test API keys for development:
```
Test Key: netz_test_1234567890abcdef
```

### Webhook Testing

Use webhook.site or ngrok for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL for webhook registration
```

### Postman Collection

Download our Postman collection:
[NETZ API Collection](https://api.netz.directory/postman/collection.json)

## 📞 Support

### Developer Support

- **Documentation**: https://docs.netz.directory/api
- **Status Page**: https://status.netz.directory
- **Support Email**: api@netz.directory
- **Discord Community**: https://discord.gg/netz-dev

### Rate Limit Increases

Contact support for higher rate limits with:
- Business justification
- Expected usage patterns
- Current API usage statistics

### SLA & Uptime

- **Uptime Target**: 99.9%
- **Response Time**: < 200ms average
- **Maintenance Window**: Sundays 2-4 AM CET

---

## 🔄 Changelog

### v1.0.0 (2025-01-15)
- Initial API release
- Companies and reviews endpoints
- Webhook system
- Basic integrations

### Coming Soon
- GraphQL API
- Real-time subscriptions
- Advanced analytics endpoints
- Mobile SDK

---

✅ **Ready to integrate?** Start by applying for API access in your developer console!