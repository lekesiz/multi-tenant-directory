import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';
import { getCurrentDomainInfo } from '@/lib/queries/domain';

export async function generateMetadata() {
  const { displayName, domain } = await getCurrentDomainInfo();
  return {
    title: `Conditions Générales d'Utilisation - ${displayName}.PRO`,
    description: `Conditions générales d'utilisation du site ${domain}`,
    alternates: {
      canonical: `https://${domain}/cgu`,
    },
  };
}

export default async function CGUPage() {
  const { domain, displayName, domainData } = await getCurrentDomainInfo();
  
  const companyInfo = {
    name: domainData?.settings?.companyName || 'NETZ FRANCE',
    address: domainData?.settings?.address || '1 rue de la Paix, 67500 Haguenau',
    email: `contact@${domain}`,
    supportEmail: `support@${domain}`,
    legalForm: domainData?.settings?.legalForm || 'SARL',
  };
  return (
    <LegalPageLayout title="Conditions Générales d'Utilisation" lastUpdated="15 octobre 2025">
      <div className="space-y-8">
        {/* 1. Objet */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Objet
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir 
              les modalités et conditions d'utilisation des services proposés sur le site internet 
              accessible à l'adresse ${domain} (ci-après « le Site »), ainsi que de définir les droits 
              et obligations des parties dans ce cadre.
            </p>
            <p>
              Le Site propose un service d'annuaire professionnel multi-domaines permettant :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>La consultation d'informations sur des entreprises locales</li>
              <li>La publication et consultation d'avis clients</li>
              <li>La gestion d'un espace professionnel pour les entreprises</li>
              <li>La mise en relation entre clients et professionnels</li>
            </ul>
            <p>
              L'accès et l'utilisation du Site impliquent l'acceptation sans réserve des présentes CGU.
            </p>
          </div>
        </section>

        {/* 2. Mentions légales */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Mentions légales
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Le Site est édité par ${companyInfo.name}, dont les informations complètes 
              sont disponibles dans les{' '}
              <Link href="/mentions-legales" className="text-blue-600 hover:underline">
                Mentions Légales
              </Link>.
            </p>
          </div>
        </section>

        {/* 3. Accès au service */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Accès au service
          </h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-xl font-medium mt-4">3.1 Conditions d'accès</h3>
            <p>
              L'accès au Site est ouvert à toute personne disposant d'un accès à internet. 
              Certaines fonctionnalités nécessitent la création d'un compte utilisateur.
            </p>
            
            <h3 className="text-xl font-medium mt-4">3.2 Création de compte professionnel</h3>
            <p>
              Les professionnels souhaitant gérer leur fiche entreprise doivent créer un compte en fournissant :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Une adresse email valide</li>
              <li>Les informations d'identification de l'entreprise</li>
              <li>Un mot de passe sécurisé</li>
            </ul>
            <p>
              L'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour.
            </p>

            <h3 className="text-xl font-medium mt-4">3.3 Sécurité du compte</h3>
            <p>
              L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. 
              Toute utilisation du compte est présumée effectuée par son titulaire.
            </p>
          </div>
        </section>

        {/* 4. Services proposés */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Services proposés
          </h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-xl font-medium mt-4">4.1 Pour les visiteurs</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Consultation gratuite de l'annuaire des entreprises</li>
              <li>Lecture des avis et évaluations</li>
              <li>Recherche d'entreprises par catégorie ou localisation</li>
              <li>Contact direct avec les entreprises</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">4.2 Pour les professionnels</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Création et gestion de leur fiche entreprise</li>
              <li>Publication de photos et informations</li>
              <li>Gestion des horaires d'ouverture</li>
              <li>Réponse aux avis clients</li>
              <li>Accès aux statistiques de consultation</li>
              <li>Outils de mise en relation avec les clients</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">4.3 Disponibilité du service</h3>
            <p>
              Le Site est accessible 24h/24 et 7j/7, sous réserve d'éventuelles pannes et interventions 
              de maintenance nécessaires au bon fonctionnement du service.
            </p>
          </div>
        </section>

        {/* 5. Obligations de l'utilisateur */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            5. Obligations de l'utilisateur
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>L'utilisateur s'engage à :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Respecter les lois et réglementations en vigueur</li>
              <li>Ne pas porter atteinte à l'ordre public et aux bonnes mœurs</li>
              <li>Ne pas usurper l'identité d'un tiers</li>
              <li>Fournir des informations exactes et sincères</li>
              <li>Ne pas publier de contenus illicites, diffamatoires, injurieux ou discriminatoires</li>
              <li>Ne pas porter atteinte aux droits de propriété intellectuelle de tiers</li>
              <li>Ne pas perturber le bon fonctionnement du Site</li>
              <li>Ne pas utiliser le Site à des fins commerciales non autorisées</li>
              <li>Respecter la vie privée des autres utilisateurs</li>
            </ul>
            <p className="mt-4">
              Tout manquement à ces obligations peut entraîner la suspension ou la suppression du compte utilisateur.
            </p>
          </div>
        </section>

        {/* 6. Contenu utilisateur */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            6. Contenu utilisateur
          </h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-xl font-medium mt-4">6.1 Propriété du contenu</h3>
            <p>
              L'utilisateur conserve la propriété intellectuelle de ses contenus (textes, photos, avis). 
              En les publiant sur le Site, il accorde une licence non exclusive, gratuite et mondiale 
              permettant leur utilisation dans le cadre du service.
            </p>

            <h3 className="text-xl font-medium mt-4">6.2 Responsabilité du contenu</h3>
            <p>
              L'utilisateur est seul responsable des contenus qu'il publie. L'éditeur du Site 
              n'effectue pas de contrôle a priori et ne peut être tenu responsable des contenus publiés.
            </p>

            <h3 className="text-xl font-medium mt-4">6.3 Modération</h3>
            <p>
              L'éditeur se réserve le droit de supprimer tout contenu qui :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Contrevient aux présentes CGU</li>
              <li>Est manifestement illégal ou inapproprié</li>
              <li>Fait l'objet d'une réclamation fondée</li>
              <li>Constitue du spam ou de la publicité non autorisée</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">6.4 Avis clients</h3>
            <p>
              Les avis doivent être authentiques et basés sur une expérience réelle. 
              Il est interdit de publier de faux avis ou de manipuler les évaluations.
              Conformément au décret n° 2017-1436 du 29 septembre 2017, nous nous engageons à garantir
              la transparence et l'authenticité des avis consommateurs.
            </p>
          </div>
        </section>

        {/* 7. Propriété intellectuelle */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            7. Propriété intellectuelle
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Tous les éléments du Site (structure, textes, logos, images, graphismes, etc.) 
              sont protégés par le droit de la propriété intellectuelle et appartiennent à l'éditeur 
              ou à ses partenaires.
            </p>
            <p>
              Toute reproduction, représentation, modification ou exploitation non autorisée 
              est interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.
            </p>
            <p>
              Les marques et logos des entreprises référencées restent la propriété exclusive 
              de leurs titulaires respectifs.
            </p>
          </div>
        </section>

        {/* 8. Données personnelles */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            8. Protection des données personnelles
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              L'utilisation du Site implique le traitement de données personnelles. 
              Ces traitements sont effectués conformément à la réglementation en vigueur (RGPD).
            </p>
            <p>
              Pour plus d'informations, consultez notre{' '}
              <Link href="/politique-de-confidentialite" className="text-blue-600 hover:underline">
                Politique de Confidentialité
              </Link>.
            </p>
          </div>
        </section>

        {/* 9. Responsabilité */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            9. Limitation de responsabilité
          </h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-xl font-medium mt-4">9.1 Disponibilité du service</h3>
            <p>
              L'éditeur s'efforce d'assurer la disponibilité du Site mais ne peut garantir 
              un accès ininterrompu ni l'absence de bugs ou d'erreurs.
            </p>

            <h3 className="text-xl font-medium mt-4">9.2 Contenu des fiches entreprises</h3>
            <p>
              L'éditeur ne garantit pas l'exactitude, l'exhaustivité ou l'actualité 
              des informations publiées sur les fiches entreprises.
            </p>

            <h3 className="text-xl font-medium mt-4">9.3 Relations avec les professionnels</h3>
            <p>
              Le Site met en relation clients et professionnels mais n'intervient pas 
              dans leurs transactions. L'éditeur ne peut être tenu responsable des litiges 
              pouvant survenir entre utilisateurs.
            </p>

            <h3 className="text-xl font-medium mt-4">9.4 Liens externes</h3>
            <p>
              Le Site peut contenir des liens vers des sites tiers. L'éditeur n'est pas 
              responsable du contenu de ces sites externes.
            </p>
          </div>
        </section>

        {/* 10. Modification des CGU */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            10. Modification des CGU
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. 
              Les utilisateurs seront informés des modifications importantes par email 
              ou via une notification sur le Site.
            </p>
            <p>
              L'utilisation continue du Site après modification vaut acceptation des nouvelles CGU.
            </p>
          </div>
        </section>

        {/* 11. Résiliation */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            11. Résiliation
          </h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-xl font-medium mt-4">11.1 Résiliation par l'utilisateur</h3>
            <p>
              L'utilisateur peut fermer son compte à tout moment depuis son espace personnel 
              ou en contactant le support client.
            </p>

            <h3 className="text-xl font-medium mt-4">11.2 Résiliation par l'éditeur</h3>
            <p>
              L'éditeur peut suspendre ou supprimer un compte en cas de :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Violation des présentes CGU</li>
              <li>Comportement frauduleux ou abusif</li>
              <li>Inactivité prolongée (plus de 3 ans)</li>
              <li>Demande des autorités compétentes</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">11.3 Conséquences de la résiliation</h3>
            <p>
              La résiliation entraîne la suppression du compte et l'impossibilité d'accéder 
              aux services réservés. Les contenus publics (avis, etc.) peuvent être conservés.
            </p>
          </div>
        </section>

        {/* 12. Dispositions diverses */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            12. Dispositions diverses
          </h2>
          <div className="text-gray-700 space-y-4">
            <h3 className="text-xl font-medium mt-4">12.1 Intégralité</h3>
            <p>
              Les présentes CGU constituent l'intégralité de l'accord entre l'utilisateur 
              et l'éditeur concernant l'utilisation du Site.
            </p>

            <h3 className="text-xl font-medium mt-4">12.2 Divisibilité</h3>
            <p>
              Si une disposition des CGU est jugée illégale, nulle ou inapplicable, 
              les autres dispositions resteront en vigueur.
            </p>

            <h3 className="text-xl font-medium mt-4">12.3 Non-renonciation</h3>
            <p>
              Le fait de ne pas exercer un droit ou de ne pas exiger l'exécution d'une obligation 
              ne constitue pas une renonciation à ce droit ou à cette obligation.
            </p>
          </div>
        </section>

        {/* 13. Loi applicable et juridiction */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            13. Loi applicable et juridiction compétente
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Les présentes CGU sont régies par le droit français.
            </p>
            <p>
              En cas de litige relatif à l'interprétation ou l'exécution des présentes, 
              les parties s'efforceront de trouver une solution amiable.
            </p>
            <p>
              À défaut d'accord amiable, tout litige sera soumis aux tribunaux compétents 
              conformément aux règles de droit commun.
            </p>
            <p>
              Pour les litiges avec des consommateurs, ceux-ci peuvent recourir à la 
              plateforme de règlement en ligne des litiges mise en place par la Commission européenne : 
              <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {' '}https://ec.europa.eu/consumers/odr/
              </a>
            </p>
          </div>
        </section>

        {/* 14. Contact */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            14. Contact
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Pour toute question concernant les présentes CGU ou l'utilisation du Site, 
              vous pouvez nous contacter :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Par email : <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:underline">{companyInfo.email}</a></li>
              <li>Email support : <a href={`mailto:${companyInfo.supportEmail}`} className="text-blue-600 hover:underline">{companyInfo.supportEmail}</a></li>
              <li>Via le formulaire de contact du Site</li>
              <li>Par courrier : {companyInfo.name}, {companyInfo.address}</li>
            </ul>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}