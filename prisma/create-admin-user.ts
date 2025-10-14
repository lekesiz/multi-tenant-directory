import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔄 Creating admin user...');

  const email = 'mikail@netzinformatique.fr';
  const name = 'Mikail Lekesiz';
  const username = 'mikail';
  const password = 'Admin@2025!'; // Temporary password
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('⚠️  User already exists. Updating password and role...');
    
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role: 'admin',
        name,
      },
    });
    
    console.log('✅ User updated successfully!');
    console.log('📧 Email:', email);
    console.log('👤 Name:', name);
    console.log('🔐 Role: admin');
    console.log('🔑 Password:', password);
    console.log('\n🌐 Admin Panel: https://bas-rhin.pro/admin');
    console.log('🌐 Or: https://bischwiller.pro/admin');
    console.log('🌐 Or: https://haguenau.pro/admin');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    return;
  }

  // Create new admin user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('\n📧 Email:', email);
  console.log('👤 Name:', name);
  console.log('🔐 Role: admin');
  console.log('🔑 Temporary Password:', password);
  console.log('\n🌐 Admin Panel URLs:');
  console.log('   - https://bas-rhin.pro/admin');
  console.log('   - https://bischwiller.pro/admin');
  console.log('   - https://haguenau.pro/admin');
  console.log('\n📝 Login Instructions:');
  console.log('   1. Go to any admin panel URL above');
  console.log('   2. Enter email:', email);
  console.log('   3. Enter password:', password);
  console.log('   4. Click "Sign In"');
  console.log('\n⚠️  IMPORTANT: Change this password after first login!');
}

createAdminUser()
  .catch((e) => {
    console.error('❌ Error creating admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

