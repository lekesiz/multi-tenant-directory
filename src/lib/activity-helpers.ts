import { prisma } from '@/lib/prisma';
import { Activity, Company } from '@prisma/client';
import {
  ActivityWithMetadata,
  ActivityAnalytics,
  ActivityType,
  ActivityStatus,
  ACTIVITY_RATE_LIMITS,
} from '@/types/activity';
import { generateSlug, ensureUniqueSlug } from '@/lib/validations/activity';

/**
 * Get business owner's company ID
 */
export async function getBusinessOwnerCompanyId(ownerId: string): Promise<number | null> {
  const ownership = await prisma.companyOwnership.findFirst({
    where: { ownerId, verified: true },
    select: { companyId: true },
  });

  return ownership?.companyId || null;
}

/**
 * Check if user owns the activity
 */
export async function userOwnsActivity(activityId: string, ownerId: string): Promise<boolean> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { companyId: true },
  });

  if (!activity) return false;

  const ownership = await prisma.companyOwnership.findFirst({
    where: {
      ownerId,
      companyId: activity.companyId,
      verified: true,
    },
  });

  return !!ownership;
}

/**
 * Generate unique slug for activity
 */
export async function generateUniqueSlug(title: string, companyId: number): Promise<string> {
  const baseSlug = generateSlug(title);

  const existingActivities = await prisma.activity.findMany({
    where: {
      companyId,
      slug: {
        startsWith: baseSlug,
      },
    },
    select: { slug: true },
  });

  const existingSlugs = existingActivities.map((a) => a.slug);
  return ensureUniqueSlug(baseSlug, existingSlugs);
}

/**
 * Check rate limits for activity creation
 */
