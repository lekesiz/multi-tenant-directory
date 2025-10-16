import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createBillingPortalSession } from '@/lib/stripe';

/**
 * POST /api/billing/portal
 * Create Stripe billing portal session for managing subscription
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: session.user.email },
    });

    if (!businessOwner) {
      return NextResponse.json({ error: 'Business owner not found' }, { status: 404 });
    }

    if (!businessOwner.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer ID found' },
        { status: 400 }
      );
    }

    // Create billing portal session
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const portalSession = await createBillingPortalSession({
      customerId: businessOwner.stripeCustomerId,
      returnUrl: `${baseUrl}/business/dashboard/billing`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error('[Billing] Create portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
