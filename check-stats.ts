import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
  console.log('📊 Vérification des statistiques...\n');

  // Leads
  const totalLeads = await prisma.lead.count();
  const newLeads = await prisma.lead.count({ where: { status: 'new' } });
  const assignedLeads = await prisma.lead.count({ where: { status: 'assigned' } });
  const wonLeads = await prisma.lead.count({ where: { status: 'won' } });
  
  console.log('📋 LEADS:');
  console.log(`  Total: ${totalLeads}`);
  console.log(`  Nouveaux: ${newLeads}`);
  console.log(`  Assignés: ${assignedLeads}`);
  console.log(`  Gagnés: ${wonLeads}\n`);

  // Contact Messages
  try {
    const totalMessages = await prisma.contactMessage.count();
    const newMessages = await prisma.contactMessage.count({ 
      where: { 
        OR: [
          { status: 'new' },
          { status: null }
        ]
      } 
    });
    console.log('📧 MESSAGES DE CONTACT:');
    console.log(`  Total: ${totalMessages}`);
    console.log(`  Nouveaux: ${newMessages}\n`);
  } catch (e) {
    console.log('📧 MESSAGES DE CONTACT: Table non trouvée\n');
  }

  // Companies
  const totalCompanies = await prisma.company.count();
  console.log(`🏢 ENTREPRISES: ${totalCompanies}\n`);

  // Domains
  const totalDomains = await prisma.domain.count();
  const activeDomains = await prisma.domain.count({ where: { isActive: true } });
  console.log('🌐 DOMAINES:');
  console.log(`  Total: ${totalDomains}`);
  console.log(`  Actifs: ${activeDomains}\n`);

  // Reviews
  const companiesWithReviews = await prisma.company.findMany({
    select: { reviewCount: true, rating: true },
    where: { reviewCount: { gt: 0 } },
  });
  const totalReviews = companiesWithReviews.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
  const avgRating = companiesWithReviews.length > 0
    ? companiesWithReviews.reduce((sum, c) => sum + (c.rating || 0), 0) / companiesWithReviews.length
    : 0;
  
  console.log('⭐ AVIS:');
  console.log(`  Total: ${totalReviews}`);
  console.log(`  Note moyenne: ${avgRating.toFixed(1)}\n`);

  await prisma.$disconnect();
}

checkStats().catch(console.error);
