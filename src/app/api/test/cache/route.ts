import { NextResponse } from 'next/server';
import { getCache, setCache, deleteCache, CacheKeys } from '@/lib/redis';

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
      await setCache(testKey, testData, { ttl: 60 });
      const setTime = Date.now() - setStart;

      const getStart = Date.now();
      const getData = await getCache(testKey);
      const getTime = Date.now() - getStart;

      await deleteCache(testKey);

      results.tests.push({
        name: 'Basic SET/GET',
        status: getData ? 'PASS' : 'FAIL',
        setTime: `${setTime}ms`,
        getTime: `${getTime}ms`,
        data: getData,
      });
    }

    if (action === 'performance' || action === 'all') {
      // Test 2: Performance test with large data
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
      await setCache(perfKey, largeData, { ttl: 60 });
      const perfSetTime = Date.now() - perfSetStart;

      const perfGetStart = Date.now();
      const perfData = await getCache(perfKey);
      const perfGetTime = Date.now() - perfGetStart;

      await deleteCache(perfKey);

      results.tests.push({
        name: 'Performance (Large Data)',
        status: perfData ? 'PASS' : 'FAIL',
        dataSize: JSON.stringify(largeData).length + ' bytes',
        setTime: `${perfSetTime}ms`,
        getTime: `${perfGetTime}ms`,
      });
    }

    if (action === 'keys' || action === 'all') {
      // Test 3: Cache key generators
      results.tests.push({
        name: 'Cache Key Generators',
        status: 'PASS',
        examples: {
          company: CacheKeys.company('test-company'),
          companies: CacheKeys.companies(1, 'restaurant'),
          categories: CacheKeys.categories(),
          reviews: CacheKeys.reviews('123', 1),
          stats: CacheKeys.stats('123'),
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
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

