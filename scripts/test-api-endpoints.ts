#!/usr/bin/env tsx
/**
 * API Endpoints Test Script
 *
 * Tests critical API endpoints to verify production readiness
 */

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
  duration?: number;
}

const tests: TestResult[] = [];

/**
 * Test an API endpoint
 */
async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });

    const duration = Date.now() - startTime;

    return {
      endpoint,
      method,
      status: response.ok ? 'PASS' : 'FAIL',
      statusCode: response.status,
      duration,
    };
  } catch (error) {
    return {
      endpoint,
      method,
      status: 'FAIL',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Public API Tests
  console.log('📡 PUBLIC ENDPOINTS:');
  tests.push(await testEndpoint('/api/companies', 'GET'));
  tests.push(await testEndpoint('/api/domains', 'GET'));
  tests.push(await testEndpoint('/api/categories', 'GET'));
  tests.push(await testEndpoint('/api/health', 'GET'));

  // Health check
  console.log('\n❤️  HEALTH CHECKS:');
  tests.push(await testEndpoint('/api/health', 'GET'));

  // Contact form (should require CSRF token)
  console.log('\n📧 FORM ENDPOINTS:');
  tests.push(
    await testEndpoint('/api/contact', 'POST', {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test',
      message: 'Test message',
    })
  );

  // Print results
  console.log('\n\n📊 TEST RESULTS:\n');
  console.log('─'.repeat(80));
  console.log(
    '| ' +
      'Endpoint'.padEnd(40) +
      '| ' +
      'Method'.padEnd(8) +
      '| ' +
      'Status'.padEnd(6) +
      '| ' +
      'Code'.padEnd(6) +
      '| ' +
      'Time'.padEnd(8) +
      '|'
  );
  console.log('─'.repeat(80));

  tests.forEach((test) => {
    const statusIcon = test.status === 'PASS' ? '✅' : '❌';
    const endpoint = test.endpoint.padEnd(38);
    const method = test.method.padEnd(8);
    const status = (statusIcon + ' ' + test.status).padEnd(6);
    const code = (test.statusCode?.toString() || 'N/A').padEnd(6);
    const time = (test.duration ? `${test.duration}ms` : 'N/A').padEnd(8);

    console.log(`| ${endpoint} | ${method} | ${status} | ${code} | ${time} |`);

    if (test.error) {
      console.log(`  └─ Error: ${test.error}`);
    }
  });

  console.log('─'.repeat(80));

  // Summary
  const passed = tests.filter((t) => t.status === 'PASS').length;
  const failed = tests.filter((t) => t.status === 'FAIL').length;
  const avgTime =
    tests.reduce((sum, t) => sum + (t.duration || 0), 0) / tests.length;

  console.log('\n📈 SUMMARY:');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed} (${Math.round((passed / tests.length) * 100)}%)`);
  console.log(`❌ Failed: ${failed} (${Math.round((failed / tests.length) * 100)}%)`);
  console.log(`⏱️  Avg Response Time: ${Math.round(avgTime)}ms\n`);

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
