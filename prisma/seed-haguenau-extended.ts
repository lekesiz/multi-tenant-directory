import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Haguenau için kapsamlı şirket listesi
const HAGUENAU_COMPANIES = [
  // Restaurants & Cafés
  {
    name: 'Restaurant Le Jardin Secret',
    slug: 'restaurant-jardin-secret-haguenau',
    address: '23 Rue du Marché',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 45 12',
    email: 'contact@jardinsecret-haguenau.fr',
    website: 'https://jardinsecret-haguenau.fr',
    categories: ['Restaurant', 'Gastronomie', 'Cuisine Française'],
  },
  {
    name: 'Pizzeria Bella Napoli',
    slug: 'pizzeria-bella-napoli-haguenau',
    address: '18 Avenue de la Gare',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 67 89',
    email: 'info@bellanapoli-haguenau.fr',
    categories: ['Restaurant', 'Pizzeria', 'Italien'],
  },
  {
    name: 'Café de la Place',
    slug: 'cafe-de-la-place-haguenau',
    address: '1 Place de la République',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 23 45',
    email: 'cafe.place@orange.fr',
    categories: ['Café', 'Bar', 'Brasserie'],
  },
  {
    name: 'Restaurant Winstub Alsacienne',
    slug: 'winstub-alsacienne-haguenau',
    address: '12 Rue des Chevaliers',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 78 90',
    email: 'winstub@alsacienne.fr',
    categories: ['Restaurant', 'Cuisine Alsacienne', 'Winstub'],
  },
  {
    name: 'Sushi Bar Sakura',
    slug: 'sushi-bar-sakura-haguenau',
    address: '34 Route de Strasbourg',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 56 78',
    email: 'contact@sakura-haguenau.fr',
    categories: ['Restaurant', 'Japonais', 'Sushi'],
  },

  // Santé & Bien-être
  {
    name: 'Cabinet Médical Dr. Schneider',
    slug: 'cabinet-medical-schneider-haguenau',
    address: '8 Rue du Docteur Schweitzer',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 34 56',
    email: 'dr.schneider@cabinet-medical.fr',
    categories: ['Médecin', 'Santé', 'Médecine Générale'],
  },
  {
    name: 'Cabinet Dentaire Dr. Weber',
    slug: 'cabinet-dentaire-weber-haguenau',
    address: '16 Avenue de la Liberté',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 45 67',
    email: 'cabinet.weber@dentiste.fr',
    categories: ['Dentiste', 'Santé', 'Soins Dentaires'],
  },
  {
    name: 'Pharmacie Saint-Georges',
    slug: 'pharmacie-saint-georges-haguenau',
    address: '25 Rue Saint-Georges',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 67 89',
    email: 'pharmacie.stgeorges@orange.fr',
    categories: ['Pharmacie', 'Santé', 'Parapharmacie'],
  },
  {
    name: 'Kinésithérapeute Martin Dubois',
    slug: 'kinesitherapeute-dubois-haguenau',
    address: '7 Rue de la Paix',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 89 01',
    email: 'martin.dubois@kine.fr',
    categories: ['Kinésithérapeute', 'Santé', 'Rééducation'],
  },
  {
    name: 'Opticien Krys',
    slug: 'opticien-krys-haguenau',
    address: '14 Grand Rue',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 12 34',
    email: 'haguenau@krys.fr',
    website: 'https://krys.com',
    categories: ['Opticien', 'Santé', 'Lunettes'],
  },

  // Beauté & Coiffure
  {
    name: 'Salon de Coiffure Élégance',
    slug: 'salon-elegance-haguenau',
    address: '19 Rue du Général de Gaulle',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 23 45',
    email: 'salon.elegance@wanadoo.fr',
    categories: ['Coiffure', 'Beauté', 'Salon'],
  },
  {
    name: 'Institut de Beauté Zen Attitude',
    slug: 'institut-zen-attitude-haguenau',
    address: '11 Rue de la Moder',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 45 67',
    email: 'zen.attitude@gmail.com',
    categories: ['Beauté', 'Esthétique', 'Spa'],
  },
  {
    name: 'Barbier Le Gentleman',
    slug: 'barbier-gentleman-haguenau',
    address: '5 Place d\'Armes',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 67 89',
    email: 'contact@legentleman.fr',
    categories: ['Barbier', 'Coiffure', 'Homme'],
  },
  {
    name: 'Onglerie Nail Art Studio',
    slug: 'onglerie-nail-art-haguenau',
    address: '22 Rue du Marché',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 89 01',
    email: 'nailart.studio@gmail.com',
    categories: ['Beauté', 'Onglerie', 'Esthétique'],
  },

  // Commerce & Alimentation
  {
    name: 'Boucherie Charcuterie Lehmann',
    slug: 'boucherie-lehmann-haguenau',
    address: '9 Place du Marché',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 12 34',
    email: 'boucherie.lehmann@orange.fr',
    categories: ['Boucherie', 'Charcuterie', 'Commerce'],
  },
  {
    name: 'Fromagerie Artisanale',
    slug: 'fromagerie-artisanale-haguenau',
    address: '17 Rue du Marché',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 34 56',
    email: 'fromagerie@artisanale.fr',
    categories: ['Fromagerie', 'Commerce', 'Alimentation'],
  },
  {
    name: 'Cave à Vins L\'Œnologue',
    slug: 'cave-vins-oenologue-haguenau',
    address: '13 Rue des Chevaliers',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 56 78',
    email: 'contact@oenologue-haguenau.fr',
    categories: ['Cave à Vins', 'Commerce', 'Vins et Spiritueux'],
  },
  {
    name: 'Primeur Les Jardins de Haguenau',
    slug: 'primeur-jardins-haguenau',
    address: '6 Place du Marché',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 78 90',
    email: 'jardins.haguenau@gmail.com',
    categories: ['Primeur', 'Fruits et Légumes', 'Commerce'],
  },
  {
    name: 'Chocolaterie Confiserie Alsacienne',
    slug: 'chocolaterie-alsacienne-haguenau',
    address: '21 Grand Rue',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 01 23',
    email: 'chocolaterie@alsacienne.fr',
    categories: ['Chocolaterie', 'Confiserie', 'Commerce'],
  },

  // Services Automobiles
  {
    name: 'Garage Peugeot Haguenau',
    slug: 'garage-peugeot-haguenau',
    address: '45 Route de Strasbourg',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 23 45',
    email: 'contact@peugeot-haguenau.fr',
    website: 'https://peugeot-haguenau.fr',
    categories: ['Garage', 'Automobile', 'Concessionnaire'],
  },
  {
    name: 'Centre Auto Speedy',
    slug: 'centre-auto-speedy-haguenau',
    address: '38 Avenue de la Gare',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 45 67',
    email: 'haguenau@speedy.fr',
    website: 'https://speedy.fr',
    categories: ['Garage', 'Entretien Auto', 'Pneumatiques'],
  },
  {
    name: 'Carrosserie Moderne',
    slug: 'carrosserie-moderne-haguenau',
    address: '52 Route de Bischwiller',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 67 89',
    email: 'carrosserie.moderne@orange.fr',
    categories: ['Carrosserie', 'Garage', 'Réparation'],
  },
  {
    name: 'Station-Service Total',
    slug: 'station-service-total-haguenau',
    address: '67 Route de Strasbourg',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 89 01',
    categories: ['Station-Service', 'Carburant', 'Automobile'],
  },

  // Services à la Personne
  {
    name: 'Plomberie Chauffage Alsace',
    slug: 'plomberie-chauffage-alsace-haguenau',
    address: '31 Rue de l\'Industrie',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 12 34',
    email: 'plomberie.alsace@wanadoo.fr',
    categories: ['Plomberie', 'Chauffage', 'Service'],
  },
  {
    name: 'Électricité Générale Haguenau',
    slug: 'electricite-generale-haguenau',
    address: '24 Rue de la Zone Artisanale',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 34 56',
    email: 'electricite.haguenau@gmail.com',
    categories: ['Électricité', 'Service', 'Dépannage'],
  },
  {
    name: 'Menuiserie Bois & Création',
    slug: 'menuiserie-bois-creation-haguenau',
    address: '18 Rue de l\'Artisanat',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 56 78',
    email: 'bois.creation@orange.fr',
    categories: ['Menuiserie', 'Artisan', 'Bois'],
  },
  {
    name: 'Serrurier Dépannage 24/7',
    slug: 'serrurier-depannage-haguenau',
    address: '42 Avenue de la Liberté',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 78 90',
    email: 'serrurier.haguenau@gmail.com',
    categories: ['Serrurier', 'Dépannage', 'Service'],
  },
  {
    name: 'Entreprise de Peinture Déco Plus',
    slug: 'peinture-deco-plus-haguenau',
    address: '15 Rue de la Zone Industrielle',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 01 23',
    email: 'deco.plus@wanadoo.fr',
    categories: ['Peinture', 'Décoration', 'Service'],
  },

  // Immobilier & Finance
  {
    name: 'Agence Immobilière Century 21',
    slug: 'century-21-haguenau',
    address: '10 Place de la République',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 23 45',
    email: 'haguenau@century21.fr',
    website: 'https://century21.fr',
    categories: ['Immobilier', 'Agence', 'Vente'],
  },
  {
    name: 'Cabinet d\'Assurance AXA',
    slug: 'axa-assurance-haguenau',
    address: '26 Grand Rue',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 45 67',
    email: 'haguenau@axa.fr',
    website: 'https://axa.fr',
    categories: ['Assurance', 'Finance', 'Service'],
  },
  {
    name: 'Banque Caisse d\'Épargne',
    slug: 'caisse-epargne-haguenau',
    address: '3 Place d\'Armes',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 67 89',
    website: 'https://caisse-epargne.fr',
    categories: ['Banque', 'Finance', 'Service'],
  },

  // Éducation & Formation
  {
    name: 'Auto-École Conduite Plus',
    slug: 'auto-ecole-conduite-plus-haguenau',
    address: '29 Avenue de la Gare',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 89 01',
    email: 'conduite.plus@gmail.com',
    categories: ['Auto-École', 'Formation', 'Éducation'],
  },
  {
    name: 'Centre de Formation Informatique',
    slug: 'formation-informatique-haguenau',
    address: '14 Rue de l\'Innovation',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 12 34',
    email: 'formation.info@haguenau.fr',
    categories: ['Formation', 'Informatique', 'Éducation'],
  },

  // Loisirs & Culture
  {
    name: 'Salle de Sport FitZone',
    slug: 'salle-sport-fitzone-haguenau',
    address: '36 Route de Strasbourg',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 34 56',
    email: 'contact@fitzone-haguenau.fr',
    categories: ['Sport', 'Fitness', 'Loisirs'],
  },
  {
    name: 'Librairie Papeterie Le Livre',
    slug: 'librairie-le-livre-haguenau',
    address: '8 Grand Rue',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 56 78',
    email: 'librairie.lelivre@orange.fr',
    categories: ['Librairie', 'Papeterie', 'Culture'],
  },
  {
    name: 'Fleuriste Au Bouquet Fleuri',
    slug: 'fleuriste-bouquet-fleuri-haguenau',
    address: '4 Rue du Marché',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 78 90',
    email: 'bouquet.fleuri@gmail.com',
    categories: ['Fleuriste', 'Commerce', 'Décoration'],
  },
  {
    name: 'Animalerie Animaux & Compagnie',
    slug: 'animalerie-animaux-compagnie-haguenau',
    address: '41 Route de Bischwiller',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 01 23',
    email: 'animaux.compagnie@wanadoo.fr',
    categories: ['Animalerie', 'Commerce', 'Animaux'],
  },

  // Hôtels & Hébergement
  {
    name: 'Hôtel Europe',
    slug: 'hotel-europe-haguenau',
    address: '15 Avenue de la Gare',
    city: 'Haguenau',
    postalCode: '67500',
    phone: '03 88 93 23 45',
    email: 'contact@hotel-europe-haguenau.fr',
    website: 'https://hotel-europe-haguenau.fr',
    categories: ['Hôtel', 'Hébergement', 'Tourisme'],
  },
];

