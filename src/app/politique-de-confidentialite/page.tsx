import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata = {
  title: 'Politique de Confidentialité - Multi-Tenant Directory',
  description: 'Politique de confidentialité et protection des données personnelles du site Multi-Tenant Directory',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPageLayout title="Politique de Confidentialité">
      <div className="space-y-8">
        {/* 1. Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Introduction
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              La protection de vos données personnelles est une priorité pour nous. Cette politique de confidentialité 
              explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles 
              conformément au Règlement Général sur la Protection des Données (RGPD) et à la législation française.
            </p>
            <p>
              <strong>Responsable du traitement :</strong> [À COMPLÉTER - Nom de la société]<br />
              <strong>Adresse :</strong> [À COMPLÉTER - Adresse complète]<br />
              <strong>Email :</strong> dpo@[domain].pro
            </p>
          </div>
        </section>

        {/* 2. Données collectées */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Données collectées
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Nous collectons différents types de données selon votre utilisation du site :</p>
            
            <h3 className="text-xl font-medium mt-4">2.1 Données d'inscription (Professionnels)</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Nom et prénom</li>
              <li>Adresse email professionnelle</li>
              <li>Numéro de téléphone</li>
              <li>Nom de l'entreprise</li>
              <li>Adresse de l'entreprise</li>
              <li>SIRET (optionnel)</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">2.2 Données de navigation</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Adresse IP</li>
              <li>Type et version du navigateur</li>
              <li>Système d'exploitation</li>
              <li>Pages visitées et durée de visite</li>
              <li>Source de trafic (referrer)</li>
              <li>Données de géolocalisation approximative</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">2.3 Données d'utilisation</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Avis et commentaires publiés</li>
              <li>Photos téléchargées</li>
              <li>Messages envoyés via les formulaires de contact</li>
              <li>Préférences et paramètres du compte</li>
            </ul>
          </div>
        </section>

        {/* 3. Finalités du traitement */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Finalités du traitement
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Gestion des comptes utilisateurs :</strong> création, authentification, gestion du profil</li>
              <li><strong>Fourniture du service :</strong> publication d'avis, gestion des entreprises, mise en relation</li>
              <li><strong>Communication :</strong> réponse aux demandes, notifications de service, support client</li>
              <li><strong>Amélioration du service :</strong> analyse statistique, personnalisation, développement de nouvelles fonctionnalités</li>
              <li><strong>Sécurité :</strong> prévention de la fraude, protection contre les abus</li>
              <li><strong>Obligations légales :</strong> conservation des données conformément aux exigences légales</li>
              <li><strong>Marketing (avec consentement) :</strong> envoi de newsletters, offres commerciales</li>
            </ul>
          </div>
        </section>

        {/* 4. Base légale */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Base légale du traitement
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Consentement :</strong> pour les cookies non essentiels, l'envoi de communications marketing</li>
              <li><strong>Exécution du contrat :</strong> pour la fourniture des services demandés</li>
              <li><strong>Intérêt légitime :</strong> pour l'amélioration du service, la sécurité, l'analyse statistique</li>
              <li><strong>Obligation légale :</strong> pour la conservation de certaines données</li>
            </ul>
          </div>
        </section>

        {/* 5. Destinataires des données */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            5. Destinataires des données
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Vos données peuvent être partagées avec :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Personnel autorisé :</strong> employés et prestataires soumis à une obligation de confidentialité</li>
              <li><strong>Prestataires techniques :</strong> 
                <ul className="list-circle list-inside ml-6 mt-2">
                  <li>Hébergement : Vercel</li>
                  <li>Base de données : Neon (PostgreSQL)</li>
                  <li>Email : Resend</li>
                  <li>Analytics : Google Analytics (anonymisé)</li>
                </ul>
              </li>
              <li><strong>Autorités compétentes :</strong> en cas d'obligation légale</li>
            </ul>
            <p className="mt-4">
              <strong>Important :</strong> Nous ne vendons, ne louons et ne partageons jamais vos données personnelles 
              avec des tiers à des fins commerciales sans votre consentement explicite.
            </p>
          </div>
        </section>

        {/* 6. Durée de conservation */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            6. Durée de conservation
          </h2>
          <div className="text-gray-700 space-y-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Type de données</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Durée de conservation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Données de compte actif</td>
                  <td className="border border-gray-300 px-4 py-2">Durée d'utilisation du service</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Données de compte inactif</td>
                  <td className="border border-gray-300 px-4 py-2">3 ans après la dernière connexion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Logs de connexion</td>
                  <td className="border border-gray-300 px-4 py-2">1 an</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Données de facturation</td>
                  <td className="border border-gray-300 px-4 py-2">10 ans (obligation légale)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Cookies</td>
                  <td className="border border-gray-300 px-4 py-2">13 mois maximum</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Données marketing</td>
                  <td className="border border-gray-300 px-4 py-2">Jusqu'au retrait du consentement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Vos droits */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            7. Vos droits
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Droit d'accès :</strong> obtenir la confirmation que vos données sont traitées et en recevoir une copie</li>
              <li><strong>Droit de rectification :</strong> corriger les données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données dans certains cas</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données dans certains cas</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment, sans affecter la licéité du traitement antérieur</li>
              <li><strong>Droit de définir des directives post-mortem :</strong> concernant la conservation et la communication de vos données</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:dpo@[domain].pro" className="text-blue-600 hover:underline">dpo@[domain].pro</a>
            </p>
            <p>
              Nous répondrons à votre demande dans un délai maximum d'un mois. Une pièce d'identité pourra vous être demandée.
            </p>
          </div>
        </section>

        {/* 8. Sécurité */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            8. Sécurité des données
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des mots de passe (bcrypt)</li>
              <li>Accès restreint aux données (principe du moindre privilège)</li>
              <li>Surveillance et journalisation des accès</li>
              <li>Mises à jour régulières de sécurité</li>
              <li>Hébergement sécurisé chez des prestataires certifiés</li>
              <li>Procédures de sauvegarde régulières</li>
            </ul>
            <p className="mt-4">
              En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés, 
              nous vous en informerons dans les meilleurs délais, ainsi que la CNIL conformément à la réglementation.
            </p>
          </div>
        </section>

        {/* 9. Cookies */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            9. Politique de cookies
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Notre site utilise des cookies pour améliorer votre expérience. Types de cookies utilisés :</p>
            
            <h3 className="text-xl font-medium mt-4">Cookies essentiels</h3>
            <p>Nécessaires au fonctionnement du site (session, authentification, préférences)</p>
            
            <h3 className="text-xl font-medium mt-4">Cookies analytiques</h3>
            <p>Google Analytics (données anonymisées) pour comprendre l'utilisation du site</p>
            
            <h3 className="text-xl font-medium mt-4">Cookies fonctionnels</h3>
            <p>Mémorisation de vos choix et personnalisation de l'interface</p>
            
            <p className="mt-4">
              Vous pouvez gérer vos préférences cookies via notre bannière de consentement ou les paramètres de votre navigateur.
            </p>
          </div>
        </section>

        {/* 10. Transferts internationaux */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            10. Transferts internationaux
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Certains de nos prestataires peuvent être situés hors de l'Union européenne. Dans ce cas, 
              nous nous assurons que des garanties appropriées sont mises en place :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Clauses contractuelles types approuvées par la Commission européenne</li>
              <li>Certification Privacy Shield (pour les transferts vers les États-Unis)</li>
              <li>Décision d'adéquation de la Commission européenne</li>
            </ul>
          </div>
        </section>

        {/* 11. Modifications */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            11. Modifications de la politique
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Nous pouvons modifier cette politique de confidentialité pour refléter les changements dans nos pratiques 
              ou pour des raisons légales. Les modifications importantes feront l'objet d'une notification 
              (email, bannière sur le site).
            </p>
            <p>
              La date de dernière mise à jour est indiquée en bas de cette page. Nous vous encourageons 
              à consulter régulièrement cette politique.
            </p>
          </div>
        </section>

        {/* 12. Contact et réclamations */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            12. Contact et réclamations
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Pour toute question concernant cette politique ou vos données personnelles :</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Délégué à la Protection des Données (DPO)</strong></p>
              <p>Email : <a href="mailto:dpo@[domain].pro" className="text-blue-600 hover:underline">dpo@[domain].pro</a></p>
              <p>Adresse : [À COMPLÉTER]</p>
            </div>
            <p className="mt-4">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
              auprès de la CNIL :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong></p>
              <p>3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</p>
              <p>Téléphone : +33 1 53 73 22 22</p>
              <p>Site web : <a href="https://www.cnil.fr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
            </div>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}