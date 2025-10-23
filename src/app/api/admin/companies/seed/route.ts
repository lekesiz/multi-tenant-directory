import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

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

// NETZ Informatique
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

/**
 * POST /api/admin/companies/seed
 * Tüm şehirler için şirketleri oluşturur
 */
export async function POST(request: Request) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET || 'your-secret-key';
    
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('🌱 Şirketler oluşturuluyor...');
    
    let totalCreated = 0;
    const results = [];
    
    for (const site of sites) {
      logger.info(`📍 ${site.city} için şirketler oluşturuluyor...`);
      
      // Domain'i bul
      const domain = await prisma.domain.findUnique({
        where: { name: site.domain }
      });
      
      if (!domain) {
        logger.warn(`⚠️  Domain bulunamadı: ${site.domain}`);
        results.push({ city: site.city, created: 0, error: 'Domain not found' });
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
          const company = await prisma.company.create({
            data: {
              name: template.name.replace('{city}', site.city),
              slug: slug,
              categories: template.categories,
              phone: template.phone,
              address: template.name.includes('Boulangerie') ? `1 Place de la Mairie, ${site.city}` :
                       template.name.includes('Pharmacie') ? `5 Rue Principale, ${site.city}` :
                       template.name.includes('Restaurant') ? `10 Grand Rue, ${site.city}` :
                       `${Math.floor(Math.random() * 50) + 1} Rue ${['de la Gare', 'du Marché', 'Principale', 'de l\'Église'][Math.floor(Math.random() * 4)]}, ${site.city}`,
              city: site.city,
              postalCode: '67500',
              rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
              reviewCount: Math.floor(Math.random() * 50) + 10,
              isActive: true,
              isFeatured: false
            }
          });
          
          // CompanyContent oluştur
          await prisma.companyContent.create({
            data: {
              companyId: company.id,
              domainId: domain.id,
              isVisible: true,
              customDescription: template.description
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
        const netzCompany = await prisma.company.create({
          data: {
            name: netzInformatique.name,
            slug: netzSlug,
            categories: netzInformatique.categories,
            phone: netzInformatique.phone,
            email: netzInformatique.email,
            website: netzInformatique.website,
            address: `${netzInformatique.address}, ${site.city}`,
            city: site.city,
            postalCode: '67500',
            rating: netzInformatique.rating,
            reviewCount: 127,
            isActive: true,
            isFeatured: true
          }
        });
        
        // CompanyContent oluştur
        await prisma.companyContent.create({
          data: {
            companyId: netzCompany.id,
            domainId: domain.id,
            isVisible: true,
            customDescription: netzInformatique.description
          }
        });
        cityCount++;
      } catch (error) {
        // Zaten varsa devam et
      }
      
      logger.info(`✅ ${site.city}: ${cityCount} şirket eklendi`);
      results.push({ city: site.city, created: cityCount });
      totalCreated += cityCount;
    }
    
    logger.info(`🎉 Toplam ${totalCreated} şirket başarıyla oluşturuldu!`);
    
    return NextResponse.json({
      success: true,
      totalCreated,
      results
    });
    
  } catch (error: any) {
    logger.error('❌ Şirket oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Şirketler oluşturulurken hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

