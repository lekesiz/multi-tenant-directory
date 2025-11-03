import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const unsubscribeSchema = z.object({
  email: z.string().email('Email invalide'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = unsubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, reason } = validation.data;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Abonné non trouvé' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        success: true,
        message: 'Déjà désabonné',
        alreadyUnsubscribed: true,
      });
    }

    // Update subscriber
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        unsubscribeReason: reason,
      },
    });

    logger.info('Newsletter unsubscribed', { email, reason });

    return NextResponse.json({
      success: true,
      message: 'Désabonnement réussi',
    });

  } catch (error) {
    logger.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du désabonnement' },
      { status: 500 }
    );
  }
}

