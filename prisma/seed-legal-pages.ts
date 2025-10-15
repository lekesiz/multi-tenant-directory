/**
 * Seed script for legal pages (mentions légales, politique de confidentialité, CGU)
 * Creates default legal pages for all domains
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const legalPages = [
  {
    slug: 'mentions-legales',
    title: 'Mentions Légales',
    content: `# Mentions Légales

## 1. Éditeur du site

**Nom de l'entreprise :** NETZ Informatique
**Forme juridique :** Micro-entreprise
**Siège social :** 22 Rue du Général de Gaulle, 67500 Haguenau, France
**SIRET :** [À compléter]
**Email :** contact@netzinformatique.fr
**Téléphone :** 03 67 31 07 70

**Directeur de la publication :** Mikail Lekesiz
**Responsable de la rédaction :** Mikail Lekesiz

## 2. Hébergement

**Hébergeur :** Vercel Inc.
**Adresse :** 340 S Lemon Ave #4133, Walnut, CA 91789, USA
**Site web :** https://vercel.com
**Téléphone :** +1 (559) 288-7060

## 3. Propriété intellectuelle

L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.

La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.

## 4. Protection des données personnelles

Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.

Pour exercer ces droits, veuillez nous contacter :
- **Par email :** contact@netzinformatique.fr
- **Par courrier :** NETZ Informatique, 22 Rue du Général de Gaulle, 67500 Haguenau, France

## 5. Cookies

Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. Vous pouvez gérer vos préférences de cookies via le bandeau de consentement affiché lors de votre première visite.

## 6. Responsabilité

Les informations fournies sur ce site le sont à titre indicatif. NETZ Informatique s'efforce d'assurer l'exactitude et la mise à jour des informations, mais ne saurait être tenu responsable des erreurs, omissions ou résultats obtenus par une mauvaise utilisation.

## 7. Liens externes

Ce site peut contenir des liens vers des sites externes. NETZ Informatique n'est pas responsable du contenu de ces sites et décline toute responsabilité quant aux informations qui y sont diffusées.

## 8. Droit applicable

Le présent site et les présentes mentions légales sont régis par le droit français. En cas de litige, les tribunaux français seront seuls compétents.

---

*Dernière mise à jour : 15 octobre 2025*
`,
  },
  {
    slug: 'politique-confidentialite',
    title: 'Politique de Confidentialité',
    content: `# Politique de Confidentialité

## 1. Introduction

NETZ Informatique accorde une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).

## 2. Responsable du traitement

**Responsable :** NETZ Informatique
**Adresse :** 22 Rue du Général de Gaulle, 67500 Haguenau, France
**Email :** contact@netzinformatique.fr
**Téléphone :** 03 67 31 07 70

## 3. Données collectées

### 3.1 Données fournies directement par vous

Lorsque vous utilisez notre site, nous collectons les informations suivantes :
- **Informations d'identification :** nom, prénom
- **Coordonnées :** adresse email, numéro de téléphone
- **Informations professionnelles :** nom d'entreprise, adresse, secteur d'activité
- **Avis et commentaires :** texte des avis, notes données

### 3.2 Données collectées automatiquement

- Adresse IP
- Type de navigateur et version
- Système d'exploitation
- Pages visitées et durée de visite
- Date et heure de connexion
- Données de géolocalisation (ville, région)

### 3.3 Cookies

Nous utilisons des cookies pour améliorer votre expérience. Consultez notre politique de cookies pour plus d'informations.

## 4. Finalités du traitement

Vos données personnelles sont utilisées pour :
- **Gestion de votre compte** : créer et gérer votre profil utilisateur
- **Publication d'annuaires** : afficher les informations des entreprises
- **Avis et commentaires** : publier et modérer les avis clients
- **Communication** : répondre à vos demandes de contact
- **Amélioration du service** : analyser l'utilisation du site
- **Obligations légales** : respecter nos obligations réglementaires

## 5. Base légale du traitement

Le traitement de vos données repose sur :
- **Votre consentement** : pour l'envoi de newsletters et la gestion des cookies
- **Exécution d'un contrat** : pour la gestion de votre compte
- **Intérêt légitime** : pour l'amélioration de nos services
- **Obligation légale** : pour le respect de la législation

## 6. Destinataires des données

Vos données peuvent être communiquées à :
- **Personnel autorisé** : équipe de NETZ Informatique
- **Prestataires techniques** : hébergement (Vercel), analytics (Google Analytics)
- **Autorités légales** : sur réquisition judiciaire

Nous ne vendons ni ne louons vos données personnelles à des tiers.

## 7. Durée de conservation

Vos données sont conservées pendant :
- **Données de compte** : durée de votre inscription + 3 ans après la dernière connexion
- **Avis publiés** : durée indéterminée (sauf demande de suppression)
- **Logs de connexion** : 12 mois
- **Cookies** : selon la durée définie dans la politique de cookies

## 8. Vos droits (RGPD)

Conformément au RGPD, vous disposez des droits suivants :

### 8.1 Droit d'accès
Obtenir la confirmation que vos données sont traitées et y accéder.

### 8.2 Droit de rectification
Corriger ou compléter vos données inexactes ou incomplètes.

### 8.3 Droit à l'effacement
Demander la suppression de vos données dans certaines conditions.

### 8.4 Droit d'opposition
Vous opposer au traitement de vos données pour des raisons légitimes.

### 8.5 Droit à la limitation
Limiter le traitement de vos données dans certains cas.

### 8.6 Droit à la portabilité
Recevoir vos données dans un format structuré et les transmettre à un autre responsable.

### 8.7 Droit de retirer votre consentement
Retirer votre consentement à tout moment pour les traitements qui le nécessitent.

### 8.8 Exercice de vos droits

Pour exercer ces droits, contactez-nous :
- **Email :** contact@netzinformatique.fr
- **Courrier :** NETZ Informatique, 22 Rue du Général de Gaulle, 67500 Haguenau, France

Nous répondrons à votre demande dans un délai d'un mois.

## 9. Sécurité des données

Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre :
- L'accès non autorisé
- La modification
- La divulgation
- La destruction

## 10. Transferts internationaux

Vos données peuvent être transférées et stockées aux États-Unis (hébergement Vercel). Ces transferts sont encadrés par des garanties appropriées conformément au RGPD.

## 11. Modifications

Cette politique peut être modifiée à tout moment. Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour.

## 12. Réclamation

Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
- **Site web :** www.cnil.fr
- **Adresse :** 3 Place de Fontenoy, 75007 Paris, France
- **Téléphone :** 01 53 73 22 22

## 13. Contact

Pour toute question concernant cette politique de confidentialité :
- **Email :** contact@netzinformatique.fr
- **Téléphone :** 03 67 31 07 70

---

*Dernière mise à jour : 15 octobre 2025*
`,
  },
  {
    slug: 'cgu',
    title: "Conditions Générales d'Utilisation",
    content: `# Conditions Générales d'Utilisation (CGU)

## 1. Objet

Les présentes Conditions Générales d'Utilisation (ci-après "CGU") ont pour objet de définir les modalités et conditions d'utilisation du site internet exploité par NETZ Informatique, ainsi que les droits et obligations des utilisateurs.

## 2. Définitions

- **Site** : le site internet accessible à l'adresse [domaine].pro et ses sous-domaines
- **Éditeur** : NETZ Informatique, responsable de la publication du site
- **Utilisateur** : toute personne accédant et utilisant le site
- **Professionnel** : entreprise ou professionnel inscrit dans l'annuaire
- **Contenu** : ensemble des informations, textes, images, avis disponibles sur le site

## 3. Acceptation des CGU

L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le site.

L'Éditeur se réserve le droit de modifier les CGU à tout moment. Les modifications seront effectives dès leur publication sur le site.

## 4. Accès au site

### 4.1 Disponibilité

Le site est accessible 24h/24, 7j/7, sauf en cas de :
- Force majeure
- Maintenance programmée ou d'urgence
- Panne technique
- Interruption du réseau internet

L'Éditeur s'efforce d'assurer la disponibilité du site mais ne peut garantir une accessibilité continue.

### 4.2 Modifications et interruptions

L'Éditeur se réserve le droit de :
- Modifier, suspendre ou interrompre tout ou partie du site
- Modifier les fonctionnalités et services proposés
- Mettre à jour le contenu

Ces modifications peuvent intervenir sans préavis.

## 5. Services proposés

Le site propose les services suivants :

### 5.1 Annuaire de professionnels
- Recherche d'entreprises par nom, catégorie, ville
- Consultation des fiches détaillées des professionnels
- Accès aux coordonnées et informations pratiques

### 5.2 Système d'avis
- Publication d'avis sur les professionnels (utilisateurs inscrits)
- Consultation des avis publiés
- Notation des établissements

### 5.3 Espace professionnel
- Création et gestion de fiche entreprise
- Réponse aux avis clients
- Gestion des informations professionnelles

## 6. Inscription et compte utilisateur

### 6.1 Création de compte

Pour accéder à certains services (publication d'avis, gestion de fiche professionnelle), vous devez créer un compte en fournissant :
- Une adresse email valide
- Un mot de passe sécurisé
- Des informations exactes et à jour

### 6.2 Responsabilités de l'utilisateur

Vous êtes responsable de :
- La confidentialité de vos identifiants de connexion
- Toutes les activités effectuées depuis votre compte
- La mise à jour régulière de vos informations
- La déconnexion après chaque session

En cas de perte ou de vol de vos identifiants, vous devez immédiatement nous en informer.

### 6.3 Suspension et suppression de compte

L'Éditeur se réserve le droit de suspendre ou supprimer tout compte :
- En cas de violation des présentes CGU
- En cas d'utilisation frauduleuse
- En cas d'inactivité prolongée (> 24 mois)
- Sans préavis si nécessaire pour des raisons de sécurité

## 7. Obligations des utilisateurs

En utilisant le site, vous vous engagez à :

### 7.1 Fournir des informations exactes
- Ne pas usurper l'identité d'autrui
- Ne pas créer de faux comptes
- Maintenir vos informations à jour

### 7.2 Utilisation conforme
- Respecter les lois et réglementations en vigueur
- Ne pas utiliser le site à des fins illégales
- Ne pas porter atteinte aux droits de tiers

### 7.3 Respect des autres utilisateurs
- Ne pas publier de contenu offensant, diffamatoire ou injurieux
- Ne pas harceler ou menacer d'autres utilisateurs
- Respecter la vie privée des autres

### 7.4 Sécurité
- Ne pas tenter d'accéder de manière non autorisée au site
- Ne pas perturber le fonctionnement du site
- Ne pas introduire de virus ou code malveillant

## 8. Avis et commentaires

### 8.1 Publication d'avis

Les utilisateurs peuvent publier des avis sur les professionnels. Ces avis doivent :
- Être basés sur une expérience réelle et vérifiée
- Être honnêtes, objectifs et constructifs
- Respecter la vie privée des personnes
- Ne pas contenir de propos :
  - Diffamatoires ou injurieux
  - Racistes, sexistes ou discriminatoires
  - Publicitaires ou promotionnels
  - Contraires à l'ordre public

### 8.2 Modération

L'Éditeur se réserve le droit de :
- Modérer les avis avant publication
- Modifier ou supprimer tout contenu inapproprié
- Refuser la publication d'un avis
- Supprimer un compte en cas d'abus répétés

Les décisions de modération sont prises à la seule discrétion de l'Éditeur.

### 8.3 Responsabilité des avis

Les avis publiés reflètent l'opinion personnelle de leurs auteurs. L'Éditeur ne peut être tenu responsable du contenu des avis, sous réserve de sa responsabilité en tant qu'hébergeur.

## 9. Propriété intellectuelle

### 9.1 Protection

Tous les éléments du site sont protégés par le droit d'auteur et sont la propriété exclusive de l'Éditeur ou de ses partenaires :
- Structure et design du site
- Textes et contenus éditoriaux
- Logos et marques
- Images et illustrations
- Code source et logiciels

### 9.2 Utilisation autorisée

Vous êtes autorisé à :
- Consulter le site pour un usage personnel et non commercial
- Imprimer des pages pour un usage personnel

### 9.3 Utilisations interdites

Il est strictement interdit de :
- Reproduire, copier ou diffuser le contenu sans autorisation
- Utiliser le contenu à des fins commerciales
- Modifier, adapter ou créer des œuvres dérivées
- Extraire ou réutiliser une partie substantielle du contenu

Toute violation peut entraîner des poursuites judiciaires.

## 10. Limitation de responsabilité

### 10.1 Informations publiées

L'Éditeur s'efforce d'assurer l'exactitude des informations mais ne peut être tenu responsable :
- Des erreurs ou omissions dans les informations
- De l'exactitude des informations fournies par les professionnels
- Des changements survenus depuis la publication

### 10.2 Utilisation du site

L'Éditeur ne peut être tenu responsable :
- Des dommages directs ou indirects résultant de l'utilisation du site
- Des interruptions de service
- De la perte de données
- Des virus ou programmes malveillants

### 10.3 Actes de tiers

L'Éditeur ne peut être tenu responsable :
- Des actes des utilisateurs
- Des contenus publiés par des tiers
- Des sites externes liés au site

## 11. Protection des données personnelles

Le traitement de vos données personnelles est régi par notre [Politique de Confidentialité](/politique-confidentialite), que nous vous invitons à consulter.

Conformément au RGPD, vous disposez de droits sur vos données (accès, rectification, effacement, opposition, portabilité).

## 12. Liens externes

Le site peut contenir des liens vers des sites externes. L'Éditeur :
- N'est pas responsable du contenu de ces sites
- Ne contrôle pas ces sites externes
- Décline toute responsabilité quant aux informations diffusées sur ces sites

L'inclusion de liens ne signifie pas l'approbation de ces sites par l'Éditeur.

## 13. Cookies

Le site utilise des cookies pour améliorer votre expérience et analyser le trafic. Vous pouvez gérer vos préférences via le bandeau de consentement.

Pour plus d'informations, consultez notre [Politique de Confidentialité](/politique-confidentialite).

## 14. Droit applicable et juridiction compétente

### 14.1 Droit applicable

Les présentes CGU sont régies par le droit français, quelle que soit votre localisation.

### 14.2 Règlement des litiges

En cas de litige relatif à l'interprétation ou l'exécution des présentes CGU :
1. Tentative de résolution amiable par contact avec notre service client
2. À défaut d'accord, recours possible à la médiation
3. En dernier recours, compétence exclusive des tribunaux français

### 14.3 Médiation

Conformément à la réglementation, vous pouvez recourir gratuitement à un médiateur de la consommation :
**Nom :** [À compléter]
**Site web :** [À compléter]

## 15. Modifications des CGU

L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment pour :
- S'adapter aux évolutions techniques et juridiques
- Améliorer les services proposés
- Corriger des erreurs ou omissions

Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour. Votre utilisation continue du site après les modifications vaut acceptation des nouvelles CGU.

## 16. Nullité partielle

Si une clause des présentes CGU est déclarée nulle ou inapplicable, elle sera réputée non écrite, sans affecter la validité des autres clauses.

## 17. Non-renonciation

Le fait pour l'Éditeur de ne pas se prévaloir d'un manquement de votre part aux présentes CGU ne saurait être interprété comme une renonciation à invoquer ce manquement ultérieurement.

## 18. Contact

Pour toute question concernant ces CGU, contactez-nous :

**NETZ Informatique**
- **Email :** contact@netzinformatique.fr
- **Téléphone :** 03 67 31 07 70
- **Adresse :** 22 Rue du Général de Gaulle, 67500 Haguenau, France

**Horaires :**
Lundi - Vendredi : 9h00 - 12h00 et 14h00 - 18h00

---

*Dernière mise à jour : 15 octobre 2025*
`,
  },
];

async function main() {
  console.log('🌱 Seeding legal pages...');

  for (const page of legalPages) {
    console.log(`Creating: ${page.title}`);

    const existingPage = await prisma.legalPage.findFirst({
      where: {
        slug: page.slug,
        domainId: null,
      },
    });

    if (existingPage) {
      await prisma.legalPage.update({
        where: { id: existingPage.id },
        data: {
          title: page.title,
          content: page.content,
          isActive: true,
        },
      });
    } else {
      await prisma.legalPage.create({
        data: {
          slug: page.slug,
          title: page.title,
          content: page.content,
          domainId: null,
          isActive: true,
        },
      });
    }

    console.log(`  ✅ ${page.title}`);
  }

  console.log('\n✅ Legal pages seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
