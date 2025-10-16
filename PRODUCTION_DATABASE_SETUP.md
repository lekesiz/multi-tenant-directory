# 🗄️ PRODUCTION DATABASE SETUP GUIDE

**Project:** Multi-Tenant Directory Platform
**Database Provider:** Neon.tech (Recommended)
**Alternative:** Supabase
**Created:** 16 Octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Pourquoi Neon.tech?](#pourquoi-neontech)
2. [Étape 1: Créer un compte Neon](#étape-1-créer-un-compte-neon)
3. [Étape 2: Créer le projet et la database](#étape-2-créer-le-projet-et-la-database)
4. [Étape 3: Configurer les environnements](#étape-3-configurer-les-environnements)
5. [Étape 4: Migrer le schéma Prisma](#étape-4-migrer-le-schéma-prisma)
6. [Étape 5: Seed data production](#étape-5-seed-data-production)
7. [Étape 6: Connexion sécurisée](#étape-6-connexion-sécurisée)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 POURQUOI NEON.TECH?

### Avantages
✅ **Serverless PostgreSQL** - Pas de serveur à gérer
✅ **Branching** - Database branches comme Git
✅ **Auto-scaling** - S'adapte automatiquement à la charge
✅ **Free tier généreux** - 0.5 GB storage, 3 GB de transfert/mois
✅ **Compatible Prisma** - Support natif
✅ **Backup automatique** - Point-in-time recovery
✅ **Multi-région** - Latence optimale

### Pricing (au 16 octobre 2025)
- **Free Tier:** 0€/mois - 1 projet, 10 branches, 0.5 GB storage
- **Pro:** 19$/mois - Projets illimités, 200 GB storage
- **Scale:** Custom pricing

**Recommandation:** Commencer avec Free Tier, upgrader à Pro si >10k visites/mois

---

## 🚀 ÉTAPE 1: CRÉER UN COMPTE NEON

### 1.1 Inscription
1. Aller sur [https://neon.tech](https://neon.tech)
2. Cliquer sur **"Sign Up"**
3. Choisir l'authentification:
   - GitHub (Recommandé - lié au repository)
   - Google
   - Email

### 1.2 Vérification
1. Vérifier l'email si nécessaire
2. Compléter le profil:
   - Nom de l'organisation: `haguenau-pro` ou `multi-tenant-directory`
   - Use case: `Web Application`
   - Team size: `1-10`

---

## 🗂️ ÉTAPE 2: CRÉER LE PROJET ET LA DATABASE

### 2.1 Créer le projet
1. Dashboard Neon > **"Create a project"**
2. Configurer:
   ```
   Project name: multi-tenant-directory-prod
   Database name: mtd_production
   PostgreSQL version: 16 (Latest)
   Region: Europe (Frankfurt) - pour latence optimale FR/DE
   ```

3. **IMPORTANT:** Sauvegarder immédiatement:
   - **Database URL** (avec password)
   - **Connection pooling URL** (recommandé pour Vercel)

   Exemple:
   ```
   # Direct connection
   postgresql://neondb_owner:AbCd1234XyZ@ep-cool-name-123456.eu-central-1.aws.neon.tech/mtd_production?sslmode=require

   # Pooled connection (Prisma)
   postgresql://neondb_owner:AbCd1234XyZ@ep-cool-name-123456-pooler.eu-central-1.aws.neon.tech/mtd_production?sslmode=require&pgbouncer=true
   ```

### 2.2 Créer les branches (Optionnel mais recommandé)
Neon permet de créer des "branches" de database comme Git:

```bash
# Production branch (main)
main → mtd_production

# Staging branch (pour tester avant prod)
staging → mtd_production_staging

# Development branch (pour dev local)
dev → mtd_production_dev
```

**Comment créer une branch:**
1. Dashboard > Votre projet > **"Branches"**
2. **"Create branch"**
3. Nom: `staging` ou `dev`
4. Parent: `main`
5. Copier la nouvelle DATABASE_URL

---

## ⚙️ ÉTAPE 3: CONFIGURER LES ENVIRONNEMENTS

### 3.1 Variables d'environnement Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Sélectionner votre projet: `multi-tenant-directory`
3. **Settings** > **Environment Variables**

4. Ajouter les variables suivantes:

#### **Production Environment**
```bash
# Database (Pooled connection)
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ENDPOINT-pooler.eu-central-1.aws.neon.tech/mtd_production?sslmode=require&pgbouncer=true"

# Direct connection (pour migrations)
DIRECT_URL="postgresql://neondb_owner:PASSWORD@ENDPOINT.eu-central-1.aws.neon.tech/mtd_production?sslmode=require"

# Environment
NODE_ENV="production"
```

**Important:**
- Sélectionner **"Production"** dans "Environment"
- Cocher **"Encrypt"** (recommandé)

#### **Preview Environment** (Optionnel - pour staging)
```bash
DATABASE_URL="postgresql://...staging..."
DIRECT_URL="postgresql://...staging..."
NODE_ENV="preview"
```

#### **Development Environment** (Local)
Garder `.env.local` avec database locale ou dev branch:
```bash
DATABASE_URL="postgresql://...dev..."
NODE_ENV="development"
```

### 3.2 Vérifier les autres variables
Assurez-vous que toutes les variables sont configurées:

```bash
# Auth (déjà configuré normalement)
NEXTAUTH_URL="https://haguenau.pro"
NEXTAUTH_SECRET="your-secret-here"

# Google Maps (à ajouter si pas fait)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key-here"

# Cloudinary (images)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Vercel Blob (review photos)
BLOB_READ_WRITE_TOKEN="vercel_blob_token"

# Email (sera configuré dans RESEND_EMAIL_SETUP.md)
RESEND_API_KEY="re_..."

# Admin credentials (CHANGER EN PRODUCTION!)
ADMIN_EMAIL="admin@haguenau.pro"
ADMIN_PASSWORD="ChangeMeInProduction123!"
```

---

## 🔧 ÉTAPE 4: MIGRER LE SCHÉMA PRISMA

### 4.1 Configuration locale

1. **Installer Prisma CLI** (si pas déjà fait):
```bash
npm install -D prisma
```

2. **Vérifier prisma/schema.prisma**:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 4.2 Appliquer les migrations

**Option A: Via Vercel (Recommandé pour production)**

1. Créer un fichier `scripts/migrate-production.sh`:
```bash
#!/bin/bash
# Production migration script

echo "🚀 Starting production migration..."

# Set production database URL
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."

# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

echo "✅ Migration completed!"
```

2. Rendre exécutable:
```bash
chmod +x scripts/migrate-production.sh
```

3. Exécuter depuis votre machine locale:
```bash
# ATTENTION: Tester d'abord sur staging!
./scripts/migrate-production.sh
```

**Option B: Via Vercel CLI**

1. Installer Vercel CLI:
```bash
npm i -g vercel
vercel login
```

2. Lier le projet:
```bash
vercel link
```

3. Exécuter la migration:
```bash
vercel env pull .env.production
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

**Option C: Automatique au build (Pas recommandé pour prod)**

Ajouter dans `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

⚠️ **Attention:** Cela exécutera les migrations à chaque build, ce qui peut être risqué.

### 4.3 Vérifier les migrations

1. Connecter à Neon Dashboard
2. **SQL Editor**
3. Exécuter:
```sql
-- Vérifier les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Vérifier les migrations appliquées
SELECT * FROM "_prisma_migrations"
ORDER BY finished_at DESC
LIMIT 10;
```

Vous devriez voir:
```
✅ Domain
✅ Company
✅ CompanyContent
✅ Review
✅ Admin
✅ BusinessOwner
✅ CompanyOwnership
✅ CompanyAnalytics
✅ _prisma_migrations
```

---

## 🌱 ÉTAPE 5: SEED DATA PRODUCTION

### 5.1 Préparer le seed script

Le fichier `prisma/seed.ts` est déjà prêt avec:
- 12 domaines (haguenau.pro, saverne.pro, etc.)
- 10 entreprises réalistes pour Haguenau
- Settings SEO pour chaque domaine
- Comptes admin et business owner de test

### 5.2 Configurer les données de production

**Modifier `prisma/seed.ts` pour production:**

```typescript
// PRODUCTION: Changer les credentials admin
const adminEmail = process.env.ADMIN_EMAIL || 'admin@haguenau.pro';
const adminPassword = process.env.ADMIN_PASSWORD || 'VotreMotDePasseFort2025!';

// PRODUCTION: Changer le business owner test
const businessEmail = process.env.BUSINESS_EMAIL || 'mikail@lekesiz.org';
const businessPassword = process.env.BUSINESS_PASSWORD || 'VotreAutreMotDePasse2025!';
```

### 5.3 Exécuter le seed

**Option A: Depuis local vers production** (Recommandé)

```bash
# 1. Exporter les variables de production
export DATABASE_URL="postgresql://neondb_owner:PASSWORD@..."
export ADMIN_EMAIL="admin@haguenau.pro"
export ADMIN_PASSWORD="VotreMotDePasseSécurisé2025!"

# 2. Exécuter le seed
npx prisma db seed

# 3. Vérifier
npx prisma studio
```

**Option B: Via script personnalisé**

Créer `scripts/seed-production.sh`:
```bash
#!/bin/bash
echo "🌱 Seeding production database..."

# Load production env
export DATABASE_URL="postgresql://..."
export ADMIN_EMAIL="admin@haguenau.pro"
export ADMIN_PASSWORD="SecurePassword2025!"

# Run seed
npx tsx prisma/seed.ts

echo "✅ Seed completed!"
```

### 5.4 Vérifier les données

SQL Editor dans Neon:
```sql
-- Vérifier les domaines
SELECT name, "isActive", "siteTitle"
FROM "Domain"
ORDER BY name;

-- Vérifier les entreprises
SELECT name, city, "postalCode", rating, "reviewCount"
FROM "Company"
ORDER BY city, name;

-- Vérifier l'admin
SELECT email, role, "createdAt"
FROM "Admin";

-- Vérifier les business owners
SELECT email, "companyName", "createdAt"
FROM "BusinessOwner";
```

Résultat attendu:
```
✅ 12 domaines actifs
✅ 10+ entreprises (Haguenau + autres villes)
✅ 1 compte admin
✅ 1+ business owner(s)
```

---

## 🔒 ÉTAPE 6: CONNEXION SÉCURISÉE

### 6.1 IP Whitelisting (Optionnel)

Neon permet de restreindre l'accès par IP:

1. Dashboard > Projet > **"Settings"**
2. **"IP Allow"**
3. Ajouter les IPs autorisées:
   ```
   Vercel IP ranges (auto-détecté)
   Votre IP bureau: 203.0.113.1
   Votre IP maison: 198.51.100.1
   ```

### 6.2 SSL/TLS

**Déjà activé par défaut** avec `?sslmode=require` dans la connection string.

Vérifier dans `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 6.3 Connection Pooling

**PgBouncer est déjà activé** avec la pooled connection URL.

Avantages:
- ✅ Gère mieux les connexions serverless
- ✅ Évite "too many connections"
- ✅ Performance optimale

Configuration dans URL:
```
?pgbouncer=true&connection_limit=10
```

### 6.4 Rotation des mots de passe

**Recommandation:** Changer le password database tous les 90 jours.

1. Neon Dashboard > Projet > **"Settings"**
2. **"Reset password"**
3. Copier le nouveau password
4. Mettre à jour `DATABASE_URL` dans Vercel
5. Redéployer l'application

---

## 🐛 TROUBLESHOOTING

### Erreur: "P1001: Can't reach database server"

**Causes possibles:**
1. URL de connexion incorrecte
2. Firewall bloque la connexion
3. Database suspendue (inactivité sur Free tier)

**Solutions:**
```bash
# Tester la connexion
npx prisma db execute --stdin <<< "SELECT 1"

# Vérifier l'URL
echo $DATABASE_URL

# Wake up database (Free tier)
# Aller sur Neon Dashboard, la database se réveille automatiquement
```

### Erreur: "P1017: Server has closed the connection"

**Cause:** Pas de connection pooling activé

**Solution:**
```bash
# Utiliser la pooled URL (avec -pooler)
DATABASE_URL="postgresql://...@endpoint-pooler.../db?pgbouncer=true"
```

### Erreur: "Too many connections"

**Cause:** Dépassement du nombre de connexions simultanées

**Solutions:**
1. Utiliser connection pooling (pooled URL)
2. Réduire `connection_limit` dans Prisma:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Limite à 10 connexions par instance
}
```

3. Upgrader vers Neon Pro (plus de connexions)

### Migration échoue: "Migration already applied"

**Solution:**
```bash
# Réinitialiser l'historique des migrations (DANGER!)
npx prisma migrate resolve --applied "migration-name"

# Ou créer une nouvelle migration
npx prisma migrate dev --create-only
```

### Seed échoue: "Unique constraint violation"

**Cause:** Données déjà existantes (seed déjà exécuté)

**Solutions:**
```bash
# Option 1: Reset complet (SUPPRIME TOUTES LES DONNÉES!)
npx prisma migrate reset

# Option 2: Modifier seed.ts pour utiliser upsert
# (Déjà implémenté dans votre seed.ts avec upsert)
```

---

## 📊 MONITORING ET MAINTENANCE

### Métriques Neon à surveiller

Dashboard > Projet > **"Monitoring"**:

1. **Connections:** < 80% de la limite
2. **Storage:** < 80% du quota (500 MB sur Free)
3. **Compute time:** < limite mensuelle
4. **Query performance:** < 100ms moyenne

### Backup

**Automatique sur Neon:**
- Point-in-time recovery: 7 jours (Free), 30 jours (Pro)
- Branching: Créer une branch = backup instantané

**Manuel:**
```bash
# Export SQL
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Ou via Neon CLI
neon branches create --name backup-$(date +%Y%m%d)
```

### Scaling

**Quand upgrader vers Pro?**
- ❌ Free tier: 0.5 GB storage, 3 GB transfert/mois
- ✅ Pro: 200 GB storage, 20 GB transfert/mois
- ✅ Besoin de >10 branches (staging, dev, feature branches)
- ✅ Besoin de >1 projet

**Coût estimé:**
```
Free tier: 0€/mois - OK jusqu'à ~5k visites/mois
Pro: 19$/mois - OK jusqu'à ~100k visites/mois
Scale: 69$/mois+ - >100k visites/mois
```

---

## ✅ CHECKLIST FINALE

Avant de passer en production:

- [ ] Compte Neon créé et vérifié
- [ ] Projet production créé (région EU)
- [ ] Database URL copiée et sécurisée (password manager)
- [ ] Variables Vercel configurées (DATABASE_URL + DIRECT_URL)
- [ ] Migrations appliquées avec succès
- [ ] Seed data exécuté et vérifié (12 domaines, 10+ entreprises)
- [ ] Credentials admin changés (pas les valeurs par défaut!)
- [ ] Connexion testée depuis Vercel
- [ ] SSL/TLS activé (sslmode=require)
- [ ] Connection pooling activé (pgbouncer=true)
- [ ] Backup automatique vérifié (branches Neon)
- [ ] Monitoring configuré (alertes si >80% quota)

---

## 📚 RESSOURCES

- [Neon Documentation](https://neon.tech/docs)
- [Prisma + Neon Guide](https://www.prisma.io/docs/guides/database/neon)
- [Vercel + Neon Integration](https://vercel.com/integrations/neon)
- [Neon Status Page](https://neonstatus.com/)

---

**Prochaine étape:** [RESEND_EMAIL_SETUP.md](./RESEND_EMAIL_SETUP.md)

**Date de création:** 16 Octobre 2025
**Dernière mise à jour:** 16 Octobre 2025
**Auteur:** Claude AI via NETZ Team
