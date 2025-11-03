import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function POST() {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting slug fix process...');

    // Get all companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    logger.info(`Found ${companies.length} total companies`);

    const problematicCompanies: typeof companies = [];
    const existingSlugs = new Set<string>();

    // Collect existing valid slugs
    for (const company of companies) {
      if (company.slug && company.slug.trim().length > 0) {
        existingSlugs.add(company.slug);
      }
    }

    // Identify problematic companies
    for (const company of companies) {
      const hasSpace = company.slug && company.slug.includes(' ');
      const hasUppercase = company.slug && company.slug !== company.slug.toLowerCase();
      const hasSpecialChars = company.slug && /[^a-z0-9-]/.test(company.slug);
      const isEmpty = !company.slug || company.slug.trim().length === 0;
      const tooShort = company.slug && company.slug.length < 2;
      const notSlugified = company.slug && company.slug !== slugify(company.slug);

      const hasInvalidSlug =
        isEmpty ||
        tooShort ||
        hasSpace ||
        hasUppercase ||
        hasSpecialChars ||
        notSlugified;

      if (hasInvalidSlug) {
        problematicCompanies.push(company);
      }
    }

    logger.info(`Found ${problematicCompanies.length} companies with invalid slugs`);

    if (problematicCompanies.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All companies have valid slugs',
        fixed: 0,
      });
    }

    const fixed = [];

    // Fix each problematic company
    for (const company of problematicCompanies) {
      let newSlug = slugify(company.name);

      if (!newSlug || newSlug.length === 0) {
        newSlug = `company-${company.id}`;
      }

      // Handle duplicates
      let finalSlug = newSlug;
      let counter = 1;

      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }

      try {
        await prisma.company.update({
          where: { id: company.id },
          data: { slug: finalSlug },
        });

        existingSlugs.add(finalSlug);

        fixed.push({
          id: company.id,
          name: company.name,
          oldSlug: company.slug,
          newSlug: finalSlug,
        });

        logger.info(`Fixed company ${company.id}: "${company.slug}" -> "${finalSlug}"`);
      } catch (error) {
        logger.error(`Error updating company ${company.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed.length} company slugs`,
      fixed: fixed,
      total: problematicCompanies.length,
    });
  } catch (error) {
    logger.error('Slug fix error:', error);
    return NextResponse.json(
      { error: 'Failed to fix slugs' },
      { status: 500 }
    );
  }
}
