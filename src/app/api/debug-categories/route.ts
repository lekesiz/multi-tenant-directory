import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domainName = searchParams.get('domain') || 'haguenau.pro';
  
  try {
    // Get domain info
    const domain = await prisma.domain.findUnique({
      where: { name: domainName },
    });
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }
    
    // Step 1: Get visible companies
    const visibleCompanyContent = await prisma.companyContent.findMany({
      where: {
        domainId: domain.id,
        isVisible: true,
        company: {
          isActive: true,
        },
      },
      select: {
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    const visibleCompanyIds = visibleCompanyContent.map((c) => c.companyId);
    
    // Step 2: Get category relations
    const categoryRelations = await prisma.companyCategory.findMany({
      where: {
        companyId: {
          in: visibleCompanyIds,
        },
      },
      select: {
        companyId: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            nameFr: true,
            slug: true,
          },
        },
      },
    });
    
    // Step 3: Get all categories
    const allCategories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        nameFr: true,
        slug: true,
        parentId: true,
      },
    });
    
    // Build category count map
    const categoryCountMap = new Map<number, Set<number>>();
    categoryRelations.forEach((relation) => {
      if (!categoryCountMap.has(relation.categoryId)) {
        categoryCountMap.set(relation.categoryId, new Set());
      }
      categoryCountMap.get(relation.categoryId)!.add(relation.companyId);
    });
    
    const categoriesWithCounts = allCategories.map((cat) => ({
      ...cat,
      count: categoryCountMap.get(cat.id)?.size || 0,
      companyIds: Array.from(categoryCountMap.get(cat.id) || []),
    }));
    
    return NextResponse.json({
      domain: {
        id: domain.id,
        name: domain.name,
      },
      stats: {
        totalVisibleCompanies: visibleCompanyIds.length,
        totalCategoryRelations: categoryRelations.length,
        totalCategories: allCategories.length,
      },
      visibleCompanies: visibleCompanyContent.map((c) => ({
        id: c.companyId,
        name: c.company.name,
      })),
      categoryRelations: categoryRelations.slice(0, 10), // First 10 for brevity
      categoriesWithCounts: categoriesWithCounts.filter((c) => !c.parentId), // Only parent categories
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
