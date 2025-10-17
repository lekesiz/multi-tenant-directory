/**
 * Subscription Management API
 * GET: Get subscription details
 * PATCH: Update subscription (cancel, reactivate, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  cancelSubscriptionAtPeriodEnd,
  cancelSubscriptionImmediate,
  reactivateSubscription,
} from '@/lib/stripe-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = await params;
    const id = parseInt(companyId);

    // Get company and verify ownership
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: { plan: true },
        },
        ownerships: {
          where: { owner: { email: session.user.email } },
        },
      },
    });

    if (!company || company.ownerships.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or unauthorized' },
        { status: 403 }
      );
    }

    // Extract subscription info
    const subscription = company.subscriptions;
    const isTrialing = company.subscriptionStatus === 'trialing';
    const daysUntilRenewal = subscription?.renewalDate
      ? Math.ceil(
          (subscription.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      : null;

    return NextResponse.json({
      companyId: company.id,
      companyName: company.name,
      tier: company.subscriptionTier,
      status: company.subscriptionStatus,
      isTrialing,
      startDate: company.subscriptionStart,
      renewalDate: subscription?.renewalDate,
      daysUntilRenewal,
      cancelAtPeriodEnd: company.cancelAtPeriodEnd,
      trialEnd: company.trialEnd,
      plan: subscription?.plan || null,
      isFeatured: company.isFeatured,
      featuredTier: company.featuredTier,
      featuredUntil: company.featuredUntil,
    });
  } catch (error: any) {
    console.error('❌ Get subscription error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = await params;
    const id = parseInt(companyId);
    const body = await request.json();
    const { action } = body;

    // Get company and verify ownership
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        ownerships: {
          where: { owner: { email: session.user.email } },
        },
      },
    });

    if (!company || company.ownerships.length === 0) {
      return NextResponse.json(
        { error: 'Company not found or unauthorized' },
        { status: 403 }
      );
    }

    if (!company.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'cancel_at_period_end': {
        result = await cancelSubscriptionAtPeriodEnd(company.stripeSubscriptionId);

        await prisma.company.update({
          where: { id },
          data: { cancelAtPeriodEnd: true },
        });

        console.log(
          `✅ Subscription scheduled for cancellation: ${company.stripeSubscriptionId}`
        );
        break;
      }

      case 'cancel_immediately': {
        result = await cancelSubscriptionImmediate(company.stripeSubscriptionId);

        await prisma.company.update({
          where: { id },
          data: {
            subscriptionStatus: 'canceled',
            isActive: false,
          },
        });

        await prisma.companySubscription.updateMany({
          where: { companyId: id },
          data: {
            status: 'canceled',
            cancelDate: new Date(),
          },
        });

        console.log(
          `✅ Subscription canceled immediately: ${company.stripeSubscriptionId}`
        );
        break;
      }

      case 'reactivate': {
        if (!company.cancelAtPeriodEnd) {
          return NextResponse.json(
            { error: 'Subscription is not scheduled for cancellation' },
            { status: 400 }
          );
        }

        result = await reactivateSubscription(company.stripeSubscriptionId);

        await prisma.company.update({
          where: { id },
          data: { cancelAtPeriodEnd: false },
        });

        console.log(`✅ Subscription reactivated: ${company.stripeSubscriptionId}`);
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Subscription ${action} processed`,
        subscription: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Subscription update error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
