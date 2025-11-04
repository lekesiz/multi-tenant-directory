const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Recherche de gries.pro dans la base de donnees...\n');
  
  // Chercher gries.pro (le champ s'appelle 'name' pas 'domain')
  const gries = await prisma.domain.findMany({
    where: {
      name: { contains: 'gries' }
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      siteTitle: true,
      siteDescription: true,
      createdAt: true
    }
  });
  
  if (gries.length === 0) {
    console.log('Aucun domaine trouve avec "gries"');
  } else {
    console.log('Domaines trouves:');
    gries.forEach(d => {
      console.log(`\nID: ${d.id}`);
      console.log(`Name: ${d.name}`);
      console.log(`Active: ${d.isActive}`);
      console.log(`Title: ${d.siteTitle}`);
      console.log(`Description: ${d.siteDescription}`);
      console.log(`Created: ${d.createdAt}`);
    });
  }
  
  // Comparer avec haguenau.pro qui fonctionne
  console.log('\n\nComparaison avec haguenau.pro (qui fonctionne):\n');
  const haguenau = await prisma.domain.findFirst({
    where: { name: 'haguenau.pro' },
    select: {
      id: true,
      name: true,
      isActive: true,
      siteTitle: true,
      siteDescription: true,
      createdAt: true
    }
  });
  
  if (haguenau) {
    console.log('haguenau.pro trouve:');
    console.log(`ID: ${haguenau.id}`);
    console.log(`Name: ${haguenau.name}`);
    console.log(`Active: ${haguenau.isActive}`);
    console.log(`Title: ${haguenau.siteTitle}`);
    console.log(`Description: ${haguenau.siteDescription}`);
  }
  
  // Lister tous les domaines
  console.log('\n\nTous les domaines dans la base:');
  const allDomains = await prisma.domain.findMany({
    select: {
      id: true,
      name: true,
      isActive: true
    },
    orderBy: { id: 'asc' }
  });
  
  console.log(`Total: ${allDomains.length} domaines`);
  allDomains.forEach(d => {
    console.log(`- ${d.name} (ID: ${d.id}, Active: ${d.isActive})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
