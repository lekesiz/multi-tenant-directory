const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@haguenau.pro';
    const password = 'Admin2025!Haguenau';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('Email:', email);
      console.log('Password:', password);
      return;
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name: 'Admin Haguenau',
        passwordHash: hashedPassword,
        role: 'admin',
        
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('=================================');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('=================================');
    console.log('');
    console.log('User ID:', admin.id);
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
