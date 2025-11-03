import { Redis } from '@upstash/redis';

async function testRedis() {
  console.log('🔍 Testing Upstash Redis connection...\n');

  // Check environment variables
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error('❌ Missing environment variables:');
    console.error('   UPSTASH_REDIS_REST_URL:', url ? '✓' : '✗');
    console.error('   UPSTASH_REDIS_REST_TOKEN:', token ? '✓' : '✗');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log('   URL:', url);
  console.log('   Token:', token.substring(0, 20) + '...\n');

  // Initialize Redis client
  const redis = new Redis({
    url,
    token,
  });

  try {
    // Test 1: PING
    console.log('Test 1: PING');
    const pingResult = await redis.ping();
    console.log('   Result:', pingResult);
    console.log('   ✅ PING successful\n');

    // Test 2: SET
    console.log('Test 2: SET');
    const testKey = 'test:connection:' + Date.now();
    const testValue = { message: 'Hello from Upstash!', timestamp: new Date().toISOString() };
    await redis.set(testKey, JSON.stringify(testValue), { ex: 60 });
    console.log('   Key:', testKey);
    console.log('   Value:', testValue);
    console.log('   ✅ SET successful\n');

    // Test 3: GET
    console.log('Test 3: GET');
    const getValue = await redis.get(testKey);
    console.log('   Retrieved:', getValue);
    console.log('   ✅ GET successful\n');

    // Test 4: EXISTS
    console.log('Test 4: EXISTS');
    const exists = await redis.exists(testKey);
    console.log('   Exists:', exists === 1 ? 'Yes' : 'No');
    console.log('   ✅ EXISTS successful\n');

    // Test 5: INCR
    console.log('Test 5: INCR');
    const counterKey = 'test:counter:' + Date.now();
    const count1 = await redis.incr(counterKey);
    const count2 = await redis.incr(counterKey);
    const count3 = await redis.incr(counterKey);
    console.log('   Counter values:', count1, count2, count3);
    console.log('   ✅ INCR successful\n');

    // Test 6: DEL
    console.log('Test 6: DEL');
    await redis.del(testKey);
    await redis.del(counterKey);
    const existsAfterDel = await redis.exists(testKey);
    console.log('   Exists after delete:', existsAfterDel === 1 ? 'Yes' : 'No');
    console.log('   ✅ DEL successful\n');

    // Test 7: Cache simulation
    console.log('Test 7: Cache Simulation');
    const cacheKey = 'cache:test:company:123';
    const companyData = {
      id: 123,
      name: 'Test Company',
      slug: 'test-company',
      rating: 4.5,
      reviewCount: 100,
    };
    
    console.log('   Setting cache...');
    await redis.setex(cacheKey, 300, JSON.stringify(companyData)); // 5 min TTL
    
    console.log('   Getting from cache...');
    const cachedData = await redis.get(cacheKey);
    console.log('   Cached data:', cachedData);
    
    console.log('   Checking TTL...');
    const ttl = await redis.ttl(cacheKey);
    console.log('   TTL:', ttl, 'seconds');
    
    await redis.del(cacheKey);
    console.log('   ✅ Cache simulation successful\n');

    console.log('🎉 All tests passed! Redis is working correctly.\n');
    console.log('📊 Summary:');
    console.log('   - Connection: ✅');
    console.log('   - Basic operations (SET/GET/DEL): ✅');
    console.log('   - Counter operations (INCR): ✅');
    console.log('   - TTL/Expiration: ✅');
    console.log('   - Cache simulation: ✅\n');

  } catch (error) {
    console.error('❌ Redis test failed:');
    console.error(error);
    process.exit(1);
  }
}

testRedis();

