import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth-guard';

interface CategoryData {
  slug: string;
  name: string;
  nameFr: string;
  nameEn: string;
  nameDe?: string;
  description?: string;
  icon: string;
  color: string;
  googleTypes: string[];
  children?: CategoryData[];
}

const categories: CategoryData[] = [
  {
    slug: 'alimentation',
    name: 'Alimentation',
    nameFr: 'Alimentation',
    nameEn: 'Food & Dining',
    nameDe: 'Essen & Trinken',
    description: 'Restaurants, cafés, boulangeries et commerces alimentaires',
    icon: '🍽️',
    color: '#F59E0B',
    googleTypes: ['food', 'meal_delivery', 'meal_takeaway'],
    children: [
      {
        slug: 'restaurant',
        name: 'Restaurant',
        nameFr: 'Restaurant',
        nameEn: 'Restaurant',
        nameDe: 'Restaurant',
        icon: '🍴',
        color: '#F59E0B',
        googleTypes: ['restaurant'],
      },
      {
        slug: 'cafe',
        name: 'Café',
        nameFr: 'Café',
        nameEn: 'Cafe',
        nameDe: 'Café',
        icon: '☕',
        color: '#92400E',
        googleTypes: ['cafe', 'coffee_shop'],
      },
      {
        slug: 'boulangerie',
        name: 'Boulangerie',
        nameFr: 'Boulangerie',
        nameEn: 'Bakery',
        nameDe: 'Bäckerei',
        icon: '🥖',
        color: '#D97706',
        googleTypes: ['bakery'],
      },
      {
        slug: 'fast-food',
        name: 'Fast Food',
        nameFr: 'Fast Food',
        nameEn: 'Fast Food',
        nameDe: 'Schnellimbiss',
        icon: '🍔',
        color: '#DC2626',
        googleTypes: ['fast_food'],
      },
      {
        slug: 'bar',
        name: 'Bar',
        nameFr: 'Bar',
        nameEn: 'Bar',
        nameDe: 'Bar',
        icon: '🍺',
        color: '#B91C1C',
        googleTypes: ['bar', 'night_club'],
      },
    ],
  },
  {
    slug: 'sante',
    name: 'Santé',
    nameFr: 'Santé',
    nameEn: 'Health',
    nameDe: 'Gesundheit',
    description: 'Services médicaux, pharmacies et soins de santé',
    icon: '⚕️',
    color: '#10B981',
    googleTypes: ['health', 'medical'],
    children: [
      {
        slug: 'pharmacie',
        name: 'Pharmacie',
        nameFr: 'Pharmacie',
        nameEn: 'Pharmacy',
        nameDe: 'Apotheke',
        icon: '💊',
        color: '#059669',
        googleTypes: ['pharmacy', 'drugstore'],
      },
      {
        slug: 'medecin',
        name: 'Médecin',
        nameFr: 'Médecin',
        nameEn: 'Doctor',
        nameDe: 'Arzt',
        icon: '🩺',
        color: '#047857',
        googleTypes: ['doctor', 'hospital', 'clinic'],
      },
      {
        slug: 'dentiste',
        name: 'Dentiste',
        nameFr: 'Dentiste',
        nameEn: 'Dentist',
        nameDe: 'Zahnarzt',
        icon: '🦷',
        color: '#065F46',
        googleTypes: ['dentist', 'dental_clinic'],
      },
    ],
  },
  {
    slug: 'commerces',
    name: 'Commerces',
    nameFr: 'Commerces',
    nameEn: 'Retail',
    nameDe: 'Einzelhandel',
    description: 'Magasins et boutiques',
    icon: '🛍️',
    color: '#8B5CF6',
    googleTypes: ['store', 'shopping'],
    children: [
      {
        slug: 'supermarche',
        name: 'Supermarché',
        nameFr: 'Supermarché',
        nameEn: 'Supermarket',
        nameDe: 'Supermarkt',
        icon: '🛒',
        color: '#7C3AED',
        googleTypes: ['supermarket', 'grocery_or_supermarket'],
      },
      {
        slug: 'vetements',
        name: 'Vêtements',
        nameFr: 'Vêtements',
        nameEn: 'Clothing',
        nameDe: 'Kleidung',
        icon: '👔',
        color: '#6D28D9',
        googleTypes: ['clothing_store', 'shoe_store'],
      },
      {
        slug: 'electronique',
        name: 'Électronique',
        nameFr: 'Électronique',
        nameEn: 'Electronics',
        nameDe: 'Elektronik',
        icon: '📱',
        color: '#5B21B6',
        googleTypes: ['electronics_store', 'computer_store'],
      },
    ],
  },
  {
    slug: 'services',
    name: 'Services',
    nameFr: 'Services',
    nameEn: 'Services',
    nameDe: 'Dienstleistungen',
    description: 'Services professionnels et artisans',
    icon: '🔧',
    color: '#3B82F6',
    googleTypes: ['services', 'professional'],
    children: [
      {
        slug: 'plombier',
        name: 'Plombier',
        nameFr: 'Plombier',
        nameEn: 'Plumber',
        nameDe: 'Klempner',
        icon: '🔧',
        color: '#2563EB',
        googleTypes: ['plumber'],
      },
      {
        slug: 'electricien',
        name: 'Électricien',
        nameFr: 'Électricien',
        nameEn: 'Electrician',
        nameDe: 'Elektriker',
        icon: '⚡',
        color: '#1D4ED8',
        googleTypes: ['electrician'],
      },
      {
        slug: 'coiffeur',
        name: 'Coiffeur',
        nameFr: 'Coiffeur',
        nameEn: 'Hair Salon',
        nameDe: 'Friseur',
        icon: '💇',
        color: '#1E40AF',
        googleTypes: ['hair_care', 'beauty_salon'],
      },
      {
        slug: 'garage',
        name: 'Garage',
        nameFr: 'Garage',
        nameEn: 'Auto Repair',
        nameDe: 'Autowerkstatt',
        icon: '🚗',
        color: '#1E3A8A',
        googleTypes: ['car_repair', 'car_wash'],
      },
    ],
  },
  {
    slug: 'loisirs',
    name: 'Loisirs',
    nameFr: 'Loisirs',
    nameEn: 'Entertainment',
    nameDe: 'Unterhaltung',
    description: 'Activités de loisirs et divertissement',
    icon: '🎭',
    color: '#EC4899',
    googleTypes: ['entertainment', 'recreation'],
    children: [
      {
        slug: 'cinema',
        name: 'Cinéma',
        nameFr: 'Cinéma',
        nameEn: 'Cinema',
        nameDe: 'Kino',
        icon: '🎬',
        color: '#DB2777',
        googleTypes: ['movie_theater'],
      },
      {
        slug: 'sport',
        name: 'Sport',
        nameFr: 'Sport',
        nameEn: 'Sports',
        nameDe: 'Sport',
        icon: '⚽',
        color: '#BE185D',
        googleTypes: ['gym', 'stadium', 'sports_club'],
      },
    ],
  },
  {
    slug: 'education',
    name: 'Éducation',
    nameFr: 'Éducation',
    nameEn: 'Education',
    nameDe: 'Bildung',
    description: "Établissements d'enseignement et formation",
    icon: '📚',
    color: '#06B6D4',
    googleTypes: ['education', 'school'],
    children: [
      {
        slug: 'ecole',
        name: 'École',
        nameFr: 'École',
        nameEn: 'School',
        nameDe: 'Schule',
        icon: '🏫',
        color: '#0891B2',
        googleTypes: ['school', 'primary_school', 'secondary_school'],
      },
      {
        slug: 'universite',
        name: 'Université',
        nameFr: 'Université',
        nameEn: 'University',
        nameDe: 'Universität',
        icon: '🎓',
        color: '#0E7490',
        googleTypes: ['university'],
      },
    ],
  },
  {
    slug: 'hebergement',
    name: 'Hébergement',
    nameFr: 'Hébergement',
    nameEn: 'Lodging',
    nameDe: 'Unterkunft',
    description: 'Hôtels et hébergements',
    icon: '🏨',
    color: '#EF4444',
    googleTypes: ['lodging', 'accommodation'],
    children: [
      {
        slug: 'hotel',
        name: 'Hôtel',
        nameFr: 'Hôtel',
        nameEn: 'Hotel',
        nameDe: 'Hotel',
        icon: '🏨',
        color: '#DC2626',
        googleTypes: ['hotel', 'motel'],
      },
    ],
  },
];

