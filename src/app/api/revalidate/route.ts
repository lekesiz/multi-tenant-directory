/**
 * Cache Revalidation API Endpoint
 * 
 * This endpoint allows manual cache revalidation for specific domains or paths.
 * Useful for clearing Vercel Edge cache when domain data is updated.
 * 
 * Usage:
 * POST /api/revalidate
 * Body: { "secret": "YOUR_SECRET", "domain": "gries.pro", "path": "/" }
 * 
 * Or revalidate specific path:
 * Body: { "secret": "YOUR_SECRET", "path": "/categories" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, domain, path, tag } = body;

    // Validate secret key
    const revalidateSecret = process.env.REVALIDATE_SECRET || process.env.NEXTAUTH_SECRET;
    
    if (!secret || secret !== revalidateSecret) {
      return NextResponse.json(
        { 
          error: 'Invalid secret',
          message: 'Please provide a valid REVALIDATE_SECRET'
        },
        { status: 401 }
      );
    }

    const revalidated: string[] = [];

    // Revalidate by tag (if provided)
    if (tag) {
      revalidateTag(tag);
      revalidated.push(`tag:${tag}`);
    }

    // Revalidate by path (if provided)
    if (path) {
      revalidatePath(path);
      revalidated.push(`path:${path}`);
    }

    // Revalidate domain homepage and common paths
    if (domain) {
      const paths = [
        '/',
        '/categories',
        '/contact',
        '/a-propos',
        '/mentions-legales',
        '/politique-de-confidentialite',
      ];

      for (const p of paths) {
        try {
          revalidatePath(p);
          revalidated.push(`domain:${domain}${p}`);
        } catch (error) {
          console.error(`Failed to revalidate ${p}:`, error);
        }
      }

      // Also revalidate domain-specific tag
      revalidateTag(`domain:${domain}`);
      revalidated.push(`tag:domain:${domain}`);
    }

    // If nothing was specified, return error
    if (revalidated.length === 0) {
      return NextResponse.json(
        {
          error: 'Missing parameters',
          message: 'Please provide at least one of: domain, path, or tag'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
      message: `Successfully revalidated ${revalidated.length} cache entries`
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        error: 'Revalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/revalidate',
    method: 'POST',
    description: 'Cache revalidation endpoint for domains and paths',
    usage: {
      revalidate_domain: {
        method: 'POST',
        body: {
          secret: 'YOUR_REVALIDATE_SECRET',
          domain: 'gries.pro'
        }
      },
      revalidate_path: {
        method: 'POST',
        body: {
          secret: 'YOUR_REVALIDATE_SECRET',
          path: '/categories'
        }
      },
      revalidate_tag: {
        method: 'POST',
        body: {
          secret: 'YOUR_REVALIDATE_SECRET',
          tag: 'companies'
        }
      }
    },
    note: 'REVALIDATE_SECRET defaults to NEXTAUTH_SECRET if not set'
  });
}
