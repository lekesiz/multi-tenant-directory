/**
 * AI API Route: Generate Business Description
 * POST /api/ai/generate-description
 */

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateBusinessDescription } from '@/lib/ai';
import { getAIRateLimit } from '@/config/ai';

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

    // Reset usage count if past reset date
    const now = new Date();
    const resetDate = businessOwner.aiUsageResetDate || new Date(0);

    let currentUsage = businessOwner.aiUsageCount || 0;

    if (now > resetDate) {
      // Reset usage (24 hours)
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

    // Check if over limit
    if (tierRateLimit !== -1 && currentUsage >= tierRateLimit) {
      return NextResponse.json(
        {
          error: `Limite quotidienne atteinte (${tierRateLimit} requêtes/jour). Passez à un plan supérieur.`,
          limit: tierRateLimit,
          usage: currentUsage,
        },
        { status: 429 }
      );
    }

    // 4. Parse request body
    const body = await req.json();
    const { companyId, name, category, city, address, existingDescription } = body;

    if (!companyId || !name || !category || !city) {
      return NextResponse.json(
        { error: 'Paramètres manquants (companyId, name, category, city requis)' },
        { status: 400 }
      );
    }

    // 5. Verify company ownership
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        companyId: parseInt(companyId),
        ownerId: businessOwner.id,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'Vous ne possédez pas cette entreprise' },
        { status: 403 }
      );
    }

    // 6. Generate description with AI
    const aiResponse = await generateBusinessDescription({
      name,
      category,
      city,
      address,
      existingDescription,
    });

    if (!aiResponse.success) {
      return NextResponse.json(
        { error: aiResponse.error || 'Erreur lors de la génération' },
        { status: 500 }
      );
    }

    // 7. Update usage count
    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: {
        aiUsageCount: currentUsage + 1,
      },
    });

    // 8. Return generated description
    return NextResponse.json({
      success: true,
      description: aiResponse.content,
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
    logger.error('[AI Generate Description] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
