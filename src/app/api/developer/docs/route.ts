import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { DeveloperPortalService } from '@/lib/api-ecosystem';

// GET /api/developer/docs - Get API documentation
export async function GET() {
  try {
    const apiDocs = DeveloperPortalService.generateApiDocs();

    return NextResponse.json({
      success: true,
      documentation: apiDocs,
    });

  } catch (error) {
    logger.error('Get API docs error:', error);
    return NextResponse.json(
      { error: 'Failed to get API documentation' },
      { status: 500 }
    );
  }
}