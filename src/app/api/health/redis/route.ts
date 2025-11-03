import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

export async function GET() {
  try {
    // Check if Redis credentials are configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Redis credentials not found in environment variables',
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }

    // Initialize Redis client
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test connection with PING
    const startTime = Date.now();
    const pingResult = await redis.ping();
    const responseTime = Date.now() - startTime;

    if (pingResult !== 'PONG') {
      throw new Error('Unexpected PING response: ' + pingResult);
    }

    // Test SET/GET operations
    const testKey = `health:check:${Date.now()}`;
    const testValue = { test: true, timestamp: new Date().toISOString() };
    
    await redis.setex(testKey, 60, JSON.stringify(testValue));
    const getValue = await redis.get(testKey);
    await redis.del(testKey);

    // Get Redis info (if available)
    let info: any = {};
    try {
      const dbsize = await redis.dbsize();
      info.keys = dbsize;
    } catch (e) {
      // DBSIZE might not be available in all Redis configurations
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Redis connection is working',
      details: {
        ping: 'PONG',
        responseTime: `${responseTime}ms`,
        operations: {
          set: 'OK',
          get: getValue ? 'OK' : 'FAILED',
          del: 'OK',
        },
        info,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Redis health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      message: 'Redis connection failed',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

