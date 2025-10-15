import { z } from 'zod';

describe('Environment Variables', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should validate required environment variables', () => {
    // Set required env vars
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_SECRET = 'this-is-a-very-long-secret-key-for-testing-purposes';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_PASSWORD = 'securepassword123';
    process.env.NODE_ENV = 'test';

    // Import should not throw
    expect(() => require('@/lib/env')).not.toThrow();
  });

  it('should throw error when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;
    process.env.SKIP_ENV_VALIDATION = 'false';

    expect(() => require('@/lib/env')).toThrow('Invalid environment variables');
  });

  it('should throw error when NEXTAUTH_SECRET is too short', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_SECRET = 'short';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_PASSWORD = 'securepassword123';
    process.env.SKIP_ENV_VALIDATION = 'false';

    expect(() => require('@/lib/env')).toThrow('Invalid environment variables');
  });

  it('should validate optional environment variables', () => {
    // Set required env vars
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_SECRET = 'this-is-a-very-long-secret-key-for-testing-purposes';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_PASSWORD = 'securepassword123';
    
    // Set optional vars
    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token';

    expect(() => require('@/lib/env')).not.toThrow();
  });

  it('should validate client-side environment variables', () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'maps-api-key';
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

    expect(() => require('@/lib/env')).not.toThrow();
  });
});