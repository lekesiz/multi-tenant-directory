# 📋 TODO - Nouvelles Tâches (5 Nov 2025)

**Date:** 5 Novembre 2025  
**Session:** Fin de journée - Notes pour demain

---

## 🔴 PRIORITÉ HAUTE

### ✅ 1. Test Coverage %15 -> %4.03 (CRITICAL) - IN PROGRESS
**Status:** ⏳ En cours  
**Description:** Augmenter la couverture de tests de 15% à 80%+

**Réalisé:**
- ✅ Coverage: %0.41 -> %4.03 (+883%)
- ✅ 30 test files created
- ✅ ~850 tests passing

### ✅ 2. Redis Cache Activation (HIGH) - COMPLETED
**Status:** ✅ TERMINÉ (2025-11-06)  
**Description:** Activer le cache Redis pour améliorer les performances et réduire les coûts API

**Réalisé:**
- ✅ Upstash Redis credentials configurés sur Vercel
- ✅ RateLimitService connecté à Redis
- ✅ AI Cache actif en production

### ✅ 3. Security Headers (HIGH) - COMPLETED
**Status:** ✅ TERMINÉ (2025-11-06)  
**Description:** Implémenter les en-têtes de sécurité (HSTS, CSP, etc.)

**Réalisé:**
- ✅ HSTS, CSP, Permissions-Policy, X-XSS-Protection implémentés
- ✅ Security grade: ~B -> ~A
- ✅ Actif en production

---


### 1. ⏰ Admin - Horaires Multiples (Interface)
**Status:** ✅ TERMINÉ (2025-11-06)  
**Description:** Activer l'interface pour ajouter plusieurs plages horaires par jour

**Réalisé:**
- ✅ Interface admin complètement révisée avec support des plages multiples
- ✅ Boutons "+ Ajouter une plage" ajoutés pour chaque jour
- ✅ Boutons de suppression de plages
- ✅ Validation Zod complète
- ✅ Support du timezone (Europe/Paris)
- ✅ Compatibilité avec l'ancien format
- ✅ Affichage visiteur mis à jour pour supporter les plages multiples
- ✅ Correction de l'erreur "Invalid business hours data"

**Commits:**
- `e7bf680` - Fix: Change BusinessHoursForm HTTP method from POST to PUT
- `dea2ac1` - Fix: Complete business hours system - Add timezone, clean data payload, support multi-shifts in visitor display

**Fichiers modifiés:**
- `/src/components/BusinessHoursForm.tsx`
- `/src/components/BusinessHours.tsx`
- `/src/app/api/companies/[id]/hours/route.ts`

---

### 2. 🔄 Admin - Bouton Sync Reviews
**Status:** ⏳ À faire  
**Description:** Ajouter un bouton "Sync Google Reviews" dans l'onglet Yorumlar

**Contexte:**
- Actuellement: "Henüz yorum yok" (Pas encore de commentaires)
- Besoin: Bouton pour déclencher manuellement la synchronisation des avis Google

**Interface souhaitée:**
```
┌─────────────────────────────────────────────┐
│ Google Yorumları                            │
│                                             │
│ Henüz yorum yok                            │
│                                             │
│         [🔄 Sync Google Reviews]           │
└─────────────────────────────────────────────┘
```

**Fichiers:**
- `/src/app/admin/companies/[id]/page.tsx` (onglet "Yorumlar")
- API: `/src/app/api/admin/companies/[id]/sync-reviews/route.ts`

**Estimation:** 1-2 heures

---

### 3. 🔘 Admin - Toggle Statut Actif/Inactif
**Status:** ⏳ À faire  
**Description:** Permettre de changer le statut d'une entreprise en cliquant sur "✓ Actif"

**Contexte:**
- Actuellement: "✓ Actif" est affiché mais non cliquable
- Besoin: Toggle pour passer de "Actif" à "Inactif" et vice-versa

**Interface souhaitée:**
```
STATUT
------
✓ Actif   → Click → ✗ Inactif
✗ Inactif → Click → ✓ Actif
```

**Fichiers:**
- `/src/app/admin/companies/page.tsx` (liste des entreprises)
- API: `/src/app/api/admin/companies/[id]/toggle-status/route.ts` (à créer)

**Estimation:** 1-2 heures

---

### 4. 📄 Admin - Pagination Liste Entreprises
**Status:** ⏳ À faire  
**Description:** Ajouter une pagination pour la liste des 238 entreprises

