#!/usr/bin/env tsx

// Check API routes without database connection
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function findApiRoutes(dir: string, routes: string[] = []): string[] {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findApiRoutes(fullPath, routes);
    } else if (file === 'route.ts' || file === 'route.js') {
      // Extract route path from directory structure
      const routePath = fullPath
        .replace(/.*\/app\/api/, '/api')
        .replace(/\/route\.(ts|js)$/, '')
        .replace(/\[([^\]]+)\]/g, ':$1');
      
      routes.push(routePath);
    }
  }
  
  return routes;
}

console.log('🔍 Scanning for API routes...\n');

const apiDir = join(process.cwd(), 'src/app/api');
const routes = findApiRoutes(apiDir);

console.log('📋 Business Owner Related API Routes:\n');

const businessRoutes = routes.filter(route => 
  route.includes('business') || 
  route.includes('companies') || 
  route.includes('admin')
);

if (businessRoutes.length === 0) {
  console.log('❌ No business owner API routes found!');
} else {
  businessRoutes.forEach(route => {
    console.log(`  ✅ ${route}`);
    
    // Show expected methods based on route pattern
    if (route.includes('register')) {
      console.log('     → POST (registration)');
    } else if (route.includes('login')) {
      console.log('     → POST (authentication)');
    } else if (route.includes('hours')) {
      console.log('     → GET, PUT (business hours)');
    } else if (route.includes('photos')) {
      console.log('     → GET, POST, DELETE (photo management)');
    } else if (route.includes('analytics')) {
      console.log('     → GET, POST (analytics tracking)');
    } else if (route.includes('reviews')) {
      console.log('     → GET, PUT, DELETE (review management)');
    }
    console.log('');
  });
}

console.log('\n📊 Summary:');
console.log(`Found ${businessRoutes.length} business-related API routes`);
console.log('\nTo test these endpoints:');
console.log('1. Ensure production database migration is deployed');
console.log('2. Start dev server: npm run dev');
console.log('3. Use curl or Postman to test each endpoint');