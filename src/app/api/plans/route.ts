/**
 * Get All Subscription Plans
 */

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(
      {
        plans: plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          trialDays: plan.trialDays,
          features: plan.features,
          maxListings: plan.maxListings,
          maxFeaturedDays: plan.maxFeaturedDays,
          isActive: plan.isActive,
          displayOrder: plan.displayOrder,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('❌ Get plans error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
