#!/usr/bin/env node

/**
 * Test Structured Data for all domains
 * 
 * Usage:
 *   node scripts/test-structured-data.js
 * 
 * This script:
 * 1. Fetches each domain's homepage
 * 2. Extracts JSON-LD structured data
 * 3. Validates schema types
 * 4. Reports results
 */

const domains = [
  'haguenau.pro',
  'mutzig.pro',
  'hoerdt.pro',
  'brumath.pro',
  'bischwiller.pro',
  'schiltigheim.pro',
  'illkirch-graffenstaden.pro',
  'ostwald.pro',
  'lingolsheim.pro',
  'geispolsheim.pro',
  'bischheim.pro',
  'souffelweyersheim.pro',
  'hoenheim.pro',
  'mundolsheim.pro',
  'reichstett.pro',
  'vendenheim.pro',
  'lampertheim.pro',
  'eckbolsheim.pro',
  'oberhausbergen.pro',
  'niederhausbergen.pro',
  'mittelhausbergen.pro',
];

async function fetchStructuredData(domain) {
  try {
    const response = await fetch(`https://${domain}`);
    const html = await response.text();
    
    // Extract JSON-LD scripts
    const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
    const matches = [...html.matchAll(jsonLdRegex)];
    
    if (matches.length === 0) {
      return { domain, error: 'No JSON-LD found' };
    }
    
    const schemas = matches.map(match => {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    // Extract schema types
    const types = schemas.flatMap(schema => {
      if (schema['@graph']) {
        return schema['@graph'].map(s => s['@type']);
      }
      return [schema['@type']];
    }).flat();
    
    return {
      domain,
      success: true,
      schemaCount: schemas.length,
      types: [...new Set(types)],
      schemas,
    };
  } catch (error) {
    return {
      domain,
      error: error.message,
    };
  }
}

async function testAllDomains() {
  console.log('🧪 Testing Structured Data for all domains...\n');
  
  const results = await Promise.all(
    domains.map(domain => fetchStructuredData(domain))
  );
  
  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => r.error);
  
  console.log('📊 Summary:');
  console.log(`  ✅ Successful: ${successful.length}/${domains.length}`);
  console.log(`  ❌ Failed: ${failed.length}/${domains.length}\n`);
  
  // Detailed results
  console.log('📋 Detailed Results:\n');
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.domain}`);
      console.log(`   Schemas: ${result.schemaCount}`);
      console.log(`   Types: ${result.types.join(', ')}`);
      console.log('');
    } else {
      console.log(`❌ ${result.domain}`);
      console.log(`   Error: ${result.error}`);
      console.log('');
    }
  });
  
  // Schema type coverage
  const allTypes = new Set();
  successful.forEach(r => r.types.forEach(t => allTypes.add(t)));
  
  console.log('📊 Schema Types Coverage:');
  [...allTypes].forEach(type => {
    const count = successful.filter(r => r.types.includes(type)).length;
    console.log(`   ${type}: ${count}/${successful.length} domains`);
  });
  
  // Google Rich Results Test URLs
  console.log('\n🔗 Google Rich Results Test URLs:');
  console.log('   Test your pages at:');
  console.log('   https://search.google.com/test/rich-results');
  console.log('\n   Example URLs:');
  domains.slice(0, 3).forEach(domain => {
    console.log(`   - https://${domain}`);
    console.log(`   - https://${domain}/companies/netz-informatique`);
  });
}

testAllDomains().catch(console.error);

