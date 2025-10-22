const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@haguenau.pro' }
  });
  
  if (admin) {
    console.log('Admin user found:');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
  } else {
    console.log('Admin user not found!');
  }
  
  await prisma.$disconnect();
}

checkAdmin().catch(console.error);
