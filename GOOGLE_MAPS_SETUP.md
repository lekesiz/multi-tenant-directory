# Configuration Google Maps API - Instructions

## Problème Actuel
Les cartes Google Maps ne s'affichent pas correctement sur les pages entreprises car:
1. L'API key pourrait ne pas être configurée dans Vercel
2. Les restrictions d'API ne sont peut-être pas correctement définies
3. Les 20+ domaines ne sont pas tous autorisés

## Solution

### 1. Vérifier l'API Key dans Vercel

**Console Vercel** → **Settings** → **Environment Variables**

Vérifier que `GOOGLE_MAPS_API_KEY` existe pour tous les environnements:
- ✅ Production
- ✅ Preview
- ✅ Development

Si absente, l'ajouter avec la clé de Google Cloud Console.

### 2. Configuration Google Cloud Console

#### A. Activer les APIs nécessaires

Dans [Google Cloud Console](https://console.cloud.google.com/):
1. **Maps JavaScript API** ✅
2. **Places API** ✅
3. **Geocoding API** ✅

#### B. Configurer les restrictions d'API

**Google Cloud Console** → **APIs & Services** → **Credentials** → Choisir l'API key

**Restrictions d'application:**
- Type: **HTTP referrers (web sites)**
- Ajouter les 20+ domaines:

```
https://haguenau.pro/*
https://www.haguenau.pro/*
https://bas-rhin.pro/*
https://www.bas-rhin.pro/*
https://mutzig.pro/*
https://www.mutzig.pro/*
https://bischwiller.pro/*
https://www.bischwiller.pro/*
https://bouxwiller.pro/*
https://www.bouxwiller.pro/*
https://brumath.pro/*
https://www.brumath.pro/*
https://erstein.pro/*
https://www.erstein.pro/*
https://geispolsheim.pro/*
https://www.geispolsheim.pro/*
https://hoerdt.pro/*
https://www.hoerdt.pro/*
https://illkirch.pro/*
https://www.illkirch.pro/*
https://ingwiller.pro/*
https://www.ingwiller.pro/*
https://ittenheim.pro/*
https://www.ittenheim.pro/*
https://ostwald.pro/*
https://www.ostwald.pro/*
https://saverne.pro/*
https://www.saverne.pro/*
https://schiltigheim.pro/*
https://www.schiltigheim.pro/*
https://schweighouse.pro/*
https://www.schweighouse.pro/*
https://souffelweyersheim.pro/*
https://www.souffelweyersheim.pro/*
https://soufflenheim.pro/*
https://www.soufflenheim.pro/*
https://vendenheim.pro/*
https://www.vendenheim.pro/*
https://wissembourg.pro/*
https://www.wissembourg.pro/*

# Vercel domains pour preview/staging
https://*.vercel.app/*

# Local development
http://localhost:3000/*
http://localhost:*/*
```

**Restrictions d'API:**
- Limiter aux APIs suivantes:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### 3. Vérifier l'implémentation

#### Fichiers concernés:
- `src/components/CompanyMap.tsx` ✅ (existe)
- `src/app/companies/[slug]/page.tsx` ✅ (utilise CompanyMap)

#### Test:
1. Visiter une page entreprise avec coordonnées GPS
2. Vérifier que la carte s'affiche
3. Vérifier qu'il n'y a pas d'erreur dans la console

Exemple: `https://haguenau.pro/companies/[slug]`

### 4. Quota et facturation

#### Quota actuel recommandé:
- **Maps JavaScript API:** 28,000 loads/mois (gratuit)
- **Places API:** 17,000 requêtes/mois (gratuit)
- **Geocoding API:** 40,000 requêtes/mois (gratuit)

#### Surveillance:
- Activer les alertes de quota dans Google Cloud
- Configurer un budget mensuel maximal
- Monitorer l'utilisation régulièrement

### 5. Variables d'environnement

**Vercel (.env):**
```bash
# Google Maps API Key (avec restrictions)
GOOGLE_MAPS_API_KEY=AIzaSy...

# Public key pour client-side (même valeur mais exposée)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

⚠️ **Important:** L'API key doit être la même pour les deux variables mais:
- `GOOGLE_MAPS_API_KEY` = utilisée côté serveur (API routes)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = utilisée côté client (maps dans browser)

### 6. Sécurité

✅ **Bonnes pratiques appliquées:**
- Restrictions d'HTTP referrers
- Limitations aux APIs spécifiques
- Quotas définis
- Pas de credentials dans le code

❌ **À éviter:**
- Ne JAMAIS commit l'API key dans Git
- Ne JAMAIS exposer une key sans restrictions
- Ne JAMAIS utiliser la même key pour dev et prod

### 7. Dépannage

#### Erreur: "This page can't load Google Maps correctly"
**Solutions:**
1. Vérifier que l'API key est bien configurée dans Vercel
2. Vérifier que le domaine est autorisé dans les restrictions
3. Vérifier que Maps JavaScript API est activée
4. Vérifier la facturation Google Cloud (carte bancaire nécessaire)

#### Erreur: "RefererNotAllowedMapError"
**Solution:**
Ajouter le domaine dans les restrictions HTTP referrers

#### Carte vide mais pas d'erreur
**Solutions:**
1. Vérifier que l'entreprise a des coordonnées (latitude/longitude)
2. Vérifier la console browser pour les erreurs JavaScript
3. Vérifier que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` est bien définie

### 8. Checklist de vérification

- [ ] API key existe dans Vercel
- [ ] Les 3 APIs sont activées dans Google Cloud
- [ ] Les 20+ domaines sont dans les restrictions
- [ ] La facturation Google Cloud est active
- [ ] Les quotas sont configurés
- [ ] Les cartes s'affichent correctement
- [ ] Aucune erreur dans la console browser
- [ ] Les markers s'affichent aux bons endroits

## Statut
- [ ] Configuration vérifiée
- [ ] Tests effectués sur tous les domaines
- [ ] Documentation mise à jour

## Priorité
**HAUTE** - Fonctionnalité visible par les utilisateurs

## Assigné
Manus AI + Claude AI

## Ressources
- [Google Maps Platform](https://console.cloud.google.com/google/maps-apis/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)

---

*Créé le: 15 Octobre 2025*
*Par: Claude AI*
