/**
 * Create Stripe Checkout Session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyId, planSlug, billingPeriod = 'month', domainId } = body;

    // Validate input
    if (!companyId || !planSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, planSlug' },
        { status: 400 }
      );
    }

    if (!['basic', 'pro', 'premium'].includes(planSlug)) {
      return NextResponse.json(
        { error: 'Invalid plan slug' },
        { status: 400 }
      );
    }

    if (!['month', 'year'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Invalid billing period' },
        { status: 400 }
      );
    }

    // Verify user owns the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        ownerships: {
          where: {
            owner: { email: session.user.email },
          },
        },
      },
    });

    if (!company || company.ownerships.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or unauthorized' },
        { status: 403 }
      );
    }

    // Check if company already has active subscription
    if (company.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: 'Company already has an active subscription' },
        { status: 400 }
      );
    }

    // Get the origin for URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      companyId,
      planSlug,
      billingPeriod,
      domainId,
      successUrl: `${origin}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/dashboard/subscription/cancel`,
    });

    console.log(`✅ Checkout session created: ${checkoutSession.id} for company ${companyId}`);

    return NextResponse.json(
      {
        sessionId: checkoutSession.id,
        clientSecret: checkoutSession.client_secret,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Checkout error:', error.message);

    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
