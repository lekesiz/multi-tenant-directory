# Category System Migration Checklist

## Objectif
Migrer de l'ancien système de catégories Google vers le nouveau système hiérarchique avec 7 catégories principales et leurs sous-catégories.

## Nouveau Système
- **7 Catégories Principales** (parentId = null):
  1. 🍽️ Alimentation
  2. 💊 Santé
  3. 🏪 Commerces
  4. 🔧 Services
  5. 🎭 Loisirs
  6. 🏠 Immobilier
  7. 📋 Autres

- **20 Sous-catégories** (avec parentId)
- Table: `categories` (nouveau)
- Junction table: `company_categories` (nouveau)
- Ancien système: `businessCategory` table (à déprécier progressivement)

---

## Fichiers à Réviser

### ✅ COMPLÉTÉ

1. **src/app/categories/page.tsx** - Page liste des catégories
   - ✅ Utilise le nouveau système hiérarchique
   - ✅ Affiche 7 catégories principales + sous-catégories

2. **src/app/categories/[category]/page.tsx** - Page détail catégorie
   - ✅ Utilise le nouveau système
   - ✅ Slug normalization

3. **src/app/admin/categories/page.tsx** - Admin panel catégories
   - ✅ CRUD complet sur nouveau système
   - ✅ Affichage hiérarchique

4. **src/app/api/admin/categories/list/route.ts** - API liste catégories
   - ✅ Retourne catégories du nouveau système

5. **src/app/api/admin/categories/seed/route.ts** - Seed catégories
   - ✅ Seed 27 catégories (7 parent + 20 child)

---

### 🔄 EN COURS

6. **src/app/page.tsx** - Page d'accueil
   - 🔄 getMainCategories() créé
   - ⏳ Affichage à mettre à jour
   - ⏳ getCategoryIcon() à adapter

---

### 📋 À FAIRE - PAGES

7. **src/app/annuaire/page.tsx** - Page annuaire
   - ❌ Sidebar "Catégories" utilise ancien système
   - ❌ Filtrage par catégorie à mettre à jour

8. **src/app/[legalSlug]/page.tsx** - Pages légales
   - 🔍 Vérifier si utilise catégories

---

### 📋 À FAIRE - ADMIN PANEL

9. **src/app/admin/companies/[id]/page.tsx** - Édition société
   - ❌ Sélection de catégories à mettre à jour
   - ❌ Utilise probablement ancien système

10. **src/app/admin/companies/new/page.tsx** - Nouvelle société
    - ❌ Sélection de catégories à mettre à jour

11. **src/app/admin/dashboard/page.tsx** - Dashboard admin
    - 🔍 Vérifier stats par catégorie

12. **src/app/admin/domains/[id]/page.tsx** - Gestion domaines
    - 🔍 Vérifier si affiche stats catégories

---

### 📋 À FAIRE - API ENDPOINTS

13. **src/app/api/categories/route.ts** - API catégories publique
    - ❌ À mettre à jour vers nouveau système

14. **src/app/api/categories/[id]/route.ts** - Détail catégorie
    - ❌ À mettre à jour

15. **src/app/api/companies/route.ts** - API sociétés
    - ❌ Filtrage par catégorie à vérifier

16. **src/app/api/companies/[id]/route.ts** - Détail société
    - ❌ Retour des catégories à vérifier

17. **src/app/api/search/route.ts** - Recherche
    - ❌ Filtrage par catégorie à mettre à jour

18. **src/app/api/domains/[id]/companies/route.ts** - Sociétés par domaine
    - ❌ Filtrage catégorie à vérifier

---

### 📋 À FAIRE - COMPOSANTS

19. **src/components/FilterBar.tsx** - Barre de filtres
    - ❌ Filtrage par catégorie à mettre à jour

20. **src/components/SearchBar.tsx** - Barre de recherche
    - ❌ Suggestions de catégories à mettre à jour

21. **src/components/LeadForm.tsx** - Formulaire leads
    - ❌ Sélection catégorie à mettre à jour

22. **src/components/LeadFormClient.tsx** - Client lead form
    - ❌ Sélection catégorie à mettre à jour

23. **src/components/RelatedCompanies.tsx** - Sociétés similaires
    - ❌ Basé sur catégories à vérifier

24. **src/components/HeroSection.tsx** - Section hero
    - 🔍 Vérifier si affiche catégories

25. **src/components/MobileMenu.tsx** - Menu mobile
    - 🔍 Vérifier navigation catégories

---

### 📋 À FAIRE - BIBLIOTHÈQUES

26. **src/lib/categories.ts** - Utilitaires catégories
    - ❌ Fonctions à adapter au nouveau système
    - ❌ getCategoryFrenchName() à mettre à jour

27. **src/lib/category-icons.ts** - Icônes catégories
    - ❌ Mapping à mettre à jour pour 7 catégories principales

28. **src/lib/queries/company.ts** - Requêtes sociétés
    - ❌ getCompaniesByCategoryCount() à mettre à jour
    - ❌ Toutes requêtes catégories à vérifier

29. **src/lib/db-queries.ts** - Requêtes DB génériques
    - 🔍 Vérifier requêtes catégories

30. **src/lib/seo.ts** - SEO
    - 🔍 Vérifier génération meta pour catégories

---

### 📋 À FAIRE - AI/AUTOMATION

31. **src/lib/ai.ts** - AI général
    - 🔍 Vérifier si utilise catégories pour suggestions

32. **src/lib/ai/matching.ts** - Matching AI
    - 🔍 Matching par catégorie à vérifier

33. **src/app/api/ai/recommendations/route.ts** - Recommandations
    - 🔍 Basé sur catégories à vérifier

---

## Stratégie de Migration

### Phase 1: Pages Frontend (EN COURS)
- ✅ /categories
- ✅ /categories/[category]
- 🔄 / (homepage)
- ⏳ /annuaire

### Phase 2: Admin Panel
- ⏳ /admin/companies/new
- ⏳ /admin/companies/[id]

### Phase 3: API Endpoints
- ⏳ /api/categories
- ⏳ /api/companies (filtrage)
- ⏳ /api/search

### Phase 4: Composants
- ⏳ FilterBar
- ⏳ SearchBar
- ⏳ LeadForm

### Phase 5: Bibliothèques
- ⏳ lib/categories.ts
- ⏳ lib/queries/company.ts

---

## Notes Importantes

1. **Compatibilité Ascendante**: Les anciennes catégories Google sont toujours dans `companies.categories` (array)
2. **Migration Progressive**: Ne pas casser les fonctionnalités existantes
3. **company_categories Table**: Actuellement vide, besoin d'un script de migration
4. **Tests**: Tester chaque changement avant commit

---

## Commandes Utiles

```bash
# Trouver tous les fichiers utilisant "category"
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "categor" {} \;

# Chercher businessCategory (ancien système)
grep -r "businessCategory" src/

# Chercher getCompaniesByCategoryCount (à mettre à jour)
grep -r "getCompaniesByCategoryCount" src/
```
