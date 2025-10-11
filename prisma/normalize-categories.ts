import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kategori mapping - benzer kategorileri birleştir
const categoryMapping: Record<string, string> = {
  // Coiffure
  'Coiffeur': 'Coiffure',
  'Coiffure': 'Coiffure',
  'Barbier': 'Coiffure',
  
  // Médecin
  'Médecin': 'Santé',
  'Médecine Générale': 'Santé',
  'Dentiste': 'Santé',
  'Soins Dentaires': 'Santé',
  'Kinésithérapeute': 'Santé',
  'Kinésithérapie': 'Santé',
  'Rééducation': 'Santé',
  'Pharmacie': 'Santé',
  'Parapharmacie': 'Santé',
  'Optique': 'Santé',
  'Opticien': 'Santé',
  'Lunettes': 'Santé',
  'Vétérinaire': 'Santé',
  'Santé Animale': 'Santé',
  
  // Beauté
  'Beauté': 'Beauté & Bien-être',
  'Bien-être': 'Beauté & Bien-être',
  'Esthétique': 'Beauté & Bien-être',
  'Institut de Beauté': 'Beauté & Bien-être',
  'Onglerie': 'Beauté & Bien-être',
  'Spa': 'Beauté & Bien-être',
  
  // Alimentation
  'Boulangerie': 'Alimentation',
  'Pâtisserie': 'Alimentation',
  'Boucherie': 'Alimentation',
  'Charcuterie': 'Alimentation',
  'Fromagerie': 'Alimentation',
  'Fruits et Légumes': 'Alimentation',
  'Primeur': 'Alimentation',
  'Épicerie': 'Alimentation',
  'Supermarché': 'Alimentation',
  'Alimentation': 'Alimentation',
  'Chocolaterie': 'Alimentation',
  'Confiserie': 'Alimentation',
  'Cave à Vins': 'Alimentation',
  'Vins et Spiritueux': 'Alimentation',
  
  // Restaurant
  'Restaurant': 'Restaurant',
  'Pizzeria': 'Restaurant',
  'Winstub': 'Restaurant',
  'Cuisine Alsacienne': 'Restaurant',
  'Cuisine Française': 'Restaurant',
  'Cuisine Traditionnelle': 'Restaurant',
  'Gastronomie': 'Restaurant',
  'Italien': 'Restaurant',
  'Japonais': 'Restaurant',
  'Sushi': 'Restaurant',
  'Traiteur': 'Restaurant',
  
  // Café & Bar
  'Café': 'Café & Bar',
  'Bar': 'Café & Bar',
  'Brasserie': 'Café & Bar',
  'Bière': 'Café & Bar',
  
  // Automobile
  'Garage': 'Automobile',
  'Automobile': 'Automobile',
  'Mécanique': 'Automobile',
  'Réparation': 'Automobile',
  'Carrosserie': 'Automobile',
  'Entretien Auto': 'Automobile',
  'Pneumatiques': 'Automobile',
  'Station-Service': 'Automobile',
  'Carburant': 'Automobile',
  'Auto-École': 'Automobile',
  'Concessionnaire': 'Automobile',
  'Peugeot': 'Automobile',
  'Renault': 'Automobile',
  'Citroën': 'Automobile',
  'Ford': 'Automobile',
  'Opel': 'Automobile',
  'Volkswagen': 'Automobile',
  
  // Artisan
  'Artisan': 'Artisan',
  'Artisanat': 'Artisan',
  'Plomberie': 'Artisan',
  'Plombier': 'Artisan',
  'Électricité': 'Artisan',
  'Électricien': 'Artisan',
  'Menuiserie': 'Artisan',
  'Ébénisterie': 'Artisan',
  'Chauffage': 'Artisan',
  'Chauffagiste': 'Artisan',
  'Peinture': 'Artisan',
  'Serrurier': 'Artisan',
  'Dépannage': 'Artisan',
  'Bois': 'Artisan',
  
  // Commerce
  'Commerce': 'Commerce',
  'Commerces': 'Commerce',
  'Vente': 'Commerce',
  'Fleuriste': 'Commerce',
  'Librairie': 'Commerce',
  'Papeterie': 'Commerce',
  'Animalerie': 'Commerce',
  'Animaux': 'Commerce',
  'Décoration': 'Commerce',
  
  // Services
  'Services': 'Services',
  'Service': 'Services',
  'Pressing': 'Services',
  'Laverie': 'Services',
  'Tabac': 'Services',
  'Presse': 'Services',
  'Tabac Presse': 'Services',
  
  // Immobilier & Finance
  'Immobilier': 'Immobilier & Finance',
  'Agence': 'Immobilier & Finance',
  'Banque': 'Immobilier & Finance',
  'Finance': 'Immobilier & Finance',
  'Assurance': 'Immobilier & Finance',
  
  // Éducation & Formation
  'Éducation': 'Éducation & Formation',
  'Formation': 'Éducation & Formation',
  'Musique': 'Éducation & Formation',
  
  // Loisirs & Culture
  'Loisirs': 'Loisirs & Culture',
  'Culture': 'Loisirs & Culture',
  'Sport': 'Loisirs & Culture',
  'Fitness': 'Loisirs & Culture',
  'Musée': 'Loisirs & Culture',
  'Tourisme': 'Loisirs & Culture',
  
  // Hébergement
  'Hôtel': 'Hébergement',
  'Hébergement': 'Hébergement',
  
  // Spécial (Alsace)
  'Poterie': 'Artisanat Alsacien',
  'Tradition': 'Artisanat Alsacien',
  
  // Informatique
  'Informatique': 'Informatique',
  
  // Industrie
  'Industrie': 'Industrie',
  
  // Cuisine (si tek başına)
  'Cuisine': 'Restaurant',
  'Homme': 'Coiffure',
  'Salon': 'Beauté & Bien-être',
};

async function normalizeCategories() {
  console.log('🔄 Kategori normalizasyonu başlıyor...\n');

  // Tüm şirketleri al
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      categories: true,
    },
  });

  console.log(`📊 Toplam ${companies.length} şirket bulundu\n`);

  let updatedCount = 0;
  let unchangedCount = 0;

  for (const company of companies) {
    const oldCategories = company.categories;
    const newCategories = Array.from(
      new Set(
        oldCategories.map((cat) => categoryMapping[cat] || cat)
      )
    );

    // Değişiklik varsa güncelle
    if (JSON.stringify(oldCategories.sort()) !== JSON.stringify(newCategories.sort())) {
      await prisma.company.update({
        where: { id: company.id },
        data: { categories: newCategories },
      });
      
      console.log(`✅ ${company.name}`);
      console.log(`   Eski: ${oldCategories.join(', ')}`);
      console.log(`   Yeni: ${newCategories.join(', ')}\n`);
      
      updatedCount++;
    } else {
      unchangedCount++;
    }
  }

  console.log('\n📊 Özet:');
  console.log(`   ✅ Güncellenen: ${updatedCount} şirket`);
  console.log(`   ⏭️  Değişmeyen: ${unchangedCount} şirket`);

  // Yeni kategori listesi
  const allCompanies = await prisma.company.findMany({
    select: { categories: true },
  });

  const uniqueCategories = new Set<string>();
  allCompanies.forEach((c) => {
    c.categories.forEach((cat) => uniqueCategories.add(cat));
  });

  console.log(`\n📋 Yeni Kategori Sayısı: ${uniqueCategories.size}`);
  console.log('\n📝 Kategoriler:');
  Array.from(uniqueCategories)
    .sort()
    .forEach((cat) => console.log(`   - ${cat}`));
}

normalizeCategories()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

