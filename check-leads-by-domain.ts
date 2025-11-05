import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLeadsByDomain() {
  console.log('📊 Vérification des leads par domain...\n');

  const leadsByDomain = await prisma.lead.groupBy({
    by: ['tenantId'],
    _count: {
      id: true
    }
  });

  console.log('📋 Leads par domain:');
  for (const item of leadsByDomain) {
    const domain = await prisma.domain.findUnique({
      where: { id: item.tenantId },
      select: { name: true }
    });
    console.log(`  ${domain?.name || 'Unknown'} (ID: ${item.tenantId}): ${item._count.id} leads`);
  }

  const totalLeads = await prisma.lead.count();
  console.log(`\n📊 Total leads (tous domaines): ${totalLeads}`);

  await prisma.$disconnect();
}

checkLeadsByDomain().catch(console.error);
