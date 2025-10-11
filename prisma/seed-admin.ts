import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating admin user...');

  const passwordHash = await bcrypt.hash('changeme123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@haguenau.pro' },
    update: {
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
    create: {
      email: 'admin@haguenau.pro',
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('📧 Email: admin@haguenau.pro');
  console.log('🔑 Password: changeme123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

