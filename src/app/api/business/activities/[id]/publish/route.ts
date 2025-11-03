import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { publishActivitySchema } from '@/lib/validations/activity';
import { userOwnsActivity, enhanceActivityWithMetadata } from '@/lib/activity-helpers';
import { ActivityResponse } from '@/types/activity';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/business/activities/[id]/publish
 * Publish a draft activity or schedule for later
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

    // Get existing activity
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Check if already published
    if (existingActivity.status === 'published') {
      return NextResponse.json(
        {
          error: 'Activity already published',
          message: 'This activity is already published',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = publishActivitySchema.safeParse({ ...body, id });

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

    // Determine publish status
    let status: string;
    let publishedAt: Date | null = null;
    let scheduledFor: Date | null = null;

    if (data.publishNow) {
      status = 'published';
      publishedAt = new Date();
    } else if (data.scheduledFor) {
      status = 'scheduled';
      scheduledFor = new Date(data.scheduledFor);
    } else {
      return NextResponse.json(
        {
          error: 'Invalid publish options',
          message: 'Either publishNow must be true or scheduledFor must be provided',
        },
        { status: 400 }
      );
    }

    // Update activity
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        status,
        publishedAt,
        scheduledFor,
      },
    });

    const enhanced = await enhanceActivityWithMetadata(updatedActivity, true);

    const response: ActivityResponse = {
      activity: enhanced,
      success: true,
      message: status === 'published' ? 'Activity published successfully' : 'Activity scheduled for publishing',
    };

    logger.info('Activity publish status updated', {
      activityId: id,
      status,
      userId: session.user.id,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error publishing activity:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
