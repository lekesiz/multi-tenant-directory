#!/usr/bin/env tsx

// Test script for Business Owner APIs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBusinessOwnerAPIs() {
  console.log('🧪 Testing Business Owner APIs...\n');

  try {
    // 1. Test Database Connection
    console.log('1️⃣ Testing database connection...');
    const companyCount = await prisma.company.count();
    console.log(`✅ Database connected. Found ${companyCount} companies.\n`);

    // 2. Check if BusinessOwner table exists
    console.log('2️⃣ Checking BusinessOwner table...');
    try {
      const ownerCount = await prisma.businessOwner.count();
      console.log(`✅ BusinessOwner table exists. Found ${ownerCount} owners.\n`);
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log('❌ BusinessOwner table does not exist!');
        console.log('   Run production migration first.\n');
        return;
      }
      throw error;
    }

    // 3. Check if CompanyOwnership table exists
    console.log('3️⃣ Checking CompanyOwnership table...');
    try {
      const ownershipCount = await prisma.companyOwnership.count();
      console.log(`✅ CompanyOwnership table exists. Found ${ownershipCount} ownerships.\n`);
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log('❌ CompanyOwnership table does not exist!\n');
      }
    }

    // 4. Check other new tables
    console.log('4️⃣ Checking other new tables...');
    const tables = ['Photo', 'BusinessHours', 'CompanyAnalytics'];
    
    for (const table of tables) {
      try {
        const model = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)];
        const count = await model.count();
        console.log(`✅ ${table} table exists. Found ${count} records.`);
      } catch (error: any) {
        if (error.code === 'P2021') {
          console.log(`❌ ${table} table does not exist!`);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log('If any tables are missing, the production migration needs to be deployed.');
    console.log('Migration file: prisma/migrations/manual_add_business_owner_system/migration.sql');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testBusinessOwnerAPIs()
  .then(() => {
    console.log('\n✅ Test completed');
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });