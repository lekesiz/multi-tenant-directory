import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNewLead() {
  // Get the most recent lead
  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      domain: true,
      category: true
    }
  });
  
  console.log(`\n📋 Derniers leads (${recentLeads.length}):`);
  recentLeads.forEach((lead, i) => {
    console.log(`\n${i+1}. Lead ID: ${lead.id}`);
    console.log(`   Domain: ${lead.domain.name}`);
    console.log(`   Phone: ${lead.phone}`);
    console.log(`   Email: ${lead.email || 'N/A'}`);
    console.log(`   Postal Code: ${lead.postalCode}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Created: ${lead.createdAt}`);
    console.log(`   Note: ${lead.note || 'N/A'}`);
  });
  
  // Count total leads
  const totalLeads = await prisma.lead.count();
  console.log(`\n📊 Total Leads: ${totalLeads}`);
  
  await prisma.$disconnect();
}

checkNewLead().catch(console.error);
