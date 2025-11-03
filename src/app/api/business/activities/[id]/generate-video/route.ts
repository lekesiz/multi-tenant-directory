import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateVideoSchema } from '@/lib/validations/activity';
import {
  userOwnsActivity,
  checkAIGenerationRateLimit,
  incrementAIUsage,
} from '@/lib/activity-helpers';
import { AIGenerationResponse } from '@/types/activity';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Generate video using Veo 3 (Google's video generation model)
 * This is a placeholder implementation - actual Veo 3 API integration would be needed
 */
async function generateVideoWithVeo3(
  prompt: string,
  options: {
    duration: number;
    style: string;
    aspectRatio: string;
  }
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  // TODO: Implement actual Veo 3 API integration
  // For now, this is a placeholder that would need to be replaced with:
  // 1. Google Cloud Vertex AI API call to Veo 3
  // 2. Video generation job submission
  // 3. Polling for completion
  // 4. Upload to cloud storage
  // 5. Return URLs

  logger.info('Veo 3 video generation requested', { prompt, options });

  // Simulated response - replace with actual API call
  throw new Error('Veo 3 API integration not yet implemented. Please configure Vertex AI credentials.');
}

/**
 * POST /api/business/activities/[id]/generate-video
 * Generate video for activity using Veo 3
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
            city: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = generateVideoSchema.safeParse({ ...body, activityId: id });

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

    // Build video prompt
    let videoPrompt = data.prompt;

    if (!videoPrompt) {
      // Generate prompt from activity content
      videoPrompt = `Create a ${data.duration}-second ${data.style} video for a ${activity.type} about "${activity.title}" for ${activity.company.name}, a ${activity.company.categories[0] || 'business'} in ${activity.company.city}.

Content summary: ${activity.excerpt || activity.content.substring(0, 200)}

The video should be professional, engaging, and suitable for social media sharing. Include smooth transitions and appealing visuals that align with the business's industry.`;
    }

    // Add technical specifications
    videoPrompt += `\n\nTechnical requirements:
- Duration: ${data.duration} seconds
- Style: ${data.style}
- Aspect ratio: ${data.aspectRatio}
- Output format: MP4, H.264 codec
- Quality: High definition (1080p)`;

    // Generate video with Veo 3
    let videoUrl: string;
    let thumbnailUrl: string;

    try {
      const result = await generateVideoWithVeo3(videoPrompt, {
        duration: data.duration,
        style: data.style,
        aspectRatio: data.aspectRatio,
      });

      videoUrl = result.videoUrl;
      thumbnailUrl = result.thumbnailUrl;
    } catch (videoError) {
      logger.error('Video generation error:', videoError);
      return NextResponse.json(
        {
          error: 'Video generation failed',
          message: videoError instanceof Error ? videoError.message : 'Veo 3 API not configured',
        },
        { status: 503 }
      );
    }

    // Update activity with generated video
    await prisma.activity.update({
      where: { id },
      data: {
        videoUrl,
        videoThumbnail: thumbnailUrl,
        aiGenerated: true,
        aiModel: 'veo-3',
        aiPrompt: videoPrompt,
      },
    });

    // Increment AI usage counter
    await incrementAIUsage(session.user.id);

    const response: AIGenerationResponse = {
      videoUrl,
      success: true,
      model: 'veo-3',
    };

    logger.info('Activity video generated', {
      activityId: id,
      userId: session.user.id,
      duration: data.duration,
      style: data.style,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error generating activity video:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
