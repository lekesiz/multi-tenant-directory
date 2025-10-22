import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';
import { z } from 'zod';

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferences: z.object({
    weeklyDigest: z.boolean().optional(),
    newBusinesses: z.boolean().optional(),
    specialOffers: z.boolean().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, preferences } = validation.data;

    // Get current domain
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const domainName = host.replace('www.', '');

    const domain = await prisma.domain.findUnique({
      where: { name: domainName },
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain non configuré' },
        { status: 404 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // If unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            status: 'active',
            firstName: firstName || existing.firstName,
            lastName: lastName || existing.lastName,
            preferences: preferences || existing.preferences,
            domainId: domain.id,
            unsubscribedAt: null,
            unsubscribeReason: null,
            confirmedAt: new Date(),
          },
        });

        logger.info('Newsletter resubscribed', { email, domain: domainName });

        return NextResponse.json({
          success: true,
          message: 'Réabonnement réussi !',
          resubscribed: true,
        });
      }

      // Already active
      return NextResponse.json({
        success: true,
        message: 'Vous êtes déjà abonné !',
        alreadySubscribed: true,
      });
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName,
        lastName,
        domainId: domain.id,
        status: 'active',
        source: 'website',
        preferences: preferences || {
          weeklyDigest: true,
          newBusinesses: true,
          specialOffers: false,
        },
        confirmedAt: new Date(),
      },
    });

    // TODO: Send welcome email
    // await sendWelcomeEmail(subscriber);

    // Log email
    await prisma.emailLog.create({
      data: {
        subscriberId: subscriber.id,
        email: subscriber.email,
        type: 'welcome',
        subject: `Bienvenue sur ${domainName}`,
        status: 'pending',
        metadata: {
          domainId: domain.id,
          domainName,
        },
      },
    });

    logger.info('Newsletter subscribed', { email, domain: domainName });

    return NextResponse.json({
      success: true,
      message: 'Abonnement réussi ! Vérifiez votre email.',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
      },
    });

  } catch (error) {
    logger.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'abonnement' },
      { status: 500 }
    );
  }
}

// Get subscriber info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        preferences: true,
        confirmedAt: true,
        createdAt: true,
      },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Abonné non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriber,
    });

  } catch (error) {
    logger.error('Get subscriber error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

