# 📚 Guide de l'API - Multi-Tenant Directory Platform

**Date:** 2025-11-06  
**Version:** 1.0  
**Auteur:** Manus AI

---

## 1. Introduction

Ce document fournit une vue d'ensemble de l'API RESTful de la plateforme. L'API est conçue pour être **prévisible, cohérente et facile à utiliser**.

### 1.1. Documentation Interactive

Une documentation interactive complète, générée avec Swagger UI, est disponible à l'adresse suivante:

**[https://haguenau.pro/docs](https://haguenau.pro/docs)**

Cette documentation permet de visualiser tous les endpoints, leurs paramètres, et de tester les appels API directement depuis le navigateur.

---

## 2. Concepts de Base

### 2.1. Format des Requêtes et Réponses

- **Format:** Toutes les requêtes et réponses sont au format **JSON**.
- **Encodage:** UTF-8.
- **Content-Type:** L'en-tête `Content-Type` pour les requêtes POST/PUT doit être `application/json`.

### 2.2. Authentification

L'API utilise deux méthodes d'authentification:

#### A. Bearer Token (JWT)

Pour les actions authentifiées depuis le frontend, un JSON Web Token (JWT) est utilisé.

```bash
curl -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  https://haguenau.pro/api/companies
```

#### B. Clé d'API

Pour les intégrations tierces, une clé d'API peut être utilisée.

```bash
curl -H "X-API-Key: VOTRE_CLE_API" \
  https://haguenau.pro/api/companies
```

### 2.3. Gestion des Erreurs

L'API utilise les codes de statut HTTP standard pour indiquer le succès ou l'échec d'une requête.

| Code | Signification |
|---|---|
| `200 OK` | La requête a réussi. |
| `201 Created` | La ressource a été créée avec succès. |
| `400 Bad Request` | La requête est malformée (ex: JSON invalide). |
| `401 Unauthorized` | L'authentification a échoué. |
| `403 Forbidden` | L'utilisateur n'a pas les droits nécessaires. |
| `404 Not Found` | La ressource demandée n'existe pas. |
| `500 Internal Server Error` | Une erreur inattendue est survenue côté serveur. |

Le corps de la réponse d'erreur contient des détails supplémentaires:

```json
{
  "error": "Message d'erreur concis"
}
```

### 2.4. Limitation de Débit (Rate Limiting)

- **Endpoints publics:** 100 requêtes / 15 minutes
- **Endpoints authentifiés:** 1000 requêtes / 15 minutes

---

## 3. Structure des Endpoints

L'API est organisée de manière RESTful, autour des ressources.

| Ressource | Endpoint | Description |
|---|---|---|
| **Entreprises** | `/api/companies` | Gérer les entreprises. |
| **Catégories** | `/api/categories` | Gérer les catégories. |
| **Avis** | `/api/reviews` | Gérer les avis. |
| **Utilisateurs** | `/api/users` | Gérer les utilisateurs. |
| **Domaines** | `/api/domains` | Gérer les domaines. |

### Exemple: CRUD sur les Entreprises

- **`GET /api/companies`**: Lister toutes les entreprises.
- **`GET /api/companies/{id}`**: Obtenir une entreprise spécifique.
- **`POST /api/companies`**: Créer une nouvelle entreprise.
- **`PUT /api/companies/{id}`**: Mettre à jour une entreprise.
- **`DELETE /api/companies/{id}`**: Supprimer une entreprise.

---

## 4. Endpoints Principaux

Voici une liste non exhaustive des endpoints les plus importants.

### 4.1. Admin API

- `GET /api/admin/users`: Lister tous les utilisateurs.
- `PUT /api/admin/companies/{id}/approve`: Approuver une entreprise.
- `POST /api/admin/categories`: Créer une catégorie.

### 4.2. Business Management API

- `GET /api/business/me`: Obtenir le profil de l'entreprise de l'utilisateur connecté.
- `PUT /api/business/hours`: Mettre à jour les horaires d'ouverture.
- `POST /api/business/photos`: Télécharger une photo.

### 4.3. AI/ML API

- `POST /api/ai/generate-description`: Générer une description d'entreprise.
- `POST /api/ai/analyze-sentiment`: Analyser le sentiment d'un avis.

### 4.4. Recherche API

- `GET /api/search?q={query}`: Effectuer une recherche.
- `GET /api/search/suggest?q={query}`: Obtenir des suggestions de recherche.

---

## 5. Pagination

Les endpoints qui retournent des listes de ressources supportent la pagination via des paramètres de requête.

- `page`: Le numéro de la page (défaut: 1).
- `limit`: Le nombre d'éléments par page (défaut: 20).

**Exemple:**
`GET /api/companies?page=2&limit=50`

La réponse inclut des informations de pagination:

```json
{
  "data": [...],
  "pagination": {
    "total": 238,
    "page": 2,
    "limit": 50,
    "totalPages": 5
  }
}
```

---

## 6. Webhooks

Le système peut envoyer des notifications d'événements à des URLs externes via des webhooks.

### 6.1. Événements Supportés

- `review.created`: Un nouvel avis a été soumis.
- `company.updated`: Une entreprise a été mise à jour.
- `user.created`: Un nouvel utilisateur s'est inscrit.

### 6.2. Configuration

Les webhooks peuvent être configurés dans le tableau de bord développeur (à venir).

### 6.3. Charge Utile (Payload)

La charge utile du webhook est un objet JSON contenant des informations sur l'événement.

```json
{
  "event": "review.created",
  "timestamp": "2025-11-06T14:00:00Z",
  "data": {
    "reviewId": 123,
    "companyId": 456,
    "rating": 5
  }
}
```

---

## 7. Bonnes Pratiques

- **Mise en cache:** Mettez en cache les réponses GET pour améliorer les performances.
- **Gestion des erreurs:** Implémentez une logique de relance pour les erreurs 5xx.
- **Sécurité:** Ne stockez jamais les clés d'API en clair dans le code frontend.
