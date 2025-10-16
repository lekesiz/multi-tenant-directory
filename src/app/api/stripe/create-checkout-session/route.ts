import { NextResponse } from 'next/server';
import { stripeService, getPlanById, TRIAL_CONFIG } from '@/lib/stripe-config';
import { prisma } from '@/lib/prisma';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { validateReferralCode } from '@/lib/referral';
import { z } from 'zod';

const createCheckoutSchema = z.object({
  planId: z.string(),
  interval: z.enum(['month', 'year']).default('month'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  couponCode: z.string().optional(),
  referralCode: z.string().optional(),
  trial: z.boolean().default(true),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    // Authenticate user
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createCheckoutSchema.parse(body);

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

    // Get plan details
    const plan = getPlanById(validatedData.planId);
    if (!plan || !plan.stripePriceId) {
      return NextResponse.json(
        { error: 'Plan non valide' },
        { status: 400 }
      );
    }

    // Get price ID based on interval
    let priceId = plan.stripePriceId;
    if (validatedData.interval === 'year') {
      // Use annual price ID if available
      const annualPriceId = process.env[`STRIPE_${plan.id.toUpperCase()}_ANNUAL_PRICE_ID`];
      if (annualPriceId) {
        priceId = annualPriceId;
      }
    }

    // Create or get Stripe customer
    let customerId = businessOwner.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripeService.createCustomer({
        email: businessOwner.email,
        name: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim(),
        businessOwnerId: businessOwner.id,
        metadata: {
          plan: validatedData.planId,
          interval: validatedData.interval,
        },
      });
      
      customerId = customer.id;
      
      // Update business owner with Stripe customer ID
      await prisma.businessOwner.update({
        where: { id: businessOwner.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Handle referral code validation and coupon creation
    let couponId: string | undefined;
    
    if (validatedData.referralCode) {
      const referralValidation = await validateReferralCode(validatedData.referralCode);
      if (referralValidation.valid) {
        // Create a referral discount coupon
        const coupon = await stripeService.createCoupon({
          name: `Parrainage - ${validatedData.referralCode}`,
          percentOff: 50, // 50% off first month
          duration: 'once',
          maxRedemptions: 1,
        });
        couponId = coupon.id;
      }
    }

    // Override with manual coupon if provided
    if (validatedData.couponCode) {
      couponId = validatedData.couponCode;
    }

    // Determine if trial should be applied
    const shouldHaveTrial = validatedData.trial && 
      TRIAL_CONFIG.plans_with_trial.includes(validatedData.planId) &&
      !businessOwner.trialEnd; // Only if user hasn't had a trial before

    // Create checkout session
    const checkoutSession = await stripeService.createCheckoutSession({
      priceId,
      customerId,
      businessOwnerId: businessOwner.id,
      successUrl: validatedData.successUrl,
      cancelUrl: validatedData.cancelUrl,
      trial: shouldHaveTrial,
      couponId,
      metadata: {
        planId: validatedData.planId,
        interval: validatedData.interval,
        referralCode: validatedData.referralCode || '',
        ...validatedData.metadata,
      },
    });

    // Track checkout session creation
    await prisma.stripeEvent.create({
      data: {
        eventType: 'checkout.session.created',
        stripeId: checkoutSession.id,
        businessOwnerId: businessOwner.id,
        data: {
          planId: validatedData.planId,
          interval: validatedData.interval,
          amount: plan.price,
          currency: plan.currency,
          trial: shouldHaveTrial,
          couponApplied: !!couponId,
        },
        processed: false,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      planDetails: {
        name: plan.name,
        price: plan.price,
        interval: validatedData.interval,
        trial: shouldHaveTrial ? TRIAL_CONFIG.duration_days : 0,
        features: plan.features,
      },
    });

  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}