# TODO - Liste des Tâches Mise à Jour

**Dernière mise à jour:** 15 Octobre 2025  
**Sprint:** 2 → 3  
**Statut:** En cours

---

## 🎉 Tâches Complétées (Sprint 2)

### ✅ Critique
1. ~~Admin login güvenlik açığı~~ - **COMPLÉTÉ** (Déjà fait avant Sprint 2)
2. ~~SEO - Şirket detay title~~ - **COMPLÉTÉ** (15 Oct 2025)
3. ~~Ana sayfa istatistikler~~ - **COMPLÉTÉ** (Déjà optimisé)
4. ~~Dil tutarlılığı (Admin panel FR)~~ - **COMPLÉTÉ** (15 Oct 2025)
5. ~~SEO metadata bug fix~~ - **COMPLÉTÉ** (15 Oct 2025)

### ✅ Haute Priorité
6. ~~Şirket kartlarında rating~~ - **COMPLÉTÉ** (Déjà implémenté)

---

## 🔴 Critique (À faire immédiatement)

### 1. Pages Légales 404 ❌
**Assigné:** Claude AI  
**Priorité:** CRITIQUE  
**Deadline:** 16 Octobre 2025

**Tâches:**
- [ ] Créer `/legal/mentions-legales` page
- [ ] Créer `/legal/politique-de-confidentialite` page
- [ ] Créer `/legal/cgu` page
- [ ] Admin panel pour éditer ces pages
- [ ] Intégration avec footer links

**Fichiers:**
- `src/app/[legalSlug]/page.tsx` (existe déjà)
- `src/app/admin/legal-pages/page.tsx` (existe déjà)
- Besoin de seed data pour les pages légales

**Notes:**
- Les routes existent mais retournent 404
- Besoin de créer les entrées dans la base de données
- Utiliser Markdown pour le contenu

---

## 🟡 Haute Priorité (1-2 jours)

### 2. Google Maps Integration ⚠️
**Assigné:** Claude AI  
**Priorité:** HAUTE  
**Deadline:** 17 Octobre 2025

**Tâches:**
- [ ] Vérifier GOOGLE_MAPS_API_KEY dans Vercel env
- [ ] Tester l'affichage des cartes sur pages entreprise
- [ ] Vérifier les restrictions API (HTTP referrers)
- [ ] Ajouter tous les domaines dans API restrictions

**Fichiers:**
- `src/components/GoogleMap.tsx` (existe déjà)
- Vercel Environment Variables

**Domaines à ajouter:**
```
haguenau.pro
mutzig.pro
hoerdt.pro
bischwiller.pro
... (21 domaines au total)
```

---

### 3. Reviews Management (Admin Panel) 🔧
**Assigné:** Manus AI  
**Priorité:** HAUTE  
**Deadline:** 17 Octobre 2025

**Tâches:**
- [ ] Page admin pour gérer les avis (`/admin/reviews`)
- [ ] Approuver/Rejeter les avis
- [ ] Synchronisation Google Places API
- [ ] Bulk approval pour seed reviews
- [ ] Filtres (approved, pending, rejected)

**Fichiers:**
- `src/app/admin/reviews/page.tsx` (existe déjà)
- `src/components/admin/ReviewsTable.tsx` (existe déjà)
- `src/app/api/admin/reviews/[id]/route.ts` (existe déjà)

**Script à exécuter:**
```bash
# Avec DATABASE_URL production
npx tsx prisma/seed-reviews.ts
```

---

### 4. Yorumlar Bölümü (Frontend) 📝
**Assigné:** Claude AI  
**Priorité:** HAUTE  
**Deadline:** 17 Octobre 2025

**Tâches:**
- [ ] Afficher la liste des avis sur page entreprise
- [ ] Formulaire d'ajout d'avis (utilisateurs)
- [ ] Rating stars component
- [ ] "Aucun avis" empty state
- [ ] Pagination si > 10 avis

**Fichiers:**
- `src/components/CompanyReviews.tsx` (existe déjà, à améliorer)
- `src/app/companies/[slug]/page.tsx` (intégration)

---

## 🟢 Moyenne Priorité (1 semaine)

### 5. Arama Fonksiyonu Iyileştirmesi 🔍
**Assigné:** Manus AI  
**Priorité:** MOYENNE  
**Deadline:** 20 Octobre 2025

**Tâches:**
- [ ] Améliorer l'UX de la barre de recherche
- [ ] Autocomplete suggestions
- [ ] Recherche par catégorie + ville combinée
- [ ] Résultats en temps réel (debounced)

**Fichiers:**
- `src/app/annuaire/page.tsx` (recherche existe déjà)
- `src/components/SearchBar.tsx` (à améliorer)

**Note:** La fonctionnalité de base existe (lignes 142-148), juste besoin d'amélioration UX.

---

### 6. Veri Tamamlama (Manuel) 📊
**Assigné:** Mikail (Manuel)  
**Priorité:** MOYENNE  
**Deadline:** 22 Octobre 2025

**Tâches:**
- [ ] Compléter les données manquantes via admin panel
  - Numéros de téléphone
  - URLs de sites web
  - Adresses email
  - Horaires d'ouverture
- [ ] Vérifier les données existantes
- [ ] Ajouter des photos pour les entreprises

