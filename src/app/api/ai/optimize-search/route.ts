/**
 * AI Search Optimization API
 *
 * Optimizes search queries for better results
 * Uses AI to understand user intent and suggest filters
 */

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { isN8nAvailable } from '@/lib/ai/n8n-client';
import { getAIOrchestrator } from '@/lib/ai/orchestrator';

export async function POST(request: NextRequest) {
  try {
    // Check if AI is available
    if (!isN8nAvailable()) {
      return NextResponse.json(
        {
          error: 'AI service not configured',
          message: 'Please set N8N_API_KEY and N8N_API_URL environment variables',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { query, context } = body;

    // Validation
    if (!query) {
      return NextResponse.json(
        {
          error: 'Missing required field: query',
        },
        { status: 400 }
      );
    }

    // Get AI orchestrator
    const orchestrator = getAIOrchestrator();

    // Optimize search query
    const optimization = await orchestrator.optimizeSearchQuery(query, context);

    return NextResponse.json({
      success: true,
      data: {
        originalQuery: query,
        ...optimization,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('AI search optimization error:', error);

    return NextResponse.json(
      {
        error: 'Search optimization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
