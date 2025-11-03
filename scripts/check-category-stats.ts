import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Category Statistics\n');

  // Get all categories with company counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          companyCategories: true,
        },
      },
      parent: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { parentId: 'asc' },
      { order: 'asc' },
    ],
  });

  // Group by parent
  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = categories.filter((c) => c.parentId);

  console.log('🏷️  PARENT CATEGORIES:\n');
  parentCategories.forEach((cat) => {
    const childCount = childCategories.filter((c) => c.parentId === cat.id).length;
    console.log(`  ${cat.icon || '📁'} ${cat.name}`);
    console.log(`     Companies: ${cat._count.companyCategories}`);
    console.log(`     Subcategories: ${childCount}\n`);
  });

  console.log('\n🏷️  CHILD CATEGORIES (Top 20 by usage):\n');
  const sortedChildren = childCategories
    .sort((a, b) => b._count.companyCategories - a._count.companyCategories)
    .slice(0, 20);

  sortedChildren.forEach((cat) => {
    console.log(
      `  ${cat.icon || '📂'} ${cat.name} (${cat.parent?.name || 'No parent'}): ${cat._count.companyCategories} companies`
    );
  });

  console.log('\n\n📈 OVERALL STATS:\n');
  const totalCompanyCategories = await prisma.companyCategory.count();
  const companiesWithCategories = await prisma.company.count({
    where: {
      companyCategories: {
        some: {},
      },
    },
  });
  const primaryCategories = await prisma.companyCategory.count({
    where: {
      isPrimary: true,
    },
  });

  console.log(`  Total category assignments: ${totalCompanyCategories}`);
  console.log(`  Companies with categories: ${companiesWithCategories}`);
  console.log(`  Primary category assignments: ${primaryCategories}`);
  console.log(`  Average categories per company: ${(totalCompanyCategories / companiesWithCategories).toFixed(2)}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
