import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding business categories...');

  const categories = [
    {
      googleCategory: 'restaurant',
      frenchName: 'Restaurant',
      description: 'Restaurants and dining establishments',
      icon: 'utensils',
      order: 1,
    },
    {
      googleCategory: 'cafe',
      frenchName: 'Café',
      description: 'Coffee shops and cafés',
      icon: 'coffee',
      order: 2,
    },
    {
      googleCategory: 'bar',
      frenchName: 'Bar',
      description: 'Bars and nightclubs',
      icon: 'wine-glass',
      order: 3,
    },
    {
      googleCategory: 'bakery',
      frenchName: 'Boulangerie',
      description: 'Bakeries and pastry shops',
      icon: 'bread',
      order: 4,
    },
    {
      googleCategory: 'butcher',
      frenchName: 'Boucherie',
      description: 'Butchers and meat shops',
      icon: 'drumstick',
      order: 5,
    },
    {
      googleCategory: 'supermarket',
      frenchName: 'Supermarché',
      description: 'Supermarkets and large grocery stores',
      icon: 'shopping-cart',
      order: 6,
    },
    {
      googleCategory: 'grocery',
      frenchName: 'Épicerie',
      description: 'Small grocery stores',
      icon: 'shopping-basket',
      order: 7,
    },
    {
      googleCategory: 'pharmacy',
      frenchName: 'Pharmacie',
      description: 'Pharmacies',
      icon: 'pills',
      order: 8,
    },
    {
      googleCategory: 'hospital',
      frenchName: 'Hôpital',
      description: 'Hospitals',
      icon: 'hospital',
      order: 9,
    },
    {
      googleCategory: 'doctor',
      frenchName: 'Médecin',
      description: 'Doctors and medical practices',
      icon: 'stethoscope',
      order: 10,
    },
    {
      googleCategory: 'dentist',
      frenchName: 'Dentiste',
      description: 'Dental practices',
      icon: 'tooth',
      order: 11,
    },
    {
      googleCategory: 'car_repair',
      frenchName: 'Réparation Auto',
      description: 'Car repair shops',
      icon: 'wrench',
      order: 12,
    },
    {
      googleCategory: 'gas_station',
      frenchName: 'Station Essence',
      description: 'Gas stations',
      icon: 'gas-pump',
      order: 13,
    },
    {
      googleCategory: 'bank',
      frenchName: 'Banque',
      description: 'Banks',
      icon: 'building',
      order: 14,
    },
    {
      googleCategory: 'post_office',
      frenchName: 'Poste',
      description: 'Post offices',
      icon: 'mail',
      order: 15,
    },
    {
      googleCategory: 'library',
      frenchName: 'Bibliothèque',
      description: 'Libraries',
      icon: 'book',
      order: 16,
    },
    {
      googleCategory: 'school',
      frenchName: 'École',
      description: 'Schools',
      icon: 'school',
      order: 17,
    },
    {
      googleCategory: 'hotel',
      frenchName: 'Hôtel',
      description: 'Hotels and accommodations',
      icon: 'bed',
      order: 18,
    },
    {
      googleCategory: 'gym',
      frenchName: 'Salle de Sport',
      description: 'Fitness centers',
      icon: 'dumbbell',
      order: 19,
    },
    {
      googleCategory: 'hair_salon',
      frenchName: 'Coiffeur',
      description: 'Hair salons',
      icon: 'scissors',
      order: 20,
    },
    {
      googleCategory: 'spa',
      frenchName: 'Spa',
      description: 'Spas and wellness centers',
      icon: 'spa',
      order: 21,
    },
    {
      googleCategory: 'cinema',
      frenchName: 'Cinéma',
      description: 'Cinemas',
      icon: 'film',
      order: 22,
    },
    {
      googleCategory: 'museum',
      frenchName: 'Musée',
      description: 'Museums',
      icon: 'image',
      order: 23,
    },
    {
      googleCategory: 'park',
      frenchName: 'Parc',
      description: 'Parks',
      icon: 'trees',
      order: 24,
    },
    {
      googleCategory: 'plumber',
      frenchName: 'Plombier',
      description: 'Plumbers',
      icon: 'wrench',
      order: 25,
    },
    {
      googleCategory: 'electrician',
      frenchName: 'Électricien',
      description: 'Electricians',
      icon: 'zap',
      order: 26,
    },
    {
      googleCategory: 'locksmith',
      frenchName: 'Serrurier',
      description: 'Locksmiths',
      icon: 'key',
      order: 27,
    },
    {
      googleCategory: 'painter',
      frenchName: 'Peintre',
      description: 'Painters',
      icon: 'paint-bucket',
      order: 28,
    },
    {
      googleCategory: 'carpenter',
      frenchName: 'Charpentier',
      description: 'Carpenters',
      icon: 'hammer',
      order: 29,
    },
  ];

  for (const category of categories) {
    const created = await prisma.businessCategory.upsert({
      where: { googleCategory: category.googleCategory },
      update: {},
      create: category,
    });
    console.log(`✓ ${category.frenchName}`);
  }

  console.log('✅ All categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
