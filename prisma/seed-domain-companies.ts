import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Her domain için özel şirketler
const DOMAIN_COMPANIES = {
  'haguenau.pro': [
    {
      name: 'Brasserie Le Houblon',
      slug: 'brasserie-le-houblon-haguenau',
      address: '15 Rue du Général de Gaulle',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 12 34',
      email: 'contact@lehoublon-haguenau.fr',
      website: 'https://lehoublon-haguenau.fr',
      categories: ['Restaurant', 'Brasserie'],
    },
    {
      name: 'Garage Alsace Auto',
      slug: 'garage-alsace-auto-haguenau',
      address: '28 Route de Strasbourg',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 45 67',
      email: 'info@alsace-auto.fr',
      website: 'https://alsace-auto.fr',
      categories: ['Garage', 'Mécanique', 'Automobile'],
    },
    {
      name: 'Coiffure Tendance',
      slug: 'coiffure-tendance-haguenau',
      address: '42 Rue du Marché',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 78 90',
      email: 'rdv@coiffure-tendance.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Pharmacie du Centre',
      slug: 'pharmacie-du-centre-haguenau',
      address: '5 Place de la République',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 23 45',
      email: 'pharmacie.centre@orange.fr',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Boulangerie Artisanale Kieffer',
      slug: 'boulangerie-kieffer-haguenau',
      address: '12 Rue des Chevaliers',
      city: 'Haguenau',
      postalCode: '67500',
      phone: '03 88 93 56 78',
      email: 'boulangerie.kieffer@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'bischwiller.pro': [
    {
      name: 'Restaurant Au Bœuf Rouge',
      slug: 'restaurant-boeuf-rouge-bischwiller',
      address: '8 Rue de la Gare',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 63 12 34',
      email: 'contact@boeuf-rouge.fr',
      categories: ['Restaurant', 'Cuisine Traditionnelle'],
    },
    {
      name: 'Plomberie Chauffage Schneider',
      slug: 'plomberie-schneider-bischwiller',
      address: '23 Route de Haguenau',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 63 45 67',
      email: 'schneider.plomberie@wanadoo.fr',
      categories: ['Plomberie', 'Chauffage', 'Service'],
    },
    {
      name: 'Salon de Beauté Éclat',
      slug: 'salon-eclat-bischwiller',
      address: '14 Rue du Général Leclerc',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 63 78 90',
      email: 'salon.eclat@gmail.com',
      categories: ['Beauté', 'Esthétique', 'Coiffure'],
    },
    {
      name: 'Boucherie Charcuterie Muller',
      slug: 'boucherie-muller-bischwiller',
      address: '6 Place du Marché',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 63 23 45',
      email: 'boucherie.muller@orange.fr',
      categories: ['Boucherie', 'Charcuterie', 'Commerce'],
    },
    {
      name: 'Électricité Services Plus',
      slug: 'electricite-services-plus-bischwiller',
      address: '31 Rue de Strasbourg',
      city: 'Bischwiller',
      postalCode: '67240',
      phone: '03 88 63 56 78',
      email: 'contact@services-plus.fr',
      categories: ['Électricité', 'Service', 'Dépannage'],
    },
  ],
  'brumath.pro': [
    {
      name: 'Pizzeria La Dolce Vita',
      slug: 'pizzeria-dolce-vita-brumath',
      address: '18 Grand Rue',
      city: 'Brumath',
      postalCode: '67170',
      phone: '03 88 51 12 34',
      email: 'contact@dolcevita-brumath.fr',
      categories: ['Restaurant', 'Pizzeria', 'Italien'],
    },
    {
      name: 'Garage Moderne',
      slug: 'garage-moderne-brumath',
      address: '45 Route de Strasbourg',
      city: 'Brumath',
      postalCode: '67170',
      phone: '03 88 51 45 67',
      email: 'garage.moderne@gmail.com',
      categories: ['Garage', 'Automobile', 'Réparation'],
    },
    {
      name: 'Pharmacie de la Place',
      slug: 'pharmacie-place-brumath',
      address: '2 Place de l\'Hôtel de Ville',
      city: 'Brumath',
      postalCode: '67170',
      phone: '03 88 51 78 90',
      email: 'pharmacie.place@orange.fr',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Coiffure Création',
      slug: 'coiffure-creation-brumath',
      address: '22 Rue du Général de Gaulle',
      city: 'Brumath',
      postalCode: '67170',
      phone: '03 88 51 23 45',
      email: 'coiffure.creation@gmail.com',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Pâtisserie Lehmann',
      slug: 'boulangerie-lehmann-brumath',
      address: '9 Rue de la Liberté',
      city: 'Brumath',
      postalCode: '67170',
      phone: '03 88 51 56 78',
      email: 'boulangerie.lehmann@wanadoo.fr',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'saverne.pro': [
    {
      name: 'Restaurant Le Château',
      slug: 'restaurant-chateau-saverne',
      address: '12 Place du Général de Gaulle',
      city: 'Saverne',
      postalCode: '67700',
      phone: '03 88 91 12 34',
      email: 'contact@restaurant-chateau.fr',
      categories: ['Restaurant', 'Gastronomie'],
    },
    {
      name: 'Garage Central Saverne',
      slug: 'garage-central-saverne',
      address: '34 Route de Paris',
      city: 'Saverne',
      postalCode: '67700',
      phone: '03 88 91 45 67',
      email: 'garage.central@orange.fr',
      categories: ['Garage', 'Automobile', 'Service'],
    },
    {
      name: 'Pharmacie des Vosges',
      slug: 'pharmacie-vosges-saverne',
      address: '8 Rue des Vosges',
      city: 'Saverne',
      postalCode: '67700',
      phone: '03 88 91 78 90',
      email: 'pharmacie.vosges@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Salon de Coiffure Moderne',
      slug: 'salon-moderne-saverne',
      address: '15 Grand Rue',
      city: 'Saverne',
      postalCode: '67700',
      phone: '03 88 91 23 45',
      email: 'salon.moderne@wanadoo.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Artisanale Schmitt',
      slug: 'boulangerie-schmitt-saverne',
      address: '21 Rue Poincaré',
      city: 'Saverne',
      postalCode: '67700',
      phone: '03 88 91 56 78',
      email: 'boulangerie.schmitt@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
  'schiltigheim.pro': [
    {
      name: 'Brasserie Schutzenberger',
      slug: 'brasserie-schutzenberger-schiltigheim',
      address: '8 Rue de la Brasserie',
      city: 'Schiltigheim',
      postalCode: '67300',
      phone: '03 88 18 12 34',
      email: 'contact@schutzenberger.fr',
      website: 'https://schutzenberger.fr',
      categories: ['Brasserie', 'Restaurant', 'Bière'],
    },
    {
      name: 'Garage Auto Plus',
      slug: 'garage-auto-plus-schiltigheim',
      address: '42 Route de Bischwiller',
      city: 'Schiltigheim',
      postalCode: '67300',
      phone: '03 88 18 45 67',
      email: 'garage.autoplus@orange.fr',
      categories: ['Garage', 'Automobile', 'Réparation'],
    },
    {
      name: 'Pharmacie Principale',
      slug: 'pharmacie-principale-schiltigheim',
      address: '16 Rue Principale',
      city: 'Schiltigheim',
      postalCode: '67300',
      phone: '03 88 18 78 90',
      email: 'pharmacie.principale@gmail.com',
      categories: ['Pharmacie', 'Santé'],
    },
    {
      name: 'Coiffure Studio',
      slug: 'coiffure-studio-schiltigheim',
      address: '28 Avenue de la Forêt Noire',
      city: 'Schiltigheim',
      postalCode: '67300',
      phone: '03 88 18 23 45',
      email: 'coiffure.studio@wanadoo.fr',
      categories: ['Coiffure', 'Beauté'],
    },
    {
      name: 'Boulangerie Pâtisserie Wagner',
      slug: 'boulangerie-wagner-schiltigheim',
      address: '5 Place de la Mairie',
      city: 'Schiltigheim',
      postalCode: '67300',
      phone: '03 88 18 56 78',
      email: 'boulangerie.wagner@gmail.com',
      categories: ['Boulangerie', 'Pâtisserie', 'Commerce'],
    },
  ],
};

async function main() {
  console.log('🌱 Starting domain-specific companies seed...\n');

  // Get all domains
  const domains = await prisma.domain.findMany();
  console.log(`📍 Found ${domains.length} domains\n`);

  let totalCreated = 0;
  let totalLinked = 0;

  for (const domain of domains) {
    const companies = DOMAIN_COMPANIES[domain.name as keyof typeof DOMAIN_COMPANIES];
    
    if (!companies) {
      console.log(`⚠️  No specific companies for ${domain.name}, skipping...`);
      continue;
    }

    console.log(`🏢 Processing ${domain.name}...`);

    for (const companyData of companies) {
      // Create company
      const company = await prisma.company.upsert({
        where: { slug: companyData.slug },
        update: companyData,
        create: companyData,
      });

      totalCreated++;
      console.log(`  ✅ ${company.name}`);

      // Link to its primary domain
      await prisma.companyContent.upsert({
        where: {
          companyId_domainId: {
            companyId: company.id,
            domainId: domain.id,
          },
        },
        update: {
          isVisible: true,
        },
        create: {
          companyId: company.id,
          domainId: domain.id,
          isVisible: true,
          customDescription: `${company.name} - Votre professionnel de confiance à ${companyData.city}`,
        },
      });

      totalLinked++;
    }

    console.log(`  ✅ ${companies.length} companies created for ${domain.name}\n`);
  }

  console.log('📊 Statistics:');
  console.log(`  - Companies created: ${totalCreated}`);
  console.log(`  - Domain links created: ${totalLinked}`);

  // Overall statistics
  const totalCompanies = await prisma.company.count();
  const totalDomains = await prisma.domain.count();
  const totalLinks = await prisma.companyContent.count();

  console.log('\n📈 Overall Statistics:');
  console.log(`  - Total Domains: ${totalDomains}`);
  console.log(`  - Total Companies: ${totalCompanies}`);
  console.log(`  - Total Links: ${totalLinks}`);
  console.log(`  - Average companies per domain: ${(totalLinks / totalDomains).toFixed(1)}`);

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

