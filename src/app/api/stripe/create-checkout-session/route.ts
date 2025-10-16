import { NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';
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

    const { planId, successUrl, cancelUrl } = await request.json();

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
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS];
    
    if (!plan || !plan.stripePriceId) {
      return NextResponse.json(
        { error: 'Plan non valide' },
        { status: 400 }
      );
    }

    // Create or get Stripe customer
    let customerId = businessOwner.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: businessOwner.email,
        name: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim(),
        metadata: {
          businessOwnerId: businessOwner.id,
        },
      });
      
      customerId = customer.id;
      
      // Update business owner with Stripe customer ID
      await prisma.businessOwner.update({
        where: { id: businessOwner.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        trial_period_days: 14, // 14 days free trial
        metadata: {
          businessOwnerId: businessOwner.id,
          planId: plan.id,
        },
      },
      metadata: {
        businessOwnerId: businessOwner.id,
        planId: plan.id,
      },
    });

    return NextResponse.json({
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