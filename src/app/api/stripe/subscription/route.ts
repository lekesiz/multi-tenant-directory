import { NextResponse } from 'next/server';
import { stripeService, getPlanById, canUpgrade, canDowngrade } from '@/lib/stripe-config';
import { prisma } from '@/lib/prisma';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { z } from 'zod';
import Stripe from 'stripe';

const updateSubscriptionSchema = z.object({
  planId: z.string(),
  interval: z.enum(['month', 'year']).default('month'),
  immediately: z.boolean().default(false),
});

const cancelSubscriptionSchema = z.object({
  immediately: z.boolean().default(false),
  reason: z.string().optional(),
});

// GET - Get subscription details
export async function GET(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: authResult.user.userId },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    let subscriptionDetails = null;
    let invoices: Stripe.Invoice[] = [];
    
    if (businessOwner.stripeSubscriptionId) {
      try {
        // Get subscription details from Stripe
        subscriptionDetails = await stripeService.getSubscriptionDetails(
          businessOwner.stripeSubscriptionId
        );
        
        // Get recent invoices
        if (businessOwner.stripeCustomerId) {
          invoices = await stripeService.getCustomerInvoices({
            customerId: businessOwner.stripeCustomerId,
            limit: 5,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      }
    }

    // Get subscription history
    const subscriptionHistory = await prisma.subscriptionHistory.findMany({
      where: { businessOwnerId: businessOwner.id },
      orderBy: { effectiveDate: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        // Current subscription info
        currentPlan: businessOwner.subscriptionTier,
        status: businessOwner.subscriptionStatus,
        startDate: businessOwner.subscriptionStart,
        endDate: businessOwner.subscriptionEnd,
        trialEnd: businessOwner.trialEnd,
        cancelAtPeriodEnd: businessOwner.cancelAtPeriodEnd,
        
        // Stripe details
        stripeSubscription: subscriptionDetails,
        stripeCustomerId: businessOwner.stripeCustomerId,
      },
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        total: invoice.total,
        currency: invoice.currency,
        created: invoice.created,
        dueDate: invoice.due_date,
        paidAt: invoice.status_transitions?.paid_at,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
      })),
      history: subscriptionHistory,
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de l\'abonnement' },
      { status: 500 }
    );
  }
}

// PUT - Update subscription
export async function PUT(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: authResult.user.userId },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!businessOwner.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé' },
        { status: 400 }
      );
    }

    // Validate plan change
    const currentPlan = businessOwner.subscriptionTier;
    const targetPlan = validatedData.planId;
    
    if (currentPlan === targetPlan) {
      return NextResponse.json(
        { error: 'Vous êtes déjà sur ce plan' },
        { status: 400 }
      );
    }

    const newPlan = getPlanById(targetPlan);
    if (!newPlan || !newPlan.stripePriceId) {
      return NextResponse.json(
        { error: 'Plan non valide' },
        { status: 400 }
      );
    }

    // Get price ID based on interval
    let priceId = newPlan.stripePriceId;
    if (validatedData.interval === 'year') {
      const annualPriceId = process.env[`STRIPE_${newPlan.id.toUpperCase()}_ANNUAL_PRICE_ID`];
      if (annualPriceId) {
        priceId = annualPriceId;
      }
    }

    // Update subscription in Stripe
    const updatedSubscription = await stripeService.updateSubscription({
      subscriptionId: businessOwner.stripeSubscriptionId,
      priceId,
      prorationBehavior: validatedData.immediately ? 'always_invoice' : 'create_prorations',
    });

    // Record subscription change in history
    await prisma.subscriptionHistory.create({
      data: {
        businessOwnerId: businessOwner.id,
        action: canUpgrade(currentPlan, targetPlan) ? 'upgraded' : 'downgraded',
        fromPlan: currentPlan,
        toPlan: targetPlan,
        fromPrice: 0, // Would need to calculate from current plan
        toPrice: newPlan.price,
        effectiveDate: new Date(),
        stripeEventId: updatedSubscription.id,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: `Abonnement mis à jour vers ${newPlan.name}`,
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'abonnement' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel subscription
export async function DELETE(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = cancelSubscriptionSchema.parse(body);

    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: authResult.user.userId },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!businessOwner.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé' },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe
    const canceledSubscription = await stripeService.cancelSubscription({
      subscriptionId: businessOwner.stripeSubscriptionId,
      immediately: validatedData.immediately,
    });

    // Record cancellation in history
    await prisma.subscriptionHistory.create({
      data: {
        businessOwnerId: businessOwner.id,
        action: 'canceled',
        fromPlan: businessOwner.subscriptionTier,
        reason: validatedData.reason,
        effectiveDate: validatedData.immediately
          ? new Date()
          : canceledSubscription.current_period_end
            ? new Date(canceledSubscription.current_period_end * 1000)
            : new Date(),
        stripeEventId: canceledSubscription.id,
      },
    });

    const message = validatedData.immediately 
      ? 'Abonnement annulé immédiatement'
      : 'Abonnement programmé pour annulation à la fin de la période de facturation';

    return NextResponse.json({
      success: true,
      subscription: canceledSubscription,
      message,
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'abonnement' },
      { status: 500 }
    );
  }
}