import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  // Check database connection
  const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
  console.log('Database info:', result);
  
  // Check if categories table exists
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'categories'
  `;
  console.log('Categories table exists:', tables);
  
  // Check categories table columns
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'categories' 
    ORDER BY ordinal_position
  `;
  console.log('Categories columns:', columns);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