**Contexte:**
- Actuellement: 238 entreprises affichées sur une seule page
- Problème: Page lente à charger
- Besoin: Pagination (20-50 entreprises par page)

**Interface souhaitée:**
```
┌─────────────────────────────────────────────┐
│ 238 entreprises trouvées                   │
├─────────────────────────────────────────────┤
│ [Entreprise 1]                             │
│ [Entreprise 2]                             │
│ ...                                        │
│ [Entreprise 20]                            │
├─────────────────────────────────────────────┤
│ [← Précédent]  [1] [2] ... [12]  [Suivant →] │
│ Affichage de 1-20 sur 238 entreprises     │
└─────────────────────────────────────────────┘
```

**Fichiers:**
- `/src/app/admin/companies/page.tsx`

**Options:**
- Client-side pagination (simple, rapide)
- Server-side pagination (meilleur pour SEO et performance)

**Estimation:** 2-3 heures

---

## 🟡 PRIORITÉ MOYENNE

### 5. 📄 Pages Publiques - Création Optimisée
**Status:** ⏳ À faire (rollback effectué)  
**Description:** Recréer les pages publiques avec queries optimisées

**Pages:**
1. `/[slug]/page.tsx` - Détail entreprise
2. `/companies/page.tsx` - Liste entreprises
3. `/categories/[slug]/page.tsx` - Catégorie

**Problèmes précédents:**
- ❌ Queries Prisma trop lourdes (timeout 30s)
- ❌ Trop de relations avec `include`
- ❌ Pas de cache/ISR

**Solutions:**
- ✅ `select` au lieu de `include`
- ✅ Limiter relations (max 5 reviews, 10 photos)
- ✅ ISR: `export const revalidate = 3600`
- ✅ Lazy loading pour images

**Estimation:** 1 journée

---

### 6. 🎨 UI/UX - Améliorations Phase 1-2
**Status:** ⏳ À faire  
**Description:** Implémenter les améliorations du rapport UX

**Tâches:**
- [ ] Sélecteur de catégorie dans formulaire manuel
- [ ] Afficher catégorie sur pages publiques
- [ ] Filtres par catégorie sur homepage
- [ ] Navigation par catégories
- [ ] Breadcrumbs

**Référence:** `/home/ubuntu/RAPPORT_AMELIORATIONS_UX.md`

**Estimation:** 3-4 jours

---

## 🟢 PRIORITÉ BASSE

### 7. 📊 SEO - Pages Catégories
**Status:** ⏳ À faire  
**Description:** Créer pages SEO pour 315 catégories × 22 domaines

**Potentiel:** 6,930 pages SEO

**Estimation:** 2-3 jours

---

### 8. 🔍 Recherche Avancée
**Status:** ⏳ À faire  
**Description:** Autocomplete, filtres, suggestions

**Estimation:** 3-4 jours

---

## ✅ TERMINÉ AUJOURD'HUI (5 Nov 2025)

### ✅ Correction API SIRET
- Suppression `requireAdmin()`
- Détection doublons Google Place ID

### ✅ Amélioration Contraste (WCAG AAA)
- Contraste 16.1:1
- Conformité WCAG AAA

### ✅ Catégories Google Business
- 315 catégories (15 principales + 300 sous)
- Mapping Google types → DB

### ✅ Mapping Entreprises → Catégories
- 238/238 entreprises (100%)
- Fonction `mapGoogleTypesToCategory()`

### ✅ Simplification Section Avis
- Suppression Sync button (public)
- Suppression graphique distribution
- Suppression filtres & pagination
- Affichage 5 avis les plus récents

### ✅ Rollback Pages Publiques
- Retour version stable `1cabd90`
- Site 100% fonctionnel

---

## 📊 RÉSUMÉ DES TÂCHES

**Total nouvelles tâches:** 8

**Par priorité:**
- 🔴 Haute: 4 tâches (8-10 heures)
- 🟡 Moyenne: 2 tâches (4-5 jours)
- 🟢 Basse: 2 tâches (5-7 jours)

**Estimation totale:** 2-3 semaines

---

## 🎯 PLAN POUR DEMAIN (6 Nov 2025)

**Matin (3-4h):**
1. ✅ Interface horaires multiples
2. ✅ Bouton Sync reviews
3. ✅ Toggle statut actif/inactif

**Après-midi (3-4h):**
4. ✅ Pagination liste entreprises
5. ✅ Tests et corrections

**Total estimé:** 6-8 heures

---

**Préparé par:** Manus AI  
**Date:** 5 Novembre 2025, 19:03  
**Prochaine session:** 6 Novembre 2025
