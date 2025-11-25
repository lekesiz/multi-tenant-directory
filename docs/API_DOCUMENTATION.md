# API Documentation - Haguenau.PRO

**Version:** 2.1
**Date:** 25 Novembre 2025
**Base URL:** `https://haguenau.pro/api`

> **Note:** Cette documentation couvre les endpoints principaux. Pour la documentation complète et interactive, visitez [https://haguenau.pro/docs](https://haguenau.pro/docs) (Swagger UI).

## 📊 Statistiques API

- **119+ endpoints** documentés
- **24 catégories** d'API
- **Rate limiting:** 100 req/15min (public), 1000 req/15min (authentifié)

---

## 📖 Table des Matières

1. [Authentication](#authentication)
2. [Business Endpoints](#business-endpoints)
3. [Review Endpoints](#review-endpoints)
4. [Analytics Endpoints](#analytics-endpoints)

---

## 🔐 Authentication

### Register

**POST** `/api/business/register`

**Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "SecurePass123",
  "companyName": "NETZ Informatique"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compte créé. Vérifiez votre email."
}
```

### Login

**POST** `/api/auth/signin`

**Body:**
```json
{
  "email": "jean@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "user": {
    "id": "123",
    "email": "jean@example.com",
    "name": "Jean Dupont"
  },
  "token": "jwt_token_here"
}
```

---

## 🏢 Business Endpoints

### Get Profile

**GET** `/api/business/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "123",
  "name": "NETZ Informatique",
  "email": "contact@netz.fr",
  "phone": "03 67 31 02 01",
  "address": "1 a Rte de Schweighouse, Haguenau"
}
```

### Update Profile

**PUT** `/api/business/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "NETZ Informatique",
  "description": "Entreprise informatique depuis 20 ans",
  "phone": "03 67 31 02 01",
  "email": "contact@netz.fr",
  "website": "https://netzinformatique.fr"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profil mis à jour"
}
```

---

## 📸 Photo Endpoints

### Upload Photos

**POST** `/api/business/photos`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```
files: [File, File, ...]
```

**Response:**
```json
{
  "success": true,
  "photos": [
    {
      "id": "photo_123",
      "url": "https://blob.vercel-storage.com/..."
    }
  ]
}
```

### Delete Photo

**DELETE** `/api/business/photos/{photoId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Photo supprimée"
}
```

---

## ⏰ Business Hours Endpoints

### Get Hours

**GET** `/api/business/hours`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "regularHours": [
    {
      "dayOfWeek": 1,
      "isOpen": true,
      "openTime": "09:00",
      "closeTime": "18:00"
    }
  ],
  "specialHours": [
    {
      "date": "2025-12-25",
      "reason": "Noël",
      "isClosed": true
    }
  ]
}
```

### Update Hours

**POST** `/api/business/hours`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "regularHours": [...],
  "specialHours": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Horaires mis à jour"
}
```

---

## ⭐ Review Endpoints

### Get Reviews

**GET** `/api/companies/{companyId}/reviews`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: approved | pending | rejected

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_123",
      "authorName": "Marie Dubois",
      "rating": 5,
      "comment": "Excellent service!",
      "createdAt": "2025-10-15T10:00:00Z",
      "isApproved": true
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 5
}
```

### Moderate Review (Admin)

**PATCH** `/api/admin/reviews/{reviewId}`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Body:**
```json
{
  "isApproved": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avis approuvé"
}
```

---

## 📊 Analytics Endpoints

### Get Analytics

**GET** `/api/business/analytics`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

**Response:**
```json
{
  "views": 1250,
  "phoneClicks": 45,
  "emailClicks": 20,
  "websiteClicks": 30,
  "contactForms": 15
}
```

---

## 📧 Contact Endpoint

### Submit Contact Form

**POST** `/api/contact`

**Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+33 6 12 34 56 78",
  "subject": "Demande de devis",
  "message": "Bonjour, je souhaiterais...",
  "companyId": "123",
  "companyName": "NETZ Informatique"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message envoyé avec succès"
}
```

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

---

## 📝 Rate Limiting

- **Public endpoints:** 100 requests / 15 minutes per IP
- **Authenticated endpoints:** 1000 requests / 15 minutes
- **Header:** `X-RateLimit-Remaining`
- **Exceeded:** HTTP 429 Too Many Requests

---

## 🆕 Nouveaux Endpoints (v2.1)

### Activities API
- `GET /api/business/activities` - Liste des activités
- `POST /api/business/activities` - Créer une activité
- `PUT /api/business/activities/[id]` - Modifier une activité
- `DELETE /api/business/activities/[id]` - Supprimer une activité
- `POST /api/business/activities/[id]/publish` - Publier une activité
- `POST /api/business/activities/generate` - Génération AI de contenu
- `POST /api/business/activities/[id]/generate-image` - Génération d'image AI
- `POST /api/business/activities/[id]/generate-video` - Génération vidéo AI

### AI/ML API (17 endpoints)
- `POST /api/ai/generate-description` - Description d'entreprise
- `POST /api/ai/analyze-sentiment` - Analyse de sentiment
- `POST /api/ai/chat` - Chatbot interactif
- `POST /api/ai/generate-seo-content` - Contenu SEO
- `POST /api/ai/review-response` - Réponse automatique aux avis
- `POST /api/ai/recommendations` - Recommandations intelligentes
- Et plus...

### Mobile API (7 endpoints)
- `POST /api/mobile/auth/login` - Connexion mobile
- `POST /api/mobile/auth/refresh` - Refresh token
- `GET /api/mobile/companies/[id]` - Détails entreprise
- `GET /api/mobile/analytics/[id]` - Analytics mobile
- `GET /api/mobile/config` - Configuration app
- `POST /api/mobile/notifications/send` - Notifications push

### Cron Jobs
- `GET /api/cron/sync-reviews` - Synchronisation automatique des avis Google

---

**Version:** 2.1
**Dernière mise à jour:** 25 Novembre 2025