async function main() {
  console.log('🌱 Starting Haguenau extended companies seed...\n');

  // Get Haguenau domain
  const haguenauDomain = await prisma.domain.findUnique({
    where: { name: 'haguenau.pro' },
  });

  if (!haguenauDomain) {
    console.error('❌ Haguenau domain not found. Run seed-12-domains.ts first.');
    return;
  }

  console.log(`📍 Found domain: ${haguenauDomain.name}\n`);
  console.log(`🏢 Creating ${HAGUENAU_COMPANIES.length} companies for Haguenau...\n`);

  let created = 0;

  for (const companyData of HAGUENAU_COMPANIES) {
    // Create company
    const company = await prisma.company.upsert({
      where: { slug: companyData.slug },
      update: companyData,
      create: companyData,
    });

    // Link to Haguenau domain
    await prisma.companyContent.upsert({
      where: {
        companyId_domainId: {
          companyId: company.id,
          domainId: haguenauDomain.id,
        },
      },
      update: {
        isVisible: true,
      },
      create: {
        companyId: company.id,
        domainId: haguenauDomain.id,
        isVisible: true,
        customDescription: `${company.name} - Votre professionnel de confiance à Haguenau`,
      },
    });

    created++;
    console.log(`  ✅ ${company.name}`);
  }

  console.log(`\n✅ ${created} companies created for Haguenau\n`);

  // Overall statistics
  const totalCompanies = await prisma.company.count();
  const haguenauCompanies = await prisma.companyContent.count({
    where: {
      domainId: haguenauDomain.id,
      isVisible: true,
    },
  });

  console.log('📊 Statistics:');
  console.log(`  - Total companies in database: ${totalCompanies}`);
  console.log(`  - Companies visible in Haguenau: ${haguenauCompanies}`);

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

