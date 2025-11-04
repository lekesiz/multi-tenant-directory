# Problème gries.pro - "Domain not found"

## Symptômes
- URL: https://gries.pro
- Erreur affichée: "Domain not found"
- Le titre de la page s'affiche: "Gries.PRO - Les Professionnels de Gries"
- Le cookie banner fonctionne (donc Next.js charge)
- Mais le contenu principal affiche "Domain not found"

## Diagnostic

### Hypothèses possibles:

1. **Base de données - Table `domains`**
   - Le domaine `gries.pro` n'existe pas dans la table `domains`
   - Ou le domaine existe mais est inactif (`is_active = false`)
   - Ou le slug/configuration est incorrect

2. **Code - Middleware ou getDomainData()**
   - Le middleware ne trouve pas le domaine
   - La fonction `getDomainData()` retourne null
   - Le layout principal affiche "Domain not found" quand domainData est null

3. **Cache Vercel**
   - Le cache n'a pas été invalidé après le dernier déploiement
   - Les anciennes données sont servies

## Prochaines étapes

1. Vérifier la table `domains` dans Neon
2. Chercher "gries.pro" dans la base de données
3. Vérifier le code qui gère l'erreur "Domain not found"
4. Comparer avec haguenau.pro qui fonctionne
