/**
 * AI Company Analysis API
 *
 * Analyzes company descriptions and suggests improvements
 * Uses AI orchestration (Claude + Gemini + GPT-4)
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
    const { companyName, description, categories } = body;

    // Validation
    if (!companyName || !description) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['companyName', 'description'],
        },
        { status: 400 }
      );
    }

    // Get AI orchestrator
    const orchestrator = getAIOrchestrator();

    // Analyze company
    const analysis = await orchestrator.analyzeCompanyDescription(
      companyName,
      description,
      categories || []
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('AI analysis error:', error);

    return NextResponse.json(
      {
        error: 'AI analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
