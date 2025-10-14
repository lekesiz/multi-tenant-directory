import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLegalPages() {
  console.log('🔄 Updating legal pages with company information...');

  // Mentions Légales
  const mentionsLegales = `# Mentions Légales

Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux utilisateurs du site l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.

## Éditeur du Site

**Raison sociale** : NETZ INFORMATIQUE  
**Forme juridique** : SAS (Société par Actions Simplifiée)  
**Capital social** : 100,00 €  
**Siège social** : 1 A Route de Schweighouse, 67500 HAGUENAU, France  

**SIREN** : 818 347 346  
**SIRET** : 818 347 346 00020  
**N° TVA Intracommunautaire** : FR83 818 347 346  
**RCS** : Strasbourg  
**Code APE** : 85.59B (Autres enseignements)  

**Téléphone** : +33 8 99 25 01 51  
**Email** : contact@netzinformatique.fr  
**Site web** : https://www.netzinformatique.fr  

**Directeur de la publication** : Mikail Lekesiz, Président  
**Email** : contact@netzinformatique.fr  

## Hébergement

Le site est hébergé par :

**Vercel Inc.**  
440 N Barranca Ave #4133  
Covina, CA 91723  
États-Unis  
Site web : https://vercel.com  

## Propriété Intellectuelle

L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.

La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.

## Données Personnelles

Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.

Pour exercer ces droits, vous pouvez nous contacter :
- Par email : contact@netzinformatique.fr
- Par courrier : NETZ INFORMATIQUE, 1 A Route de Schweighouse, 67500 HAGUENAU, France

## Cookies

Le site peut être amené à vous demander l'acceptation des cookies pour des besoins de statistiques et d'affichage. Un cookie est une information déposée sur votre disque dur par le serveur du site que vous visitez.

Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.

## Limitation de Responsabilité

NETZ INFORMATIQUE ne pourra être tenue responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications indiquées, soit de l'apparition d'un bug ou d'une incompatibilité.

NETZ INFORMATIQUE ne pourra également être tenue responsable des dommages indirects (tels par exemple qu'une perte de marché ou perte d'une chance) consécutifs à l'utilisation du site.

## Droit Applicable

Tout litige en relation avec l'utilisation du site est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de Strasbourg.

---

*Dernière mise à jour : Octobre 2025*`;

  // Politique de Confidentialité
  const politiqueConfidentialite = `# Politique de Confidentialité

NETZ INFORMATIQUE accorde une grande importance à la protection de vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos données.

## Responsable du Traitement

**NETZ INFORMATIQUE**  
SAS au capital de 100,00 €  
Siège social : 1 A Route de Schweighouse, 67500 HAGUENAU, France  
SIREN : 818 347 346  
Email : contact@netzinformatique.fr  
Téléphone : +33 8 99 25 01 51  

**Délégué à la Protection des Données (DPO)** : Mikail Lekesiz  
Email : contact@netzinformatique.fr  

## Données Collectées

Dans le cadre de l'utilisation de nos services, nous sommes susceptibles de collecter les données suivantes :

### Données d'Identification
- Nom et prénom
- Adresse email
- Numéro de téléphone
- Adresse postale

### Données de Navigation
- Adresse IP
- Type et version du navigateur
- Pages visitées
- Date et heure de connexion
- Données de localisation

### Données Professionnelles
- Nom de l'entreprise
- SIRET
- Secteur d'activité
- Fonction

## Finalités du Traitement

Vos données personnelles sont collectées et traitées pour les finalités suivantes :

1. **Gestion des demandes de contact** : Répondre à vos demandes d'information
2. **Gestion des services** : Fournir nos services informatiques
3. **Amélioration de nos services** : Analyser l'utilisation du site
4. **Communication commerciale** : Vous informer de nos offres (avec votre consentement)
5. **Obligations légales** : Respecter nos obligations comptables et fiscales

## Base Légale du Traitement

Le traitement de vos données repose sur :
- Votre **consentement** (newsletter, cookies)
- L'**exécution d'un contrat** (prestations de services)
- Le respect d'**obligations légales** (comptabilité, fiscalité)
- Notre **intérêt légitime** (amélioration des services)

## Destinataires des Données

Vos données personnelles sont destinées aux services internes de NETZ INFORMATIQUE. Elles peuvent également être transmises à nos sous-traitants :

- Hébergeur du site : Vercel Inc.
- Prestataires de services informatiques
- Services de paiement (si applicable)
- Autorités administratives ou judiciaires (sur réquisition)

## Durée de Conservation

Vos données sont conservées pour la durée nécessaire aux finalités pour lesquelles elles sont traitées :

- **Données de contact** : 3 ans après le dernier contact
- **Données clients** : 10 ans (obligations comptables)
- **Données de navigation** : 13 mois (cookies)
- **Newsletter** : Jusqu'à désinscription

## Vos Droits

Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :

### Droit d'Accès
Vous pouvez demander l'accès à vos données personnelles.

### Droit de Rectification
Vous pouvez demander la correction de vos données inexactes ou incomplètes.

### Droit à l'Effacement
Vous pouvez demander la suppression de vos données dans certains cas.

### Droit à la Limitation
Vous pouvez demander la limitation du traitement de vos données.

### Droit à la Portabilité
Vous pouvez recevoir vos données dans un format structuré et couramment utilisé.

### Droit d'Opposition
Vous pouvez vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière.

### Droit de Retirer votre Consentement
Vous pouvez retirer votre consentement à tout moment.

## Exercice de vos Droits

Pour exercer vos droits, vous pouvez nous contacter :

**Par email** : contact@netzinformatique.fr  
**Par courrier** : NETZ INFORMATIQUE, 1 A Route de Schweighouse, 67500 HAGUENAU, France  

Nous vous répondrons dans un délai d'un mois suivant la réception de votre demande.

## Réclamation

Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :

**Commission Nationale de l'Informatique et des Libertés (CNIL)**  
3 Place de Fontenoy  
TSA 80715  
75334 PARIS CEDEX 07  
Téléphone : 01 53 73 22 22  
Site web : https://www.cnil.fr  

## Sécurité des Données

NETZ INFORMATIQUE met en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre la destruction, la perte, l'altération, la divulgation ou l'accès non autorisé.

Nos mesures de sécurité incluent :
- Chiffrement des données sensibles (SSL/TLS)
- Accès restreint aux données personnelles
- Sauvegardes régulières
- Pare-feu et antivirus
- Sensibilisation du personnel

## Transferts de Données

Vos données personnelles peuvent être transférées vers des pays situés en dehors de l'Union Européenne, notamment vers les États-Unis (hébergeur Vercel). Ces transferts sont encadrés par des garanties appropriées conformément au RGPD.

## Cookies

Le site utilise des cookies pour améliorer votre expérience de navigation. Pour plus d'informations, consultez notre politique de cookies disponible sur le site.

## Modifications

Cette politique de confidentialité peut être modifiée à tout moment. La version en vigueur est celle publiée sur le site. Nous vous informerons de toute modification substantielle.

## Contact

Pour toute question concernant cette politique de confidentialité :

**Email** : contact@netzinformatique.fr  
**Téléphone** : +33 8 99 25 01 51  
**Adresse** : 1 A Route de Schweighouse, 67500 HAGUENAU, France  

---

*Dernière mise à jour : Octobre 2025*`;

  // CGU (Conditions Générales d'Utilisation)
  const cgu = `# Conditions Générales d'Utilisation (CGU)

## 1. Objet

Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d'utilisation des services proposés sur le site, ainsi que de définir les droits et obligations des parties dans ce cadre.

## 2. Mentions Légales

**Éditeur** : NETZ INFORMATIQUE  
SAS au capital de 100,00 €  
Siège social : 1 A Route de Schweighouse, 67500 HAGUENAU, France  
SIREN : 818 347 346  
SIRET : 818 347 346 00020  
N° TVA Intracommunautaire : FR83 818 347 346  
RCS : Strasbourg  
Email : contact@netzinformatique.fr  
Téléphone : +33 8 99 25 01 51  

**Directeur de la publication** : Mikail Lekesiz, Président  

**Hébergeur** : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis  

## 3. Accès au Site

L'accès au site et son utilisation sont réservés à un usage strictement personnel. Vous vous engagez à ne pas utiliser ce site et les informations ou données qui y figurent à des fins commerciales, politiques, publicitaires et pour toute forme de sollicitation commerciale.

## 4. Contenu du Site

NETZ INFORMATIQUE s'efforce de fournir sur le site des informations aussi précises que possible. Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.

## 5. Propriété Intellectuelle

Tous les éléments du site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) sont la propriété exclusive de NETZ INFORMATIQUE, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.

Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de NETZ INFORMATIQUE.

## 6. Liens Hypertextes

Le site peut contenir des liens hypertextes vers d'autres sites. NETZ INFORMATIQUE n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.

La mise en place d'un lien hypertexte vers le site nécessite une autorisation préalable écrite de NETZ INFORMATIQUE.

## 7. Protection des Données Personnelles

Les données personnelles collectées sur le site sont traitées conformément à notre Politique de Confidentialité, disponible sur le site.

Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.

Pour exercer ces droits : contact@netzinformatique.fr

## 8. Cookies

Le site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques de visite. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.

## 9. Responsabilité

NETZ INFORMATIQUE ne pourra être tenue responsable des dommages directs et indirects causés au matériel de l'utilisateur lors de l'accès au site.

NETZ INFORMATIQUE décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur le site.

## 10. Services Proposés

Le site constitue un annuaire de professionnels permettant :
- La recherche d'entreprises et de professionnels
- La consultation de fiches d'information sur les entreprises
- La mise en relation avec les professionnels

Les informations présentées sur le site sont fournies à titre indicatif et peuvent être modifiées sans préavis.

## 11. Inscription et Compte Utilisateur

L'accès à certaines fonctionnalités du site peut nécessiter la création d'un compte utilisateur. Vous vous engagez à :
- Fournir des informations exactes et à jour
- Maintenir la confidentialité de vos identifiants
- Ne pas créer de faux comptes
- Ne pas usurper l'identité d'autrui

NETZ INFORMATIQUE se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.

## 12. Contenu Utilisateur

Si vous publiez du contenu sur le site (avis, commentaires, etc.), vous garantissez :
- Détenir tous les droits nécessaires sur ce contenu
- Que ce contenu ne viole aucune loi ou droit de tiers
- Que ce contenu n'est pas diffamatoire, injurieux ou obscène

NETZ INFORMATIQUE se réserve le droit de modérer, modifier ou supprimer tout contenu inapproprié.

## 13. Disponibilité du Site

NETZ INFORMATIQUE s'efforce d'assurer la disponibilité du site 24h/24, 7j/7. Toutefois, elle ne peut garantir une disponibilité absolue et se réserve le droit d'interrompre l'accès au site pour maintenance ou mise à jour.

## 14. Modification des CGU

NETZ INFORMATIQUE se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles conditions seront applicables dès leur mise en ligne. Il est conseillé de consulter régulièrement les CGU.

## 15. Droit Applicable et Juridiction

Les présentes CGU sont régies par le droit français. En cas de litige, et à défaut d'accord amiable, le litige sera porté devant les tribunaux compétents de Strasbourg.

## 16. Contact

Pour toute question relative aux présentes CGU :

**Email** : contact@netzinformatique.fr  
**Téléphone** : +33 8 99 25 01 51  
**Adresse** : NETZ INFORMATIQUE, 1 A Route de Schweighouse, 67500 HAGUENAU, France  

## 17. Acceptation des CGU

L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le site.

---

*Dernière mise à jour : Octobre 2025*`;

  // Update Mentions Légales
  await prisma.legalPage.update({
    where: { slug: 'mentions-legales' },
    data: {
      title: 'Mentions Légales',
      content: mentionsLegales,
      updatedAt: new Date(),
    },
  });
  console.log('✅ Mentions Légales updated');

  // Update Politique de Confidentialité
  await prisma.legalPage.update({
    where: { slug: 'politique-confidentialite' },
    data: {
      title: 'Politique de Confidentialité',
      content: politiqueConfidentialite,
      updatedAt: new Date(),
    },
  });
  console.log('✅ Politique de Confidentialité updated');

  // Update CGU
  await prisma.legalPage.update({
    where: { slug: 'cgu' },
    data: {
      title: 'Conditions Générales d\'Utilisation',
      content: cgu,
      updatedAt: new Date(),
    },
  });
  console.log('✅ CGU updated');

  console.log('🎉 All legal pages updated successfully!');
}

updateLegalPages()
  .catch((e) => {
    console.error('❌ Error updating legal pages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

