# ✅ DEPLOYMENT CHECKLIST & TESTING GUIDE

**Project:** Multi-Tenant Directory Platform
**Target:** Production Launch (MVP v1.0)
**Platform:** Vercel + Neon + Resend
**Created:** 16 Octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Steps](#deployment-steps)
3. [Post-Deployment Validation](#post-deployment-validation)
4. [Smoke Tests](#smoke-tests)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Rollback Procedure](#rollback-procedure)
8. [Monitoring Setup](#monitoring-setup)

---

## 🎯 OBJECTIF

**MVP v1.0 - Production Ready**

Ce checklist garantit que votre application est prête pour la production avec:
- ✅ 98% de fonctionnalités complètes
- ✅ Infrastructure sécurisée
- ✅ Performance optimale
- ✅ Monitoring actif
- ✅ Plan de rollback défini

**Durée estimée:** 4-6 heures (première fois), 1-2 heures (déploiements suivants)

---

## 📝 PRE-DEPLOYMENT CHECKLIST

### 1. Code Quality & Tests

#### Build local
- [ ] `npm run build` réussit sans erreur
- [ ] `npm run type-check` réussit (0 TypeScript errors)
- [ ] `npm run lint` réussit (0 ESLint errors)
- [ ] `npm run format:check` réussit (code formaté)

**Commandes:**
```bash
# Build complet
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format check
npm run format:check
```

#### Tests (si configurés)
- [ ] `npm test` réussit (100% pass)
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent (si configurés)

### 2. Database

#### Schema Prisma
- [ ] Schema à jour (`prisma/schema.prisma`)
- [ ] Migrations créées pour toutes les modifications
- [ ] Seed data préparé (`prisma/seed.ts`)
- [ ] Pas de TODO dans le schema

**Vérification:**
```bash
# Vérifier le schema
npx prisma validate

# Lister les migrations
ls -la prisma/migrations/

# Test du seed localement
npx prisma db seed
```

#### Production Database (Neon)
- [ ] Projet Neon créé (région EU)
- [ ] Database `mtd_production` créée
- [ ] Connection pooling activé
- [ ] DATABASE_URL et DIRECT_URL copiées
- [ ] Backup automatique vérifié (Point-in-time recovery)

### 3. Environment Variables

#### Variables obligatoires configurées dans Vercel
- [ ] `DATABASE_URL` (pooled connection)
- [ ] `DIRECT_URL` (direct connection)
- [ ] `NEXTAUTH_URL` (https://haguenau.pro)
- [ ] `NEXTAUTH_SECRET` (48+ caractères)
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `RESEND_FROM_NAME`
- [ ] `RESEND_REPLY_TO`
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PASSWORD` (16+ caractères)
- [ ] `NODE_ENV=production`

#### Variables optionnelles (selon features)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `BLOB_READ_WRITE_TOKEN`
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`

**Vérification:**
```bash
# Vérifier dans Vercel
# Settings > Environment Variables
# Filtrer par "Production"
# Compter: minimum 11 variables obligatoires
```

### 4. Email Service (Resend)

- [ ] Compte Resend créé
- [ ] Domaine `haguenau.pro` ajouté et vérifié
- [ ] DNS records configurés (SPF, DKIM, DMARC)
- [ ] API Key créée et stockée dans Vercel
- [ ] Test email envoyé et reçu
- [ ] Email pas dans spam (score >8/10 sur mail-tester.com)

**Test:**
```bash
# Tester l'envoi depuis local avec production API key
export RESEND_API_KEY="re_..."
npx tsx scripts/test-email.ts
```

### 5. Domains & DNS

#### Domaines achetés
- [ ] `haguenau.pro` acheté (priorité 1)
- [ ] `strasbourg.pro` acheté (optionnel Phase 1)
- [ ] Autres domaines achetés selon roadmap

#### DNS Configuration
- [ ] CNAME ou A record configuré pour chaque domaine
- [ ] WWW CNAME configuré (redirection)
- [ ] DNS propagé (vérifier avec dnschecker.org)
- [ ] TTL configuré (3600 ou Auto)

#### Vercel
- [ ] Tous les domaines ajoutés dans Vercel > Settings > Domains
- [ ] Status "Valid Configuration" pour chaque domaine
- [ ] SSL certificates générés (Let's Encrypt)
- [ ] HTTPS actif (cadenas vert 🔒)

**Vérification:**
```bash
# Pour chaque domaine
dig haguenau.pro CNAME +short
# Doit retourner: cname.vercel-dns.com

curl -I https://haguenau.pro
# Doit retourner: HTTP/2 200
```

### 6. Security

#### Secrets
- [ ] `NEXTAUTH_SECRET` unique et fort (≠ dev)
- [ ] `ADMIN_PASSWORD` unique et fort (≠ dev)
- [ ] Tous les secrets stockés dans password manager
- [ ] Aucun secret dans Git (`git log -p | grep -i password`)

#### Headers
- [ ] Security headers configurés (`next.config.ts`)
- [ ] CORS configuré correctement
- [ ] CSP (Content Security Policy) configuré

**Vérification:**
```bash
# Tester les headers
curl -I https://haguenau.pro | grep -i "x-frame-options\|x-content-type-options\|strict-transport-security"
```

#### Rate Limiting
- [ ] Rate limiting activé sur les API routes sensibles
- [ ] CAPTCHA configuré (si applicable)
- [ ] Brute force protection sur login

### 7. SEO

- [ ] `robots.txt` configuré (`public/robots.txt`)
- [ ] Sitemap généré (`/sitemap.xml`)
- [ ] Meta tags pour chaque page
- [ ] Open Graph images configurées
- [ ] Structured data (Schema.org) ajouté
- [ ] Google Search Console prêt à être configuré

**Vérification:**
```bash
curl https://haguenau.pro/robots.txt
curl https://haguenau.pro/sitemap.xml

# View source de la homepage et chercher:
# <meta property="og:image" ...>
# <script type="application/ld+json">
```

### 8. Performance

- [ ] Images optimisées (WebP/AVIF)
- [ ] Lazy loading activé
- [ ] Code splitting configuré
- [ ] Fonts optimisés (next/font)
- [ ] Cache headers configurés

**Vérification locale:**
```bash
# Build et analyser
npm run build

# Vérifier les bundle sizes
# .next/server/app/*.js ne doit pas dépasser 500KB par route
```

### 9. Monitoring & Logging

- [ ] Vercel Analytics configuré (ou alternatif)
- [ ] Error tracking configuré (Sentry, LogRocket, ou logs Vercel)
- [ ] Uptime monitoring configuré (UptimeRobot, Better Uptime)
- [ ] Alertes configurées (email/SMS si site down)

### 10. Documentation

- [ ] README.md à jour
- [ ] PRODUCTION_DATABASE_SETUP.md créé
- [ ] RESEND_EMAIL_SETUP.md créé
- [ ] DOMAIN_DEPLOYMENT_DNS_SETUP.md créé
- [ ] PRODUCTION_ENVIRONMENT_VARIABLES.md créé
- [ ] DEPLOYMENT_CHECKLIST.md (ce fichier) créé

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Database Migration

**⚠️ ATTENTION: Étape critique - faire un backup avant!**

#### 1.1 Backup de la production (si déjà en prod)
```bash
# Exporter la database actuelle
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Ou créer une Neon branch
# Dashboard Neon > Branches > Create branch > "backup-pre-migration"
```

#### 1.2 Appliquer les migrations
```bash
# Définir les variables d'environnement
export DATABASE_URL="postgresql://...production-pooler..."
export DIRECT_URL="postgresql://...production..."

# Vérifier les migrations à appliquer
npx prisma migrate status

# Appliquer les migrations
npx prisma migrate deploy

# Vérifier que toutes les migrations sont appliquées
npx prisma migrate status
# Doit afficher: "Database schema is up to date!"
```

#### 1.3 Seed la production (première fois uniquement)
```bash
# Définir les credentials admin
export ADMIN_EMAIL="your-real-email@domain.com"
export ADMIN_PASSWORD="$(openssl rand -base64 24)"

# Sauvegarder le password généré!
echo "ADMIN_PASSWORD: $ADMIN_PASSWORD" >> ~/admin-credentials-prod.txt

# Exécuter le seed
npx prisma db seed

# Vérifier les données
npx prisma studio
# Vérifier: 12 domaines, 10+ entreprises, 1 admin
```

### Step 2: Deploy to Vercel

#### 2.1 Via Git Push (Recommandé)
```bash
# S'assurer que tout est commité
git status
# Doit être clean

# Créer un tag de version
git tag -a v1.0.0 -m "Production release MVP v1.0"

# Push avec tags
git push origin main --tags

# Vercel déploie automatiquement
# Suivre le déploiement sur vercel.com > Deployments
```

#### 2.2 Via Vercel CLI (Alternatif)
```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy en production
vercel --prod

# Suivre les logs
vercel logs --follow
```

#### 2.3 Vérifier le déploiement
1. Aller sur [vercel.com](https://vercel.com) > Votre projet
2. **Deployments** > Le déploiement le plus récent
3. Vérifier:
   - ✅ Status: **Ready**
   - ✅ Duration: <2 minutes
   - ✅ Domains: Tous les domaines listés
   - ✅ No errors dans les logs

### Step 3: DNS & SSL Activation

#### 3.1 Vérifier la propagation DNS (10-30 min)
```bash
# Pour chaque domaine
dig haguenau.pro +short
# Doit retourner une IP Vercel ou cname.vercel-dns.com

# Tester depuis différents serveurs DNS
nslookup haguenau.pro 8.8.8.8  # Google DNS
nslookup haguenau.pro 1.1.1.1  # Cloudflare DNS
```

#### 3.2 Attendre les certificats SSL (5-15 min)
```bash
# Vérifier dans Vercel
# Settings > Domains
# Chaque domaine doit être ✅ Valid Configuration

# Tester SSL
curl -I https://haguenau.pro
# Doit retourner: HTTP/2 200

# Vérifier le certificat
openssl s_client -connect haguenau.pro:443 < /dev/null 2>/dev/null | grep "Verify return code"
# Doit retourner: Verify return code: 0 (ok)
```

### Step 4: Post-Deployment Configuration

#### 4.1 Créer le compte admin
1. Ouvrir https://haguenau.pro/admin/login
2. Se connecter avec `ADMIN_EMAIL` et `ADMIN_PASSWORD`
3. ✅ Devrait fonctionner
4. ⚠️ Changer le password immédiatement dans le profil

#### 4.2 Configurer Google Search Console
1. Aller sur [Google Search Console](https://search.google.com/search-console)
2. **Add Property** > `haguenau.pro`
3. Vérification: Méthode DNS (TXT record)
4. Soumettre le sitemap: `https://haguenau.pro/sitemap.xml`
5. Répéter pour chaque domaine

#### 4.3 Configurer Google Analytics (si applicable)
1. Créer une propriété GA4 pour chaque domaine
2. Copier les Measurement IDs
3. Ajouter dans Vercel env vars (si un ID par domaine)
4. Ou configurer dynamiquement dans le code

---

## ✅ POST-DEPLOYMENT VALIDATION

### 1. Smoke Tests (Critical Path)

**Durée:** 10-15 minutes

#### Test 1.1: Homepage Loading
```bash
# Vérifier chaque domaine
for domain in haguenau.pro saverne.pro; do
  echo "Testing $domain..."
  curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://$domain
done

# Attendu:
# HTTP 200 | Time: <2s
```

#### Test 1.2: Database Connection
```bash
# Tester via API health endpoint (créer si nécessaire)
curl https://haguenau.pro/api/health

# Attendu: {"status":"ok","database":"connected"}
```

#### Test 1.3: Admin Login
1. ✅ https://haguenau.pro/admin/login charge
2. ✅ Login avec credentials fonctionne
3. ✅ Dashboard affiche correctement
4. ✅ Pas d'erreur console (F12)

#### Test 1.4: Public Pages
1. ✅ https://haguenau.pro (homepage)
2. ✅ https://haguenau.pro/companies (liste entreprises)
3. ✅ https://haguenau.pro/companies/[slug] (page entreprise)
4. ✅ https://haguenau.pro/contact (formulaire)

#### Test 1.5: Email Sending
1. Soumettre le formulaire de contact
2. ✅ Message de succès affiché
3. ✅ Email reçu dans inbox
4. ✅ Email pas dans spam

### 2. Functional Tests (Feature Validation)

**Durée:** 30-45 minutes

#### Test 2.1: Multi-Tenant
- [ ] haguenau.pro affiche entreprises de Haguenau uniquement
- [ ] saverne.pro affiche entreprises de Saverne uniquement
- [ ] Logo/couleurs différents par domaine
- [ ] SEO meta tags uniques par domaine

#### Test 2.2: Company Listing
- [ ] Liste des entreprises s'affiche
- [ ] Filtres fonctionnent (catégorie, ville, etc.)
- [ ] Recherche fonctionne
- [ ] Pagination fonctionne
- [ ] Cartes (si Google Maps configuré)

#### Test 2.3: Company Detail Page
- [ ] Page entreprise s'affiche
- [ ] Informations complètes visibles
- [ ] Boutons d'action fonctionnent (tel, site web, directions)
- [ ] Analytics trackées (vérifier dans DB après clic)

#### Test 2.4: Reviews
- [ ] Formulaire de soumission d'avis fonctionne
- [ ] Upload de photos fonctionne (max 5)
- [ ] Avis en attente de modération (isApproved=false)
- [ ] Admin peut approuver/rejeter
- [ ] Rating recalculé après approbation

#### Test 2.5: Business Owner Dashboard
- [ ] Inscription business owner fonctionne
- [ ] Login fonctionne
- [ ] Dashboard affiche analytics
- [ ] Graphiques affichent les données
- [ ] Peut répondre aux avis

#### Test 2.6: Advanced Search
- [ ] Recherche par catégorie
- [ ] Recherche par localisation (si maps configuré)
- [ ] Filtrage par rating minimum
- [ ] Filtrage "ouvert maintenant" (si hours configurées)
- [ ] Tri par distance/rating/nom

### 3. Cross-Browser Testing

**Durée:** 15 minutes

- [ ] **Chrome** (latest): Tout fonctionne
- [ ] **Firefox** (latest): Tout fonctionne
- [ ] **Safari** (latest): Tout fonctionne
- [ ] **Edge** (latest): Tout fonctionne
- [ ] **Mobile Chrome** (Android): Responsive OK
- [ ] **Mobile Safari** (iOS): Responsive OK

**Outil:** [BrowserStack](https://www.browserstack.com/) ou test manuel

### 4. Responsive Design Testing

**Durée:** 10 minutes

- [ ] **Mobile** (375px): Layout OK, navigation OK
- [ ] **Tablet** (768px): Layout OK, navigation OK
- [ ] **Desktop** (1920px): Layout OK
- [ ] **4K** (3840px): Layout OK, pas de stretch

**Test avec Chrome DevTools:**
```
F12 > Toggle device toolbar (Ctrl+Shift+M)
Tester: iPhone 12 Pro, iPad Air, Desktop HD, 4K
```

---

## 📊 PERFORMANCE TESTING

### 1. PageSpeed Insights

**Objectif:** Score >90 dans toutes les catégories

```bash
# Tester avec Lighthouse CLI
npx lighthouse https://haguenau.pro --view

# Ou utiliser: https://pagespeed.web.dev
```

**Attendu:**
- ✅ **Performance:** >90/100
- ✅ **Accessibility:** >95/100
- ✅ **Best Practices:** >95/100
- ✅ **SEO:** >95/100

**Core Web Vitals:**
- ✅ LCP (Largest Contentful Paint): <2.5s
- ✅ FID (First Input Delay): <100ms
- ✅ CLS (Cumulative Layout Shift): <0.1

### 2. Load Testing

**Outil:** [k6](https://k6.io/) ou [Artillery](https://www.artillery.io/)

```bash
# Installer k6
brew install k6  # macOS
# ou télécharger depuis k6.io

# Créer scripts/load-test.js
```

**Script de load test:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 10 },   // Stay at 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const res = http.get('https://haguenau.pro');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
```

**Exécuter:**
```bash
k6 run scripts/load-test.js

# Attendu:
# ✅ >95% requests succeed (HTTP 200)
# ✅ Average response time <2s
# ✅ p95 response time <3s
```

### 3. Database Performance

```sql
-- Connecter à Neon avec psql ou Prisma Studio

-- Vérifier les slow queries
SELECT * FROM "_prisma_migrations"
ORDER BY finished_at DESC
LIMIT 10;

-- Vérifier les indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';

-- Stats de performance
SELECT schemaname, tablename, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

**Attendu:**
- ✅ Toutes les foreign keys ont un index
- ✅ Pas de table scan sur requêtes fréquentes
- ✅ Query time <100ms pour 95% des requêtes

---

## 🔒 SECURITY TESTING

### 1. SSL/TLS Testing

```bash
# SSL Labs
# https://www.ssllabs.com/ssltest/
# Entrer: haguenau.pro
# Attendu: A ou A+ rating

# Vérifier manuellement
openssl s_client -connect haguenau.pro:443 -servername haguenau.pro < /dev/null

# Vérifier HSTS
curl -I https://haguenau.pro | grep strict-transport-security
# Attendu: strict-transport-security: max-age=31536000
```

### 2. Headers Security

```bash
# Tester les security headers
curl -I https://haguenau.pro

# Vérifier:
# ✅ x-frame-options: DENY
# ✅ x-content-type-options: nosniff
# ✅ strict-transport-security: max-age=31536000
# ✅ x-xss-protection (ou CSP)
```

### 3. OWASP Top 10 Check

- [ ] **SQL Injection:** Tester avec `' OR '1'='1` dans les champs
- [ ] **XSS:** Tester avec `<script>alert('XSS')</script>` dans les inputs
- [ ] **CSRF:** Vérifier que NextAuth gère les tokens CSRF
- [ ] **Broken Auth:** Tester login avec mauvais credentials (rate limited?)
- [ ] **Sensitive Data:** Vérifier qu'aucun secret n'est exposé (view source)
- [ ] **XXE:** Pas applicable (pas de XML parsing)
- [ ] **Broken Access Control:** Tester l'accès admin sans auth
- [ ] **Security Misconfiguration:** Vérifier headers, erreurs détaillées masquées
- [ ] **Using Components with Known Vulnerabilities:** `npm audit`
- [ ] **Insufficient Logging:** Vérifier que les logs sont actifs

```bash
# Audit de sécurité npm
npm audit

# Fixer automatiquement les vulnérabilités mineures
npm audit fix

# Vérifier les dépendances obsolètes
npx npm-check-updates
```

### 4. Penetration Testing (Optionnel)

**Outil:** [OWASP ZAP](https://www.zaproxy.org/)

```bash
# Installer ZAP
# https://www.zaproxy.org/download/

# Scanner automatique
# ZAP > Quick Start > Automated Scan
# URL: https://haguenau.pro
```

---

## 🔄 ROLLBACK PROCEDURE

**Si un problème critique est détecté après déploiement:**

### Option 1: Rollback Vercel Deployment

1. Aller sur [vercel.com](https://vercel.com) > Votre projet > **Deployments**
2. Trouver le dernier déploiement stable (avec ✅)
3. Cliquer sur les **3 points** > **Promote to Production**
4. Confirmer
5. ✅ Le déploiement précédent devient actif en <30 secondes

### Option 2: Revert Git Commit

```bash
# Identifier le commit à revert
git log --oneline -10

# Revert le commit problématique
git revert HEAD

# Ou revenir à un commit spécifique
git reset --hard abc1234

# Force push (ATTENTION: dangereux si équipe)
git push --force origin main

# Vercel redéploie automatiquement
```

### Option 3: Database Rollback (si migration problématique)

```bash
# Restaurer depuis backup
psql $DATABASE_URL < backup-20251016-120000.sql

# Ou utiliser Neon branch
# Dashboard Neon > Branches > Créer une nouvelle branch depuis un point dans le temps
# Pointer DATABASE_URL vers cette branch
```

---

## 📡 MONITORING SETUP

### 1. Uptime Monitoring (UptimeRobot)

1. Créer un compte sur [uptimerobot.com](https://uptimerobot.com)
2. **Add New Monitor**:
   ```
   Monitor Type: HTTPS
   Friendly Name: Haguenau.PRO - Homepage
   URL: https://haguenau.pro
   Monitoring Interval: 5 minutes
   ```
3. Répéter pour chaque domaine critique
4. Configurer les alertes:
   ```
   Alert Contacts: Votre email, SMS (optionnel)
   Alert When: Down
   Alert After: 2 failed checks (10 minutes)
   ```

### 2. Error Tracking (Sentry - Optionnel)

```bash
# Installer Sentry
npm install @sentry/nextjs

# Initialiser
npx @sentry/wizard -i nextjs

# Suivre les instructions
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% des transactions
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null; // Ignore
    }
    return event;
  },
});
```

### 3. Analytics Monitoring

#### Vercel Analytics (Recommandé si Vercel Pro)
1. Vercel Dashboard > Votre projet > **Analytics**
2. Activer **Web Analytics**
3. ✅ Données disponibles après 24h

#### Google Analytics 4
1. Créer une propriété GA4 pour chaque domaine
2. Installer le tracking code (déjà fait via `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
3. Configurer les événements personnalisés:
   - Company view
   - Phone click
   - Website click
   - Directions click
   - Review submission

### 4. Database Monitoring

**Neon Dashboard > Votre projet > Monitoring**

Surveiller:
- ✅ **Connections:** <80% de la limite
- ✅ **Storage:** <80% du quota
- ✅ **Compute time:** <limite mensuelle
- ✅ **Query performance:** <100ms moyenne

**Configurer des alertes:**
1. Dashboard Neon > Project > **Settings** > **Alerts**
2. Créer des alertes pour:
   - Storage >70%
   - Connections >80%
   - Query performance >500ms

---

## 📝 FINAL CHECKLIST

Avant de considérer le déploiement réussi:

### Infrastructure
- [ ] Database migrée et seedée
- [ ] Déploiement Vercel réussi (status: Ready)
- [ ] Tous les domaines actifs avec SSL
- [ ] DNS propagé complètement
- [ ] Environment variables toutes configurées

### Functionality
- [ ] Homepage charge (<2s)
- [ ] Admin login fonctionne
- [ ] Company listing fonctionne
- [ ] Company detail pages fonctionnent
- [ ] Review submission fonctionne
- [ ] Email sending fonctionne
- [ ] Business owner dashboard fonctionne
- [ ] Analytics tracking fonctionne

### Performance
- [ ] PageSpeed score >90
- [ ] LCP <2.5s
- [ ] FID <100ms
- [ ] CLS <0.1
- [ ] Load test passé (50 users concurrent)

### Security
- [ ] SSL Labs score A/A+
- [ ] Security headers configurés
- [ ] npm audit 0 critical vulnerabilities
- [ ] Secrets rotés (≠ dev)
- [ ] Admin password fort

### Monitoring
- [ ] Uptime monitoring actif
- [ ] Alertes email configurées
- [ ] Error tracking configuré (Sentry ou logs Vercel)
- [ ] Analytics actif (Vercel ou GA4)

### Documentation
- [ ] README mis à jour avec instructions production
- [ ] Runbook créé pour équipe
- [ ] Credentials stockés dans password manager
- [ ] Contacts d'urgence définis

---

## 🎉 POST-LAUNCH

### Semaine 1: Surveillance intensive

- [ ] Vérifier uptime quotidiennement
- [ ] Monitorer les erreurs (Sentry/Vercel logs)
- [ ] Analyser les performances (PageSpeed)
- [ ] Vérifier l'indexation Google Search Console
- [ ] Collecter les premiers feedbacks utilisateurs

### Semaine 2-4: Optimisation

- [ ] Analyser les métriques analytics
- [ ] Identifier les pages lentes (Vercel Analytics)
- [ ] Optimiser les requêtes SQL lentes
- [ ] A/B testing (si applicable)
- [ ] Implémenter les quick fixes critiques

### Mois 1: Stabilisation

- [ ] Atteindre 99.9% uptime
- [ ] PageSpeed score stable >90
- [ ] 0 critical bugs
- [ ] Premiers retours positifs utilisateurs
- [ ] Plan pour MVP v2.0

---

## 📞 CONTACTS D'URGENCE

**En cas de problème critique (site down, data leak, etc.):**

1. **Vercel Support:** support@vercel.com (si Pro plan)
2. **Neon Support:** support@neon.tech
3. **Resend Support:** support@resend.com
4. **Développeur principal:** [Votre email/téléphone]

**Procédure d'escalade:**
1. Vérifier si le problème est réplicable
2. Vérifier les logs Vercel (Deployments > Logs)
3. Si database issue: Vérifier Neon status page
4. Si email issue: Vérifier Resend dashboard
5. Si critique: Rollback immédiat (voir section Rollback)
6. Notifier l'équipe/stakeholders
7. Créer un post-mortem après résolution

---

## ✅ SIGN-OFF

**Déploiement effectué le:** [Date]
**Par:** [Nom]
**Version déployée:** v1.0.0
**Status:** ✅ Production Ready

**Problèmes connus:**
- [ ] Aucun (idéal)
- [ ] Listés ci-dessous avec sévérité et plan de résolution

**Prochaines étapes:**
- [ ] MVP v2.0: Lead management system
- [ ] Phase 3A: Project management features
- [ ] Expansion: Ajouter les 10 domaines restants

---

**Date de création:** 16 Octobre 2025
**Dernière mise à jour:** 16 Octobre 2025
**Auteur:** Claude AI via NETZ Team