export async function checkActivityRateLimit(
  ownerId: string,
  subscriptionTier: string = 'free'
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const tierLimits = ACTIVITY_RATE_LIMITS[subscriptionTier as keyof typeof ACTIVITY_RATE_LIMITS] || ACTIVITY_RATE_LIMITS.free;

  if (tierLimits.activitiesPerDay === -1) {
    return { allowed: true, remaining: -1, resetAt: new Date() };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const companyId = await getBusinessOwnerCompanyId(ownerId);
  if (!companyId) {
    return { allowed: false, remaining: 0, resetAt: new Date() };
  }

  const todayCount = await prisma.activity.count({
    where: {
      companyId,
      createdAt: {
        gte: today,
      },
    },
  });

  const remaining = Math.max(0, tierLimits.activitiesPerDay - todayCount);
  const resetAt = new Date(today);
  resetAt.setDate(resetAt.getDate() + 1);

  return {
    allowed: todayCount < tierLimits.activitiesPerDay,
    remaining,
    resetAt,
  };
}

/**
 * Check AI generation rate limit
 */
export async function checkAIGenerationRateLimit(
  ownerId: string,
  subscriptionTier: string = 'free'
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const tierLimits = ACTIVITY_RATE_LIMITS[subscriptionTier as keyof typeof ACTIVITY_RATE_LIMITS] || ACTIVITY_RATE_LIMITS.free;

  if (tierLimits.aiGenerationsPerDay === -1) {
    return { allowed: true, remaining: -1, resetAt: new Date() };
  }

  const owner = await prisma.businessOwner.findUnique({
    where: { id: ownerId },
    select: { aiUsageCount: true, aiUsageResetDate: true },
  });

  if (!owner) {
    return { allowed: false, remaining: 0, resetAt: new Date() };
  }

  const now = new Date();
  const resetDate = owner.aiUsageResetDate || now;

  // Reset if past reset date
  if (now > resetDate) {
    await prisma.businessOwner.update({
      where: { id: ownerId },
      data: {
        aiUsageCount: 0,
        aiUsageResetDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    return {
      allowed: true,
      remaining: tierLimits.aiGenerationsPerDay - 1,
      resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  const remaining = Math.max(0, tierLimits.aiGenerationsPerDay - owner.aiUsageCount);

  return {
    allowed: owner.aiUsageCount < tierLimits.aiGenerationsPerDay,
    remaining,
    resetAt: resetDate,
  };
}

/**
 * Increment AI usage count
 */
export async function incrementAIUsage(ownerId: string): Promise<void> {
  await prisma.businessOwner.update({
    where: { id: ownerId },
    data: {
      aiUsageCount: { increment: 1 },
      aiTotalRequests: { increment: 1 },
    },
  });
}

/**
 * Enhance activity with metadata
 */
export async function enhanceActivityWithMetadata(
  activity: Activity,
  includeCompany: boolean = false
): Promise<ActivityWithMetadata> {
  const enhanced: ActivityWithMetadata = {
    ...activity,
    engagementRate: calculateEngagementRate(activity),
    isScheduled: !!activity.scheduledFor && activity.status === 'scheduled',
    canEdit: activity.status !== 'published',
    canDelete: true,
  };

  if (includeCompany) {
    const company = await prisma.company.findUnique({
      where: { id: activity.companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
      },
    });

    if (company) {
      enhanced.company = company;
    }
  }

  return enhanced;
}

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(activity: Activity): number {
  if (activity.viewCount === 0) return 0;

  const totalEngagements = activity.likeCount + activity.shareCount + activity.commentCount;
  return (totalEngagements / activity.viewCount) * 100;
}

/**
 * Get activity analytics for a company
 */
export async function getActivityAnalytics(companyId: number): Promise<ActivityAnalytics> {
  const activities = await prisma.activity.findMany({
    where: { companyId },
  });

  const publishedActivities = activities.filter((a) => a.status === 'published');
  const draftActivities = activities.filter((a) => a.status === 'draft');
  const scheduledActivities = activities.filter((a) => a.status === 'scheduled');

  const totalViews = activities.reduce((sum, a) => sum + a.viewCount, 0);
  const totalLikes = activities.reduce((sum, a) => sum + a.likeCount, 0);
  const totalShares = activities.reduce((sum, a) => sum + a.shareCount, 0);
  const totalComments = activities.reduce((sum, a) => sum + a.commentCount, 0);

  const avgEngagementRate =
    publishedActivities.length > 0
      ? publishedActivities.reduce((sum, a) => sum + calculateEngagementRate(a), 0) /
        publishedActivities.length
      : 0;

  // Top performing activities
  const topPerforming = await prisma.activity.findMany({
    where: { companyId, status: 'published' },
    orderBy: { viewCount: 'desc' },
    take: 5,
  });

  const topPerformingWithMetadata = await Promise.all(
    topPerforming.map((a) => enhanceActivityWithMetadata(a, true))
  );

  // Recent activities
  const recent = await prisma.activity.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const recentWithMetadata = await Promise.all(
    recent.map((a) => enhanceActivityWithMetadata(a, true))
  );

  // Activity by type
  const activityByType = activities.reduce((acc, a) => {
    acc[a.type as ActivityType] = (acc[a.type as ActivityType] || 0) + 1;
    return acc;
  }, {} as Record<ActivityType, number>);

  // Activity by month (last 12 months)
  const activityByMonth = getActivityByMonth(activities);

  return {
    totalActivities: activities.length,
    publishedCount: publishedActivities.length,
    draftCount: draftActivities.length,
    scheduledCount: scheduledActivities.length,
    totalViews,
    totalLikes,
    totalShares,
    totalComments,
    avgEngagementRate,
    topPerformingActivities: topPerformingWithMetadata,
    recentActivities: recentWithMetadata,
    activityByType,
    activityByMonth,
  };
}

/**
 * Get activity by month
 */
function getActivityByMonth(
  activities: Activity[]
): { month: string; count: number; views: number }[] {
  const months: { [key: string]: { count: number; views: number } } = {};

  activities.forEach((activity) => {
    const monthKey = new Date(activity.createdAt).toISOString().substring(0, 7);
    if (!months[monthKey]) {
      months[monthKey] = { count: 0, views: 0 };
    }
    months[monthKey].count++;
    months[monthKey].views += activity.viewCount;
  });

  return Object.entries(months)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 12);
}

/**
 * Increment activity view count
 */
export async function incrementActivityViews(activityId: string): Promise<void> {
  await prisma.activity.update({
    where: { id: activityId },
    data: { viewCount: { increment: 1 } },
  });
}

/**
 * Check if activity should be auto-published
 */
export async function checkScheduledActivities(): Promise<void> {
  const now = new Date();

  const scheduledActivities = await prisma.activity.findMany({
    where: {
      status: 'scheduled',
      scheduledFor: {
        lte: now,
      },
    },
  });

  for (const activity of scheduledActivities) {
    await prisma.activity.update({
      where: { id: activity.id },
      data: {
        status: 'published',
        publishedAt: now,
      },
    });
  }
}

/**
 * Archive expired activities
 * NOTE: expiresAt field doesn't exist in migration - this function is disabled
 */
export async function archiveExpiredActivities(): Promise<void> {
  // DISABLED: expiresAt field not in database schema
  // const now = new Date();
  // await prisma.activity.updateMany({
  //   where: {
  //     status: 'published',
  //     expiresAt: { lte: now },
  //   },
  //   data: {
  //     status: 'archived',
  //   },
  // });
}

/**
 * Get popular tags for a company
 */
export async function getPopularTags(companyId: number, limit: number = 10): Promise<string[]> {
  const activities = await prisma.activity.findMany({
    where: { companyId },
    select: { tags: true },
  });

  const tagCounts: { [key: string]: number } = {};

  activities.forEach((activity) => {
    activity.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Search activities
 */
export async function searchActivities(
  companyId: number,
  searchTerm: string,
  limit: number = 10
): Promise<Activity[]> {
  return prisma.activity.findMany({
    where: {
      companyId,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}
