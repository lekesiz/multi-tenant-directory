import { NextResponse } from 'next/server';
import { stripeService, SUBSCRIPTION_PLANS, ANNUAL_PLANS } from '@/lib/stripe-config';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { planId, interval = 'month', successUrl, cancelUrl, referralCode } = await request.json();

    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Get business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: session.user.email },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan non valide' },
        { status: 400 }
      );
    }

    // Get price ID based on interval
    let priceId: string | null | undefined;

    if (interval === 'year') {
      // Check if annual plan exists for this plan
      const annualPlan = ANNUAL_PLANS[planId as keyof typeof ANNUAL_PLANS];
      priceId = annualPlan?.stripePriceId;
    } else {
      priceId = plan.stripePriceId;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Prix non disponible pour ce plan' },
        { status: 400 }
      );
    }

    // Create checkout session using stripe service
    const checkoutSession = await stripeService.createCheckoutSession({
      priceId,
      customerId: businessOwner.stripeCustomerId || undefined,
      businessOwnerId: businessOwner.id,
      successUrl,
      cancelUrl,
      trial: true, // 14 day trial
      metadata: {
        planId: plan.id,
        interval,
        businessOwnerId: businessOwner.id,
        ...(referralCode && { referralCode }),
      }
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}