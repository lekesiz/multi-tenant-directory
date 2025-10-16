import { NextResponse } from 'next/server';
import { stripeService } from '@/lib/stripe-config';
import { prisma } from '@/lib/prisma';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { z } from 'zod';

const billingPortalSchema = z.object({
  returnUrl: z.string().url(),
});

export async function POST(request: Request) {
  try {
    // Authenticate user
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = billingPortalSchema.parse(body);

    // Get business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: authResult.user.userId },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!businessOwner.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun compte de facturation trouvé' },
        { status: 400 }
      );
    }

    // Create billing portal session
    const portalSession = await stripeService.createBillingPortalSession({
      customerId: businessOwner.stripeCustomerId,
      returnUrl: validatedData.returnUrl,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });

  } catch (error) {
    console.error('Billing portal session creation failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de facturation' },
      { status: 500 }
    );
  }
}