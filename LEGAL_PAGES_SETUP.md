# Configuration des Pages Légales - URGENT ⚠️

## Problème
Les pages légales (`/mentions-legales`, `/politique-confidentialite`, `/cgu`) retournent 404 car aucune donnée n'existe dans la base de données.

## Solution
Exécuter le script de seed avec accès à la production database.

## Instructions pour Manus AI

### 1. Vérifier que le fichier existe
```bash
ls -la prisma/seed-legal-pages.ts
```

### 2. Exécuter le script avec la DATABASE_URL production
```bash
# Option A: Avec DATABASE_URL dans .env
npx tsx prisma/seed-legal-pages.ts

# Option B: Avec DATABASE_URL inline (si Vercel)
DATABASE_URL="postgresql://..." npx tsx prisma/seed-legal-pages.ts
```

### 3. Vérifier les pages créées
Le script créera 3 pages dans la table `legal_pages`:
- `mentions-legales` - Mentions Légales
- `politique-confidentialite` - Politique de Confidentialité
- `cgu` - Conditions Générales d'Utilisation

### 4. Tester les routes
Après exécution, ces URLs devraient fonctionner:
- https://haguenau.pro/mentions-legales
- https://haguenau.pro/politique-confidentialite
- https://haguenau.pro/cgu

## Détails Techniques

### Script: `prisma/seed-legal-pages.ts`
- Crée des pages **globales** (domainId = null)
- Disponibles pour tous les 20+ domaines
- Contenu en Markdown
- Peut être re-exécuté sans problème (upsert logic)

### Routes existantes
- ✅ `src/app/[legalSlug]/page.tsx` - Page component (existe)
- ✅ Footer links dans `src/app/page.tsx` (existe)
- ✅ Markdown rendering avec ReactMarkdown (existe)

## Statut
- [ ] Pages créées en base de données
- [ ] Routes testées et fonctionnelles
- [ ] Footer links vérifiés

## Priorité
**CRITIQUE** - À faire immédiatement

## Assigné
Manus AI (accès production database)

---

*Créé le: 15 Octobre 2025*
*Par: Claude AI*
