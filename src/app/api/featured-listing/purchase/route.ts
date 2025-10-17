/**
 * Purchase Featured Listing Upgrade
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/stripe-utils';

type FeaturedTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface PurchaseRequest {
  companyId: number;
  tier: FeaturedTier;
  days: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as PurchaseRequest;
    const { companyId, tier, days } = body;

    // Validate input
    if (!companyId || !tier || !days) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
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

    // Get pricing
    let price: number | null = null;

    // Check for domain-specific pricing
    if (company.email) {
      const domainPricing = await prisma.domainPricing.findFirst({
        where: { domainId: { not: undefined } },
      });

      if (domainPricing) {
        const tierPriceMap = {
          bronze: domainPricing.featuredBronze,
          silver: domainPricing.featuredSilver,
          gold: domainPricing.featuredGold,
          platinum: domainPricing.featuredPlatinum,
        };
        price = tierPriceMap[tier] || null;
      }
    }

    // Default pricing if not found
    if (!price) {
      const defaultPrices = {
        bronze: 2999,
        silver: 4999,
        gold: 7999,
        platinum: 14999,
      };
      price = defaultPrices[tier];
    }

    // Create Stripe customer if needed
    if (!company.stripeCustomerId) {
      const customer = await prisma.company.update({
        where: { id: companyId },
        data: {
          stripeCustomerId: `company_${companyId}_featured`,
        },
      });
    }

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    // Create a one-time charge (using subscription with 0 trial and auto-cancel)
    // OR we could create a simple one-time payment

    // For now, return a simple response with checkout info
    // In production, you'd integrate with Stripe to create a one-time charge

    console.log(
      `✅ Featured listing purchase requested: Company ${companyId}, Tier ${tier}, Days ${days}, Price €${price / 100}`
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Featured listing purchase processed',
        tier,
        days,
        price,
        expiresAt: expirationDate.toISOString(),
        // In a real implementation, this would be the Stripe checkout URL
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription/success`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Featured listing purchase error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

/**
 * Get featured listing pricing and status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing companyId' },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
      select: {
        id: true,
        name: true,
        isFeatured: true,
        featuredTier: true,
        featuredUntil: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get domain pricing
    const domainPricing = await prisma.domainPricing.findFirst({
      select: {
        featuredBronze: true,
        featuredSilver: true,
        featuredGold: true,
        featuredPlatinum: true,
      },
    });

    const tiers = {
      bronze: { price: domainPricing?.featuredBronze || 2999, days: 7 },
      silver: { price: domainPricing?.featuredSilver || 4999, days: 14 },
      gold: { price: domainPricing?.featuredGold || 7999, days: 30 },
      platinum: { price: domainPricing?.featuredPlatinum || 14999, days: 60 },
    };

    return NextResponse.json(
      {
        company: {
          id: company.id,
          name: company.name,
          isFeatured: company.isFeatured,
          featuredTier: company.featuredTier,
          featuredUntil: company.featuredUntil,
        },
        tiers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Get featured pricing error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}
