# Guide Administrateur - Haguenau.PRO

**Version:** 2.1
**Date:** 25 Novembre 2025
**Public:** Administrateurs de la plateforme

---

## 📖 Table des Matières

1. [Accès Admin](#accès-admin)
2. [Dashboard](#dashboard)
3. [Gestion des Entreprises](#gestion-des-entreprises)
4. [Gestion des Catégories](#gestion-des-catégories)
5. [Modération des Avis](#modération-des-avis)
6. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
7. [Gestion des Domaines](#gestion-des-domaines)
8. [Gestion des Leads](#gestion-des-leads)
9. [Statistiques](#statistiques)

---

## 🔐 Accès Admin

**URL:** `https://haguenau.pro/admin/login`

**Identifiants:** Fournis par l'équipe technique

**Sécurité:**
- ✅ Mot de passe fort requis
- ✅ Session expirée après 24h d'inactivité
- ✅ Logs d'activité

---

## 🏢 Gestion des Entreprises

### Dashboard Admin

**URL:** `/admin/dashboard`

**Fonctionnalités:**
- Vue d'ensemble des entreprises
- Statistiques globales
- Activité récente

### Liste des Entreprises

**URL:** `/admin/companies`

**Actions disponibles:**
- **Voir** : Consulter le profil complet
- **Modifier** : Éditer les informations
- **Supprimer** : Retirer une entreprise

### Ajouter une Entreprise

**URL:** `/admin/companies/new`

**Champs requis:**
- Nom de l'entreprise
- Adresse
- Téléphone
- Email
- Catégorie

---

## ⭐ Modération des Avis

### Liste des Avis

**URL:** `/admin/reviews`

**Filtres:**
- Tous les avis
- En attente de modération
- Approuvés
- Rejetés

### Actions de Modération

**Approuver un avis:**
1. Cliquez sur "Approuver"
2. L'avis devient visible publiquement

**Rejeter un avis:**
1. Cliquez sur "Rejeter"
2. Indiquez la raison (optionnel)
3. L'avis est masqué

**Critères de Modération:**
- ✅ Avis authentique et constructif
- ❌ Contenu offensant ou diffamatoire
- ❌ Spam ou publicité
- ❌ Hors sujet

---

## 📊 Statistiques

### Métriques Globales

**Disponibles sur le dashboard:**
- Nombre total d'entreprises
- Nombre total d'avis
- Note moyenne globale
- Vues totales
- Demandes de contact

### Rapports

**Exportation:**
- Format CSV
- Période personnalisable
- Filtres par catégorie/ville

---

## 📂 Gestion des Catégories

### Liste des Catégories

**URL:** `/admin/categories`

**Fonctionnalités:**
- Vue hiérarchique (catégories parentes et sous-catégories)
- Recherche et filtrage
- Création et modification

### Créer une Catégorie

**Champs disponibles:**
- **Nom** : Nom de la catégorie
- **Slug** : URL-friendly (auto-généré ou manuel)
- **Catégorie parente** : Pour créer une sous-catégorie
- **Icône** : Icône représentative
- **Couleur** : Code couleur hexadécimal
- **Google Place Types** : Mapping avec Google
- **Traductions** : FR/EN/DE
- **Ordre d'affichage** : Priorité de tri

---

## 👥 Gestion des Utilisateurs

**URL:** `/admin/users`

**Types d'utilisateurs:**
- **Admin** : Accès complet
- **Business Owner** : Gestion de leurs entreprises

**Actions:**
- Voir les détails utilisateur
- Modifier les informations
- Réinitialiser le mot de passe
- Activer/désactiver le compte

---

## 🌐 Gestion des Domaines

**URL:** `/admin/domains`

**22 domaines actifs:**
- haguenau.pro, bas-rhin.pro, strasbourg.pro
- Et 19 autres communes du Bas-Rhin

**Configuration par domaine:**
- Titre et description SEO
- Logo et couleurs
- Paramètres spécifiques

---

## 📋 Gestion des Leads

**URL:** `/admin/leads`

**Fonctionnalités:**
- Recherche par code postal
- Filtrage par catégorie
- Export CSV
- Suivi des statuts (nouveau, qualifié, assigné, gagné, perdu, spam)
- Traçabilité RGPD

---

## 🔄 Synchronisation Google Reviews

**URL:** `/admin/reviews`

**Actions:**
- **Sync tous** : Synchroniser tous les avis Google
- **Sync par entreprise** : Synchronisation individuelle
- **Cron automatique** : Synchronisation quotidienne automatique

---

## 📞 Support Technique

**Email:** tech@haguenau.pro
**Urgences:** Contactez le développeur principal

---

**Version:** 2.1
**Dernière mise à jour:** 25 Novembre 2025
