import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { marketingAutomation } from '@/lib/marketing-automation';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateScoreSchema = z.object({
  userId: z.string(),
  companyId: z.number(),
  action: z.string(),
  points: z.number(),
  metadata: z.any().optional(),
});

// GET - Get lead scores
export async function GET(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const minScore = searchParams.get('minScore');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Verify company ownership
    const ownerships = await prisma.companyOwnership.findMany({
      where: { ownerId: authResult.user.userId },
      select: { companyId: true },
    });

    const ownedCompanyIds = ownerships.map(o => o.companyId);

    const where: any = {};
    
    if (companyId) {
      const companyIdNum = parseInt(companyId);
      if (!ownedCompanyIds.includes(companyIdNum)) {
        return NextResponse.json(
          { error: 'Accès non autorisé à cette entreprise' },
          { status: 403 }
        );
      }
      where.companyId = companyIdNum;
    } else {
      where.companyId = { in: ownedCompanyIds };
    }

    if (minScore) {
      where.score = { gte: parseInt(minScore) };
    }

    const leadScores = await prisma.leadScore.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            subscriptionTier: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      take: limit,
    });

    const formattedScores = leadScores.map(score => ({
      id: score.id,
      userId: score.userId,
      companyId: score.companyId,
      score: score.score,
      factors: score.factors,
      lastUpdated: score.lastUpdated,
      user: score.user,
      company: score.company,
    }));

    // Calculate score distribution
    const scoreRanges = {
      hot: leadScores.filter(s => s.score >= 80).length,
      warm: leadScores.filter(s => s.score >= 50 && s.score < 80).length,
      cold: leadScores.filter(s => s.score < 50).length,
    };

    return NextResponse.json({
      success: true,
      leadScores: formattedScores,
      distribution: scoreRanges,
      total: leadScores.length,
    });

  } catch (error) {
    logger.error('Get lead scores error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des scores' },
      { status: 500 }
    );
  }
}

// POST - Update lead score
export async function POST(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateScoreSchema.parse(body);

    // Verify company ownership
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: authResult.user.userId,
        companyId: validatedData.companyId,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette entreprise' },
        { status: 403 }
      );
    }

    const updatedScore = await marketingAutomation.updateLeadScore(
      validatedData.userId,
      validatedData.companyId,
      validatedData.action,
      validatedData.points,
      validatedData.metadata
    );

    return NextResponse.json({
      success: true,
      leadScore: updatedScore,
      message: 'Score mis à jour avec succès',
    });

  } catch (error) {
    logger.error('Update lead score error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du score' },
      { status: 500 }
    );
  }
}