/**
 * AI SEO Content Generator API
 *
 * Generates SEO-optimized content for pages
 * Uses AI orchestration to create compelling, keyword-rich content
 */

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
    const { pageType, data } = body;

    // Validation
    if (!pageType || !data || !data.name) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['pageType', 'data.name'],
        },
        { status: 400 }
      );
    }

    // Validate pageType
    if (!['category', 'city', 'company'].includes(pageType)) {
      return NextResponse.json(
        {
          error: 'Invalid pageType',
          allowed: ['category', 'city', 'company'],
        },
        { status: 400 }
      );
    }

    // Get AI orchestrator
    const orchestrator = getAIOrchestrator();

    // Generate SEO content
    const seoContent = await orchestrator.generateSeoContent(pageType, data);

    return NextResponse.json({
      success: true,
      data: seoContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI SEO content generation error:', error);

    return NextResponse.json(
      {
        error: 'SEO content generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
