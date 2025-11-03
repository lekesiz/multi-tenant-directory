const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all unique categories from companies
  const companies = await prisma.company.findMany({
    select: { categories: true },
  });

  const allCategories = new Set();
  companies.forEach(company => {
    company.categories.forEach(cat => allCategories.add(cat));
  });

  // Get existing categories in business_categories table
  const businessCategories = await prisma.businessCategory.findMany({
    select: { googleCategory: true, frenchName: true },
  });

  const existingCategories = new Set(businessCategories.map(bc => bc.googleCategory));

  // Find missing categories
  const missingCategories = Array.from(allCategories).filter(cat => !existingCategories.has(cat));

  console.log('\n=== All Categories ===');
  console.log(Array.from(allCategories).sort());

  console.log('\n=== Missing Categories (need French translation) ===');
  console.log(missingCategories.sort());

  console.log('\n=== Existing Categories ===');
  businessCategories.forEach(bc => {
    console.log(`${bc.googleCategory} → ${bc.frenchName}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
