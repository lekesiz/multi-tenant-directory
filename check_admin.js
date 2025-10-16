const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    
    console.log('Admin users:', JSON.stringify(users, null, 2));
    
    if (users.length === 0) {
      console.log('\nNo admin users found!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
