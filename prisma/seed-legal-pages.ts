import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const legalPages = [
  {
    slug: 'mentions-legales',
    title: 'Mentions Légales',
    content: `# Mentions Légales

## Éditeur du site

**Nom du site** : Annuaire des Professionnels du Bas-Rhin  
**Propriétaire** : [Nom de votre entreprise]  
**Adresse** : [Votre adresse]  
**Email** : contact@bas-rhin.pro  
**Téléphone** : [Votre téléphone]  
**SIRET** : [Votre SIRET]  
**Directeur de publication** : [Nom du directeur]

## Hébergement

**Hébergeur** : Vercel Inc.  
**Adresse** : 340 S Lemon Ave #4133, Walnut, CA 91789, USA  
**Site web** : https://vercel.com

## Propriété intellectuelle

L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.

## Protection des données personnelles

Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. Pour exercer ce droit, contactez-nous à : contact@bas-rhin.pro

## Cookies

Ce site utilise des cookies pour améliorer l'expérience utilisateur. En poursuivant votre navigation, vous acceptez l'utilisation de cookies.

---

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*
`
  },
  {
    slug: 'politique-confidentialite',
    title: 'Politique de Confidentialité',
    content: `# Politique de Confidentialité

## Introduction

La protection de vos données personnelles est une priorité pour nous. Cette politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons et vos droits concernant ces données.

## Données collectées

### Données fournies directement
- Nom et prénom
- Adresse email
- Numéro de téléphone
- Informations professionnelles (pour les professionnels inscrits)

### Données collectées automatiquement
- Adresse IP
- Type de navigateur
- Pages visitées
- Durée de visite
- Cookies

## Utilisation des données

Vos données sont utilisées pour :
- Gérer votre compte et vos annonces
- Vous contacter concernant nos services
- Améliorer nos services
- Respecter nos obligations légales

## Partage des données

Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées avec :
- Nos prestataires de services (hébergement, analytics)
- Les autorités légales si requis par la loi

## Vos droits (RGPD)

Conformément au RGPD, vous disposez des droits suivants :
- **Droit d'accès** : obtenir une copie de vos données
- **Droit de rectification** : corriger vos données
- **Droit à l'effacement** : supprimer vos données
- **Droit à la portabilité** : recevoir vos données dans un format structuré
- **Droit d'opposition** : vous opposer au traitement de vos données

Pour exercer ces droits, contactez-nous à : contact@bas-rhin.pro

## Sécurité

Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction.

## Conservation des données

Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont traitées, conformément à la législation en vigueur.

## Cookies

Nous utilisons des cookies pour :
- Mémoriser vos préférences
- Analyser le trafic du site
- Améliorer l'expérience utilisateur

Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.

## Contact

Pour toute question concernant cette politique de confidentialité :  
**Email** : contact@bas-rhin.pro  
**Adresse** : [Votre adresse]

---

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*
`
  },
  {
    slug: 'cgu',
    title: 'Conditions Générales d\'Utilisation',
    content: `# Conditions Générales d'Utilisation (CGU)

## 1. Objet

Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation du site annuaire des professionnels du Bas-Rhin.

## 2. Acceptation des CGU

L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.

## 3. Accès au site

### 3.1 Accès libre
L'accès au site est gratuit pour tous les utilisateurs disposant d'un accès à Internet.

### 3.2 Disponibilité
Nous nous efforçons de maintenir le site accessible 24h/24 et 7j/7, mais nous ne pouvons garantir une disponibilité absolue.

### 3.3 Maintenance
Le site peut être temporairement indisponible en raison d'opérations de maintenance.

## 4. Utilisation du site

### 4.1 Usage autorisé
Le site est destiné à :
- Rechercher des professionnels locaux
- Consulter des informations sur les entreprises
- Contacter des professionnels

### 4.2 Usage interdit
Il est strictement interdit de :
- Utiliser le site à des fins illégales
- Collecter des données de manière automatisée (scraping)
- Publier du contenu offensant ou diffamatoire
- Usurper l'identité d'autrui
- Tenter de compromettre la sécurité du site

## 5. Inscription des professionnels

### 5.1 Création de compte
Les professionnels peuvent créer un compte pour gérer leur présence sur le site.

### 5.2 Exactitude des informations
Vous vous engagez à fournir des informations exactes et à les maintenir à jour.

### 5.3 Sécurité du compte
Vous êtes responsable de la confidentialité de vos identifiants de connexion.

## 6. Contenu publié

### 6.1 Responsabilité
Les professionnels sont responsables du contenu qu'ils publient.

### 6.2 Modération
Nous nous réservons le droit de modérer, modifier ou supprimer tout contenu inapproprié.

### 6.3 Propriété intellectuelle
En publiant du contenu, vous accordez au site une licence d'utilisation non exclusive.

## 7. Avis et commentaires

### 7.1 Publication d'avis
Les utilisateurs peuvent publier des avis sur les professionnels.

### 7.2 Authenticité
Les avis doivent être authentiques et basés sur une expérience réelle.

### 7.3 Modération
Les avis peuvent être modérés pour respecter nos standards de qualité.

## 8. Limitation de responsabilité

### 8.1 Contenu tiers
Nous ne sommes pas responsables du contenu publié par les utilisateurs ou les professionnels.

### 8.2 Exactitude des informations
Nous ne garantissons pas l'exactitude absolue des informations publiées.

### 8.3 Dommages
Nous ne saurions être tenus responsables des dommages directs ou indirects résultant de l'utilisation du site.

## 9. Propriété intellectuelle

Tous les éléments du site (textes, images, logos, etc.) sont protégés par le droit d'auteur et ne peuvent être reproduits sans autorisation.

## 10. Données personnelles

Le traitement de vos données personnelles est régi par notre Politique de Confidentialité.

## 11. Modification des CGU

Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.

## 12. Droit applicable

Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents.

## 13. Contact

Pour toute question concernant ces CGU :  
**Email** : contact@bas-rhin.pro  
**Adresse** : [Votre adresse]

---

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*
`
  },
  {
    slug: 'tarifs',
    title: 'Tarifs',
    content: `# Tarifs

## Annuaire des Professionnels du Bas-Rhin

Découvrez nos différentes offres pour augmenter votre visibilité locale et développer votre activité.

---

## 🆓 Offre Gratuite

**Idéal pour démarrer**

### Inclus :
- ✅ Fiche entreprise basique
- ✅ Coordonnées (adresse, téléphone, email)
- ✅ Horaires d'ouverture
- ✅ Catégorie d'activité
- ✅ Localisation sur carte

### Prix : **Gratuit**

[Créer mon profil gratuit](#)

---

## ⭐ Offre Premium

**Pour se démarquer**

### Inclus :
Tout de l'offre Gratuite, plus :
- ✅ **Mise en avant** dans les résultats de recherche
- ✅ **Photos illimitées** (galerie)
- ✅ **Description détaillée** de vos services
- ✅ **Promotions et offres spéciales**
- ✅ **Badge "Professionnel Vérifié"**
- ✅ **Statistiques de visibilité**
- ✅ **Réponse aux avis clients**

### Prix : **29€ HT/mois**
*Engagement 12 mois : 25€ HT/mois*

[Choisir Premium](#)

---

## 🚀 Offre Business

**Pour maximiser votre visibilité**

### Inclus :
Tout de l'offre Premium, plus :
- ✅ **Position prioritaire** en tête de liste
- ✅ **Page entreprise personnalisée**
- ✅ **Vidéo de présentation**
- ✅ **Articles/actualités** de votre entreprise
- ✅ **Formulaire de contact direct**
- ✅ **Intégration réseaux sociaux**
- ✅ **Support prioritaire**
- ✅ **Rapport mensuel détaillé**

### Prix : **79€ HT/mois**
*Engagement 12 mois : 69€ HT/mois*

[Choisir Business](#)

---

## 💼 Offre Sur Mesure

**Pour les besoins spécifiques**

Vous avez des besoins particuliers ? Nous créons une offre personnalisée adaptée à votre activité.

### Possibilités :
- Multi-établissements
- Intégration API
- Campagnes publicitaires ciblées
- Formation à l'utilisation de la plateforme
- Gestion de votre présence en ligne

### Prix : **Sur devis**

[Nous contacter](#)

---

## 📊 Comparatif des offres

| Fonctionnalité | Gratuit | Premium | Business |
|----------------|---------|---------|----------|
| Fiche entreprise | ✅ | ✅ | ✅ |
| Photos | 3 max | Illimité | Illimité |
| Mise en avant | ❌ | ✅ | ✅✅ |
| Badge vérifié | ❌ | ✅ | ✅ |
| Statistiques | ❌ | Basiques | Détaillées |
| Vidéo | ❌ | ❌ | ✅ |
| Articles | ❌ | ❌ | ✅ |
| Support | Standard | Prioritaire | Prioritaire |

---

## ❓ Questions Fréquentes

### Comment souscrire ?
Créez votre compte et choisissez l'offre qui vous convient. Vous pouvez commencer gratuitement et upgrader à tout moment.

### Puis-je changer d'offre ?
Oui, vous pouvez upgrader ou downgrader votre offre à tout moment.

### Y a-t-il un engagement ?
L'offre gratuite n'a pas d'engagement. Les offres payantes sont sans engagement ou avec engagement 12 mois (tarif réduit).

### Quels moyens de paiement ?
Nous acceptons les cartes bancaires, virements et prélèvements SEPA.

### Puis-je annuler ?
Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client.

---

## 📞 Besoin d'aide ?

Notre équipe est à votre disposition pour vous conseiller.

**Email** : contact@bas-rhin.pro  
**Téléphone** : [Votre téléphone]

---

*Prix valables au ${new Date().toLocaleDateString('fr-FR')}. TVA non applicable, art. 293 B du CGI.*
`
  }
];

async function main() {
  console.log('🔄 Seeding legal pages...\n');

  for (const page of legalPages) {
    const result = await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
      },
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        domainId: null, // Global pour tous les domains
      },
    });
    
    console.log(`✅ ${result.title} (/${result.slug})`);
  }

  console.log('\n✨ Legal pages seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
