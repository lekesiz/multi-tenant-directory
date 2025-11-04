import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking if SIRET column exists in companies table...\n');
  
  const result = await prisma.$queryRaw<Array<{column_name: string, data_type: string}>>`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'companies' 
    AND column_name = 'siret'
  `;
  
  if (result.length > 0) {
    console.log('✅ SIRET column EXISTS');
    console.log('   Type:', result[0].data_type);
  } else {
    console.log('❌ SIRET column DOES NOT EXIST');
    console.log('\nSolution: Remove siret from Prisma schema or add migration');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
