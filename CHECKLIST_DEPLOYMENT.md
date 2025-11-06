# ✅ Checklist de Déploiement

**Date:** 2025-11-06  
**Version:** 1.0  
**Auteur:** Manus AI

---

## 1. Avant le Déploiement

### 1.1. Code

- [ ] **Revue de code:** Toutes les modifications ont été revues et approuvées.
- [ ] **Tests:** Tous les tests (unitaires, intégration, e2e) passent avec succès.
- [ ] **Linting:** Le code est conforme aux règles de linting (`pnpm lint`).
- [ ] **Merge:** La branche de fonctionnalité a été mergée sur `main`.
- [ ] **Pull:** La branche `main` locale est à jour (`git pull origin main`).

### 1.2. Variables d'Environnement

- [ ] **Vérification:** S'assurer que toutes les nouvelles variables d'environnement ont été ajoutées à Vercel (Production, Preview, Development).
- [ ] **Synchronisation:** Le fichier `.env.local.example` est à jour.

### 1.3. Migrations de Base de Données

- [ ] **Génération:** Une nouvelle migration a été générée si le schéma Prisma a changé (`npx prisma migrate dev`).
- [ ] **Test en local:** La migration a été testée avec succès en environnement de développement.

---

## 2. Pendant le Déploiement

### 2.1. Déclenchement

- [ ] **Push:** Pousser les modifications sur la branche `main` (`git push origin main`).
- [ ] **Vercel:** Vérifier que le build a bien démarré sur Vercel.

### 2.2. Suivi

- [ ] **Logs de build:** Surveiller les logs de build sur Vercel pour détecter d'éventuelles erreurs.
- [ ] **Déploiement:** Attendre que le statut du déploiement passe à **Ready**.

---

## 3. Après le Déploiement

### 3.1. Vérifications Post-Déploiement

- [ ] **Page d'accueil:** Vérifier que la page d'accueil se charge correctement.
- [ ] **Fonctionnalités clés:** Tester les fonctionnalités principales impactées par les changements.
- [ ] **Authentification:** Tester la connexion et l'inscription.
- [ ] **Console du navigateur:** Vérifier l'absence d'erreurs dans la console.
- [ ] **Monitoring:** Surveiller les outils de monitoring (Sentry, Vercel Analytics) pour détecter d'éventuelles nouvelles erreurs.

### 3.2. Communication

- [ ] **Équipe:** Informer l'équipe que le déploiement est terminé.
- [ ] **Changelog:** Mettre à jour le `CHANGELOG.md` si ce n'est pas déjà fait.

---

## 4. En Cas de Problème (Rollback)

### 4.1. Identification

- **Identifier rapidement** la cause du problème (logs Vercel, Sentry).

### 4.2. Décision

- **Évaluer l'impact:** Si le problème est critique, procéder à un rollback.

### 4.3. Procédure de Rollback

1. **Vercel:** Aller dans l'onglet "Deployments" du projet.
2. **Sélectionner:** Trouver le déploiement précédent qui fonctionnait.
3. **Redéployer:** Cliquer sur le menu "..." et sélectionner "Redeploy".

### 4.4. Post-Rollback

- **Communication:** Informer l'équipe que le rollback a été effectué.
- **Analyse:** Créer un post-mortem pour analyser la cause du problème et éviter qu'il ne se reproduise.
