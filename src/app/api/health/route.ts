import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'pending',
      redis: 'pending',
    },
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'ok';
  } catch (error) {
    checks.status = 'error';
    checks.checks.database = 'error';
  }

  // Redis check (if configured)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      });
      
      if (response.ok) {
        checks.checks.redis = 'ok';
      } else {
        checks.checks.redis = 'error';
      }
    } catch (error) {
      checks.checks.redis = 'error';
    }
  } else {
    checks.checks.redis = 'not configured';
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json(
    {
      ...checks,
      responseTime: `${responseTime}ms`,
    },
    {
      status: checks.status === 'ok' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}