import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContactTable() {
  const result = await prisma.$queryRaw<Array<{tablename: string}>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `;
  
  console.log('📋 Toutes les tables:');
  result.forEach(row => console.log(`  - ${row.tablename}`));
  
  const contactTables = result.filter(r => r.tablename.includes('contact') || r.tablename.includes('message'));
  console.log(`\n📧 Tables de contact/message: ${contactTables.length > 0 ? contactTables.map(t => t.tablename).join(', ') : 'Aucune'}`);
  
  await prisma.$disconnect();
}

checkContactTable().catch(console.error);
