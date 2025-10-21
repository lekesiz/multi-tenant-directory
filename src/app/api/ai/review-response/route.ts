import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { generateReviewResponse } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { reviewText, rating, businessContext } = await request.json();

    if (!reviewText || !rating || !businessContext) {
      return NextResponse.json(
        { error: 'Données manquantes pour générer la réponse' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Note invalide (doit être entre 1 et 5)' },
        { status: 400 }
      );
    }

    if (!businessContext.name || !businessContext.category || !businessContext.city) {
      return NextResponse.json(
        { error: 'Contexte business incomplet' },
        { status: 400 }
      );
    }

    // Generate AI response
    const response = await generateReviewResponse({
      companyName: businessContext.name,
      rating,
      comment: reviewText,
      authorName: 'Client',
    });

    return NextResponse.json({
      response,
      metadata: {
        rating,
        sentiment: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative',
        businessName: businessContext.name,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('AI Review Response API error:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    );
  }
}