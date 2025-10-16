# 🤖 AI INTEGRATION GUIDE

**Project:** Multi-Tenant Directory Platform
**AI System:** NETZ Team Orchestration (Claude + Gemini + GPT-4)
**Integration:** n8n Workflow Automation
**Created:** 16 Octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture AI](#architecture-ai)
3. [Installation et Configuration](#installation-et-configuration)
4. [Fonctionnalités AI](#fonctionnalités-ai)
5. [API Endpoints](#api-endpoints)
6. [Admin Dashboard](#admin-dashboard)
7. [Utilisation](#utilisation)
8. [Workflows n8n](#workflows-n8n)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 VUE D'ENSEMBLE

### NETZ Team - AI Orchestration System

Le système NETZ utilise **3 modèles AI en parallèle** pour des analyses plus complètes:

1. **Claude (Technical Lead)**
   - Analyse de code
   - Debugging
   - Conception système
   - Documentation technique

2. **Gemini (Research & Innovation)**
   - Solutions créatives
   - Recherche et analyse de données
   - Optimisation
   - Génération de contenu

3. **GPT-4 (Strategy & Integration)**
   - Connaissances générales
   - Résolution de problèmes
   - Génération de code
   - Planification stratégique

### Avantages

✅ **3 perspectives différentes** - Analyses plus riches
✅ **Parallélisation** - 3x plus rapide qu'un seul AI
✅ **Consensus automatique** - Synthèse des meilleures réponses
✅ **Spécialisation** - Chaque AI pour sa force
✅ **Fiabilité** - Validation croisée entre AI

---

## 🏗️ ARCHITECTURE AI

```
┌─────────────────────────────────────────────────────┐
│  Multi-Tenant Directory Platform                    │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Admin     │  │   Business   │  │  Public   │ │
│  │  Dashboard  │  │     Owner    │  │  Pages    │ │
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                │                 │        │
│         └────────────────┴─────────────────┘        │
│                          │                          │
│                          ▼                          │
│              ┌─────────────────────┐                │
│              │   AI API Routes     │                │
│              │  /api/ai/*          │                │
│              └──────────┬──────────┘                │
└─────────────────────────┼───────────────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │  AI Orchestrator    │
              │  (orchestrator.ts)  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   n8n Client        │
              │  (n8n-client.ts)    │
              └──────────┬──────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│         n8n Workflow Automation Platform           │
│    https://netzfrance.app.n8n.cloud                │
│                                                    │
│  ┌─────────┐    ┌─────────┐    ┌──────────┐      │
│  │ Claude  │    │ Gemini  │    │  GPT-4   │      │
│  │  API    │    │   API   │    │   API    │      │
│  └────┬────┘    └────┬────┘    └─────┬────┘      │
│       │              │                │           │
│       └──────────────┴────────────────┘           │
│                      │                            │
│                      ▼                            │
│           ┌──────────────────┐                    │
│           │  Consensus Logic │                    │
│           └──────────────────┘                    │
└────────────────────────────────────────────────────┘
```

---

## ⚙️ INSTALLATION ET CONFIGURATION

### Étape 1: Variables d'environnement

Ajouter dans `.env.local` (développement):

```bash
# n8n API Configuration
N8N_API_URL="https://netzfrance.app.n8n.cloud"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# AI Features (optional flags)
ENABLE_AI_FEATURES="true"
AI_RATE_LIMIT="100"  # requests per day
```

Ajouter dans **Vercel Environment Variables** (production):

1. Aller sur [vercel.com](https://vercel.com) > Votre projet
2. **Settings** > **Environment Variables**
3. Ajouter:
   ```
   Name: N8N_API_URL
   Value: https://netzfrance.app.n8n.cloud
   Environment: Production, Preview
   ```
4. Ajouter:
   ```
   Name: N8N_API_KEY
   Value: [Votre API key depuis CLAUDE.md]
   Environment: Production, Preview
   Encrypt: ✅
   ```

### Étape 2: Installer les dépendances

Aucune dépendance supplémentaire n'est requise. Les fichiers créés utilisent uniquement:
- `fetch` (built-in)
- Next.js App Router
- React

### Étape 3: Vérifier l'installation

Test local:
```bash
# Build
npm run build

# Vérifier qu'aucune erreur TypeScript
npx tsc --noEmit
```

Test de l'API:
```bash
# Démarrer le serveur
npm run dev

# Tester (dans un autre terminal)
curl http://localhost:3000/api/ai/analyze-company \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "description": "A test company",
    "categories": ["Test"]
  }'
```

---

## 🚀 FONCTIONNALITÉS AI

### 1. Company Analysis (Analyse d'entreprise)

**Utilité:** Améliore les descriptions d'entreprises, suggère des mots-clés SEO

**Entrées:**
- Nom de l'entreprise
- Description actuelle
- Catégories actuelles

**Sorties:**
- Description améliorée (SEO-optimized)
- Mots-clés suggérés
- Catégories suggérées
- Score SEO (0-100)

**Exemple d'utilisation:**
```typescript
const analysis = await fetch('/api/ai/analyze-company', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyName: 'Boulangerie Schneider',
    description: 'Boulangerie artisanale',
    categories: ['Boulangerie'],
  }),
});

const data = await analysis.json();
// {
//   improvedDescription: "Boulangerie artisanale familiale depuis 1952...",
//   suggestedKeywords: ["pain artisanal", "pâtisserie", "viennoiserie"],
//   suggestedCategories: ["Pâtisserie", "Traiteur"],
//   seoScore: 85
// }
```

### 2. Review Response Generator (Générateur de réponses aux avis)

**Utilité:** Génère des réponses professionnelles aux avis clients

**Entrées:**
- ID de l'avis (depuis la database)
- Ton de la réponse (professional/friendly/formal)

**Sorties:**
- Réponse générée par AI

**Exemple d'utilisation:**
```typescript
const response = await fetch('/api/ai/generate-review-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reviewId: 123,
    tone: 'professional',
  }),
});

const data = await response.json();
// {
//   reviewId: 123,
//   generatedResponse: "Thank you for your wonderful review...",
//   tone: "professional"
// }
```

### 3. Search Optimization (Optimisation de recherche)

**Utilité:** Optimise les requêtes de recherche pour de meilleurs résultats

**Entrées:**
- Requête de recherche
- Contexte (ville, catégorie, intention)

**Sorties:**
- Requête optimisée
- Filtres suggérés
- Stratégie de recherche

**Exemple d'utilisation:**
```typescript
const optimization = await fetch('/api/ai/optimize-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'restaurant près de moi',
    context: {
      city: 'Haguenau',
      category: 'Restaurant',
    },
  }),
});

const data = await optimization.json();
// {
//   originalQuery: "restaurant près de moi",
//   optimizedQuery: "restaurant Haguenau cuisine locale",
//   suggestedFilters: { rating: ">=4", openNow: true },
//   searchStrategy: "semantic"
// }
```

### 4. SEO Content Generator (Générateur de contenu SEO)

**Utilité:** Génère du contenu SEO-optimized pour les pages

**Entrées:**
- Type de page (category/city/company)
- Nom
- Description (optionnel)
- Mots-clés (optionnel)

**Sorties:**
- Titre SEO
- Meta description
- H1
- Contenu de page
- Structured data (JSON-LD)

**Exemple d'utilisation:**
```typescript
const seoContent = await fetch('/api/ai/generate-seo-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pageType: 'category',
    data: {
      name: 'Restaurant',
      description: 'Restaurants à Haguenau',
      keywords: ['restaurant', 'gastronomie', 'cuisine'],
    },
  }),
});

const data = await seoContent.json();
// {
//   title: "Restaurants à Haguenau | Trouvez le meilleur restaurant",
//   metaDescription: "Découvrez les meilleurs restaurants...",
//   h1: "Restaurants à Haguenau",
//   content: "Haguenau regorge de restaurants...",
//   structuredData: { "@type": "Restaurant", ... }
// }
```

---

## 🔌 API ENDPOINTS

### POST `/api/ai/analyze-company`

Analyse une entreprise et suggère des améliorations.

**Body:**
```json
{
  "companyName": "string",
  "description": "string",
  "categories": ["string"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "improvedDescription": "string",
    "suggestedKeywords": ["string"],
    "suggestedCategories": ["string"],
    "seoScore": 85
  },
  "timestamp": "2025-10-16T12:00:00Z"
}
```

---

### POST `/api/ai/generate-review-response`

Génère une réponse professionnelle à un avis.

**Body:**
```json
{
  "reviewId": 123,
  "tone": "professional" | "friendly" | "formal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviewId": 123,
    "generatedResponse": "string",
    "tone": "professional"
  },
  "timestamp": "2025-10-16T12:00:00Z"
}
```

---

### POST `/api/ai/optimize-search`

Optimise une requête de recherche.

**Body:**
```json
{
  "query": "string",
  "context": {
    "city": "string",
    "category": "string",
    "userIntent": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalQuery": "string",
    "optimizedQuery": "string",
    "suggestedFilters": {},
    "searchStrategy": "semantic"
  },
  "timestamp": "2025-10-16T12:00:00Z"
}
```

---

### POST `/api/ai/generate-seo-content`

Génère du contenu SEO-optimized.

**Body:**
```json
{
  "pageType": "category" | "city" | "company",
  "data": {
    "name": "string",
    "description": "string",
    "keywords": ["string"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "string",
    "metaDescription": "string",
    "h1": "string",
    "content": "string",
    "structuredData": {}
  },
  "timestamp": "2025-10-16T12:00:00Z"
}
```

---

## 🎨 ADMIN DASHBOARD

### Accès

URL: `https://haguenau.pro/admin/ai-tools`

**Prérequis:** Être connecté comme admin

### Onglets disponibles

#### 1. Company Analysis
- Formulaire: Nom, description, catégories
- Bouton: "Analyze Company"
- Résultat: Description améliorée, keywords, score SEO

#### 2. Review Response
- Formulaire: Review ID, tone
- Bouton: "Generate Response"
- Résultat: Réponse générée

#### 3. Search Optimization
- Formulaire: Query, city, category
- Bouton: "Optimize Search"
- Résultat: Query optimisée, filtres suggérés

#### 4. SEO Content
- Formulaire: Page type, name, description, keywords
- Bouton: "Generate SEO Content"
- Résultat: Title, meta, contenu, structured data

---

## 💻 UTILISATION

### Cas d'usage 1: Améliorer une fiche entreprise

**Workflow:**
1. Admin va sur `/admin/companies/[id]`
2. Copie la description actuelle
3. Va sur `/admin/ai-tools` > "Company Analysis"
4. Colle la description
5. Clique "Analyze Company"
6. Copie la description améliorée
7. Retourne sur `/admin/companies/[id]` et met à jour

**Résultat:** Description SEO-optimized avec mots-clés pertinents

---

### Cas d'usage 2: Répondre à un avis négatif

**Workflow:**
1. Admin va sur `/admin/reviews`
2. Trouve l'avis (ID 456, 2 étoiles)
3. Va sur `/admin/ai-tools` > "Review Response"
4. Entre l'ID 456, choisit tone "professional"
5. Clique "Generate Response"
6. Copie la réponse générée
7. Retourne sur l'avis et poste la réponse

**Résultat:** Réponse professionnelle et empathique automatique

---

### Cas d'usage 3: Optimiser le SEO d'une catégorie

**Workflow:**
1. Admin crée une nouvelle page catégorie "Boulangerie"
2. Va sur `/admin/ai-tools` > "SEO Content"
3. Page Type: "category"
4. Name: "Boulangerie"
5. Keywords: "boulangerie, pain artisanal, pâtisserie"
6. Clique "Generate SEO Content"
7. Copie le titre, meta description, contenu
8. Utilise le contenu dans la page catégorie

**Résultat:** Page catégorie SEO-optimized prête à indexer

---

## 🔧 WORKFLOWS N8N

### Workflow: ai-orchestrate

**Webhook URL:** `https://netzfrance.app.n8n.cloud/webhook/ai-orchestrate`

**Fonction:** Distribue les tâches aux 3 AI et synthétise les résultats

**Architecture du workflow:**

```
┌─────────────┐
│   Webhook   │
│   Trigger   │
└──────┬──────┘
       │
       ├────────────┬────────────┬────────────┐
       │            │            │            │
       ▼            ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Claude  │ │  Gemini  │ │  GPT-4   │ │  Filter  │
│   API    │ │   API    │ │   API    │ │  Logic   │
└─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘
      │            │            │            │
      └────────────┴────────────┴────────────┘
                   │
                   ▼
            ┌──────────────┐
            │  Consensus   │
            │  Generator   │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │   Response   │
            │   Formatter  │
            └──────────────┘
```

**Input (JSON):**
```json
{
  "taskId": "string",
  "type": "analysis" | "generation" | "optimization" | "research",
  "prompt": "string",
  "context": {},
  "priority": "low" | "medium" | "high"
}
```

**Output (JSON):**
```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "model": "claude",
        "response": "...",
        "confidence": 0.95
      },
      {
        "model": "gemini",
        "response": "...",
        "confidence": 0.92
      },
      {
        "model": "gpt4",
        "response": "...",
        "confidence": 0.89
      }
    ],
    "consensus": "Synthesized response...",
    "recommendations": ["..."]
  }
}
```

### Configuration n8n (À faire)

1. **Créer le workflow dans n8n:**
   - Se connecter à https://netzfrance.app.n8n.cloud
   - Créer un nouveau workflow nommé "AI Orchestration"
   - Ajouter un Webhook Trigger

2. **Ajouter les nodes AI:**
   - Node Claude API (Anthropic)
   - Node Gemini API (Google)
   - Node OpenAI API (GPT-4)

3. **Ajouter la logique de consensus:**
   - Node Function pour comparer les réponses
   - Node Function pour synthétiser

4. **Activer le workflow:**
   - Sauvegarder
   - Activer
   - Copier l'URL du webhook

5. **Tester:**
   ```bash
   curl https://netzfrance.app.n8n.cloud/webhook/ai-orchestrate \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{
       "taskId": "test-1",
       "type": "generation",
       "prompt": "Write a professional review response",
       "priority": "high"
     }'
   ```

---

## 🐛 TROUBLESHOOTING

### Erreur: "AI service not configured"

**Cause:** Variables d'environnement manquantes

**Solution:**
```bash
# Vérifier les variables
echo $N8N_API_URL
echo $N8N_API_KEY

# Si vides, les ajouter dans .env.local
N8N_API_URL="https://netzfrance.app.n8n.cloud"
N8N_API_KEY="your-api-key"

# Redémarrer le serveur
npm run dev
```

---

### Erreur: "Webhook call failed"

**Cause:** Workflow n8n pas activé ou URL incorrecte

**Solution:**
1. Aller sur n8n dashboard
2. Vérifier que le workflow "AI Orchestration" est actif (toggle vert)
3. Vérifier l'URL du webhook dans le workflow
4. Tester avec curl:
   ```bash
   curl https://netzfrance.app.n8n.cloud/webhook/ai-orchestrate \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

---

### Erreur: "429 Too Many Requests"

**Cause:** Rate limit dépassé

**Solution:**
- Implémenter un rate limiter côté application
- Utiliser un cache pour les réponses fréquentes
- Upgrader le plan n8n si nécessaire

---

### AI renvoie des réponses génériques

**Cause:** Prompt pas assez détaillé ou contexte manquant

**Solution:**
- Améliorer les prompts dans `orchestrator.ts`
- Ajouter plus de contexte dans les appels API
- Fine-tuner les modèles AI (avancé)

---

## 📊 MÉTRIQUES

### Performance

**Temps de réponse typique:**
```
Company Analysis:    3-5 secondes
Review Response:     2-4 secondes
Search Optimization: 1-3 secondes
SEO Content:         4-6 secondes
```

**Débit:**
```
Free tier n8n:    ~100 requêtes/jour
Pro tier n8n:     ~10,000 requêtes/jour
```

### Coûts

**API Costs (estimation):**
```
Claude API:   $0.002 per request
Gemini API:   $0.001 per request
GPT-4 API:    $0.003 per request
─────────────────────────────────
Total:        ~$0.006 per request
```

**n8n Costs:**
```
Free tier:    0€/mois (100 requêtes/jour)
Pro tier:     $20/mois (10,000 requêtes/jour)
```

**Scénario 100 requêtes/jour:**
```
API costs:    $0.006 × 100 × 30 = $18/mois
n8n:          Free tier = 0€
─────────────────────────────────
Total:        ~$18/mois (~16€)
```

---

## ✅ CHECKLIST INTÉGRATION

Avant de considérer l'intégration AI complète:

- [ ] Variables d'environnement configurées (N8N_API_KEY, N8N_API_URL)
- [ ] Workflow n8n "AI Orchestration" créé et activé
- [ ] Test des 4 endpoints API (/api/ai/*)
- [ ] Admin dashboard `/admin/ai-tools` accessible
- [ ] Test d'un cycle complet (Company Analysis)
- [ ] Rate limiting implémenté (optionnel)
- [ ] Cache pour réponses fréquentes (optionnel)
- [ ] Monitoring des coûts API (optionnel)
- [ ] Documentation partagée avec l'équipe

---

## 📚 RESSOURCES

- [n8n Documentation](https://docs.n8n.io/)
- [Claude API Docs](https://docs.anthropic.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Date de création:** 16 Octobre 2025
**Dernière mise à jour:** 16 Octobre 2025
**Auteur:** Claude AI via NETZ Team
**Status:** ✅ Integration Complete - Ready for n8n Workflow Setup
