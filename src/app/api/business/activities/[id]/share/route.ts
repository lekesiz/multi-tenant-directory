import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { shareActivitySchema } from '@/lib/validations/activity';
import { userOwnsActivity } from '@/lib/activity-helpers';
import { ShareActivityResponse, ShareStatus, SocialPlatform } from '@/types/activity';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Share to Facebook
 * Requires Facebook Business API integration
 */
async function shareToFacebook(
  activity: any,
  company: any,
  customMessage?: string
): Promise<ShareStatus> {
  try {
    // TODO: Implement Facebook Graph API integration
    // 1. Use company's Facebook page token
    // 2. Create post with link to activity
    // 3. Include image/video if available
    // 4. Return post URL

    logger.info('Facebook share requested', { activityId: activity.id });

    // Simulated response
    return {
      platform: 'facebook',
      success: false,
      error: 'Facebook API integration not configured',
    };
  } catch (error) {
    return {
      platform: 'facebook',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share',
    };
  }
}

/**
 * Share to Twitter/X
 * Requires Twitter API integration
 */
async function shareToTwitter(
  activity: any,
  company: any,
  customMessage?: string
): Promise<ShareStatus> {
  try {
    // TODO: Implement Twitter API v2 integration
    // 1. Use company's Twitter OAuth tokens
    // 2. Create tweet with activity link
    // 3. Attach media if available
    // 4. Return tweet URL

    logger.info('Twitter share requested', { activityId: activity.id });

    return {
      platform: 'twitter',
      success: false,
      error: 'Twitter API integration not configured',
    };
  } catch (error) {
    return {
      platform: 'twitter',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share',
    };
  }
}

/**
 * Share to LinkedIn
 * Requires LinkedIn API integration
 */
async function shareToLinkedIn(
  activity: any,
  company: any,
  customMessage?: string
): Promise<ShareStatus> {
  try {
    // TODO: Implement LinkedIn API integration
    // 1. Use company's LinkedIn organization token
    // 2. Create organization post
    // 3. Include link and media
    // 4. Return post URL

    logger.info('LinkedIn share requested', { activityId: activity.id });

    return {
      platform: 'linkedin',
      success: false,
      error: 'LinkedIn API integration not configured',
    };
  } catch (error) {
    return {
      platform: 'linkedin',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share',
    };
  }
}

/**
 * Share to Instagram
 * Requires Instagram Business API integration
 */
async function shareToInstagram(
  activity: any,
  company: any,
  customMessage?: string
): Promise<ShareStatus> {
  try {
    // TODO: Implement Instagram Graph API integration
    // 1. Use company's Instagram business account token
    // 2. Create post/story with media
    // 3. Add caption and tags
    // 4. Return post URL

    logger.info('Instagram share requested', { activityId: activity.id });

    // Instagram requires images/videos
    if (!activity.imageUrl && !activity.videoUrl) {
      return {
        platform: 'instagram',
        success: false,
        error: 'Instagram requires an image or video',
      };
    }

    return {
      platform: 'instagram',
      success: false,
      error: 'Instagram API integration not configured',
    };
  } catch (error) {
    return {
      platform: 'instagram',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share',
    };
  }
}

/**
 * POST /api/business/activities/[id]/share
 * Share activity to social media platforms
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const ownsActivity = await userOwnsActivity(id, session.user.id);
    if (!ownsActivity) {
      return NextResponse.json({ error: 'Activity not found or access denied' }, { status: 404 });
    }

    // Get activity with company details
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            website: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Only published activities can be shared
    if (activity.status !== 'published') {
      return NextResponse.json(
        {
          error: 'Activity must be published before sharing',
          message: 'Please publish the activity first',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = shareActivitySchema.safeParse({ ...body, activityId: id });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Build activity URL (assuming we have a public activity page)
    const activityUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://haguenau.pro'}/companies/${activity.company.slug}/activities/${activity.slug}`;

    // Share to each platform
    const shareResults: ShareStatus[] = [];

    for (const platform of data.platforms) {
      let result: ShareStatus;

      switch (platform) {
        case 'facebook':
          result = await shareToFacebook(activity, activity.company, data.customMessage);
          break;
        case 'twitter':
          result = await shareToTwitter(activity, activity.company, data.customMessage);
          break;
        case 'linkedin':
          result = await shareToLinkedIn(activity, activity.company, data.customMessage);
          break;
        case 'instagram':
          result = await shareToInstagram(activity, activity.company, data.customMessage);
          break;
        default:
          result = {
            platform: platform as SocialPlatform,
            success: false,
            error: 'Unsupported platform',
          };
      }

      shareResults.push(result);
    }

    // Update activity with successful shares
    const successfulShares = shareResults.filter((r) => r.success).map((r) => r.platform);

    if (successfulShares.length > 0) {
      const updateData: any = {
        shareCount: { increment: successfulShares.length },
      };

      // Update platform-specific flags
      if (successfulShares.includes('facebook')) {
        updateData.sharedOnFacebook = true;
      }
      if (successfulShares.includes('twitter')) {
        updateData.sharedOnTwitter = true;
      }
      if (successfulShares.includes('linkedin')) {
        updateData.sharedOnLinkedIn = true;
      }
      if (successfulShares.includes('instagram')) {
        updateData.sharedOnInstagram = true;
      }

      await prisma.activity.update({
        where: { id },
        data: updateData,
      });
    }

    const response: ShareActivityResponse = {
      activityId: id,
      shares: shareResults,
      success: shareResults.some((r) => r.success),
      message:
        shareResults.filter((r) => r.success).length > 0
          ? `Successfully shared to ${shareResults.filter((r) => r.success).length} platform(s)`
          : 'Failed to share to any platform',
    };

    logger.info('Activity sharing completed', {
      activityId: id,
      userId: session.user.id,
      platforms: data.platforms,
      successful: successfulShares,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error sharing activity:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
