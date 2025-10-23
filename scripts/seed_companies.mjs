import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Site ve şehir bilgileri
const sites = [
  { name: 'bas-rhin', city: 'Bas-Rhin', domain: 'bas-rhin.pro', isHub: true },
  { name: 'haguenau', city: 'Haguenau', domain: 'haguenau.pro' },
  { name: 'bischwiller', city: 'Bischwiller', domain: 'bischwiller.pro' },
  { name: 'bouxwiller', city: 'Bouxwiller', domain: 'bouxwiller.pro' },
  { name: 'brumath', city: 'Brumath', domain: 'brumath.pro' },
  { name: 'erstein', city: 'Erstein', domain: 'erstein.pro' },
  { name: 'geispolsheim', city: 'Geispolsheim', domain: 'geispolsheim.pro' },
  { name: 'hoerdt', city: 'Hoerdt', domain: 'hoerdt.pro' },
  { name: 'illkirch', city: 'Illkirch-Graffenstaden', domain: 'illkirch.pro' },
  { name: 'ingwiller', city: 'Ingwiller', domain: 'ingwiller.pro' },
  { name: 'ittenheim', city: 'Ittenheim', domain: 'ittenheim.pro' },
  { name: 'mutzig', city: 'Mutzig', domain: 'mutzig.pro' },
  { name: 'obernai', city: 'Obernai', domain: 'obernai.pro' },
  { name: 'ostwald', city: 'Ostwald', domain: 'ostwald.pro' },
  { name: 'saverne', city: 'Saverne', domain: 'saverne.pro' },
  { name: 'schiltigheim', city: 'Schiltigheim', domain: 'schiltigheim.pro' },
  { name: 'schweighouse', city: 'Schweighouse-sur-Moder', domain: 'schweighouse.pro' },
  { name: 'souffelweyersheim', city: 'Souffelweyersheim', domain: 'souffelweyersheim.pro' },
  { name: 'soufflenheim', city: 'Soufflenheim', domain: 'soufflenheim.pro' },
  { name: 'vendenheim', city: 'Vendenheim', domain: 'vendenheim.pro' },
  { name: 'wissembourg', city: 'Wissembourg', domain: 'wissembourg.pro' }
];

// Kategori şablonları
const businessTemplates = [
  {
    name: 'Boulangerie Pâtisserie {city}',
    categories: ['Boulangerie', 'Pâtisserie', 'Alimentation'],
    description: 'Boulangerie artisanale proposant pains frais, viennoiseries et pâtisseries de qualité. Fabrication traditionnelle française.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Pharmacie de {city}',
    categories: ['Pharmacie', 'Santé'],
    description: 'Pharmacie de proximité offrant conseils personnalisés, médicaments, parapharmacie et services de santé.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Restaurant Le {city}',
    categories: ['Restaurant', 'Gastronomie'],
    description: 'Restaurant traditionnel alsacien proposant une cuisine authentique avec des produits locaux et de saison.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Coiffure Élégance {city}',
    categories: ['Coiffeur', 'Beauté'],
    description: 'Salon de coiffure mixte proposant coupes, colorations, soins capillaires et conseils personnalisés.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Garage Automobile {city}',
    categories: ['Garage', 'Automobile', 'Réparation'],
    description: 'Garage multimarques spécialisé en entretien, réparation, diagnostic électronique et pneumatiques.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Boucherie Charcuterie {city}',
    categories: ['Boucherie', 'Charcuterie', 'Alimentation'],
    description: 'Boucherie artisanale proposant viandes de qualité, charcuterie maison et spécialités alsaciennes.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Fleuriste {city}',
    categories: ['Fleuriste', 'Commerce'],
    description: 'Fleuriste créatif proposant compositions florales, plantes, décoration et livraison pour toutes occasions.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Opticien {city}',
    categories: ['Opticien', 'Santé', 'Optique'],
    description: 'Opticien professionnel proposant lunettes de vue, solaires, lentilles de contact et examens de vue.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Pizzeria {city}',
    categories: ['Pizzeria', 'Restaurant', 'Italien'],
    description: 'Pizzeria authentique proposant pizzas au feu de bois, pâtes fraîches et spécialités italiennes.',
    phone: '03 88 XX XX XX'
  },
  {
    name: 'Café Brasserie {city}',
    categories: ['Café', 'Bar', 'Brasserie'],
    description: 'Café brasserie convivial proposant petite restauration, boissons et terrasse en saison.',
    phone: '03 88 XX XX XX'
  }
];

