# 🌐 DOMAIN DEPLOYMENT & DNS CONFIGURATION GUIDE

**Project:** Multi-Tenant Directory Platform
**Domains:** 12 .PRO domains (haguenau.pro, saverne.pro, etc.)
**Hosting:** Vercel
**Created:** 16 Octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Architecture multi-tenant](#architecture-multi-tenant)
2. [Étape 1: Acheter les domaines](#étape-1-acheter-les-domaines)
3. [Étape 2: Configurer Vercel](#étape-2-configurer-vercel)
4. [Étape 3: Configuration DNS](#étape-3-configuration-dns)
5. [Étape 4: SSL/TLS Certificates](#étape-4-ssltls-certificates)
6. [Étape 5: Redirection WWW](#étape-5-redirection-www)
7. [Étape 6: Tester les domaines](#étape-6-tester-les-domaines)
8. [Performance et CDN](#performance-et-cdn)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ ARCHITECTURE MULTI-TENANT

### Comment ça marche?

Votre application Next.js utilise **1 seul codebase** pour servir **12 domaines différents**.

```
┌─────────────────┐
│  haguenau.pro   │ ─┐
├─────────────────┤  │
│  saverne.pro    │ ─┤
├─────────────────┤  │
│ wissembourg.pro │ ─┤
├─────────────────┤  │         ┌──────────────────────┐
│  selestat.pro   │ ─┤         │   Vercel Deployment  │
├─────────────────┤  ├────────▶│                      │
│  molsheim.pro   │ ─┤         │  Next.js App Router  │
├─────────────────┤  │         │   (1 seul projet)    │
│   obernai.pro   │ ─┤         │                      │
├─────────────────┤  │         └──────────────────────┘
│ bischwiller.pro │ ─┤                    │
├─────────────────┤  │                    ▼
│schiltigheim.pro │ ─┤         ┌──────────────────────┐
├─────────────────┤  │         │   PostgreSQL (Neon)  │
│illkirch.pro     │ ─┤         │                      │
├─────────────────┤  │         │  - 12 domain records │
│lingolsheim.pro  │ ─┤         │  - Companies         │
├─────────────────┤  │         │  - Reviews           │
│  ostwald.pro    │ ─┤         │  - Analytics         │
├─────────────────┤  │         └──────────────────────┘
│ strasbourg.pro  │ ─┘
└─────────────────┘
```

### Détection du domaine

Dans `src/app/layout.tsx` et chaque page:
```typescript
import { headers } from 'next/headers';

const headersList = await headers();
const host = headersList.get('host') || '';
const domain = host.replace('www.', '');

// Récupère les settings du domaine depuis DB
const domainData = await prisma.domain.findUnique({
  where: { name: domain }
});
```

Chaque domaine affiche:
- ✅ Logo et couleurs personnalisés
- ✅ Entreprises de sa ville uniquement
- ✅ Settings SEO uniques
- ✅ Informations légales spécifiques

---

## 🛒 ÉTAPE 1: ACHETER LES DOMAINES

### 1.1 Liste des 12 domaines

```
1. haguenau.pro       (Priorité 1 - domaine principal)
2. saverne.pro        (Priorité 2)
3. wissembourg.pro    (Priorité 2)
4. selestat.pro       (Priorité 2)
5. molsheim.pro       (Priorité 3)
6. obernai.pro        (Priorité 3)
7. bischwiller.pro    (Priorité 3)
8. schiltigheim.pro   (Priorité 3)
9. illkirch.pro       (Priorité 3)
10. lingolsheim.pro   (Priorité 3)
11. ostwald.pro       (Priorité 3)
12. strasbourg.pro    (Priorité 1 - grande ville)
```

**Stratégie de déploiement:**
- **Phase 1:** Acheter haguenau.pro uniquement (tester le concept)
- **Phase 2:** Ajouter strasbourg.pro (grande ville = plus de trafic)
- **Phase 3:** Acheter les 10 autres domaines

### 1.2 Où acheter?

#### **Option A: OVH (Recommandé pour .FR et .PRO)**
- **Prix .PRO:** ~15-20€/an
- **Avantages:**
  - ✅ Support français
  - ✅ Interface en français
  - ✅ DNS management simple
  - ✅ WHOIS privacy inclus
- **URL:** [https://www.ovhcloud.com/fr/domains/](https://www.ovhcloud.com/fr/domains/)

#### **Option B: Gandi**
- **Prix .PRO:** ~20€/an
- **Avantages:**
  - ✅ Excellent support
  - ✅ Éthique (français)
  - ✅ SSL gratuit
- **URL:** [https://www.gandi.net](https://www.gandi.net)

#### **Option C: Cloudflare Registrar**
- **Prix .PRO:** ~15€/an (prix coûtant)
- **Avantages:**
  - ✅ Prix très compétitifs
  - ✅ CDN gratuit intégré
  - ✅ Protection DDoS
- **URL:** [https://www.cloudflare.com/products/registrar/](https://www.cloudflare.com/products/registrar/)

**Recommandation:** OVH pour simplicité, Cloudflare pour performance et prix.

### 1.3 Processus d'achat (Exemple OVH)

1. Aller sur [ovh.com](https://ovh.com)
2. **Domaines** > **Commander un domaine**
3. Rechercher: `haguenau.pro`
4. Vérifier disponibilité
5. Ajouter au panier
6. Configurer:
   - **Durée:** 1 an (renouvellement automatique)
   - **WHOIS Privacy:** Activé ✅
   - **DNS OVH:** Activé ✅
7. Payer (~15-20€)

**Répéter pour chaque domaine.**

### 1.4 Coût total

```
Scénario conservateur (Phase 1):
- haguenau.pro: 20€/an
- strasbourg.pro: 20€/an
Total: 40€/an

Scénario complet (12 domaines):
- 12 domaines × 20€/an = 240€/an
- Soit 20€/mois
```

---

## ⚙️ ÉTAPE 2: CONFIGURER VERCEL

### 2.1 Ajouter les domaines dans Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Sélectionner votre projet: `multi-tenant-directory`
3. **Settings** > **Domains**

### 2.2 Ajouter le premier domaine (haguenau.pro)

1. Cliquer sur **"Add"**
2. Entrer: `haguenau.pro`
3. Cliquer sur **"Add"**

Vercel affichera:
```
⚠️ Invalid Configuration
Domain is not configured correctly
```

**C'est normal!** Vous devez d'abord configurer le DNS.

### 2.3 Copier les enregistrements DNS

Vercel affiche 2 options:

#### **Option A: CNAME (Recommandé)**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

#### **Option B: A Record**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Recommandation:** Utiliser CNAME si votre registrar le permet. Sinon A Record.

### 2.4 Ajouter www.haguenau.pro

Vercel gère automatiquement `www` en redirigeant vers le domaine principal.

Mais vous devez aussi l'ajouter:
1. **Add Domain** > `www.haguenau.pro`
2. Configurer un autre CNAME:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2.5 Répéter pour tous les domaines

**Important:** Ajouter TOUS les 12 domaines dans Vercel:

```bash
# Dans Vercel > Settings > Domains, ajouter:
1. haguenau.pro + www.haguenau.pro
2. saverne.pro + www.saverne.pro
3. wissembourg.pro + www.wissembourg.pro
4. selestat.pro + www.selestat.pro
5. molsheim.pro + www.molsheim.pro
6. obernai.pro + www.obernai.pro
7. bischwiller.pro + www.bischwiller.pro
8. schiltigheim.pro + www.schiltigheim.pro
9. illkirch.pro + www.illkirch.pro
10. lingolsheim.pro + www.lingolsheim.pro
11. ostwald.pro + www.ostwald.pro
12. strasbourg.pro + www.strasbourg.pro
```

**Total:** 24 entrées dans Vercel (12 domaines + 12 www)

---

## 🌐 ÉTAPE 3: CONFIGURATION DNS

### 3.1 Accéder à la zone DNS (OVH)

1. Connexion sur [ovh.com](https://ovh.com)
2. **Web Cloud** > **Noms de domaine**
3. Sélectionner `haguenau.pro`
4. Onglet **"Zone DNS"**

### 3.2 Ajouter l'enregistrement principal

**Supprimer les enregistrements par défaut:**
- Supprimer l'entrée `A` existante (pointe vers parking OVH)
- Supprimer l'entrée `CNAME www` existante si présente

**Ajouter CNAME pour le domaine principal:**

1. **"Ajouter une entrée"**
2. Type: **CNAME**
3. Configurer:
   ```
   Sous-domaine: (vide ou @)
   Cible: cname.vercel-dns.com.
   TTL: 3600 (ou Auto)
   ```

⚠️ **Note:** Certains registrars ne permettent pas CNAME sur le domaine racine (@).
Si erreur, utiliser **A Record** à la place:
```
Type: A
Sous-domaine: @
Cible: 76.76.21.21
TTL: 3600
```

### 3.3 Ajouter www

1. **"Ajouter une entrée"**
2. Type: **CNAME**
3. Configurer:
   ```
   Sous-domaine: www
   Cible: cname.vercel-dns.com.
   TTL: 3600
   ```

### 3.4 Configuration complète

Votre zone DNS doit ressembler à:

```
Type    Name    Value                      TTL
────────────────────────────────────────────────────
CNAME   @       cname.vercel-dns.com.      3600
CNAME   www     cname.vercel-dns.com.      3600
```

Ou si CNAME sur @ impossible:
```
Type    Name    Value                      TTL
────────────────────────────────────────────────────
A       @       76.76.21.21                3600
CNAME   www     cname.vercel-dns.com.      3600
```

### 3.5 Répéter pour tous les domaines

**Checklist:**
- [ ] haguenau.pro DNS configuré
- [ ] saverne.pro DNS configuré
- [ ] wissembourg.pro DNS configuré
- [ ] selestat.pro DNS configuré
- [ ] molsheim.pro DNS configuré
- [ ] obernai.pro DNS configuré
- [ ] bischwiller.pro DNS configuré
- [ ] schiltigheim.pro DNS configuré
- [ ] illkirch.pro DNS configuré
- [ ] lingolsheim.pro DNS configuré
- [ ] ostwald.pro DNS configuré
- [ ] strasbourg.pro DNS configuré

### 3.6 Vérifier la propagation DNS

**Attendre 10-60 minutes** pour la propagation.

Vérifier avec:
```bash
# Vérifier le domaine principal
dig haguenau.pro

# Vérifier www
dig www.haguenau.pro

# Vérifier CNAME
dig haguenau.pro CNAME +short
# Devrait retourner: cname.vercel-dns.com.
```

Ou utiliser: [https://dnschecker.org](https://dnschecker.org)

---

## 🔒 ÉTAPE 4: SSL/TLS CERTIFICATES

### 4.1 Certificats automatiques Vercel

**Bonne nouvelle:** Vercel génère automatiquement les certificats SSL gratuits via Let's Encrypt!

Une fois le DNS configuré:
1. Attendre 10-30 minutes
2. Vérifier dans Vercel > Settings > Domains
3. Le domaine devrait passer de ⚠️ à ✅
4. Statut: **"Valid Configuration"**

### 4.2 Forcer HTTPS

Dans `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // Force HTTPS redirect
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://:path*',
        permanent: true,
      },
    ];
  },
};
```

**Déjà configuré** dans votre projet ✅

### 4.3 Vérifier le certificat SSL

1. Ouvrir: [https://haguenau.pro](https://haguenau.pro)
2. Cliquer sur le cadenas 🔒 dans la barre d'adresse
3. **"Certificate"** > Vérifier:
   - ✅ Issued by: Let's Encrypt
   - ✅ Valid from: [date actuelle]
   - ✅ Valid to: [3 mois plus tard]
   - ✅ Subject: haguenau.pro

**Vercel renouvelle automatiquement** les certificats avant expiration.

### 4.4 Tester la sécurité SSL

Utiliser: [https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/)

1. Entrer: `haguenau.pro`
2. **"Submit"**
3. Attendre 1-2 minutes
4. Résultat attendu: **A ou A+**

---

## 🔄 ÉTAPE 5: REDIRECTION WWW

### 5.1 Redirection automatique Vercel

Vercel redirige automatiquement `www` vers le domaine principal (sans www).

**Exemple:**
```
www.haguenau.pro → haguenau.pro (301 redirect)
```

**Déjà configuré** ✅

### 5.2 Tester la redirection

```bash
# Tester avec curl
curl -I https://www.haguenau.pro

# Vérifier la réponse:
HTTP/2 308
location: https://haguenau.pro/
```

Le code **308** signifie "Permanent Redirect" (SEO-friendly).

### 5.3 Personnaliser la redirection (Optionnel)

Si vous préférez `www` comme domaine principal:

Dans Vercel > Settings > Domains:
1. Définir `www.haguenau.pro` comme **"Primary Domain"**
2. `haguenau.pro` redirigera automatiquement vers `www.haguenau.pro`

**Recommandation:** Garder sans www (plus court, moderne).

---

## 🧪 ÉTAPE 6: TESTER LES DOMAINES

### 6.1 Checklist de test par domaine

Pour **chaque domaine**, vérifier:

#### **Connectivité**
```bash
# Ping
ping haguenau.pro

# HTTPS
curl -I https://haguenau.pro

# Temps de réponse
time curl -s -o /dev/null https://haguenau.pro
```

#### **SSL/TLS**
```bash
# Vérifier le certificat
openssl s_client -connect haguenau.pro:443 -servername haguenau.pro < /dev/null

# Devrait afficher:
# subject=CN=haguenau.pro
# issuer=C=US, O=Let's Encrypt...
```

#### **Contenu**
1. Ouvrir https://haguenau.pro dans le navigateur
2. Vérifier:
   - ✅ Logo et titre corrects (ex: "Haguenau.PRO")
   - ✅ Entreprises de Haguenau affichées
   - ✅ Pas d'erreurs console (F12)
   - ✅ SEO meta tags (View Source > `<head>`)

#### **Performance**
Utiliser: [https://pagespeed.web.dev](https://pagespeed.web.dev)

1. Entrer: `https://haguenau.pro`
2. **"Analyze"**
3. Objectif:
   - ✅ Performance: >90/100
   - ✅ Accessibility: >95/100
   - ✅ Best Practices: >95/100
   - ✅ SEO: >95/100

### 6.2 Script de test automatique

Créer `scripts/test-domains.sh`:

```bash
#!/bin/bash

DOMAINS=(
  "haguenau.pro"
  "saverne.pro"
  "wissembourg.pro"
  "selestat.pro"
  "molsheim.pro"
  "obernai.pro"
  "bischwiller.pro"
  "schiltigheim.pro"
  "illkirch.pro"
  "lingolsheim.pro"
  "ostwald.pro"
  "strasbourg.pro"
)

echo "🧪 Testing all domains..."
echo ""

for domain in "${DOMAINS[@]}"; do
  echo "Testing $domain..."

  # Test HTTPS
  status=$(curl -s -o /dev/null -w "%{http_code}" https://$domain)

  if [ "$status" -eq 200 ]; then
    echo "  ✅ HTTPS working (200 OK)"
  else
    echo "  ❌ HTTPS failed (HTTP $status)"
  fi

  # Test SSL
  ssl_valid=$(echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | grep "Verify return code: 0")

  if [ -n "$ssl_valid" ]; then
    echo "  ✅ SSL certificate valid"
  else
    echo "  ⚠️  SSL certificate issue"
  fi

  # Test response time
  response_time=$(curl -s -o /dev/null -w "%{time_total}" https://$domain)
  echo "  ⏱️  Response time: ${response_time}s"

  echo ""
done

echo "✅ All tests completed!"
```

Exécuter:
```bash
chmod +x scripts/test-domains.sh
./scripts/test-domains.sh
```

### 6.3 Monitoring continu

Utiliser un service d'uptime monitoring:

#### **Option A: Vercel Analytics** (Gratuit avec Vercel Pro)
- Dashboard Vercel > Analytics
- Tracking automatique de tous les domaines

#### **Option B: UptimeRobot** (Gratuit)
- [https://uptimerobot.com](https://uptimerobot.com)
- Créer un monitor pour chaque domaine
- Alertes email si down

#### **Option C: Better Uptime**
- [https://betteruptime.com](https://betteruptime.com)
- Free tier: 10 monitors
- Status page public

**Recommandation:** UptimeRobot pour commencer (gratuit, simple).

---

## 🚀 PERFORMANCE ET CDN

### 7.1 Vercel Edge Network

**Déjà activé** ✅ - Tous vos domaines bénéficient du CDN global de Vercel:

- **300+ edge locations** dans le monde
- **Automatic caching** des assets statiques
- **Compression** Gzip et Brotli
- **HTTP/2** et **HTTP/3** activés

### 7.2 Optimisations Next.js

Déjà implémentées:
```typescript
// next.config.ts
{
  images: {
    formats: ['image/avif', 'image/webp'], // Images modernes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
  },
  compress: true, // Gzip compression
  poweredByHeader: false, // Sécurité
}
```

### 7.3 Caching Headers

Ajouter dans `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Cache static assets for 1 year
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Cache images for 1 week
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  }

  return response;
}
```

### 7.4 Mesurer la performance

```bash
# PageSpeed Insights API
npx lighthouse https://haguenau.pro --view

# Core Web Vitals
npx @lhci/cli https://haguenau.pro
```

**Objectif:**
- ✅ LCP (Largest Contentful Paint): <2.5s
- ✅ FID (First Input Delay): <100ms
- ✅ CLS (Cumulative Layout Shift): <0.1

---

## 🐛 TROUBLESHOOTING

### Erreur: "Domain not found" après 24h

**Causes possibles:**
1. DNS pas configuré correctement
2. CNAME pointe vers la mauvaise cible
3. Domaine pas ajouté dans Vercel

**Solutions:**
```bash
# Vérifier le DNS
dig haguenau.pro CNAME +short
# Doit retourner: cname.vercel-dns.com

# Vérifier dans Vercel
# Settings > Domains > Chercher "haguenau.pro"
# Status doit être "Valid Configuration"
```

### Erreur: "SSL Certificate Error"

**Causes:**
1. Certificat en cours de génération (attendre 30 min)
2. DNS pas propagé complètement
3. HTTPS mixed content

**Solutions:**
```bash
# Vérifier la propagation DNS globale
https://dnschecker.org

# Forcer le renouvellement du certificat
# Vercel > Settings > Domains > Remove domain > Re-add
```

### Site affiche du contenu d'un autre domaine

**Cause:** Problème de détection du domaine dans le code

**Solution:**
```typescript
// Vérifier src/app/page.tsx
const headersList = await headers();
const host = headersList.get('host') || '';
console.log('Current host:', host); // Debug

// S'assurer que 'host' contient le bon domaine
// Si toujours 'vercel.app', vérifier Vercel config
```

### Performance lente (>3s)

**Causes:**
1. Images non optimisées
2. Trop de requêtes API
3. Database queries lentes

**Solutions:**
```bash
# Analyser avec Vercel Analytics
# Vercel > Analytics > Chercher les slow pages

# Optimiser les images
npx @next/codemod@latest new-link .
npx next build --profile

# Vérifier les requêtes SQL
# Ajouter Prisma logging en dev:
# prisma/schema.prisma
log = ['query', 'info', 'warn', 'error']
```

### Domaine redirige vers www alors que pas configuré

**Cause:** Configuration inverse dans Vercel

**Solution:**
```bash
# Vercel > Settings > Domains
# Vérifier le badge "Primary" sur le bon domaine
# Retirer "Primary" de www si nécessaire
```

---

## ✅ CHECKLIST FINALE

Avant de considérer le déploiement terminé:

### DNS et Domaines
- [ ] 12 domaines achetés (ou au moins haguenau.pro + strasbourg.pro)
- [ ] DNS configuré pour tous les domaines (CNAME ou A)
- [ ] DNS propagé (vérifier avec dnschecker.org)
- [ ] Tous les domaines ajoutés dans Vercel Settings > Domains
- [ ] WWW configuré pour chaque domaine

### SSL/TLS
- [ ] Certificats SSL générés pour tous les domaines (✅ dans Vercel)
- [ ] HTTPS fonctionne sans warning
- [ ] Redirection HTTP → HTTPS active
- [ ] SSL score A/A+ sur ssllabs.com

### Fonctionnalité
- [ ] Chaque domaine affiche le contenu de sa ville
- [ ] Logo et titre personnalisés par domaine
- [ ] Entreprises filtrées par domaine
- [ ] Settings SEO uniques par domaine
- [ ] Aucune erreur console (F12)

### Performance
- [ ] PageSpeed score >90 pour tous les domaines
- [ ] Images optimisées (WebP/AVIF)
- [ ] Caching activé (headers)
- [ ] CDN Vercel actif (vérifier via Network tab)

### Monitoring
- [ ] Vercel Analytics activé
- [ ] UptimeRobot configuré (ou similaire)
- [ ] Alertes email configurées si site down
- [ ] Google Search Console ajouté pour chaque domaine

---

## 📚 RESSOURCES

- [Vercel Custom Domains Guide](https://vercel.com/docs/projects/domains/add-a-domain)
- [DNS Configuration Best Practices](https://vercel.com/docs/projects/domains/troubleshooting)
- [SSL/TLS Testing](https://www.ssllabs.com/ssltest/)
- [DNS Propagation Checker](https://dnschecker.org)
- [PageSpeed Insights](https://pagespeed.web.dev)

---

## 💰 COÛT RÉCAPITULATIF

### Domaines (12 .PRO)
```
12 domaines × 20€/an = 240€/an
Soit: 20€/mois
```

### Hébergement Vercel
```
Hobby (Free): 0€/mois - OK pour MVP
Pro: $20/mois - Recommandé pour production
  - Analytics
  - Password protection
  - Plus de bandwidth
```

### Total estimé (Production)
```
Domaines: 20€/mois
Vercel Pro: $20/mois (~18€)
Neon DB Pro: $19/mois (~17€)
Resend Pro: $20/mois (~18€)
─────────────────────────
TOTAL: ~73€/mois (~900€/an)
```

**Phase 1 (MVP - 2 domaines):**
```
2 domaines: 3.30€/mois
Vercel Hobby: 0€
Neon Free: 0€
Resend Free: 0€
─────────────────────────
TOTAL: ~3.30€/mois (~40€/an)
```

---

**Prochaine étape:** [PRODUCTION_ENVIRONMENT_VARIABLES.md](./PRODUCTION_ENVIRONMENT_VARIABLES.md)

**Date de création:** 16 Octobre 2025
**Dernière mise à jour:** 16 Octobre 2025
**Auteur:** Claude AI via NETZ Team
