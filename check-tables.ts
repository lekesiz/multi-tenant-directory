import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  const result = await prisma.$queryRaw<Array<{tablename: string}>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE '%contact%' OR tablename LIKE '%message%'
    ORDER BY tablename;
  `;
  
  console.log('📋 Tables contenant "contact" ou "message":');
  result.forEach(row => console.log(`  - ${row.tablename}`));
  
  await prisma.$disconnect();
}

checkTables().catch(console.error);
