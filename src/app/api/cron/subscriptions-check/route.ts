/**
 * Subscription Lifecycle Management Cron Job
 * Runs periodically to:
 * 1. Check for expired subscriptions and deactivate companies
 * 2. Send renewal reminders (7 days, 3 days, 1 day before expiration)
 * 3. Reactivate subscriptions after payment
 *
 * This should be called by a cron service (e.g., Vercel Crons, EasyCron, etc.)
 * Every 6 hours is recommended
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// TODO: Add email notifications in Phase 3.2
// import { sendEmailNotification } from '@/lib/email';

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('⚠️ CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

interface SubscriptionCheck {
  expiredCount: number;
  expiringSoonCount: number;
  renewalRemindersSent: number;
  reactivatedCount: number;
}

/**
 * Check for expired subscriptions and deactivate
 */
async function checkExpiredSubscriptions(): Promise<number> {
  const now = new Date();

  // Find subscriptions that expired
  const expiredSubscriptions = await prisma.companySubscription.findMany({
    where: {
      status: 'active',
      renewalDate: {
        lt: now,
      },
      autoRenew: false,
    },
    include: {
      company: true,
    },
  });

  if (expiredSubscriptions.length === 0) {
    console.log('✅ No expired subscriptions found');
    return 0;
  }

  console.log(`🔄 Found ${expiredSubscriptions.length} expired subscriptions`);

  let deactivatedCount = 0;

  for (const subscription of expiredSubscriptions) {
    await prisma.company.update({
      where: { id: subscription.companyId },
      data: {
        subscriptionStatus: 'expired',
        isActive: false,
      },
    });

    await prisma.companySubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'expired',
      },
    });

    // TODO: Send expiration email notification in Phase 3.2
    // if (subscription.company.email) {
    //   await sendEmailNotification({ ... });
    // }

    deactivatedCount++;
    console.log(`✅ Deactivated company ${subscription.companyId}`);
  }

  return deactivatedCount;
}

/**
 * Send renewal reminders for subscriptions expiring soon
 */
async function sendRenewalReminders(): Promise<number> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  let remindersSent = 0;

  // Get subscriptions expiring in 7 days
  const expiringSoon = await prisma.companySubscription.findMany({
    where: {
      status: 'active',
      renewalDate: {
        gte: now,
        lte: in7Days,
      },
    },
    include: {
      company: true,
    },
  });

  for (const subscription of expiringSoon) {
    const company = subscription.company;
    const daysUntilExpiry = Math.ceil(
      (subscription.renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine which reminder to send
    let templateType: 'subscription-reminder-7' | 'subscription-reminder-3' | 'subscription-reminder-1' | null =
      null;

    if (daysUntilExpiry === 1) {
      templateType = 'subscription-reminder-1';
    } else if (daysUntilExpiry === 3) {
      templateType = 'subscription-reminder-3';
    } else if (daysUntilExpiry === 7) {
      templateType = 'subscription-reminder-7';
    }

    if (!templateType || !company.email) continue;

    // TODO: Send reminder email in Phase 3.2
    // try {
    //   await sendEmailNotification({ ... });
    //   remindersSent++;
    // } catch (error) {
    //   console.error(...);
    // }

    // For now, just log that a reminder would be sent
    console.log(
      `ℹ️ Reminder: Would send ${daysUntilExpiry}-day renewal reminder to ${company.email}`
    );
  }

  return remindersSent;
}

/**
 * Reactivate subscriptions after payment
 */
async function checkForReactivation(): Promise<number> {
  // Find companies with past_due status
  const pastDue = await prisma.company.findMany({
    where: {
      subscriptionStatus: 'past_due',
    },
    include: {
      subscriptions: true,
    },
  });

  let reactivatedCount = 0;

  for (const company of pastDue) {
    const subscription = company.subscriptions;
    if (!subscription) continue;

    // Check if renewal date has passed and company should be reactivated
    // This would normally be done via Stripe webhook, but we check as fallback
    const now = new Date();

    if (subscription.renewalDate > now) {
      // Subscription is still active, reactivate
      await prisma.company.update({
        where: { id: company.id },
        data: {
          subscriptionStatus: 'active',
          isActive: true,
        },
      });

      reactivatedCount++;
      console.log(`✅ Reactivated company ${company.id}`);
    }
  }

  return reactivatedCount;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      console.warn('⚠️ Invalid or missing cron secret');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting subscription lifecycle check...');

    const results: SubscriptionCheck = {
      expiredCount: 0,
      expiringSoonCount: 0,
      renewalRemindersSent: 0,
      reactivatedCount: 0,
    };

    // Run checks
    results.expiredCount = await checkExpiredSubscriptions();
    results.renewalRemindersSent = await sendRenewalReminders();
    results.reactivatedCount = await checkForReactivation();

    console.log('✅ Subscription lifecycle check completed:', results);

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription check completed',
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Cron job error:', error.message);

    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
