/**
 * AI Review Response Generator API
 *
 * Generates professional responses to customer reviews
 * Uses AI orchestration for tone-appropriate responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { isN8nAvailable } from '@/lib/ai/n8n-client';
import { getAIOrchestrator } from '@/lib/ai/orchestrator';
import { prisma } from '@/lib/prisma';

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
    const { reviewId, tone } = body;

    // Validation
    if (!reviewId) {
      return NextResponse.json(
        {
          error: 'Missing required field: reviewId',
        },
        { status: 400 }
      );
    }

    // Fetch review from database
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        {
          error: 'Review not found',
        },
        { status: 404 }
      );
    }

    // Get AI orchestrator
    const orchestrator = getAIOrchestrator();

    // Generate response
    const response = await orchestrator.generateReviewResponse(
      {
        rating: review.rating,
        comment: review.comment || '',
        authorName: review.authorName,
      },
      review.company.name,
      tone || 'professional'
    );

    return NextResponse.json({
      success: true,
      data: {
        reviewId: review.id,
        generatedResponse: response,
        tone: tone || 'professional',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI review response generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate review response',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
