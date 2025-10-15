import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata = {
  title: 'Mentions Légales - Multi-Tenant Directory',
  description: 'Informations légales et mentions obligatoires du site Multi-Tenant Directory',
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout title="Mentions Légales">
      <div className="space-y-8">
        {/* 1. Éditeur du site */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Éditeur du site
          </h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Raison sociale :</strong> [À COMPLÉTER - Nom de la société]</p>
            <p><strong>Forme juridique :</strong> [À COMPLÉTER - SARL/SAS/Auto-entrepreneur]</p>
            <p><strong>Capital social :</strong> [À COMPLÉTER] €</p>
            <p><strong>Siège social :</strong> [À COMPLÉTER - Adresse complète]</p>
            <p><strong>SIRET :</strong> [À COMPLÉTER - Numéro SIRET]</p>
            <p><strong>RCS :</strong> [À COMPLÉTER - Ville + Numéro]</p>
            <p><strong>Numéro TVA intracommunautaire :</strong> [À COMPLÉTER]</p>
            <p><strong>Directeur de publication :</strong> [À COMPLÉTER - Nom Prénom]</p>
            <p><strong>Email :</strong> contact@[domain].pro</p>
            <p><strong>Téléphone :</strong> [À COMPLÉTER]</p>
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
              Les marques, logos et signes distinctifs affichés sur ce site sont la propriété de leurs détenteurs respectifs.
            </p>
          </div>
        </section>

        {/* 4. Protection des données personnelles */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Protection des données personnelles
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD) 
              du 27 avril 2016, vous disposez d'un droit d'accès, de rectification, de suppression, de limitation, de portabilité et d'opposition 
              aux données personnelles vous concernant.
            </p>
            <p>
              Pour exercer ces droits, veuillez nous contacter à l'adresse suivante : <a href="mailto:dpo@[domain].pro" className="text-blue-600 hover:underline">dpo@[domain].pro</a>
            </p>
            <p>
              Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) 
              si vous estimez que vos droits ne sont pas respectés.
            </p>
            <p>
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
              Ce site utilise des cookies pour améliorer l'expérience utilisateur, analyser le trafic et personnaliser le contenu. 
              Ces cookies peuvent être désactivés à tout moment depuis les paramètres de votre navigateur.
            </p>
            <p>Types de cookies utilisés :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Cookies techniques :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies analytiques :</strong> pour mesurer l'audience (Google Analytics)</li>
              <li><strong>Cookies de préférences :</strong> pour mémoriser vos choix</li>
            </ul>
            <p>
              En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies conformément à notre politique.
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
              L'éditeur du site ne saurait être tenu responsable des dommages directs ou indirects résultant de l'accès ou de l'utilisation du site, 
              y compris l'inaccessibilité, les pertes de données, détériorations, destructions ou virus qui pourraient affecter l'équipement informatique 
              de l'utilisateur.
            </p>
            <p>
              Les informations publiées sur ce site le sont à titre informatif et peuvent être modifiées sans préavis.
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
              Le site peut contenir des liens hypertextes vers d'autres sites. L'éditeur n'exerce aucun contrôle sur ces sites externes 
              et décline toute responsabilité quant à leur contenu ou leur disponibilité.
            </p>
            <p>
              La création de liens hypertextes vers ce site est soumise à l'autorisation préalable et écrite du directeur de publication.
            </p>
          </div>
        </section>

        {/* 8. Crédits */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            8. Crédits
          </h2>
          <div className="text-gray-700 space-y-2">
            <p><strong>Conception et développement :</strong> [À COMPLÉTER - Nom de l'agence/développeur]</p>
            <p><strong>Technologies utilisées :</strong> Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL</p>
            <p><strong>Crédits photos :</strong> Les visuels utilisés sont la propriété de leurs auteurs respectifs</p>
          </div>
        </section>

        {/* 9. Loi applicable et juridiction compétente */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            9. Loi applicable et juridiction compétente
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Les présentes mentions légales sont régies par la loi française. En cas de litige relatif à l'interprétation 
              ou l'exécution de ces mentions légales, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
            </p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}