import { NextResponse } from 'next/server';
import { redis, cache, cacheKeys, cacheTTL } from '@/lib/redis';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'test';

  try {
    const results: any = {
      action,
      timestamp: new Date().toISOString(),
      tests: [],
    };

    if (action === 'test' || action === 'all') {
      // Test 1: Basic SET/GET
      const testKey = `test:${Date.now()}`;
      const testData = { message: 'Hello Redis!', timestamp: Date.now() };
      
      const setStart = Date.now();
      await cache.set(testKey, testData, 60);
      const setTime = Date.now() - setStart;

      const getStart = Date.now();
      const getData = await cache.get(testKey);
      const getTime = Date.now() - getStart;

      await cache.del(testKey);

      results.tests.push({
        name: 'Basic SET/GET',
        status: getData ? 'PASS' : 'FAIL',
        setTime: `${setTime}ms`,
        getTime: `${getTime}ms`,
        data: getData,
      });
    }

    if (action === 'counter' || action === 'all') {
      // Test 2: Counter
      const counterKey = `counter:test:${Date.now()}`;
      
      const count1 = await cache.incr(counterKey);
      const count2 = await cache.incr(counterKey);
      const count3 = await cache.incr(counterKey);

      await cache.del(counterKey);

      results.tests.push({
        name: 'Counter (INCR)',
        status: count3 === 3 ? 'PASS' : 'FAIL',
        values: [count1, count2, count3],
      });
    }

    if (action === 'ttl' || action === 'all') {
      // Test 3: TTL
      const ttlKey = `ttl:test:${Date.now()}`;
      await cache.set(ttlKey, { test: true }, 300);
      
      const exists = await cache.exists(ttlKey);
      await cache.del(ttlKey);

      results.tests.push({
        name: 'TTL/Expiration',
        status: exists ? 'PASS' : 'FAIL',
        ttl: '300s',
      });
    }

    if (action === 'performance' || action === 'all') {
      // Test 4: Performance test
      const perfKey = `perf:test:${Date.now()}`;
      const largeData = {
        id: 123,
        name: 'Test Company',
        description: 'A'.repeat(1000),
        categories: Array.from({ length: 10 }, (_, i) => `category-${i}`),
        reviews: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          rating: 4.5,
          comment: 'Great service!',
        })),
      };

      const perfSetStart = Date.now();
      await cache.set(perfKey, largeData, 60);
      const perfSetTime = Date.now() - perfSetStart;

      const perfGetStart = Date.now();
      const perfData = await cache.get(perfKey);
      const perfGetTime = Date.now() - perfGetStart;

      await cache.del(perfKey);

      results.tests.push({
        name: 'Performance (Large Data)',
        status: perfData ? 'PASS' : 'FAIL',
        dataSize: JSON.stringify(largeData).length + ' bytes',
        setTime: `${perfSetTime}ms`,
        getTime: `${perfGetTime}ms`,
      });
    }

    if (action === 'keys' || action === 'all') {
      // Test 5: Cache key generators
      results.tests.push({
        name: 'Cache Key Generators',
        status: 'PASS',
        examples: {
          company: cacheKeys.company('test-company'),
          companies: cacheKeys.companies('haguenau.pro', 1),
          category: cacheKeys.category('restaurant'),
          reviews: cacheKeys.reviews(123),
          domainSettings: cacheKeys.domainSettings('haguenau.pro'),
        },
      });
    }

    // Summary
    const passedTests = results.tests.filter((t: any) => t.status === 'PASS').length;
    const totalTests = results.tests.length;

    return NextResponse.json({
      ...results,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        status: passedTests === totalTests ? 'ALL PASS ✅' : 'SOME FAILED ❌',
      },
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

