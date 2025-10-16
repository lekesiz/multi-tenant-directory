/**
 * AI API Route: Analyze Review
 * POST /api/ai/analyze-review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeReview, parseAIJSON } from '@/lib/ai';
import { getAIRateLimit } from '@/config/ai';

interface ReviewAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  topics: {
    service?: 'positive' | 'neutral' | 'negative' | null;
    quality?: 'positive' | 'neutral' | 'negative' | null;
    price?: 'positive' | 'neutral' | 'negative' | null;
    ambiance?: 'positive' | 'neutral' | 'negative' | null;
    hygiene?: 'positive' | 'neutral' | 'negative' | null;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Get business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionTier: true,
        aiUsageCount: true,
        aiUsageResetDate: true,
      },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Propriétaire d\'entreprise non trouvé' },
        { status: 404 }
      );
    }

    // 3. Check rate limit
    const tierRateLimit = getAIRateLimit(
      businessOwner.subscriptionTier as 'free' | 'basic' | 'pro' | 'enterprise'
    );

    const now = new Date();
    const resetDate = businessOwner.aiUsageResetDate || new Date(0);
    let currentUsage = businessOwner.aiUsageCount || 0;

    if (now > resetDate) {
      currentUsage = 0;
      const nextReset = new Date(now);
      nextReset.setDate(nextReset.getDate() + 1);

      await prisma.businessOwner.update({
        where: { id: businessOwner.id },
        data: {
          aiUsageCount: 0,
          aiUsageResetDate: nextReset,
        },
      });
    }

    if (tierRateLimit !== -1 && currentUsage >= tierRateLimit) {
      return NextResponse.json(
        {
          error: `Limite quotidienne atteinte (${tierRateLimit} requêtes/jour)`,
          limit: tierRateLimit,
          usage: currentUsage,
        },
        { status: 429 }
      );
    }

    // 4. Parse request body
    const body = await req.json();
    const { reviewId, rating, comment, authorName } = body;

    if (!reviewId || rating === undefined || !comment || !authorName) {
      return NextResponse.json(
        { error: 'Paramètres manquants (reviewId, rating, comment, authorName requis)' },
        { status: 400 }
      );
    }

    // 5. Verify review ownership (check if review belongs to owner's company)
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        company: {
          include: {
            ownerships: {
              where: {
                ownerId: businessOwner.id,
              },
            },
          },
        },
      },
    });

    if (!review || review.company.ownerships.length === 0) {
      return NextResponse.json(
        { error: 'Avis non trouvé ou non autorisé' },
        { status: 403 }
      );
    }

    // 6. Analyze review with AI
    const aiResponse = await analyzeReview({
      rating,
      comment,
      authorName,
    });

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error || 'Erreur lors de l\'analyse' },
        { status: 500 }
      );
    }

    // 7. Parse AI response
    const analysis = parseAIJSON<ReviewAnalysis>(aiResponse.content);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Format de réponse AI invalide' },
        { status: 500 }
      );
    }

    // 8. Save analysis to database (optional - extend Review model if needed)
    // await prisma.review.update({
    //   where: { id: reviewId },
    //   data: {
    //     aiSentiment: analysis.sentiment,
    //     aiKeywords: analysis.keywords,
    //     aiSummary: analysis.summary,
    //   },
    // });

    // 9. Update usage count
    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: {
        aiUsageCount: currentUsage + 1,
      },
    });

    // 10. Return analysis
    return NextResponse.json({
      success: true,
      analysis,
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      costCents: aiResponse.costCents,
      usage: {
        current: currentUsage + 1,
        limit: tierRateLimit,
      },
    });
  } catch (error) {
    console.error('[AI Analyze Review] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