**Note:** Utiliser `/admin/companies/[id]` pour éditer.

---

### 7. Şirket Detay Eksik Bölümler 🏢
**Assigné:** Claude AI  
**Priorité:** MOYENNE  
**Deadline:** 22 Octobre 2025

**Tâches:**
- [ ] Section horaires d'ouverture (BusinessHours component existe)
- [ ] Galerie photos (PhotoGallery component existe)
- [ ] Liens réseaux sociaux (SocialLinks component existe)
- [ ] Breadcrumb navigation
- [ ] Bouton "Partager" (share button)

**Fichiers:**
- `src/app/companies/[slug]/page.tsx`
- `src/components/BusinessHours.tsx` (existe)
- `src/components/PhotoGallery.tsx` (existe)
- `src/components/SocialLinks.tsx` (existe)

**Note:** Les composants existent, juste besoin d'intégration et de données.

---

## 🔵 Basse Priorité (Quand le temps le permet)

### 8. Mobile Responsive Iyileştirmeleri 📱
**Assigné:** Claude AI  
**Priorité:** BASSE  
**Deadline:** 25 Octobre 2025

**Tâches:**
- [ ] Tester toutes les pages sur mobile
- [ ] Hamburger menu (existe, à tester)
- [ ] Touch-friendly buttons (44x44px minimum)
- [ ] Responsive tables
- [ ] Mobile-first images

**Fichiers:**
- Tous les fichiers `.tsx` avec Tailwind classes
- `src/components/MobileMenu.tsx` (existe)

---

### 9. Loading States & Error Handling 🔄
**Assigné:** Manus AI  
**Priorité:** BASSE  
**Deadline:** 25 Octobre 2025

**Tâches:**
- [ ] Loading skeletons pour toutes les pages
- [ ] Error boundaries
- [ ] Empty states (pas de données)
- [ ] Toast notifications pour succès/erreur
- [ ] Retry buttons sur erreurs

**Fichiers:**
- `src/components/LoadingSkeleton.tsx` (existe)
- `src/components/EmptyState.tsx` (existe)
- `src/components/ErrorBoundary.tsx` (existe)

**Note:** Composants existent, juste besoin d'intégration.

---

### 10. Email Integration (SendGrid) 📧
**Assigné:** Manus AI  
**Priorité:** BASSE  
**Deadline:** 27 Octobre 2025

**Tâches:**
- [ ] SendGrid API integration
- [ ] Email templates (HTML)
- [ ] Contact form email sending
- [ ] Notification emails (nouveaux avis, etc.)
- [ ] Email verification (optionnel)

**Fichiers:**
- `src/lib/email.ts` (nouveau)
- `src/app/api/contact/route.ts` (existe)

---

### 11. Google Analytics 4 📊
**Assigné:** Manus AI  
**Priorité:** BASSE  
**Deadline:** 27 Octobre 2025

**Tâches:**
- [ ] GA4 script integration
- [ ] Event tracking (page views, clicks, etc.)
- [ ] Conversion tracking
- [ ] Custom dimensions

**Tracking ID:** `G-RXFKWB8YQJ`

**Fichiers:**
- `src/components/GoogleAnalytics.tsx` (nouveau)
- `src/app/layout.tsx` (intégration)

---

### 12. Kategori Ikonları 🎨
**Assigné:** Manus AI  
**Priorité:** BASSE  
**Deadline:** 27 Octobre 2025

**Tâches:**
- [ ] Ajouter des icônes sur page catégories
- [ ] Cohérence avec page d'accueil
- [ ] Hover effects

**Fichiers:**
- `src/app/categories/page.tsx`
- `src/shared/category-icons.ts` (existe déjà)

---

## 📊 Répartition des Tâches

### Manus AI (5 tâches)
1. Reviews Management (Admin Panel) - HAUTE
2. Arama Fonksiyonu - MOYENNE
3. Loading States & Error Handling - BASSE
4. Email Integration - BASSE
5. Google Analytics 4 - BASSE
6. Kategori Ikonları - BASSE

### Claude AI (5 tâches)
1. Pages Légales - CRITIQUE ⚠️
2. Google Maps Integration - HAUTE
3. Yorumlar Bölümü (Frontend) - HAUTE
4. Şirket Detay Eksik Bölümler - MOYENNE
5. Mobile Responsive - BASSE

### Mikail (Manuel) (1 tâche)
1. Veri Tamamlama - MOYENNE

---

## 🎯 Critères de Succès

- [ ] Toutes les tâches CRITIQUES complétées
- [ ] Toutes les tâches HAUTE priorité complétées
- [ ] Site production-ready
- [ ] Scores SEO améliorés (>90/100)
- [ ] UX optimisée (mobile + desktop)
- [ ] Sécurité renforcée
- [ ] Performance optimisée (<3s load time)

---

## 📅 Planning Sprint 3

**Début:** 15 Octobre 2025  
**Fin:** 22 Octobre 2025 (7 jours)

**Objectifs:**
1. ✅ Résoudre toutes les tâches CRITIQUES
2. ✅ Compléter 80% des tâches HAUTE priorité
3. ⏸️ Commencer les tâches MOYENNE priorité

---

**Dernière mise à jour:** 15 Octobre 2025, 16:40 GMT+2  
**Mis à jour par:** Manus AI

