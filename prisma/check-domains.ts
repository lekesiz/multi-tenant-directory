import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const domains = await prisma.domain.findMany({ select: { name: true } });
  console.log('Domains in database:');
  domains.forEach(d => console.log('  -', d.name));
}

main().finally(() => prisma.$disconnect());
