# 🚀 Multi-Tenant Directory Platform - Handover Document

**Date:** 2025-11-06  
**Version:** 1.0  
**Auteur:** Manus AI

---

## 1. Introduction

Ce document a pour but de faciliter le transfert de connaissances et de responsabilités du projet **Multi-Tenant Directory Platform** à une nouvelle équipe technique. Il fournit une vue d'ensemble complète du projet, de son architecture, de ses fonctionnalités et des procédures de maintenance.

### 1.1. Objectifs du Projet

Le projet est une plateforme d'annuaire d'entreprises locales moderne, évolutive et optimisée pour le SEO, avec une architecture multi-tenant. Un seul codebase dessert **22 domaines** avec un contenu spécifique à chaque domaine, des fonctionnalités basées sur l'IA et des outils de gestion d'entreprise complets.

### 1.2. Liens Utiles

| Ressource | Lien |
|---|---|
| **Dépôt GitHub** | [https://github.com/lekesiz/multi-tenant-directory](https://github.com/lekesiz/multi-tenant-directory) |
| **Déploiement Vercel** | [https://vercel.com/lekesizs-projects/multi-tenant-directory](https://vercel.com/lekesizs-projects/multi-tenant-directory) |
| **Site Principal** | [https://haguenau.pro](https://haguenau.pro) |
| **Documentation API** | [https://haguenau.pro/docs](https://haguenau.pro/docs) |

---

## 2. Architecture Technique

### 2.1. Vue d'ensemble

Le projet est construit sur une stack moderne et robuste, conçue pour la performance, la scalabilité et la maintenabilité.

| Composant | Technologie |
|---|---|
| **Framework** | Next.js 15.5.4 (App Router) |
| **Langage** | TypeScript 5.0 |
| **Base de Données** | PostgreSQL (via Neon Serverless) |
| **ORM** | Prisma 6.17 |
| **Authentification** | NextAuth.js 5 (Google OAuth, JWT) |
| **Styling** | Tailwind CSS 3.4 |
| **Déploiement** | Vercel Edge |

### 2.2. Architecture Multi-Tenant

- **Un seul codebase** pour tous les domaines.
- **Contenu spécifique au domaine** géré via la base de données.
- **Routage dynamique** basé sur le nom d'hôte.
- **Variables d'environnement** centralisées sur Vercel.

### 2.3. Base de Données

- **Schéma Prisma:** `/prisma/schema.prisma`
- **Migrations:** Gérées avec `prisma migrate`
- **Seeding:** Géré avec `prisma db seed`
- **Hébergement:** Neon (PostgreSQL Serverless)

---

## 3. Fonctionnalités Clés

Le projet est riche en fonctionnalités, couvrant un large éventail de besoins pour les entreprises, les administrateurs et les utilisateurs finaux.

### 3.1. Pour les Entreprises

- **Tableau de bord propriétaire:** Gestion complète du profil
- **Système d'activités:** Création de posts (annonces, événements, offres)
- **Gestion des avis:** Répondre, vérifier et modérer les avis
- **Analytique:** Métriques en temps réel
- **Galerie de photos:** Téléchargement multiple
- **Horaires d'ouverture:** Plages multiples par jour, horaires spéciaux

### 3.2. Pour les Administrateurs

- **Gestion des entreprises:** CRUD complet
- **Gestion des utilisateurs:** Rôles admin et propriétaire
- **Gestion des catégories:** Système hiérarchique
- **Gestion des leads:** Vue, recherche, export CSV
- **Modération des avis:** Approuver, rejeter, synchroniser

### 3.3. Pour les Utilisateurs Finaux

- **Recherche avancée:** Texte intégral, filtres
- **Autocomplétion:** Suggestions en temps réel
- **Navigation par catégorie:** Multi-niveaux
- **Géolocalisation:** Recherche basée sur la localisation

---

## 4. Démarrage Rapide

### 4.1. Prérequis

- Node.js 18+ (recommandé: 22.x)
- pnpm (recommandé)
- Compte Vercel

### 4.2. Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/lekesiz/multi-tenant-directory.git
cd multi-tenant-directory

# 2. Installer les dépendances
pnpm install

# 3. Configurer les variables d'environnement
cp .env.local.example .env.local
# (Éditer .env.local avec les clés API et DB)

# 4. Configurer la base de données
npx prisma db push
npx prisma db seed

# 5. Démarrer le serveur de développement
pnpm dev
```

### 4.3. Variables d'Environnement

Les variables d'environnement sont gérées sur Vercel pour la production. Pour le développement local, voir `.env.local.example`.

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion à la base de données Neon |
| `NEXTAUTH_URL` | URL de l'application |
| `NEXTAUTH_SECRET` | Clé secrète pour NextAuth.js |
| `GOOGLE_CLIENT_ID` | ID client Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Clé secrète client Google OAuth |
| `ADMIN_EMAIL` | Email de l'administrateur par défaut |
| `ADMIN_PASSWORD` | Mot de passe de l'administrateur par défaut |

---

## 5. Procédures de Maintenance

### 5.1. Déploiement

- **Déploiement continu:** Chaque `git push` sur la branche `main` déclenche un déploiement sur Vercel.
- **Prévisualisation:** Les pull requests créent des déploiements de prévisualisation.

### 5.2. Migrations de Base de Données

1. **Créer une migration:** `npx prisma migrate dev --name <nom_migration>`
2. **Appliquer en production:** Les migrations sont appliquées automatiquement par Vercel lors du build.

### 5.3. Sauvegardes

- **Base de données:** Gérées par Neon (PITR - Point-in-Time Recovery)
- **Code:** Versionné sur GitHub

---

## 6. Prochaines Étapes et Feuille de Route

Le fichier `TODO_NOUVELLES_TACHES.md` contient la liste des tâches prioritaires et des idées d'améliorations.

### 6.1. Priorités Actuelles

1. **Bouton Sync Reviews:** Ajouter un bouton pour synchroniser manuellement les avis Google.
2. **Toggle Statut Actif/Inactif:** Permettre de changer le statut d'une entreprise.
3. **Pagination Liste Entreprises:** Ajouter une pagination pour la liste des entreprises.

### 6.2. Vision à Long Terme

- **Expansion internationale:** Support de nouvelles langues et régions.
- **Marketplace de services:** Permettre aux entreprises de vendre des services.
- **Application mobile native:** iOS et Android.

---

## 7. Contacts et Support

Pour toute question ou problème, veuillez contacter:

- **Support Technique:** [support@manus.ai](mailto:support@manus.ai)
- **Gestion de Projet:** [project@manus.ai](mailto:project@manus.ai)

