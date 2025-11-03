import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  // İngilizce kategoriler (Google Places'ten gelen)
  { googleCategory: 'establishment', frenchName: 'Établissement', icon: '🏢', order: 1 },
  { googleCategory: 'point_of_interest', frenchName: 'Point d\'Intérêt', icon: '📍', order: 2 },
  { googleCategory: 'general_contractor', frenchName: 'Entrepreneur Général', icon: '🏗️', order: 3 },
  { googleCategory: 'food', frenchName: 'Alimentation', icon: '🍽️', order: 4 },
  { googleCategory: 'home_goods_store', frenchName: 'Magasin d\'Articles Ménagers', icon: '🏠', order: 5 },
  { googleCategory: 'electronics_store', frenchName: 'Magasin d\'Électronique', icon: '📱', order: 6 },
  { googleCategory: 'furniture_store', frenchName: 'Magasin de Meubles', icon: '🛋️', order: 7 },
  { googleCategory: 'car_repair', frenchName: 'Réparation Auto', icon: '🔧', order: 8 },
  { googleCategory: 'painter', frenchName: 'Peintre', icon: '🎨', order: 9 },
  { googleCategory: 'health', frenchName: 'Santé', icon: '🏥', order: 10 },
  { googleCategory: 'store', frenchName: 'Magasin', icon: '🏪', order: 11 },
  { googleCategory: 'bakery', frenchName: 'Boulangerie', icon: '🥖', order: 12 },
  { googleCategory: 'electrician', frenchName: 'Électricien', icon: '⚡', order: 13 },
  
  // Fransızca kategoriler (zaten var olanlar)
  { googleCategory: 'Restaurant', frenchName: 'Restaurant', icon: '🍽️', order: 20 },
  { googleCategory: 'Boulangerie', frenchName: 'Boulangerie', icon: '🥖', order: 21 },
  { googleCategory: 'Pâtisserie', frenchName: 'Pâtisserie', icon: '🍰', order: 22 },
  { googleCategory: 'Pizzeria', frenchName: 'Pizzeria', icon: '🍕', order: 23 },
  { googleCategory: 'Café', frenchName: 'Café', icon: '☕', order: 24 },
  { googleCategory: 'Bar', frenchName: 'Bar', icon: '🍺', order: 25 },
  { googleCategory: 'Boucherie', frenchName: 'Boucherie', icon: '🥩', order: 26 },
  { googleCategory: 'Charcuterie', frenchName: 'Charcuterie', icon: '🥓', order: 27 },
  { googleCategory: 'Traiteur', frenchName: 'Traiteur', icon: '🍱', order: 28 },
  { googleCategory: 'Épicerie', frenchName: 'Épicerie', icon: '🏪', order: 29 },
  { googleCategory: 'Supermarché', frenchName: 'Supermarché', icon: '🛒', order: 30 },
  { googleCategory: 'Pharmacie', frenchName: 'Pharmacie', icon: '💊', order: 31 },
  { googleCategory: 'Médecin', frenchName: 'Médecin', icon: '🩺', order: 32 },
  { googleCategory: 'Dentiste', frenchName: 'Dentiste', icon: '🦷', order: 33 },
  { googleCategory: 'Kinésithérapie', frenchName: 'Kinésithérapie', icon: '🏥', order: 34 },
  { googleCategory: 'Vétérinaire', frenchName: 'Vétérinaire', icon: '🐾', order: 35 },
  { googleCategory: 'Optique', frenchName: 'Optique', icon: '👓', order: 36 },
  { googleCategory: 'Garage', frenchName: 'Garage', icon: '🚗', order: 37 },
  { googleCategory: 'Coiffure', frenchName: 'Coiffure', icon: '💇', order: 38 },
  { googleCategory: 'Beauté', frenchName: 'Beauté', icon: '💄', order: 39 },
  { googleCategory: 'Fleuriste', frenchName: 'Fleuriste', icon: '🌸', order: 40 },
  { googleCategory: 'Plomberie', frenchName: 'Plomberie', icon: '🔧', order: 41 },
  { googleCategory: 'Électricité', frenchName: 'Électricité', icon: '⚡', order: 42 },
  { googleCategory: 'Menuiserie', frenchName: 'Menuiserie', icon: '🪚', order: 43 },
  { googleCategory: 'Peinture', frenchName: 'Peinture', icon: '🎨', order: 44 },
  { googleCategory: 'Immobilier', frenchName: 'Immobilier', icon: '🏠', order: 45 },
  { googleCategory: 'Banque', frenchName: 'Banque', icon: '🏦', order: 46 },
  { googleCategory: 'Librairie', frenchName: 'Librairie', icon: '📚', order: 47 },
  { googleCategory: 'Informatique', frenchName: 'Informatique', icon: '💻', order: 48 },
  { googleCategory: 'Sport', frenchName: 'Sport', icon: '⚽', order: 49 },
  { googleCategory: 'Fitness', frenchName: 'Fitness', icon: '💪', order: 50 },
  { googleCategory: 'Hôtel', frenchName: 'Hôtel', icon: '🏨', order: 51 },
  { googleCategory: 'Assurance', frenchName: 'Assurance', icon: '🛡️', order: 52 },
  { googleCategory: 'Automobile', frenchName: 'Automobile', icon: '🚗', order: 53 },
  { googleCategory: 'Santé', frenchName: 'Santé', icon: '🏥', order: 54 },
  { googleCategory: 'Commerce', frenchName: 'Commerce', icon: '🏪', order: 55 },
  { googleCategory: 'Tabac', frenchName: 'Tabac', icon: '🚬', order: 56 },
  { googleCategory: 'Presse', frenchName: 'Presse', icon: '📰', order: 57 },
];

async function main() {
  console.log('🌱 Seeding business categories...');

  for (const category of categories) {
    try {
      await prisma.businessCategory.upsert({
        where: { googleCategory: category.googleCategory },
        update: {
          frenchName: category.frenchName,
          icon: category.icon,
          order: category.order,
        },
        create: {
          googleCategory: category.googleCategory,
          frenchName: category.frenchName,
          icon: category.icon,
          order: category.order,
          isActive: true,
        },
      });
      console.log(`✅ ${category.googleCategory} → ${category.frenchName} ${category.icon}`);
    } catch (error) {
      console.error(`❌ Error seeding ${category.googleCategory}:`, error);
    }
  }

  console.log('✅ Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

