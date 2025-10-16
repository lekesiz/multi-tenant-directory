/**
 * Referral System - Viral Growth Engine
 * Handles referral code generation, tracking, and rewards
 */

import { prisma } from './prisma';
import { nanoid } from 'nanoid';

export interface ReferralCode {
  id: string;
  code: string;
  referrerId: string;
  clicks: number;
  signups: number;
  conversions: number;
  status: 'active' | 'completed' | 'expired';
  expiresAt?: Date;
}

export interface ReferralReward {
  referrerReward: string;
  referredReward: string;
  description: string;
}

// Referral reward configurations
export const REFERRAL_REWARDS = {
  STANDARD: {
    referrerReward: '1_month_free',
    referredReward: '50_percent_first_month',
    description: 'Parrain: 1 mois gratuit, Filleul: 50% de réduction premier mois',
  },
  PREMIUM: {
    referrerReward: '3_months_free',
    referredReward: '2_months_free',
    description: 'Parrain: 3 mois gratuits, Filleul: 2 mois gratuits',
  },
  ENTERPRISE: {
    referrerReward: 'lifetime_discount',
    referredReward: 'free_setup',
    description: 'Parrain: Réduction à vie, Filleul: Installation gratuite',
  },
} as const;

/**
 * Generate a unique referral code
 */
export function generateReferralCode(businessName: string): string {
  // Create a code based on business name + random string
  const cleanName = businessName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4);
  
  const randomSuffix = nanoid(4).toUpperCase();
  return `${cleanName}${randomSuffix}`;
}

/**
 * Create a new referral code for a business owner
 */
export async function createReferralCode(
  referrerId: string,
  businessName: string,
  rewardType: keyof typeof REFERRAL_REWARDS = 'STANDARD'
): Promise<ReferralCode> {
  const code = generateReferralCode(businessName);
  const rewards = REFERRAL_REWARDS[rewardType];
  
  // Set expiration to 1 year from now
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const referral = await prisma.referral.create({
    data: {
      referrerId,
      code,
      referrerReward: rewards.referrerReward,
      referredReward: rewards.referredReward,
      status: 'active',
      expiresAt,
    },
  });

  return {
    id: referral.id,
    code: referral.code,
    referrerId: referral.referrerId,
    clicks: referral.clicks,
    signups: referral.signups,
    conversions: referral.conversions,
    status: referral.status as 'active' | 'completed' | 'expired',
    expiresAt: referral.expiresAt || undefined,
  };
}

/**
 * Track a referral click
 */
export async function trackReferralClick(code: string): Promise<boolean> {
  try {
    const referral = await prisma.referral.findUnique({
      where: { code },
    });

    if (!referral || referral.status !== 'active') {
      return false;
    }

    // Check if expired
    if (referral.expiresAt && new Date() > referral.expiresAt) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: 'expired' },
      });
      return false;
    }

    // Increment click count
    await prisma.referral.update({
      where: { id: referral.id },
      data: { clicks: { increment: 1 } },
    });

    return true;
  } catch (error) {
    console.error('Error tracking referral click:', error);
    return false;
  }
}

/**
 * Track a referral signup
 */
export async function trackReferralSignup(
  code: string,
  referredId: string
): Promise<boolean> {
  try {
    const referral = await prisma.referral.findUnique({
      where: { code },
    });

    if (!referral || referral.status !== 'active') {
      return false;
    }

    // Update referral with referred user and increment signup count
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredId,
        signups: { increment: 1 },
      },
    });

    return true;
  } catch (error) {
    console.error('Error tracking referral signup:', error);
    return false;
  }
}

/**
 * Track a referral conversion (when referred user subscribes)
 */
export async function trackReferralConversion(referredId: string): Promise<void> {
  try {
    const referral = await prisma.referral.findFirst({
      where: {
        referredId,
        status: 'active',
      },
    });

    if (!referral) return;

    // Increment conversion count
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        conversions: { increment: 1 },
        status: 'completed',
        rewardedAt: new Date(),
      },
    });

    // Apply rewards to both referrer and referred
    await applyReferralRewards(referral.referrerId, referredId, referral);
  } catch (error) {
    console.error('Error tracking referral conversion:', error);
  }
}

/**
 * Apply referral rewards to both parties
 */
async function applyReferralRewards(
  referrerId: string,
  referredId: string,
  referral: any
): Promise<void> {
  try {
    // Apply referrer reward
    await applyReward(referrerId, referral.referrerReward);
    
    // Apply referred reward
    await applyReward(referredId, referral.referredReward);

    // Send notification emails (to be implemented)
    // await sendReferralRewardNotifications(referrerId, referredId, referral);
  } catch (error) {
    console.error('Error applying referral rewards:', error);
  }
}

/**
 * Apply a specific reward to a business owner
 */
