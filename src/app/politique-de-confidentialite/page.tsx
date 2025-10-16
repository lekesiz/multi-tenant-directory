import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';
import { getCurrentDomainInfo } from '@/lib/queries/domain';

export async function generateMetadata() {
  const { displayName, domain } = await getCurrentDomainInfo();
  return {
    title: `Politique de Confidentialité - ${displayName}.PRO`,
    description: `Politique de confidentialité et protection des données personnelles du site ${domain}`,
    alternates: {
      canonical: `https://${domain}/politique-de-confidentialite`,
    },
  };
}

export default async function PolitiqueConfidentialitePage() {
  const { domain, displayName, domainData } = await getCurrentDomainInfo();

  const settings = domainData?.settings as Record<string, any> | null | undefined;
  const companyInfo = {
    name: settings?.companyName || 'NETZ FRANCE',
    address: settings?.address || '1 rue de la Paix, 67500 Haguenau',
    email: `contact@${domain}`,
    dpoEmail: `dpo@${domain}`,
  };

  return (
    <LegalPageLayout title="Politique de Confidentialité" lastUpdated="15 octobre 2025">
      <div className="space-y-8">
        {/* 1. Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Introduction
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              La protection de vos données personnelles est une priorité absolue pour {companyInfo.name}. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons 
              vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD - UE 2016/679) 
              et à la législation française en vigueur.
            </p>
            <p>
              En utilisant le site {domain}, vous acceptez les pratiques décrites dans cette politique de confidentialité. 
              Si vous n'acceptez pas ces pratiques, nous vous invitons à ne pas utiliser notre site.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">Responsable du traitement :</p>
              <p>{companyInfo.name}</p>
              <p>{companyInfo.address}</p>
              <p>Email : <a href={`mailto:${companyInfo.dpoEmail}`} className="text-blue-600 hover:underline">{companyInfo.dpoEmail}</a></p>
            </div>
          </div>
        </section>

        {/* 2. Données collectées */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Données collectées
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Nous collectons différents types de données selon votre utilisation du site :</p>
            
            <h3 className="text-xl font-medium mt-4">2.1 Données collectées automatiquement</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, système d'exploitation, pages visitées, durée de visite</li>
              <li><strong>Données de localisation :</strong> pays, région (anonymisées)</li>
              <li><strong>Cookies et technologies similaires :</strong> voir section 9</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">2.2 Données fournies volontairement</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Pour les visiteurs :</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Nom et prénom (formulaire de contact)</li>
                <li>Adresse email (formulaire de contact, newsletter)</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Message/Commentaire</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <h4 className="font-semibold mb-2">Pour les professionnels (Business Owners) :</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Nom et prénom</li>
                <li>Email professionnel</li>
                <li>Mot de passe (hashé et salé)</li>
                <li>Numéro de téléphone professionnel</li>
                <li>Nom et adresse de l'entreprise</li>
                <li>SIRET/SIREN (optionnel)</li>
                <li>Photos et contenus téléchargés</li>
                <li>Horaires d'ouverture</li>
                <li>Descriptions et informations commerciales</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-4">2.3 Données sensibles</h3>
            <p className="text-red-600 font-semibold">
              Nous ne collectons AUCUNE donnée sensible (origine raciale ou ethnique, opinions politiques, 
              convictions religieuses ou philosophiques, appartenance syndicale, données génétiques, 
              données biométriques, données de santé, vie sexuelle ou orientation sexuelle).
            </p>
          </div>
        </section>

        {/* 3. Finalités du traitement */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Finalités du traitement et base légale
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Finalité</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Base légale</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Données concernées</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Gestion des comptes professionnels</td>
                    <td className="border border-gray-300 px-4 py-2">Exécution du contrat</td>
                    <td className="border border-gray-300 px-4 py-2">Identité, contact, entreprise</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Réponse aux demandes de contact</td>
                    <td className="border border-gray-300 px-4 py-2">Intérêt légitime</td>
                    <td className="border border-gray-300 px-4 py-2">Identité, contact, message</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Envoi de newsletters (opt-in)</td>
                    <td className="border border-gray-300 px-4 py-2">Consentement</td>
                    <td className="border border-gray-300 px-4 py-2">Email, préférences</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Statistiques et amélioration du site</td>
                    <td className="border border-gray-300 px-4 py-2">Intérêt légitime</td>
                    <td className="border border-gray-300 px-4 py-2">Navigation (anonymisée)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Sécurité et prévention de la fraude</td>
                    <td className="border border-gray-300 px-4 py-2">Intérêt légitime</td>
                    <td className="border border-gray-300 px-4 py-2">Logs, IP</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Respect des obligations légales</td>
                    <td className="border border-gray-300 px-4 py-2">Obligation légale</td>
                    <td className="border border-gray-300 px-4 py-2">Selon la loi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. Destinataires des données */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Destinataires des données
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Vos données personnelles peuvent être partagées avec :</p>
            
            <h3 className="text-xl font-medium mt-4">4.1 Destinataires internes</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Personnel autorisé de {companyInfo.name} (support client, équipe technique)</li>
              <li>Administrateurs du site (accès restreint et journalisé)</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">4.2 Prestataires techniques</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Hébergement :</strong> Vercel Inc. (USA) - <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>Base de données :</strong> Neon (PostgreSQL) - <a href="https://neon.tech/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>Email :</strong> Resend - <a href="https://resend.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>Analytics :</strong> Google Analytics 4 (données anonymisées) - <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><strong>CDN :</strong> Cloudflare (optionnel) - <a href="https://www.cloudflare.com/privacy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-4">4.3 Autres destinataires</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Autorités publiques :</strong> uniquement sur requête légale (police, justice)</li>
              <li><strong>Professionnels référencés :</strong> uniquement les données publiques et messages de contact les concernant</li>
            </ul>

            <div className="bg-red-50 p-4 rounded-lg mt-4">
              <p className="font-semibold text-red-700">
                Important : Nous ne vendons, ne louons et ne partageons JAMAIS vos données personnelles 
                avec des tiers à des fins commerciales.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Transferts internationaux */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            5. Transferts internationaux
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Certains de nos prestataires peuvent être situés hors de l'Union européenne. 
              Dans ce cas, nous nous assurons que des garanties appropriées sont mises en place :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Clauses contractuelles types (SCC)</strong> approuvées par la Commission européenne</li>
              <li><strong>Décision d'adéquation</strong> de la Commission européenne (ex: Suisse, Canada)</li>
              <li><strong>Mesures techniques</strong> : chiffrement, pseudonymisation</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">Transferts vers les États-Unis :</p>
              <p>
                Suite à l'invalidation du Privacy Shield, nous utilisons les nouvelles Clauses Contractuelles Types 
                (SCC 2021) pour tout transfert vers les USA, avec des mesures supplémentaires de protection.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Durée de conservation */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            6. Durée de conservation
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités poursuivies :</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Type de données</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Durée de conservation</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Compte professionnel actif</td>
                    <td className="border border-gray-300 px-4 py-2">Durée d'utilisation du service</td>
                    <td className="border border-gray-300 px-4 py-2">Exécution du contrat</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Compte professionnel inactif</td>
                    <td className="border border-gray-300 px-4 py-2">3 ans après dernière connexion</td>
                    <td className="border border-gray-300 px-4 py-2">Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Données de contact (formulaire)</td>
                    <td className="border border-gray-300 px-4 py-2">3 ans après dernier contact</td>
                    <td className="border border-gray-300 px-4 py-2">Intérêt légitime</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Logs de sécurité</td>
                    <td className="border border-gray-300 px-4 py-2">1 an</td>
                    <td className="border border-gray-300 px-4 py-2">Obligation légale</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Données de facturation</td>
                    <td className="border border-gray-300 px-4 py-2">10 ans</td>
                    <td className="border border-gray-300 px-4 py-2">Obligation légale (L.123-22 Code de commerce)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Cookies</td>
                    <td className="border border-gray-300 px-4 py-2">13 mois maximum</td>
                    <td className="border border-gray-300 px-4 py-2">CNIL - Lignes directrices cookies</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Newsletter (consentement)</td>
                    <td className="border border-gray-300 px-4 py-2">Jusqu'au retrait du consentement + 3 ans</td>
                    <td className="border border-gray-300 px-4 py-2">Consentement</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              <strong>Archivage :</strong> Certaines données peuvent être archivées au-delà de ces durées pour répondre 
              à des obligations légales ou pour la constatation, l'exercice ou la défense de droits en justice.
            </p>
          </div>
        </section>

        {/* 7. Vos droits */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            7. Vos droits RGPD
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📋 Droit d'accès (Art. 15 RGPD)</h4>
                <p>Obtenir la confirmation que vos données sont traitées et en recevoir une copie</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">✏️ Droit de rectification (Art. 16 RGPD)</h4>
                <p>Corriger les données inexactes ou incomplètes vous concernant</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🗑️ Droit à l'effacement (Art. 17 RGPD)</h4>
                <p>Demander la suppression de vos données dans certains cas</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⏸️ Droit à la limitation (Art. 18 RGPD)</h4>
                <p>Limiter le traitement de vos données dans certains cas</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📦 Droit à la portabilité (Art. 20 RGPD)</h4>
                <p>Recevoir vos données dans un format structuré et lisible</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🚫 Droit d'opposition (Art. 21 RGPD)</h4>
                <p>Vous opposer au traitement de vos données</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <h4 className="font-semibold mb-2">Comment exercer vos droits ?</h4>
              <p>Pour exercer vos droits, contactez notre DPO :</p>
              <ul className="mt-2 space-y-1">
                <li>📧 Email : <a href={`mailto:${companyInfo.dpoEmail}`} className="text-blue-600 hover:underline">{companyInfo.dpoEmail}</a></li>
                <li>📮 Courrier : DPO - {companyInfo.name}, {companyInfo.address}</li>
                <li>⏰ Délai de réponse : 1 mois maximum (prolongeable de 2 mois si complexe)</li>
                <li>🆔 Pièce d'identité requise pour vérifier votre identité</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🏛️ Réclamation auprès de la CNIL</h4>
              <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation :</p>
              <ul className="mt-2 space-y-1">
                <li>🌐 En ligne : <a href="https://www.cnil.fr/fr/plaintes" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr/fr/plaintes</a></li>
                <li>📮 Courrier : CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
                <li>☎️ Téléphone : +33 1 53 73 22 22</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Sécurité */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            8. Sécurité des données
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
            
            <h3 className="text-xl font-medium mt-4">Mesures techniques</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>🔒 Chiffrement HTTPS/TLS pour toutes les connexions</li>
              <li>🔐 Hashage des mots de passe (bcrypt avec salt)</li>
              <li>🛡️ Pare-feu applicatif (WAF)</li>
              <li>🔄 Sauvegardes régulières et chiffrées</li>
              <li>📊 Monitoring et détection d'intrusion</li>
              <li>🔑 Authentification à deux facteurs pour les admins</li>
              <li>🗄️ Chiffrement des données sensibles en base</li>
            </ul>

            <h3 className="text-xl font-medium mt-4">Mesures organisationnelles</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>👥 Accès restreint selon le principe du moindre privilège</li>
              <li>📝 Journalisation des accès aux données</li>
              <li>🎓 Formation du personnel à la protection des données</li>
              <li>📋 Procédures de gestion des incidents</li>
              <li>🔍 Audits de sécurité réguliers</li>
              <li>📄 Clauses de confidentialité avec les prestataires</li>
            </ul>

            <div className="bg-red-50 p-4 rounded-lg mt-4">
              <h4 className="font-semibold mb-2">🚨 En cas de violation de données</h4>
              <p>
                En cas de violation susceptible d'engendrer un risque élevé pour vos droits et libertés, 
                nous vous en informerons dans les meilleurs délais et au plus tard sous 72h, ainsi que la CNIL 
                conformément à l'article 33 du RGPD.
              </p>
            </div>
          </div>
        </section>

        {/* 9. Cookies */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            9. Politique de cookies et traceurs
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site. 
              Il permet de vous reconnaître lors d'une visite ultérieure.
            </p>
            
            <h3 className="text-xl font-medium mt-4">Types de cookies utilisés</h3>
            
            <div className="space-y-3">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">✅ Cookies essentiels (toujours actifs)</h4>
                <p>Nécessaires au fonctionnement du site. Exemples :</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Session utilisateur</li>
                  <li>Préférences de langue</li>
                  <li>Consentement cookies</li>
                  <li>Sécurité (CSRF token)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📊 Cookies analytiques (soumis à consentement)</h4>
                <p>Pour comprendre comment vous utilisez le site. Exemples :</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Google Analytics 4 (anonymisé)</li>
                  <li>Pages visitées</li>
                  <li>Durée de visite</li>
                  <li>Source de trafic</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚙️ Cookies fonctionnels (soumis à consentement)</h4>
                <p>Pour améliorer votre expérience. Exemples :</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Mémorisation de vos choix</li>
                  <li>Personnalisation de l'interface</li>
                  <li>Historique de recherche</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-medium mt-4">Gestion des cookies</h3>
            <p>Vous pouvez gérer vos préférences cookies :</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Via notre bannière de consentement (lors de votre première visite)</li>
              <li>Dans les paramètres de votre compte (si connecté)</li>
              <li>Via les paramètres de votre navigateur</li>
            </ul>

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="font-semibold mb-2">Paramétrage des navigateurs :</p>
              <ul className="space-y-1">
                <li>🌐 Chrome : chrome://settings/cookies</li>
                <li>🦊 Firefox : about:preferences#privacy</li>
                <li>🧭 Safari : Préférences {'>'} Confidentialité</li>
                <li>🔷 Edge : edge://settings/privacy</li>
              </ul>
            </div>

            <p className="mt-4">
              <strong>Note :</strong> Le refus de certains cookies peut impacter votre expérience sur le site.
            </p>
          </div>
        </section>

        {/* 10. Mineurs */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            10. Protection des mineurs
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Notre site s'adresse aux professionnels et aux adultes. Nous ne collectons pas sciemment 
              de données personnelles de mineurs de moins de 15 ans.
            </p>
            <p>
              Si vous êtes parent ou tuteur légal et que vous constatez que votre enfant nous a fourni 
              des données personnelles sans votre consentement, contactez-nous à : 
              <a href={`mailto:${companyInfo.dpoEmail}`} className="text-blue-600 hover:underline">{companyInfo.dpoEmail}</a>
            </p>
          </div>
        </section>

        {/* 11. Modifications */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            11. Modifications de la politique
          </h2>
          <div className="text-gray-700 space-y-4">
            <p>
              Nous pouvons modifier cette politique de confidentialité pour refléter les changements 
              dans nos pratiques, la législation ou pour d'autres raisons opérationnelles.
            </p>
            <p>
              En cas de modification substantielle :
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Nous afficherons une notification sur le site</li>
              <li>Les utilisateurs inscrits seront notifiés par email</li>
              <li>La date de "Dernière mise à jour" sera actualisée</li>
            </ul>
            <p>
              Votre utilisation continue du site après ces modifications vaut acceptation de la nouvelle politique.
            </p>
          </div>
        </section>

        {/* 12. Contact */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            12. Contact et DPO
          </h2>
          <div className="text-gray-700 space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Délégué à la Protection des Données (DPO)</h3>
              <p>Pour toute question concernant cette politique ou vos données personnelles :</p>
              <div className="mt-4 space-y-2">
                <p>📧 <strong>Email :</strong> <a href={`mailto:${companyInfo.dpoEmail}`} className="text-blue-600 hover:underline">{companyInfo.dpoEmail}</a></p>
                <p>📮 <strong>Courrier :</strong> DPO - {companyInfo.name}<br />{companyInfo.address}</p>
                <p>⏰ <strong>Délai de réponse :</strong> Maximum 1 mois</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Autorité de contrôle</h3>
              <p><strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong></p>
              <div className="mt-4 space-y-2">
                <p>📮 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</p>
                <p>☎️ +33 1 53 73 22 22</p>
                <p>🌐 <a href="https://www.cnil.fr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}