# 🏗️ Guide de l'Architecture - Multi-Tenant Directory Platform

**Date:** 2025-11-06  
**Version:** 1.0  
**Auteur:** Manus AI

---

## 1. Vue d'ensemble

Ce document détaille l'architecture technique de la plateforme, conçue pour être **modulaire, évolutive et maintenable**. L'objectif est de fournir une base solide pour les développements futurs et de faciliter l'intégration de nouveaux membres dans l'équipe.

### 1.1. Philosophie de Conception

- **Séparation des préoccupations:** Logique métier, interface utilisateur et accès aux données sont clairement séparés.
- **Performance d'abord:** Utilisation de techniques modernes (ISR, Edge Functions) pour des temps de chargement rapides.
- **Sécurité intégrée:** Protection contre les vulnérabilités courantes (XSS, CSRF, etc.).
- **Scalabilité:** Architecture capable de supporter un grand nombre de domaines et d'utilisateurs.

---

## 2. Stack Technologique

| Catégorie | Technologie | Version | Rôle |
|---|---|---|---|
| **Framework** | Next.js | 15.5.4 | Framework React pour le rendu côté serveur et la génération de sites statiques. |
| **Langage** | TypeScript | 5.0 | Sur-ensemble de JavaScript qui ajoute des types statiques. |
| **Base de Données** | PostgreSQL | 16 | Système de gestion de base de données relationnelle. |
| **Hébergement DB** | Neon | Serverless | Plateforme PostgreSQL serverless. |
| **ORM** | Prisma | 6.17 | ORM de nouvelle génération pour Node.js et TypeScript. |
| **Authentification** | NextAuth.js | 5 | Solution d'authentification complète pour Next.js. |
| **Styling** | Tailwind CSS | 3.4 | Framework CSS utility-first. |
| **Déploiement** | Vercel | - | Plateforme cloud pour les applications frontend. |

---

## 3. Structure du Projet

Le projet suit une structure de dossiers basée sur les fonctionnalités, inspirée du **App Router** de Next.js.

```
/src
├── app/                  # App Router: pages, layouts, routes API
│   ├── (admin)/          # Routes protégées pour l'admin
│   ├── (auth)/           # Routes d'authentification
│   ├── (main)/           # Routes publiques principales
│   ├── api/              # Routes API
│   └── layout.tsx        # Layout principal
├── components/           # Composants React réutilisables
│   ├── ui/               # Composants UI de base (boutons, inputs)
│   └── shared/           # Composants partagés complexes
├── lib/                  # Fonctions utilitaires, helpers, clients API
│   ├── prisma.ts         # Instance client Prisma
│   ├── auth.ts           # Configuration NextAuth.js
│   └── utils.ts          # Fonctions utilitaires générales
├── styles/               # Fichiers CSS globaux
├── types/                # Définitions de types TypeScript
└── prisma/               # Schéma et migrations Prisma
    ├── schema.prisma     # Schéma de la base de données
    └── migrations/       # Fichiers de migration
```

---

## 4. Architecture Multi-Tenant

L'architecture multi-tenant est au cœur du projet. Elle permet de servir plusieurs domaines à partir d'un seul codebase et d'une seule base de données.

### 4.1. Identification du Tenant

- Le **tenant** (domaine) est identifié à partir du **nom d'hôte** de la requête entrante.
- Un middleware (`/src/middleware.ts`) intercepte chaque requête pour déterminer le domaine actuel.

### 4.2. Données Spécifiques au Tenant

- La base de données contient une table `Domain` qui stocke les informations spécifiques à chaque domaine (nom, SEO, etc.).
- Les autres tables (ex: `Company`, `Review`) sont liées à un domaine via une clé étrangère `domainId`.

### 4.3. Logique de Rendu

- **Incremental Static Regeneration (ISR):** Les pages sont générées statiquement au moment du build, puis régénérées périodiquement (toutes les 60 secondes) pour refléter les nouvelles données.
- **`generateStaticParams`:** Cette fonction de Next.js est utilisée pour générer les pages de chaque entreprise pour chaque domaine au moment du build.

---

## 5. Flux de Données

### 5.1. Rendu d'une Page

1. **Requête entrante:** Un utilisateur visite `https://haguenau.pro/companies/mon-entreprise`.
2. **Middleware:** Identifie le domaine `haguenau.pro`.
3. **Next.js App Router:** Fait correspondre l'URL à la page `/src/app/(main)/companies/[slug]/page.tsx`.
4. **Accès aux données:** La page récupère les données de l'entreprise et du domaine via Prisma.
5. **Rendu:** La page est rendue côté serveur (ou servie depuis le cache statique) avec les données spécifiques.

### 5.2. Appel API

1. **Requête client:** Le frontend fait un appel à `/api/companies`.
2. **Route API:** La requête est gérée par `/src/app/api/companies/route.ts`.
3. **Authentification:** NextAuth.js valide le token JWT (si présent).
4. **Logique métier:** La route API exécute la logique métier (ex: récupérer les entreprises).
5. **Réponse:** La route API renvoie une réponse JSON.

---

## 6. Authentification et Autorisation

### 6.1. Fournisseurs

- **Google OAuth:** Pour l'inscription et la connexion des utilisateurs.
- **Credentials:** Pour la connexion des administrateurs.

### 6.2. Rôles

- **`ADMIN`:** Accès complet au panneau d'administration.
- **`BUSINESS_OWNER`:** Accès au tableau de bord de son entreprise.
- **`USER`:** Accès aux fonctionnalités publiques (laisser des avis, etc.).

### 6.3. Protection des Routes

- **Middleware:** Redirige les utilisateurs non authentifiés des pages protégées.
- **Layouts:** Les layouts de groupe (ex: `(admin)`) appliquent des vérifications de rôle.

---

## 7. Déploiement et Infrastructure

### 7.1. Vercel

- **Hébergement:** Le projet est déployé sur Vercel.
- **Edge Functions:** Les routes API sont déployées en tant que Edge Functions pour une faible latence.
- **Cache:** Vercel gère le cache pour les pages générées statiquement (ISR).

### 7.2. Neon

- **Base de données:** PostgreSQL serverless.
- **Haute disponibilité:** Architecture redondante.
- **Sauvegardes:** Point-in-Time Recovery (PITR).

---

## 8. Schéma de la Base de Données (Simplifié)

```prisma
// /prisma/schema.prisma

model Domain {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  companies Company[]
}

model Company {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String
  domain      Domain   @relation(fields: [domainId], references: [id])
  domainId    Int
  reviews     Review[]
  owner       User?    @relation(fields: [ownerId], references: [id])
  ownerId     String?
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  role      Role      @default(USER)
  companies Company[]
}

model Review {
  id        Int     @id @default(autoincrement())
  rating    Int
  text      String
  company   Company @relation(fields: [companyId], references: [id])
  companyId Int
}

enum Role {
  USER
  BUSINESS_OWNER
  ADMIN
}
```

