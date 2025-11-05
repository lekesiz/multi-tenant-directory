import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findMessageTables() {
  const result = await prisma.$queryRaw<Array<{tablename: string}>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `;
  
  console.log('📋 Toutes les tables dans la base de données:\n');
  result.forEach((row, index) => console.log(`${index + 1}. ${row.tablename}`));
  
  console.log('\n🔍 Recherche de tables liées aux messages...\n');
  const messageTables = result.filter(r => 
    r.tablename.toLowerCase().includes('message') || 
    r.tablename.toLowerCase().includes('contact') ||
    r.tablename.toLowerCase().includes('lead')
  );
  
  if (messageTables.length > 0) {
    console.log('✅ Tables trouvées:');
    messageTables.forEach(t => console.log(`  - ${t.tablename}`));
  } else {
    console.log('❌ Aucune table de messages trouvée');
  }
  
  await prisma.$disconnect();
}

findMessageTables().catch(console.error);
