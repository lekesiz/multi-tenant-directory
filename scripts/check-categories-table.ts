import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking categories table structure...\n');
  
  // Try to get one category with raw SQL
  const result = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'categories'
    ORDER BY ordinal_position;
  `;
  
  console.log('Categories table columns:');
  console.log(result);
  
  // Try to get a sample category
  console.log('\nSample category:');
  const sample = await prisma.$queryRaw`SELECT * FROM categories LIMIT 1`;
  console.log(sample);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
