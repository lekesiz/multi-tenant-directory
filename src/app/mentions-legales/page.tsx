import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';
import { getCurrentDomainInfo } from '@/lib/queries/domain';

export async function generateMetadata() {
  const { displayName, domain } = await getCurrentDomainInfo();
  return {
    title: `Mentions Légales - ${displayName}.PRO`,
    description: `Informations légales et mentions obligatoires du site ${domain}`,
    alternates: {
      canonical: `https://${domain}/mentions-legales`,
    },
  };
}

export default async function MentionsLegalesPage() {
  const { domain, displayName, domainData } = await getCurrentDomainInfo();
  
  // Company information (can be customized per domain if needed)
  const companyInfo = {
    name: domainData?.settings?.companyName || 'NETZ FRANCE',
    legalForm: domainData?.settings?.legalForm || 'SARL',
    capital: domainData?.settings?.capital || '10.000',
    address: domainData?.settings?.address || '1 rue de la Paix, 67500 Haguenau',
    siret: domainData?.settings?.siret || '123 456 789 00012',
    rcs: domainData?.settings?.rcs || 'Strasbourg B 123 456 789',
    vat: domainData?.settings?.vat || 'FR12 123456789',
    director: domainData?.settings?.director || 'Mikail LEKESIZ',
    email: `contact@${domain}`,
    phone: domainData?.settings?.phone || '03 88 00 00 00',
  };

  return (
    <LegalPageLayout title="Mentions Légales">
      <div className="space-y-8">
        {/* 1. Éditeur du site */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Éditeur du site
          </h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Site web :</strong> {domain}</p>
            <p><strong>Raison sociale :</strong> {companyInfo.name}</p>
            <p><strong>Forme juridique :</strong> {companyInfo.legalForm}</p>
            <p><strong>Capital social :</strong> {companyInfo.capital} €</p>
            <p><strong>Siège social :</strong> {companyInfo.address}</p>
            <p><strong>SIRET :</strong> {companyInfo.siret}</p>
            <p><strong>RCS :</strong> {companyInfo.rcs}</p>
            <p><strong>Numéro TVA intracommunautaire :</strong> {companyInfo.vat}</p>
            <p><strong>Directeur de publication :</strong> {companyInfo.director}</p>
            <p><strong>Email :</strong> <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:underline">{companyInfo.email}</a></p>
            <p><strong>Téléphone :</strong> <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">{companyInfo.phone}</a></p>
          </div>
        </section>

        {/* 2. Hébergeur */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Hébergeur du site
          </h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Nom :</strong> Vercel Inc.</p>
            <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
            <p><strong>Site web :</strong> <a href="https://vercel.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://vercel.com</a></p>
            <p><strong>Support :</strong> <a href="https://vercel.com/support" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://vercel.com/support</a></p>
          </div>
        </section>

        {/* 3. Propriété intellectuelle */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Propriété intellectuelle
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p>
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite 
              sauf autorisation expresse du directeur de la publication.
            </p>
            <p>
              Les marques, logos, signes ainsi que tous les contenus du site (textes, images, son...) font l'objet 
              d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.
            </p>
            <p>
              L'utilisateur doit solliciter l'autorisation préalable du site pour toute reproduction, publication, copie des 
              différents contenus. Il s'engage à une utilisation des contenus du site dans un cadre strictement privé, toute 
              utilisation à des fins commerciales et publicitaires est strictement interdite.
            </p>
          </div>
        </section>

        {/* 4. Protection des données personnelles */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Protection des données personnelles (RGPD)
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) du 27 avril 2016 et à la loi 
              « Informatique et Libertés » du 6 janvier 1978 modifiée, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Droit d'accès (article 15 RGPD)</li>
              <li>Droit de rectification (article 16 RGPD)</li>
              <li>Droit à l'effacement / droit à l'oubli (article 17 RGPD)</li>
              <li>Droit à la limitation du traitement (article 18 RGPD)</li>
              <li>Droit à la portabilité des données (article 20 RGPD)</li>
              <li>Droit d'opposition (article 21 RGPD)</li>
              <li>Droit de retirer votre consentement à tout moment</li>
            </ul>
            <p>
              Pour exercer ces droits ou pour toute question sur le traitement de vos données, vous pouvez contacter 
              notre Délégué à la Protection des Données (DPO) :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email :</strong> <a href={`mailto:dpo@${domain}`} className="text-blue-600 hover:underline">dpo@{domain}</a></p>
              <p><strong>Courrier :</strong> DPO - {companyInfo.name}, {companyInfo.address}</p>
            </div>
            <p className="mt-4">
              Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>CNIL</strong></p>
              <p>3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</p>
              <p>Téléphone : +33 1 53 73 22 22</p>
              <p>Site web : <a href="https://www.cnil.fr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
            </div>
            <p className="mt-4">
              Pour plus d'informations sur la gestion de vos données personnelles, consultez notre{' '}
              <Link href="/politique-de-confidentialite" className="text-blue-600 hover:underline">
                Politique de Confidentialité
              </Link>.
            </p>
          </div>
        </section>

        {/* 5. Cookies */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            5. Cookies
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Le site {domain} peut être amené à vous demander l'acceptation des cookies pour des besoins de statistiques 
              et d'affichage. Un cookie est une information déposée sur votre disque dur par le serveur du site que vous visitez.
            </p>
            <p>Il contient plusieurs données qui sont stockées sur votre ordinateur dans un simple fichier texte auquel un serveur accède pour lire et enregistrer des informations.</p>
            <p>Types de cookies utilisés :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Cookies techniques :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies analytiques :</strong> pour mesurer l'audience (Google Analytics 4 - données anonymisées)</li>
              <li><strong>Cookies de préférences :</strong> pour mémoriser vos choix et préférences</li>
            </ul>
            <p>
              Vous pouvez désactiver ces cookies à partir des paramètres de votre navigateur. Pour plus d'informations sur 
              la gestion des cookies, consultez notre <Link href="/politique-de-confidentialite" className="text-blue-600 hover:underline">Politique de Confidentialité</Link>.
            </p>
          </div>
        </section>

        {/* 6. Limitation de responsabilité */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            6. Limitation de responsabilité
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, 
              mais peut toutefois contenir des inexactitudes ou des omissions.
            </p>
            <p>
              Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le 
              signaler par email à <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:underline">{companyInfo.email}</a>, 
              en décrivant le problème de la manière la plus précise possible.
            </p>
            <p>
              L'éditeur du site ne saurait être tenu responsable de l'usage fait de ces informations et de tout préjudice 
              direct ou indirect pouvant en découler.
            </p>
          </div>
        </section>

        {/* 7. Liens hypertextes */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            7. Liens hypertextes
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Le site {domain} peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. 
              Les liens vers ces autres ressources vous font quitter le site {domain}.
            </p>
            <p>
              Il est possible de créer un lien vers la page de présentation de ce site sans autorisation expresse de l'éditeur. 
              Aucune autorisation ou demande d'information préalable ne peut être exigée par l'éditeur à l'égard d'un site 
              qui souhaite établir un lien vers le site de l'éditeur.
            </p>
            <p>
              Il convient toutefois d'afficher ce site dans une nouvelle fenêtre du navigateur. Cependant, l'éditeur se 
              réserve le droit de demander la suppression d'un lien qu'il estime non conforme à l'objet du site.
            </p>
          </div>
        </section>

        {/* 8. Crédits */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            8. Crédits
          </h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Conception et développement :</strong> {companyInfo.name}</p>
            <p><strong>Technologies utilisées :</strong> Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL</p>
            <p><strong>Crédits photos :</strong> Les visuels utilisés sont la propriété de leurs auteurs respectifs ou libres de droits</p>
            <p><strong>Icônes :</strong> Heroicons, Lucide Icons</p>
          </div>
        </section>

        {/* 9. Loi applicable et juridiction compétente */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            9. Loi applicable et juridiction compétente
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Les présentes mentions légales sont régies par la loi française. En cas de contestation ou de litige, 
              les tribunaux français seront seuls compétents.
            </p>
            <p>
              Pour toute question relative aux présentes mentions légales ou à l'utilisation du site, vous pouvez 
              nous écrire à l'adresse suivante : <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:underline">{companyInfo.email}</a>.
            </p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}