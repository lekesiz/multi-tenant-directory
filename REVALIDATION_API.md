# Cache Revalidation API

## Vue d'ensemble

L'endpoint `/api/revalidate` permet de vider manuellement le cache Vercel Edge pour des domaines ou chemins spécifiques. Ceci est particulièrement utile lorsque :

- Un nouveau domaine est ajouté à la base de données
- Les données d'un domaine sont mises à jour
- Le cache Vercel Edge sert des données obsolètes
- Vous devez forcer un rafraîchissement sans redéploiement complet

## Sécurité

L'endpoint est protégé par une clé secrète. Par défaut, il utilise `REVALIDATE_SECRET` ou se replie sur `NEXTAUTH_SECRET` si `REVALIDATE_SECRET` n'est pas défini.

## Utilisation

### 1. Revalider un domaine complet

Ceci revalidera toutes les pages principales d'un domaine :

```bash
curl -X POST https://haguenau.pro/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SECRET_HERE",
    "domain": "gries.pro"
  }'
```

**Pages revalidées automatiquement :**
- `/` (homepage)
- `/categories`
- `/contact`
- `/a-propos`
- `/mentions-legales`
- `/politique-de-confidentialite`

### 2. Revalider un chemin spécifique

```bash
curl -X POST https://haguenau.pro/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SECRET_HERE",
    "path": "/categories/alimentation"
  }'
```

### 3. Revalider par tag

```bash
curl -X POST https://haguenau.pro/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SECRET_HERE",
    "tag": "companies"
  }'
```

### 4. Combiner plusieurs options

```bash
curl -X POST https://haguenau.pro/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SECRET_HERE",
    "domain": "gries.pro",
    "path": "/categories",
    "tag": "domain:gries.pro"
  }'
```

## Réponses

### Succès (200)

```json
{
  "success": true,
  "revalidated": [
    "domain:gries.pro/",
    "domain:gries.pro/categories",
    "domain:gries.pro/contact",
    "tag:domain:gries.pro"
  ],
  "timestamp": "2025-11-04T12:45:00.000Z",
  "message": "Successfully revalidated 4 cache entries"
}
```

### Erreur - Secret invalide (401)

```json
{
  "error": "Invalid secret",
  "message": "Please provide a valid REVALIDATE_SECRET"
}
```

### Erreur - Paramètres manquants (400)

```json
{
  "error": "Missing parameters",
  "message": "Please provide at least one of: domain, path, or tag"
}
```

## Configuration

### Variables d'environnement

Ajoutez dans Vercel ou `.env.local` :

```env
# Option 1: Utiliser une clé dédiée
REVALIDATE_SECRET=your-secure-random-string-here

# Option 2: Utiliser NEXTAUTH_SECRET (déjà configuré)
# L'API utilisera automatiquement NEXTAUTH_SECRET si REVALIDATE_SECRET n'existe pas
```

## Cas d'usage : Résoudre "Domain not found" pour gries.pro

Lorsqu'un nouveau domaine est ajouté à la base de données mais que Vercel Edge cache sert encore l'ancienne réponse "Domain not found" :

```bash
# Utiliser NEXTAUTH_SECRET comme secret (déjà configuré)
curl -X POST https://haguenau.pro/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_NEXTAUTH_SECRET",
    "domain": "gries.pro"
  }'
```

Après cette requête, visitez `https://gries.pro` et le domaine devrait fonctionner correctement.

## Test de l'endpoint

Pour vérifier que l'endpoint est accessible :

```bash
curl https://haguenau.pro/api/revalidate
```

Réponse :

```json
{
  "endpoint": "/api/revalidate",
  "method": "POST",
  "description": "Cache revalidation endpoint for domains and paths",
  "usage": { ... }
}
```

## Intégration dans l'admin panel

Vous pouvez ajouter un bouton "Clear Cache" dans l'admin panel pour chaque domaine :

```typescript
async function clearDomainCache(domain: string) {
  const response = await fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.NEXTAUTH_SECRET,
      domain
    })
  });
  
  const result = await response.json();
  console.log('Cache cleared:', result);
}
```

## Notes importantes

1. **Sécurité** : Ne jamais exposer le secret dans le code client. Utilisez toujours une API route côté serveur.

2. **Limites Vercel** : Vercel a des limites sur le nombre de revalidations par déploiement. Utilisez judicieusement.

3. **Propagation** : Le cache peut prendre quelques secondes à se propager sur le réseau Edge de Vercel.

4. **Alternative** : Pour un redéploiement complet avec cache cleared, utilisez Vercel CLI ou Dashboard.

## Dépannage

### "Invalid secret"
- Vérifiez que `NEXTAUTH_SECRET` est bien configuré dans Vercel
- Utilisez exactement la même valeur que dans les variables d'environnement

### "Missing parameters"
- Fournissez au moins un de : `domain`, `path`, ou `tag`

### Cache toujours présent
- Attendez 10-30 secondes pour la propagation
- Essayez un hard refresh (Ctrl+Shift+R)
- Vérifiez les logs Vercel pour les erreurs
