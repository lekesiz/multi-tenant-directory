# Guide de Déploiement - Haguenau.PRO

**Version:** 1.0  
**Date:** 16 Octobre 2025  
**Platform:** Vercel + Neon Postgres

---

## 📖 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Environnement](#configuration-environnement)
3. [Déploiement Vercel](#déploiement-vercel)
4. [Database Migration](#database-migration)
5. [Post-Deployment](#post-deployment)

---

## 🔧 Prérequis

### Comptes Requis

- **GitHub** : Repository du projet
- **Vercel** : Hébergement et déploiement
- **Neon** : Database PostgreSQL
- **Resend** : Service email
- **Google Cloud** : Google Maps API

### Outils Locaux

```bash
# Node.js 22+
node --version

# pnpm
pnpm --version

# Git
git --version
```

---

## 🌍 Configuration Environnement

### Variables d'Environnement Requises

#### 1. Authentication

```bash
# Generate secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Production URL
NEXTAUTH_URL=https://haguenau.pro
```

#### 2. Database

```bash
# Neon Postgres connection string
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

#### 3. Email Service

```bash
# Resend API key
RESEND_API_KEY=re_xxxxxxxxxxxx
```

#### 4. Storage

```bash
# Vercel Blob token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

#### 5. Google Maps

```bash
# Frontend (public)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend (server-side)
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 6. Google OAuth (Optional)

```bash
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
```

---

## 🚀 Déploiement Vercel

### 1. Connecter GitHub

```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to Vercel Dashboard
# 3. Click "Import Project"
# 4. Select GitHub repository
# 5. Configure project
```

### 2. Configuration Projet

**Framework Preset:** Next.js  
**Root Directory:** `./`  
**Build Command:** `pnpm build`  
**Output Directory:** `.next`  
**Install Command:** `pnpm install`

### 3. Ajouter Variables d'Environnement

**Via Vercel Dashboard:**
1. Project Settings → Environment Variables
2. Add each variable
3. Select environments (Production, Preview, Development)
4. Save

**Via CLI:**
```bash
# Install Vercel CLI
pnpm install -g vercel

# Login
vercel login

# Add env vars
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add RESEND_API_KEY
# ... etc
```

### 4. Déployer

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

---

## 🗄️ Database Migration

### 1. Créer Database Neon

```bash
# 1. Go to https://neon.tech
# 2. Create new project: "multi-tenant-directory"
# 3. Copy connection string
# 4. Add to Vercel env vars
```

### 2. Run Migrations

```bash
# Local development
pnpm prisma migrate dev

# Production (via Vercel CLI or Neon MCP)
npx prisma migrate deploy
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Seed Database (Optional)

```bash
# Seed reviews
npx tsx prisma/seed-reviews.ts

# Or custom seed
npx prisma db seed
```

---

## 🔗 Configuration Domaines

### 1. Ajouter Domaines Vercel

**Via Dashboard:**
1. Project Settings → Domains
2. Add domain: `haguenau.pro`
3. Configure DNS (A/CNAME records)
4. Repeat for 21 domains

**DNS Configuration:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2. SSL Certificates

- ✅ Automatic via Vercel (Let's Encrypt)
- ✅ Renews automatically

---

## 🗺️ Google Maps API Setup

### 1. Create API Key

```bash
# 1. Go to Google Cloud Console
# 2. Enable APIs:
#    - Maps JavaScript API
#    - Geocoding API
#    - Places API
# 3. Create API key
```

### 2. Configure Restrictions

**HTTP referrers (web sites):**
```
haguenau.pro/*
mutzig.pro/*
hoerdt.pro/*
brumath.pro/*
bischwiller.pro/*
schiltigheim.pro/*
illkirch-graffenstaden.pro/*
ostwald.pro/*
lingolsheim.pro/*
geispolsheim.pro/*
bischheim.pro/*
souffelweyersheim.pro/*
hoenheim.pro/*
mundolsheim.pro/*
reichstett.pro/*
vendenheim.pro/*
lampertheim.pro/*
eckbolsheim.pro/*
oberhausbergen.pro/*
niederhausbergen.pro/*
mittelhausbergen.pro/*
*.vercel.app/*
localhost:3000/*
```

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Homepage loads
- [ ] Directory works
- [ ] Company pages display
- [ ] Search functional
- [ ] Contact form works
- [ ] Business dashboard accessible
- [ ] Admin panel accessible

### 2. Test Features

- [ ] User registration
- [ ] Email verification
- [ ] Photo upload
- [ ] Business hours
- [ ] Analytics tracking
- [ ] Review system

### 3. SEO Verification

- [ ] Sitemap accessible (`/sitemap.xml`)
- [ ] Robots.txt correct (`/robots.txt`)
- [ ] Meta tags present
- [ ] Structured data (JSON-LD)
- [ ] Google Search Console setup

### 4. Performance

- [ ] Lighthouse score > 90
- [ ] Core Web Vitals green
- [ ] Images optimized
- [ ] Caching configured

### 5. Security

- [ ] HTTPS enabled
- [ ] Security headers (A+ rating)
- [ ] Environment variables secured
- [ ] No sensitive data exposed

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache
vercel --force

# Check logs
vercel logs

# Local build test
pnpm build
```

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (dev only)
npx prisma migrate reset
```

### Environment Variables Not Working

```bash
# Verify vars
vercel env ls

# Pull env vars locally
vercel env pull .env.local

# Redeploy
vercel --prod --force
```

---

## 📊 Monitoring

### Vercel Analytics

- **URL:** Vercel Dashboard → Analytics
- **Metrics:** Page views, performance, errors

### Error Tracking

- **Logs:** Vercel Dashboard → Logs
- **Real-time:** `vercel logs --follow`

### Database Monitoring

- **Neon Dashboard:** https://console.neon.tech
- **Metrics:** Connections, queries, storage

---

## 🔄 Updates and Rollbacks

### Deploy New Version

```bash
# Push to main
git push origin main

# Or manual deploy
vercel --prod
```

### Rollback

```bash
# Via Dashboard
# Deployments → Select previous → Promote to Production

# Or via CLI
vercel rollback
```

---

## 📞 Support

**Technical Issues:**
- Email: tech@haguenau.pro
- GitHub Issues: [repository]/issues

**Vercel Support:**
- https://vercel.com/support

**Neon Support:**
- https://neon.tech/docs

---

**Version:** 1.0  
**Dernière mise à jour:** 16 Octobre 2025  
**Auteur:** Équipe Technique Haguenau.PRO
