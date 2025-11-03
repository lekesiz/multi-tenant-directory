import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateImageSchema } from '@/lib/validations/activity';
import {
  userOwnsActivity,
  checkAIGenerationRateLimit,
  incrementAIUsage,
} from '@/lib/activity-helpers';
import { AIGenerationResponse } from '@/types/activity';
import { generateImage } from '@/lib/image-generation';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/business/activities/[id]/generate-image
 * Generate image for activity using Gemini
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

    // Get business owner details
    const owner = await prisma.businessOwner.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    // Check AI generation rate limits
    const rateLimit = await checkAIGenerationRateLimit(
      session.user.id,
      owner?.subscriptionTier || 'free'
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'AI generation rate limit exceeded',
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // Get activity
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            name: true,
            categories: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = generateImageSchema.safeParse({ ...body, activityId: id });

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

    // Build image prompt
    let imagePrompt = data.prompt;

    if (!imagePrompt) {
      // Generate prompt from activity content
      imagePrompt = `Create a professional ${data.style} image for a ${activity.type} post about "${activity.title}" for ${activity.company.name}, a ${activity.company.categories[0] || 'business'}. The image should be eye-catching and relevant to the content.`;
    }

    // Add style specifications
    imagePrompt += ` Style: ${data.style}. Aspect ratio: ${data.aspectRatio}.`;

    // Generate image
    let imageUrl: string;

    try {
      imageUrl = await generateImage(imagePrompt, {
        style: data.style,
        aspectRatio: data.aspectRatio,
        model: 'gemini-nano', // Using Gemini for image generation
      });
    } catch (imageError) {
      logger.error('Image generation error:', imageError);
      return NextResponse.json(
        {
          error: 'Image generation failed',
          message: imageError instanceof Error ? imageError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Update activity with generated image
    await prisma.activity.update({
      where: { id },
      data: {
        imageUrl,
        aiGenerated: true,
        aiModel: 'gemini',
        aiPrompt: imagePrompt,
      },
    });

    // Increment AI usage counter
    await incrementAIUsage(session.user.id);

    const response: AIGenerationResponse = {
      imageUrl,
      success: true,
      model: 'gemini',
    };

    logger.info('Activity image generated', {
      activityId: id,
      userId: session.user.id,
      style: data.style,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error generating activity image:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
