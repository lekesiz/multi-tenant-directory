import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { updateActivitySchema } from '@/lib/validations/activity';
import { userOwnsActivity, enhanceActivityWithMetadata } from '@/lib/activity-helpers';
import { ActivityResponse } from '@/types/activity';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/business/activities/[id]
 * Get single activity
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
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

    // Fetch activity
    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const enhanced = await enhanceActivityWithMetadata(activity, true);

    const response: ActivityResponse = {
      activity: enhanced,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching activity:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/business/activities/[id]
 * Update activity
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
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

    // Get existing activity
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Check if activity can be edited (published activities have restrictions)
    if (existingActivity.status === 'published') {
      return NextResponse.json(
        {
          error: 'Cannot edit published activity',
          message: 'Published activities cannot be edited. Create a new version instead.',
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = updateActivitySchema.safeParse({ ...body, id });

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

    // Update activity - using correct field names from migration
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.type !== undefined) updateData.type = data.type;
    // postType field doesn't exist in migration - removed
    if (data.status !== undefined) updateData.status = data.status;
    if (data.imageUrl !== undefined) updateData.featuredImage = data.imageUrl; // FIXED: imageUrl -> featuredImage
    // imageCaption doesn't exist in migration - removed
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    // videoThumbnail doesn't exist in migration - removed
    if (data.mediaUrls !== undefined) updateData.images = data.mediaUrls; // FIXED: mediaUrls -> images
    if (data.tags !== undefined) updateData.tags = data.tags;
    // category doesn't exist in migration - removed
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.metaKeywords !== undefined) updateData.keywords = data.metaKeywords; // FIXED: metaKeywords -> keywords
    if (data.scheduledFor !== undefined)
      updateData.scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;
    // expiresAt doesn't exist in migration - removed

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: updateData,
    });

    const enhanced = await enhanceActivityWithMetadata(updatedActivity, true);

    const response: ActivityResponse = {
      activity: enhanced,
      success: true,
      message: 'Activity updated successfully',
    };

    logger.info('Activity updated', {
      activityId: id,
      userId: session.user.id,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error updating activity:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/business/activities/[id]
 * Delete activity
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    // Delete activity
    await prisma.activity.delete({
      where: { id },
    });

    logger.info('Activity deleted', {
      activityId: id,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting activity:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
