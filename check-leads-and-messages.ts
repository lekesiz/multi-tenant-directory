import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLeadsAndMessages() {
  console.log('📊 Vérification des Leads et Messages...\n');

  // Check leads
  const leads = await prisma.$queryRaw<Array<any>>`
    SELECT id, "tenantId", phone, email, status, "createdAt" 
    FROM leads 
    ORDER BY "createdAt" DESC 
    LIMIT 10;
  `;
  
  console.log('📋 LEADS:');
  console.log(`  Total: ${leads.length} (derniers 10)`);
  if (leads.length > 0) {
    leads.forEach((lead, i) => {
      console.log(`  ${i + 1}. ID: ${lead.id}, Phone: ${lead.phone}, Status: ${lead.status}, Date: ${lead.createdAt}`);
    });
  }

  // Check contact inquiries
  const inquiries = await prisma.$queryRaw<Array<any>>`
    SELECT * 
    FROM contact_inquiries 
    ORDER BY "createdAt" DESC 
    LIMIT 10;
  `;
  
  console.log('\n📧 CONTACT INQUIRIES:');
  console.log(`  Total: ${inquiries.length} (derniers 10)`);
  if (inquiries.length > 0) {
    inquiries.forEach((inq, i) => {
      console.log(`  ${i + 1}. ID: ${inq.id}, Name: ${inq.name || 'N/A'}, Email: ${inq.email || 'N/A'}, Date: ${inq.createdAt}`);
    });
  }

  // Get counts
  const leadCount = await prisma.$queryRaw<Array<{count: bigint}>>`SELECT COUNT(*) as count FROM leads`;
  const inquiryCount = await prisma.$queryRaw<Array<{count: bigint}>>`SELECT COUNT(*) as count FROM contact_inquiries`;
  
  console.log('\n📊 TOTAUX:');
  console.log(`  Leads: ${leadCount[0].count}`);
  console.log(`  Contact Inquiries: ${inquiryCount[0].count}`);

  await prisma.$disconnect();
}

checkLeadsAndMessages().catch(console.error);
