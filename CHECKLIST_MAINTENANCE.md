# 🛠️ Checklist de Maintenance

**Date:** 2025-11-06  
**Version:** 1.0  
**Auteur:** Manus AI

---

## 1. Tâches Quotidiennes

- [ ] **Monitoring des erreurs:** Vérifier Sentry (ou autre outil de monitoring) pour les nouvelles erreurs.
- [ ] **Logs serveur:** Examiner les logs Vercel pour les erreurs 5xx ou les avertissements inhabituels.
- [ ] **Performance:** Vérifier le score Core Web Vitals sur Vercel Analytics.

---

## 2. Tâches Hebdomadaires

- [ ] **Sauvegardes:** Vérifier que les sauvegardes de la base de données Neon sont bien effectuées.
- [ ] **Dépendances:** Vérifier les vulnérabilités des dépendances (`pnpm audit`).
- [ ] **Avis en attente:** Modérer les avis en attente dans le panneau d'administration.
- [ ] **Leads:** Examiner les nouveaux leads et les assigner.

---

## 3. Tâches Mensuelles

- [ ] **Mise à jour des dépendances:** Mettre à jour les dépendances mineures et les patchs (`pnpm up --latest`).
- [ ] **Revue des performances:** Analyser les tendances de performance sur Vercel Analytics.
- [ ] **Analyse de la base de données:** Vérifier la taille de la base de données et l'utilisation des index.
- [ ] **Revue des accès:** Vérifier que seuls les utilisateurs autorisés ont accès aux comptes admin.

---

## 4. Tâches Trimestrielles

- [ ] **Mise à jour des dépendances majeures:** Planifier la mise à jour des dépendances majeures (Next.js, Prisma, etc.).
- [ ] **Audit de sécurité:** Effectuer un audit de sécurité de base de l'application.
- [ ] **Revue de la documentation:** S'assurer que la documentation est toujours à jour.
- [ ] **Nettoyage de la base de données:** Archiver ou supprimer les anciennes données non pertinentes (ex: logs, brouillons).

---

## 5. Procédures Spécifiques

### 5.1. Ajout d'un Nouveau Domaine

1. **Achat du domaine:** Acheter le nom de domaine auprès d'un registrar.
2. **Configuration DNS:** Configurer les DNS pour pointer vers Vercel.
3. **Vercel:** Ajouter le domaine au projet Vercel.
4. **Base de données:** Ajouter le domaine à la table `Domain`.
5. **SEO:** Configurer les informations SEO spécifiques au domaine dans le panneau d'administration.

### 5.2. Gestion d'un Incident de Sécurité

1. **Identifier et contenir:** Isoler le composant affecté.
2. **Évaluer l'impact:** Déterminer l'étendue de la violation.
3. **Corriger:** Développer et déployer un correctif.
4. **Communiquer:** Informer les utilisateurs si leurs données ont été compromises.
5. **Post-mortem:** Analyser la cause de l'incident et mettre en place des mesures préventives.