async function applyReward(businessOwnerId: string, rewardType: string): Promise<void> {
  const businessOwner = await prisma.businessOwner.findUnique({
    where: { id: businessOwnerId },
  });

  if (!businessOwner) return;

  switch (rewardType) {
    case '1_month_free':
      // Extend subscription by 1 month
      const currentEnd = businessOwner.subscriptionEnd || new Date();
      const newEnd = new Date(currentEnd);
      newEnd.setMonth(newEnd.getMonth() + 1);
      
      await prisma.businessOwner.update({
        where: { id: businessOwnerId },
        data: { subscriptionEnd: newEnd },
      });
      break;

    case '3_months_free':
      // Extend subscription by 3 months
      const currentEnd3 = businessOwner.subscriptionEnd || new Date();
      const newEnd3 = new Date(currentEnd3);
      newEnd3.setMonth(newEnd3.getMonth() + 3);
      
      await prisma.businessOwner.update({
        where: { id: businessOwnerId },
        data: { subscriptionEnd: newEnd3 },
      });
      break;

    case '50_percent_first_month':
      // Apply 50% discount to first month (handled via Stripe coupon)
      // This would be implemented in the checkout process
      break;

    case '2_months_free':
      // Extend subscription by 2 months
      const currentEnd2 = businessOwner.subscriptionEnd || new Date();
      const newEnd2 = new Date(currentEnd2);
      newEnd2.setMonth(newEnd2.getMonth() + 2);
      
      await prisma.businessOwner.update({
        where: { id: businessOwnerId },
        data: { subscriptionEnd: newEnd2 },
      });
      break;

    case 'lifetime_discount':
      // Apply permanent discount (custom implementation needed)
      break;

    case 'free_setup':
      // Mark as eligible for free setup service
      break;

    default:
      console.log(`Unknown reward type: ${rewardType}`);
  }
}

/**
 * Get referral statistics for a business owner
 */
export async function getReferralStats(referrerId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId },
    include: {
      referred: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          subscriptionTier: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = referrals.reduce(
    (acc, referral) => ({
      totalClicks: acc.totalClicks + referral.clicks,
      totalSignups: acc.totalSignups + referral.signups,
      totalConversions: acc.totalConversions + referral.conversions,
      activeReferrals: acc.activeReferrals + (referral.status === 'active' ? 1 : 0),
      completedReferrals: acc.completedReferrals + (referral.status === 'completed' ? 1 : 0),
    }),
    {
      totalClicks: 0,
      totalSignups: 0,
      totalConversions: 0,
      activeReferrals: 0,
      completedReferrals: 0,
    }
  );

  const conversionRate = stats.totalClicks > 0 ? (stats.totalConversions / stats.totalClicks) * 100 : 0;
  const signupRate = stats.totalClicks > 0 ? (stats.totalSignups / stats.totalClicks) * 100 : 0;

  return {
    ...stats,
    conversionRate: Math.round(conversionRate * 100) / 100,
    signupRate: Math.round(signupRate * 100) / 100,
    referrals: referrals.map(r => ({
      id: r.id,
      code: r.code,
      clicks: r.clicks,
      signups: r.signups,
      conversions: r.conversions,
      status: r.status,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      referred: r.referred,
      referrerReward: r.referrerReward,
      referredReward: r.referredReward,
    })),
  };
}

/**
 * Generate referral URL
 */
export function generateReferralUrl(code: string, baseUrl: string = 'https://haguenau.pro'): string {
  return `${baseUrl}/register?ref=${code}`;
}

/**
 * Validate referral code
 */
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  referral?: any;
  error?: string;
}> {
  try {
    const referral = await prisma.referral.findUnique({
      where: { code },
      include: {
        referrer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!referral) {
      return { valid: false, error: 'Code de parrainage invalide' };
    }

    if (referral.status !== 'active') {
      return { valid: false, error: 'Code de parrainage expiré ou inactif' };
    }

    if (referral.expiresAt && new Date() > referral.expiresAt) {
      // Mark as expired
      await prisma.referral.update({
        where: { id: referral.id },
        data: { status: 'expired' },
      });
      return { valid: false, error: 'Code de parrainage expiré' };
    }

    return { valid: true, referral };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
  }
}

/**
 * Get leaderboard of top referrers
 */
export async function getReferralLeaderboard(limit: number = 10) {
  const leaderboard = await prisma.referral.groupBy({
    by: ['referrerId'],
    _sum: {
      clicks: true,
      signups: true,
      conversions: true,
    },
    orderBy: {
      _sum: {
        conversions: 'desc',
      },
    },
    take: limit,
  });

  const referrerIds = leaderboard.map(entry => entry.referrerId);
  const referrers = await prisma.businessOwner.findMany({
    where: { id: { in: referrerIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  return leaderboard.map(entry => {
    const referrer = referrers.find(r => r.id === entry.referrerId);
    return {
      referrer,
      stats: {
        clicks: entry._sum.clicks || 0,
        signups: entry._sum.signups || 0,
        conversions: entry._sum.conversions || 0,
        conversionRate: entry._sum.clicks && entry._sum.clicks > 0 
          ? ((entry._sum.conversions || 0) / entry._sum.clicks) * 100 
          : 0,
      },
    };
  });
}