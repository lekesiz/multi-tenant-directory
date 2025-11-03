import { logger } from '@/lib/logger';
import { prisma } from './prisma';

/**
 * Get French name for a Google category
 * Falls back to English if French not available, then original category
 */
export async function getCategoryFrenchName(googleCategory: string): Promise<string> {
  try {
    const category = await prisma.businessCategory.findUnique({
      where: { googleCategory },
      select: { frenchName: true },
    });

    if (category) {
      return category.frenchName;
    }
  } catch (error) {
    logger.error('Error fetching category:', error);
  }

  // Return title-cased original category as fallback
  return googleCategory
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get category details (French name, icon, description)
 */
export async function getCategoryDetails(googleCategory: string) {
  try {
    const category = await prisma.businessCategory.findUnique({
      where: { googleCategory },
      select: {
        frenchName: true,
        germanName: true,
        englishName: true,
        description: true,
        icon: true,
        order: true,
      },
    });

    if (category) {
      return category;
    }
  } catch (error) {
    logger.error('Error fetching category details:', error);
  }

  // Return minimal fallback
  return {
    frenchName: getCategoryFrenchName(googleCategory),
    germanName: null,
    englishName: null,
    description: null,
    icon: null,
    order: 999,
  };
}

/**
 * Get all categories (for category navigation)
 */
export async function getAllCategories() {
  try {
    const categories = await prisma.businessCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        googleCategory: true,
        frenchName: true,
        icon: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });

    return categories;
  } catch (error) {
    logger.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Create default categories (for seeding database)
 */
export async function seedDefaultCategories() {
  const defaultCategories = [
    { googleCategory: 'restaurant', frenchName: 'Restaurant', icon: 'utensils' },
    { googleCategory: 'cafe', frenchName: 'Café', icon: 'coffee' },
    { googleCategory: 'bar', frenchName: 'Bar', icon: 'wine-glass' },
    { googleCategory: 'bakery', frenchName: 'Boulangerie', icon: 'bread' },
    { googleCategory: 'butcher', frenchName: 'Boucherie', icon: 'drumstick' },
    { googleCategory: 'supermarket', frenchName: 'Supermarché', icon: 'shopping-cart' },
    { googleCategory: 'grocery', frenchName: 'Épicerie', icon: 'shopping-basket' },
    { googleCategory: 'pharmacy', frenchName: 'Pharmacie', icon: 'pills' },
    { googleCategory: 'hospital', frenchName: 'Hôpital', icon: 'hospital' },
    { googleCategory: 'doctor', frenchName: 'Médecin', icon: 'stethoscope' },
    { googleCategory: 'dentist', frenchName: 'Dentiste', icon: 'tooth' },
    { googleCategory: 'car_repair', frenchName: 'Réparation Auto', icon: 'wrench' },
    { googleCategory: 'gas_station', frenchName: 'Station Essence', icon: 'gas-pump' },
    { googleCategory: 'bank', frenchName: 'Banque', icon: 'building' },
    { googleCategory: 'post_office', frenchName: 'Poste', icon: 'mail' },
    { googleCategory: 'library', frenchName: 'Bibliothèque', icon: 'book' },
    { googleCategory: 'school', frenchName: 'École', icon: 'school' },
    { googleCategory: 'hotel', frenchName: 'Hôtel', icon: 'bed' },
    { googleCategory: 'gym', frenchName: 'Salle de Sport', icon: 'dumbbell' },
    { googleCategory: 'hair_salon', frenchName: 'Coiffeur', icon: 'scissors' },
    { googleCategory: 'spa', frenchName: 'Spa', icon: 'spa' },
    { googleCategory: 'cinema', frenchName: 'Cinéma', icon: 'film' },
    { googleCategory: 'museum', frenchName: 'Musée', icon: 'image' },
    { googleCategory: 'park', frenchName: 'Parc', icon: 'trees' },
    { googleCategory: 'plumber', frenchName: 'Plombier', icon: 'wrench' },
    { googleCategory: 'electrician', frenchName: 'Électricien', icon: 'zap' },
    { googleCategory: 'locksmith', frenchName: 'Serrurier', icon: 'key' },
    { googleCategory: 'painter', frenchName: 'Peintre', icon: 'paint-bucket' },
    { googleCategory: 'carpenter', frenchName: 'Charpentier', icon: 'hammer' },
  ];

  for (const cat of defaultCategories) {
    try {
      await prisma.businessCategory.upsert({
        where: { googleCategory: cat.googleCategory },
        update: { frenchName: cat.frenchName, icon: cat.icon },
        create: {
          googleCategory: cat.googleCategory,
          frenchName: cat.frenchName,
          icon: cat.icon,
        },
      });
    } catch (error) {
      logger.error(`Error seeding category ${cat.googleCategory}:`, error);
    }
  }

  logger.info('✅ Categories seeded successfully');
}

export default {
  getCategoryFrenchName,
  getCategoryDetails,
  getAllCategories,
  seedDefaultCategories,
};
