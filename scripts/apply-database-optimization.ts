import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function applyDatabaseOptimization() {
  try {
    console.log('🗄️  Starting database optimization...');
    
    // Read the performance indexes SQL file
    const indexesSQL = readFileSync(
      join(process.cwd(), 'prisma', 'migrations', 'add_performance_indexes.sql'),
      'utf-8'
    );

    console.log('📊 Applying performance indexes...');
    
    // Split SQL commands and execute them one by one
    const commands = indexesSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let skipCount = 0;

    for (const command of commands) {
      if (command.trim()) {
        try {
          console.log(`Executing: ${command.substring(0, 60)}...`);
          await prisma.$executeRawUnsafe(command);
          successCount++;
        } catch (error: any) {
          if (error.message.includes('already exists')) {
            console.log(`  ⏭️  Index already exists, skipping...`);
            skipCount++;
          } else {
            console.error(`  ❌ Error: ${error.message}`);
            throw error;
          }
        }
      }
    }

    console.log('\n📈 Running database statistics update...');
    
    // Update table statistics for better query planning
    const tables = ['domains', 'companies', 'company_content', 'reviews', 'users', 'legal_pages'];
    
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`ANALYZE ${table}`);
        console.log(`  ✅ Analyzed table: ${table}`);
      } catch (error: any) {
        console.log(`  ⚠️  Could not analyze ${table}: ${error.message}`);
      }
    }

    console.log('\n🔍 Checking index usage...');
    
    // Check if our indexes are being used
    const indexUsage = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY idx_tup_read DESC
      LIMIT 10
    `;
    
    console.log('Top 10 most used indexes:');
    console.table(indexUsage);

    console.log('\n🎯 Performance optimization summary:');
    console.log(`  ✅ Successfully created: ${successCount} indexes`);
    console.log(`  ⏭️  Already existed: ${skipCount} indexes`);
    console.log(`  📊 Analyzed: ${tables.length} tables`);
    
    console.log('\n🚀 Database optimization completed successfully!');
    console.log('\nRecommendations:');
    console.log('  • Monitor query performance with EXPLAIN ANALYZE');
    console.log('  • Run VACUUM ANALYZE periodically in production');
    console.log('  • Consider pg_stat_statements for query analysis');
    console.log('  • Set up monitoring for slow queries (>100ms)');
    
  } catch (error) {
    console.error('❌ Error applying database optimization:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Test some optimized queries
async function testOptimizedQueries() {
  try {
    console.log('\n🧪 Testing optimized queries...');
    
    const startTime = Date.now();
    
    // Test tenant isolation query
    const domains = await prisma.domain.findMany({
      where: { isActive: true },
      take: 1,
    });
    
    if (domains.length > 0) {
      const domainId = domains[0].id;
      
      // Test optimized company query
      const companies = await prisma.company.findMany({
        where: {
          content: {
            some: {
              domainId,
              isVisible: true,
            },
          },
        },
        include: {
          content: {
            where: { domainId },
          },
          _count: {
            select: {
              reviews: {
                where: { isApproved: true },
              },
            },
          },
        },
        take: 5,
      });
      
      console.log(`  ✅ Found ${companies.length} companies for domain ${domains[0].name}`);
    }
    
    const endTime = Date.now();
    console.log(`  ⏱️  Query test completed in ${endTime - startTime}ms`);
    
  } catch (error) {
    console.error('❌ Error testing queries:', error);
  }
}

// Run the optimization
async function main() {
  await applyDatabaseOptimization();
  await testOptimizedQueries();
}

// Only run if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { applyDatabaseOptimization, testOptimizedQueries };