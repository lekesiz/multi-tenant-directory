import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  // Check leads count
  const leadCount = await prisma.$queryRaw<Array<{count: string}>>`SELECT COUNT(*) as count FROM leads`;
  console.log(`📋 Total Leads: ${leadCount[0].count}`);
  
  // Check contact_inquiries count  
  const inquiryCount = await prisma.$queryRaw<Array<{count: string}>>`SELECT COUNT(*) as count FROM contact_inquiries`;
  console.log(`📧 Total Contact Inquiries: ${inquiryCount[0].count}`);
  
  // Get sample leads
  const sampleLeads = await prisma.$queryRaw<Array<any>>`
    SELECT id, "tenantId", phone, email, status, "createdAt" 
    FROM leads 
    ORDER BY "createdAt" DESC 
    LIMIT 5;
  `;
  
  console.log(`\n📋 Exemples de Leads (derniers 5):`);
  sampleLeads.forEach((lead, i) => {
    console.log(`  ${i+1}. ID: ${lead.id}, Phone: ${lead.phone}, Status: ${lead.status}`);
  });
  
  // Get sample inquiries
  const sampleInquiries = await prisma.$queryRaw<Array<any>>`
    SELECT id, "companyId", name, email, message, status, "createdAt"
    FROM contact_inquiries 
    ORDER BY "createdAt" DESC 
    LIMIT 5;
  `;
  
  console.log(`\n📧 Exemples de Contact Inquiries (derniers 5):`);
  sampleInquiries.forEach((inq, i) => {
    console.log(`  ${i+1}. ID: ${inq.id}, Name: ${inq.name}, Email: ${inq.email}, Status: ${inq.status}`);
  });
  
  await prisma.$disconnect();
}

checkData().catch(console.error);
