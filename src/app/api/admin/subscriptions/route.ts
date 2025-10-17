/**
 * Admin Subscription Management API
 * GET: List all subscriptions with filters
 * POST: Create subscription plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const expiringSoon = searchParams.get('expiring_soon');

    let where: any = {};

    if (status) {
      where.subscriptionStatus = status;
    }

    if (tier) {
      where.subscriptionTier = tier;
    }

    // Get subscriptions expiring within 7 days
    if (expiringSoon === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      where.AND = [
        { subscriptionEnd: { lte: sevenDaysFromNow } },
        { subscriptionEnd: { gte: new Date() } },
      ];
    }

    const subscriptions = await prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        cancelAtPeriodEnd: true,
        isFeatured: true,
        featuredTier: true,
        featuredUntil: true,
        subscriptions: {
          select: { plan: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error('❌ Get subscriptions error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, monthlyPrice, yearlyPrice, features, maxListings } = body;

    // Validate input
    if (!name || !slug || !description || !monthlyPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if plan already exists
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Plan with slug "${slug}" already exists` },
        { status: 400 }
      );
    }

    // Create plan
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        slug,
        description,
        monthlyPrice,
        yearlyPrice,
        features: features || [],
        maxListings: maxListings || 1,
      },
    });

    console.log(`✅ Subscription plan created: ${plan.slug}`);

    return NextResponse.json(
      {
        success: true,
        plan,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Create plan error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}