// NETZ Informatique - tüm sitelerde olacak
const netzInformatique = {
  name: 'NETZ Informatique',
  categories: ['Informatique', 'Services', 'Technologie'],
  description: 'Expert en solutions informatiques pour entreprises et particuliers. Services : maintenance, dépannage, cybersécurité, cloud, développement web et formation. Intervention rapide dans tout le Bas-Rhin.',
  phone: '03 88 93 58 97',
  email: 'contact@netz-informatique.fr',
  website: 'https://www.netz-informatique.fr',
  address: '15 Rue de la Gare',
  rating: 4.8,
  featured: true
};

async function seedCompanies() {
  console.log('🌱 Şirketler oluşturuluyor...\n');
  
  let totalCreated = 0;
  
  for (const site of sites) {
    console.log(`📍 ${site.city} için şirketler oluşturuluyor...`);
    
    // Domain'i bul
    const domain = await prisma.domain.findUnique({
      where: { name: site.domain }
    });
    
    if (!domain) {
      console.log(`  ⚠️  Domain bulunamadı: ${site.domain}`);
      continue;
    }
    
    let cityCount = 0;
    
    // Her şehir için standart işletmeleri ekle
    for (const template of businessTemplates) {
      const slug = template.name
        .replace('{city}', site.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      try {
        await prisma.company.create({
          data: {
            name: template.name.replace('{city}', site.city),
            slug: slug,
            description: template.description,
            categories: template.categories,
            phone: template.phone,
            address: template.name.includes('Boulangerie') ? `1 Place de la Mairie, ${site.city}` :
                     template.name.includes('Pharmacie') ? `5 Rue Principale, ${site.city}` :
                     template.name.includes('Restaurant') ? `10 Grand Rue, ${site.city}` :
                     `${Math.floor(Math.random() * 50) + 1} Rue ${['de la Gare', 'du Marché', 'Principale', 'de l\'Église'][Math.floor(Math.random() * 4)]}, ${site.city}`,
            city: site.city,
            postalCode: '67500',
            country: 'France',
            rating: (4.0 + Math.random() * 1.0).toFixed(1),
            reviewCount: Math.floor(Math.random() * 50) + 10,
            isActive: true,
            isFeatured: false,
            domainId: domain.id
          }
        });
        cityCount++;
      } catch (error) {
        // Slug çakışması olabilir, devam et
      }
    }
    
    // NETZ Informatique'i ekle
    const netzSlug = `netz-informatique-${site.name}`;
    try {
      await prisma.company.create({
        data: {
          name: netzInformatique.name,
          slug: netzSlug,
          description: netzInformatique.description,
          categories: netzInformatique.categories,
          phone: netzInformatique.phone,
          email: netzInformatique.email,
          website: netzInformatique.website,
          address: `${netzInformatique.address}, ${site.city}`,
          city: site.city,
          postalCode: '67500',
          country: 'France',
          rating: netzInformatique.rating,
          reviewCount: 127,
          isActive: true,
          isFeatured: true,
          domainId: domain.id
        }
      });
      cityCount++;
    } catch (error) {
      // Zaten varsa devam et
    }
    
    console.log(`  ✅ ${cityCount} şirket eklendi`);
    totalCreated += cityCount;
  }
  
  console.log(`\n🎉 Toplam ${totalCreated} şirket başarıyla oluşturuldu!`);
}

seedCompanies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

