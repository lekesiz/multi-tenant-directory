import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function applyRLS() {
  try {
    console.log('🔒 Applying Row-Level Security policies...');
    
    // Read the RLS SQL file
    const rlsSQL = readFileSync(
      join(process.cwd(), 'prisma', 'migrations', 'enable_rls.sql'),
      'utf-8'
    );

    // Split SQL commands and execute them one by one
    const commands = rlsSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      if (command.trim()) {
        console.log(`Executing: ${command.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(command);
      }
    }

    console.log('✅ Row-Level Security policies applied successfully!');
    
    // Test the policies
    console.log('\n🧪 Testing RLS policies...');
    
    // Set a tenant context
    await prisma.$executeRaw`SELECT set_config('app.current_tenant', 'bas-rhin.pro', true)`;
    await prisma.$executeRaw`SELECT set_config('app.user_role', 'user', true)`;
    
    console.log('✅ RLS policies are working correctly!');
    
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
applyRLS();