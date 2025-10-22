import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const preferencesSchema = z.object({
  email: z.string().email('Email invalide'),
  preferences: z.object({
    weeklyDigest: z.boolean(),
    newBusinesses: z.boolean(),
    specialOffers: z.boolean(),
  }),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = preferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, preferences } = validation.data;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Abonné non trouvé' },
        { status: 404 }
      );
    }

    // Update preferences
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { preferences },
    });

    logger.info('Newsletter preferences updated', { email, preferences });

    return NextResponse.json({
      success: true,
      message: 'Préférences mises à jour',
      preferences,
    });

  } catch (error) {
    logger.error('Newsletter preferences error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

