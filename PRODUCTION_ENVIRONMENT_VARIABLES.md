# 🔐 PRODUCTION ENVIRONMENT VARIABLES GUIDE

**Project:** Multi-Tenant Directory Platform
**Platform:** Vercel
**Security Level:** HIGH
**Created:** 16 Octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Variables obligatoires](#variables-obligatoires)
2. [Variables optionnelles](#variables-optionnelles)
3. [Configuration Vercel](#configuration-vercel)
4. [Génération de secrets sécurisés](#génération-de-secrets-sécurisés)
5. [Environnements multiples](#environnements-multiples)
6. [Sécurité et bonnes pratiques](#sécurité-et-bonnes-pratiques)
7. [Validation et tests](#validation-et-tests)
8. [Troubleshooting](#troubleshooting)

---

## ⚠️ SÉCURITÉ CRITIQUE

**NE JAMAIS:**
- ❌ Commit les variables dans Git
- ❌ Partager les secrets par email/Slack
- ❌ Utiliser les mêmes secrets en dev et prod
- ❌ Laisser des valeurs par défaut en production

**TOUJOURS:**
- ✅ Utiliser un password manager (1Password, Bitwarden)
- ✅ Générer des secrets cryptographiquement sûrs
- ✅ Rotate les secrets régulièrement (tous les 90 jours)
- ✅ Utiliser des environnements séparés (dev, staging, prod)

---

## 🔑 VARIABLES OBLIGATOIRES

### 1. Database (PostgreSQL via Neon)

```bash
# Connection pooling (recommandé pour Vercel serverless)
DATABASE_URL="postgresql://username:password@endpoint-pooler.region.aws.neon.tech/dbname?sslmode=require&pgbouncer=true"

# Direct connection (pour migrations uniquement)
DIRECT_URL="postgresql://username:password@endpoint.region.aws.neon.tech/dbname?sslmode=require"
```

**Obtenir:**
1. Aller sur [neon.tech](https://neon.tech)
2. Dashboard > Votre projet > **"Connection Details"**
3. Copier **"Pooled connection"** pour `DATABASE_URL`
4. Copier **"Direct connection"** pour `DIRECT_URL`

**Format complet:**
```bash
DATABASE_URL="postgresql://neondb_owner:AbCd1234XyZ@ep-cool-name-123456-pooler.eu-central-1.aws.neon.tech/mtd_production?sslmode=require&pgbouncer=true&connect_timeout=10"

DIRECT_URL="postgresql://neondb_owner:AbCd1234XyZ@ep-cool-name-123456.eu-central-1.aws.neon.tech/mtd_production?sslmode=require&connect_timeout=10"
```

**⚠️ Attention:**
- Ne pas oublier `?sslmode=require` (sécurité)
- Ne pas oublier `&pgbouncer=true` dans DATABASE_URL (performance)
- Le password ne doit contenir aucun espace

---

### 2. NextAuth (Authentication)

```bash
# URL de l'application (changer selon le domaine)
NEXTAUTH_URL="https://haguenau.pro"

# Secret pour chiffrer les tokens (minimum 32 caractères)
NEXTAUTH_SECRET="votre-secret-cryptographiquement-sur-64-caracteres-minimum"
```

**Générer NEXTAUTH_SECRET:**
```bash
# Option 1: OpenSSL
openssl rand -base64 48

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Option 3: Site web
# https://generate-secret.vercel.app/32
```

**Exemple de valeur:**
```bash
NEXTAUTH_SECRET="8f3d7c2e1a9b4f6e5d8c7a2b1e9f4d6c3a8b7e1f9d2c4a6e8b3d7f1c9e2a4b6d8"
```

**⚠️ Important:**
- Générer un nouveau secret pour la production (ne pas réutiliser celui du développement)
- Ne jamais partager ce secret
- Si compromis, générer un nouveau et forcer la reconnexion de tous les utilisateurs

---

### 3. Email (Resend)

```bash
# API Key Resend
RESEND_API_KEY="re_AbCdEfGh123456789_XyZaBcDeFgHiJkLmNoPqRsTuVwXyZ"

# Email expéditeur (doit être un domaine vérifié dans Resend)
RESEND_FROM_EMAIL="noreply@haguenau.pro"

# Nom d'affichage
RESEND_FROM_NAME="Haguenau.PRO"

# Email de réponse
RESEND_REPLY_TO="contact@haguenau.pro"
```

**Obtenir RESEND_API_KEY:**
1. Dashboard Resend > **"API Keys"**
2. **"Create API Key"**
3. Name: `production-haguenau-pro`
4. Permission: **Full Access**
5. Copier la clé (affichée une seule fois!)

**⚠️ Attention:**
- `RESEND_FROM_EMAIL` doit utiliser un domaine vérifié dans Resend
- Ne pas utiliser @gmail.com, @outlook.com, etc.
- Vérifier que les DNS (SPF, DKIM, DMARC) sont configurés

---

### 4. Admin Credentials (Premier compte admin)

```bash
# Email admin (sera créé au seed)
ADMIN_EMAIL="admin@haguenau.pro"

# Password admin (minimum 12 caractères)
ADMIN_PASSWORD="VotreMotDePasseTresFort2025!@#"
```

**⚠️ CRITIQUE:**
- **NE PAS** utiliser `admin@example.com` ou `test@test.com` en production
- **NE PAS** utiliser des passwords faibles comme `password123`
- Générer un password fort:
  ```bash
  # Au moins 16 caractères, avec majuscules, minuscules, chiffres, symboles
  openssl rand -base64 24
  ```
- Sauvegarder dans un password manager
- Changer le password après la première connexion

**Recommandation:**
```bash
ADMIN_EMAIL="mikail@lekesiz.org"  # Votre email réel
ADMIN_PASSWORD="$(openssl rand -base64 24)"  # Généré aléatoirement
```

---

### 5. Environment Type

```bash
# Définit l'environnement actuel
NODE_ENV="production"
```

**Valeurs possibles:**
- `development` - Local dev
- `preview` - Vercel preview deployments
- `production` - Production

**Impact:**
- Désactive les logs détaillés en production
- Active les optimisations Next.js
- Cache agressif pour performance
- Désactive React DevTools

---

## 🔧 VARIABLES OPTIONNELLES

### 6. Cloudinary (Images - si utilisé)

```bash
# Nom du cloud Cloudinary
CLOUDINARY_CLOUD_NAME="votre-cloud-name"

# API Key
CLOUDINARY_API_KEY="123456789012345"

# API Secret
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
```

**Obtenir:**
1. [cloudinary.com](https://cloudinary.com) > Dashboard
2. Copier les 3 valeurs depuis **"Account Details"**

**Note:** Cloudinary est utilisé pour les logos d'entreprises.
Si pas configuré, les images peuvent être hébergées directement sur Vercel.

---

### 7. Vercel Blob Storage (Photos de reviews)

```bash
# Token d'accès Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_AbCdEfGh123456_XyZaBcDeFgHiJk"
```

**Obtenir:**
1. Vercel Dashboard > Votre projet > **"Storage"**
2. **"Create Database"** > **"Blob"**
3. Suivre les instructions
4. Copier le token généré

**Alternative:** Si vous n'utilisez pas les photos de reviews, cette variable n'est pas obligatoire.

---

### 8. Google Maps API (Optionnel - si utilisé)

```bash
# Clé API Google Maps (avec restrictions)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567"
```

**Obtenir:**
1. [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** > **Credentials**
3. **Create Credentials** > **API Key**
4. **Restrict key:**
   - API restrictions: Maps JavaScript API, Places API
   - HTTP referrers: `haguenau.pro/*`, `*.vercel.app/*`

**⚠️ Important:**
- Le préfixe `NEXT_PUBLIC_` rend cette variable visible côté client
- **Obligatoire** de restreindre la clé par domaine/API
- Activer la facturation dans Google Cloud (mais Free tier = 200$/mois gratuit)

**Note:** Si pas configuré, la carte sera désactivée.

---

### 9. Google Analytics 4 (Optionnel)

```bash
# Measurement ID Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

**Obtenir:**
1. [Google Analytics](https://analytics.google.com)
2. **Admin** > **Data Streams**
3. Sélectionner votre stream web
4. Copier **"Measurement ID"** (format: G-XXXXXXXXXX)

**Note:** Remplacer pour chaque domaine si vous voulez des analytics séparés.

---

### 10. Monitoring et Logging (Optionnel)

```bash
# Sentry (Error tracking)
SENTRY_DSN="https://public@sentry.io/123456"

# LogRocket (Session replay)
LOGROCKET_APP_ID="app-id/project-name"
```

**Recommandé pour production** mais pas obligatoire au lancement MVP.

---

## ⚙️ CONFIGURATION VERCEL

### Étape 1: Accéder aux environment variables

1. [vercel.com](https://vercel.com) > Votre projet
2. **Settings** > **Environment Variables**

### Étape 2: Ajouter les variables

Pour chaque variable:
1. Cliquer sur **"Add New"**
2. **Name:** (ex: `DATABASE_URL`)
3. **Value:** (coller la valeur)
4. **Environment:**
   - ✅ **Production** (toujours cocher)
   - ✅ **Preview** (optionnel - pour staging)
   - ❌ **Development** (NON - utiliser `.env.local` en local)
5. Cliquer sur **"Save"**

### Étape 3: Liste complète à ajouter

Copier-coller cette checklist et cocher au fur et à mesure:

#### Obligatoires
- [ ] `DATABASE_URL` (Production ✅, Preview ✅)
- [ ] `DIRECT_URL` (Production ✅, Preview ✅)
- [ ] `NEXTAUTH_URL` (Production: https://haguenau.pro)
- [ ] `NEXTAUTH_SECRET` (Production ✅, Preview ✅)
- [ ] `RESEND_API_KEY` (Production ✅, Preview ✅)
- [ ] `RESEND_FROM_EMAIL` (Production ✅, Preview ✅)
- [ ] `RESEND_FROM_NAME` (Production ✅, Preview ✅)
- [ ] `RESEND_REPLY_TO` (Production ✅, Preview ✅)
- [ ] `ADMIN_EMAIL` (Production ✅)
- [ ] `ADMIN_PASSWORD` (Production ✅)
- [ ] `NODE_ENV` (Production: `production`)

#### Optionnelles (selon features utilisées)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `BLOB_READ_WRITE_TOKEN`
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Étape 4: Variables pour Preview (Staging)

Si vous utilisez une database staging séparée:

```bash
# Preview Environment
DATABASE_URL="postgresql://...staging-pooler..."
DIRECT_URL="postgresql://...staging..."
NEXTAUTH_URL="https://your-preview-url.vercel.app"
NEXTAUTH_SECRET="different-secret-for-staging"
ADMIN_EMAIL="staging-admin@haguenau.pro"
ADMIN_PASSWORD="DifferentStagingPassword123!"
```

**Recommandation:** Utiliser la même config en Preview et Production au début.
Séparer seulement si besoin de tests isolés.

---

## 🔒 GÉNÉRATION DE SECRETS SÉCURISÉS

### Script de génération automatique

Créer `scripts/generate-secrets.sh`:

```bash
#!/bin/bash

echo "🔐 Generating secure secrets for production..."
echo ""

# NEXTAUTH_SECRET (64 caractères)
echo "NEXTAUTH_SECRET:"
openssl rand -base64 48
echo ""

# ADMIN_PASSWORD (24 caractères)
echo "ADMIN_PASSWORD:"
openssl rand -base64 24
echo ""

# BUSINESS_OWNER_PASSWORD (si nécessaire)
echo "BUSINESS_OWNER_PASSWORD:"
openssl rand -base64 24
echo ""

echo "✅ Copy these values into your password manager IMMEDIATELY!"
echo "⚠️  NEVER commit these to Git!"
```

Exécuter:
```bash
chmod +x scripts/generate-secrets.sh
./scripts/generate-secrets.sh
```

**Sauvegarder immédiatement** dans 1Password, Bitwarden, ou autre password manager.

---

## 🌍 ENVIRONNEMENTS MULTIPLES

### Structure recommandée

```
┌─────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT                          │
│  - .env.local (gitignored)                  │
│  - SQLite ou PostgreSQL local               │
│  - Resend test mode                         │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  PREVIEW (Vercel)                           │
│  - Vercel env vars (Preview)                │
│  - Neon staging database                    │
│  - Resend Free tier                         │
│  - URL: *.vercel.app                        │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  PRODUCTION (Vercel)                        │
│  - Vercel env vars (Production)             │
│  - Neon production database                 │
│  - Resend Pro                               │
│  - URL: haguenau.pro, saverne.pro, etc.     │
└─────────────────────────────────────────────┘
```

### Fichier .env.local (Development)

Créer `.env.local` à la racine du projet:

```bash
# Database (local PostgreSQL ou Neon dev branch)
DATABASE_URL="postgresql://localhost:5432/mtd_dev"
DIRECT_URL="postgresql://localhost:5432/mtd_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-not-for-production"

# Email (Resend test mode)
RESEND_API_KEY="re_dev_..."
RESEND_FROM_EMAIL="noreply@test.haguenau.pro"
RESEND_FROM_NAME="Haguenau.PRO (Dev)"
RESEND_REPLY_TO="dev@localhost"

# Admin
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="dev123"

# Environment
NODE_ENV="development"
```

**⚠️ S'assurer que `.env.local` est dans `.gitignore`:**
```bash
# .gitignore
.env.local
.env*.local
```

---

## 🛡️ SÉCURITÉ ET BONNES PRATIQUES

### 1. Rotation des secrets

**Planning de rotation:**
```
NEXTAUTH_SECRET: tous les 90 jours
ADMIN_PASSWORD: tous les 30 jours (ou après chaque accès suspect)
RESEND_API_KEY: tous les 180 jours
Database password: tous les 180 jours
```

**Comment faire:**
1. Générer nouveau secret
2. Ajouter dans Vercel avec un nom temporaire (ex: `NEXTAUTH_SECRET_NEW`)
3. Mettre à jour le code pour supporter les deux
4. Déployer
5. Remplacer `NEXTAUTH_SECRET` par `NEXTAUTH_SECRET_NEW`
6. Supprimer `NEXTAUTH_SECRET_NEW`

### 2. Principe du moindre privilège

Pour chaque service, utiliser les permissions minimales:

**Database:**
```sql
-- Créer un user avec permissions limitées (pas de DROP TABLE)
CREATE USER app_user WITH PASSWORD 'secure-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

**Resend API Key:**
- Permissions: **Send Emails only** (pas "Manage Domains")

**Google Maps API:**
- Restrictions: Uniquement les APIs nécessaires (Maps JavaScript API, Places API)
- HTTP referrers: Seulement vos domaines

### 3. Secrets dans le code

**❌ JAMAIS FAIRE:**
```typescript
// BAD
const apiKey = 'hardcoded-secret-123';
const dbUrl = 'postgresql://user:password@host/db';
```

**✅ TOUJOURS FAIRE:**
```typescript
// GOOD
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error('RESEND_API_KEY not set');

// Avec validation (encore mieux)
import { z } from 'zod';

const envSchema = z.object({
  RESEND_API_KEY: z.string().startsWith('re_'),
  DATABASE_URL: z.string().url(),
});

const env = envSchema.parse(process.env);
```

### 4. Validation des variables

Créer `src/lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_'),
  RESEND_FROM_EMAIL: z.string().email(),

  // Admin
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12),

  // Environment
  NODE_ENV: z.enum(['development', 'preview', 'production']),
});

export const env = envSchema.parse(process.env);

// Usage:
// import { env } from '@/lib/env';
// const apiKey = env.RESEND_API_KEY; // Type-safe!
```

**Ajouter dans `src/app/layout.tsx`:**
```typescript
import '@/lib/env'; // Valide les env vars au démarrage
```

Si une variable manque ou est invalide, l'application refusera de démarrer.

---

## 🧪 VALIDATION ET TESTS

### Test 1: Vérifier les variables en production

Créer `src/app/api/health/env/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  // ⚠️ Ne jamais exposer les vraies valeurs!
  // Seulement vérifier leur présence

  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'RESEND_API_KEY',
    'ADMIN_EMAIL',
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        status: 'error',
        missing,
        message: 'Required environment variables are missing',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: 'ok',
    message: 'All required environment variables are set',
    env: process.env.NODE_ENV,
  });
}
```

**Tester:**
```bash
curl https://haguenau.pro/api/health/env

# Réponse attendue:
# {"status":"ok","message":"All required...","env":"production"}
```

**⚠️ IMPORTANT:** Supprimer cette route après vérification (sécurité).

### Test 2: Vérifier la connexion database

```bash
# Depuis Vercel CLI
vercel env pull .env.production
npx prisma db execute --stdin <<< "SELECT 1"

# Devrait retourner: 1
```

### Test 3: Tester l'envoi d'email

Créer un email de test depuis l'interface admin après déploiement.

### Test 4: Vérifier l'authentification

1. Aller sur https://haguenau.pro/admin/login
2. Utiliser `ADMIN_EMAIL` et `ADMIN_PASSWORD`
3. Devrait se connecter sans erreur

---

## 🐛 TROUBLESHOOTING

### Erreur: "Environment variable not found"

**Cause:** Variable pas définie ou mal nommée

**Solution:**
```bash
# Vérifier dans Vercel
# Settings > Environment Variables
# Chercher la variable manquante

# Vérifier le nom exact (case-sensitive!)
DATABASE_URL ≠ database_url ≠ Database_Url
```

### Erreur: "Invalid database URL"

**Cause:** Format de `DATABASE_URL` incorrect

**Solution:**
```bash
# Vérifier le format:
postgresql://username:password@host:port/database?options

# Vérifier:
# - Pas d'espace dans le password
# - ?sslmode=require à la fin
# - Utiliser la pooled URL (-pooler) pour DATABASE_URL
```

### Erreur: "NEXTAUTH_SECRET too short"

**Cause:** Secret moins de 32 caractères

**Solution:**
```bash
# Générer un nouveau secret de 48+ caractères
openssl rand -base64 48

# Mettre à jour dans Vercel
```

### Variables non prises en compte après update

**Cause:** Cache Vercel ou redéploiement nécessaire

**Solution:**
```bash
# 1. Redéployer manuellement
# Vercel Dashboard > Deployments > Redeploy

# 2. Ou via CLI
vercel --prod

# 3. Ou commit vide
git commit --allow-empty -m "redeploy"
git push
```

### Variables `NEXT_PUBLIC_*` non disponibles côté client

**Cause:** Variables ajoutées après le build

**Solution:**
```bash
# Les variables NEXT_PUBLIC_* sont injectées au BUILD time
# Pas au RUNTIME

# Donc: Chaque fois qu'on modifie une NEXT_PUBLIC_* variable,
# il FAUT redéployer

# Vercel redéploie automatiquement si variable changée,
# mais vérifier dans Deployments > Logs
```

---

## ✅ CHECKLIST FINALE

Avant de considérer la configuration terminée:

### Variables obligatoires
- [ ] `DATABASE_URL` configurée (pooled connection)
- [ ] `DIRECT_URL` configurée (direct connection)
- [ ] `NEXTAUTH_URL` = https://haguenau.pro (ou votre domaine)
- [ ] `NEXTAUTH_SECRET` généré (48+ caractères)
- [ ] `RESEND_API_KEY` configurée
- [ ] `RESEND_FROM_EMAIL` = domaine vérifié
- [ ] `ADMIN_EMAIL` = email réel (pas test@test.com)
- [ ] `ADMIN_PASSWORD` = mot de passe fort (16+ caractères)
- [ ] `NODE_ENV` = production

### Sécurité
- [ ] Tous les secrets stockés dans password manager
- [ ] Aucun secret dans Git (vérifier avec `git log -p`)
- [ ] `.env.local` dans `.gitignore`
- [ ] Secrets différents entre dev et production
- [ ] Planning de rotation des secrets défini

### Validation
- [ ] Route `/api/health/env` retourne "ok"
- [ ] Database connection fonctionne (Prisma Studio)
- [ ] Email test envoyé et reçu
- [ ] Login admin fonctionne
- [ ] Google Maps affiche (si configuré)
- [ ] Analytics tracking fonctionne (si configuré)

### Documentation
- [ ] Liste des variables documentée dans README
- [ ] Procédure de rotation documentée
- [ ] Accès password manager partagé avec l'équipe
- [ ] Contacts d'urgence définis (si leak)

---

## 📚 RESSOURCES

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Security Best Practices](https://vercel.com/docs/security/security-best-practices)
- [Zod Validation](https://zod.dev)
- [OpenSSL Random Generation](https://www.openssl.org/docs/man1.1.1/man1/rand.html)

---

## 📄 TEMPLATE `.env.production`

**⚠️ NE PAS COMMIT CE FICHIER!**

Créer `.env.production.template` (pour documentation):

```bash
# =================================
# PRODUCTION ENVIRONMENT VARIABLES
# =================================
# Copy this file to .env.production and fill in the values
# NEVER commit .env.production to Git!

# Database (Neon)
DATABASE_URL="postgresql://username:password@endpoint-pooler.region.aws.neon.tech/dbname?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://username:password@endpoint.region.aws.neon.tech/dbname?sslmode=require"

# Authentication (NextAuth)
NEXTAUTH_URL="https://haguenau.pro"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-48"

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@haguenau.pro"
RESEND_FROM_NAME="Haguenau.PRO"
RESEND_REPLY_TO="contact@haguenau.pro"

# Admin Credentials
ADMIN_EMAIL="your-email@domain.com"
ADMIN_PASSWORD="generate-with-openssl-rand-base64-24"

# Environment
NODE_ENV="production"

# Optional: Cloudinary (Images)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Optional: Vercel Blob (Review photos)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Optional: Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSy..."

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

Ajouter dans `.gitignore`:
```bash
.env.production
.env*.local
```

---

**Prochaine étape:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**Date de création:** 16 Octobre 2025
**Dernière mise à jour:** 16 Octobre 2025
**Auteur:** Claude AI via NETZ Team