async function seedCategory(
  categoryData: CategoryData,
  parentId: number | null = null,
  order: number = 0
) {
  const category = await prisma.category.create({
    data: {
      slug: categoryData.slug,
      name: categoryData.name,
      nameFr: categoryData.nameFr,
      nameEn: categoryData.nameEn,
      nameDe: categoryData.nameDe,
      description: categoryData.description,
      icon: categoryData.icon,
      color: categoryData.color,
      parentId: parentId,
      googleTypes: categoryData.googleTypes,
      isActive: true,
      order: order,
    },
  });

  // Recursively create children
  if (categoryData.children) {
    for (let i = 0; i < categoryData.children.length; i++) {
      await seedCategory(categoryData.children[i], category.id, i);
    }
  }

  return category;
}

export async function POST() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      return auth;
    }

    logger.info('Starting category seed...');

    // Check if categories already exist
    const existingCount = await prisma.category.count();
    if (existingCount > 0) {
      return NextResponse.json(
        {
          message: 'Categories already exist',
          count: existingCount,
        },
        { status: 200 }
      );
    }

    // Create all parent categories and their children
    for (let i = 0; i < categories.length; i++) {
      await seedCategory(categories[i], null, i);
    }

    const totalCategories = await prisma.category.count();
    const parentCategories = await prisma.category.count({
      where: { parentId: null },
    });
    const childCategories = await prisma.category.count({
      where: { parentId: { not: null } },
    });

    logger.info('Category seed completed successfully', {
      total: totalCategories,
      parents: parentCategories,
      children: childCategories,
    });

    return NextResponse.json({
      success: true,
      message: 'Categories seeded successfully',
      stats: {
        total: totalCategories,
        parents: parentCategories,
        children: childCategories,
      },
    });
  } catch (error) {
    logger.error('Error seeding categories:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed categories',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
