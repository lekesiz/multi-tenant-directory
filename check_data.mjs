import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.count();
  const categories = await prisma.company.findMany({
    select: { categories: true }
  });
  
  const allCategories = new Set();
  categories.forEach(c => c.categories.forEach(cat => allCategories.add(cat)));
  
  const domains = await prisma.domain.findMany({
    select: { name: true, id: true },
    where: { isActive: true }
  });
  
  console.log(JSON.stringify({
    totalCompanies: companies,
    uniqueCategories: Array.from(allCategories).sort(),
    categoryCount: allCategories.size,
    domains: domains
  }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
