import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateActivitySchema } from '@/lib/validations/activity';
import {
  checkAIGenerationRateLimit,
  incrementAIUsage,
  getBusinessOwnerCompanyId,
} from '@/lib/activity-helpers';
import { AIGenerationResponse } from '@/types/activity';
import { generateText } from '@/lib/ai';

/**
 * POST /api/business/activities/generate
 * Generate activity content using AI
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Parse and validate request body
    const body = await req.json();
    const validation = generateActivitySchema.safeParse(body);

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

    // Verify company ownership
    const companyId = await getBusinessOwnerCompanyId(session.user.id);
    if (companyId !== data.companyId) {
      return NextResponse.json(
        { error: 'Access denied to this company' },
        { status: 403 }
      );
    }

    // Get company details for context
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
      select: {
        name: true,
        categories: true,
        address: true,
        city: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Build AI prompt
    const systemPrompt = `You are a professional content writer for ${company.name}, a business located in ${company.city}.
Your task is to create engaging, informative, and professional content for their business activities.
The business categories are: ${company.categories.join(', ')}.

Generate content that is:
- Relevant to their business
- Engaging and easy to read
- SEO-friendly
- Professional yet approachable in tone
- Appropriate for ${data.tone} tone`;

    let userPrompt = '';

    if (data.prompt) {
      userPrompt = data.prompt;
    } else if (data.topic) {
      userPrompt = `Write a ${data.length} ${data.type} post about "${data.topic}" for ${company.name}.`;
    } else {
      userPrompt = `Write a ${data.length} ${data.type} post for ${company.name}, a ${company.categories[0] || 'business'} in ${company.city}.`;
    }

    // Add length specifications
    let lengthSpec = '';
    switch (data.length) {
      case 'short':
        lengthSpec = 'Keep it concise, around 100-200 words.';
        break;
      case 'medium':
        lengthSpec = 'Make it detailed, around 300-500 words.';
        break;
      case 'long':
        lengthSpec = 'Make it comprehensive, around 600-1000 words.';
        break;
    }

    userPrompt += `\n\n${lengthSpec}\n\nProvide the following in JSON format:
{
  "title": "An engaging title",
  "content": "The main content in markdown format",
  "excerpt": "A brief 1-2 sentence summary",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    // Generate content using AI
    let generatedContent: any;
    let aiModel = 'gemini';

    try {
      const aiResponse = await generateText(systemPrompt, userPrompt);

      // Try to parse JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        generatedContent = {
          title: 'Generated Content',
          content: aiResponse,
          excerpt: aiResponse.substring(0, 150) + '...',
          tags: [],
        };
      }
    } catch (aiError) {
      logger.error('AI generation error:', aiError);
      return NextResponse.json(
        {
          error: 'AI generation failed',
          message: aiError instanceof Error ? aiError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Increment AI usage counter
    await incrementAIUsage(session.user.id);

    const response: AIGenerationResponse = {
      content: generatedContent.content,
      title: generatedContent.title,
      excerpt: generatedContent.excerpt,
      tags: generatedContent.tags,
      success: true,
      model: aiModel,
    };

    logger.info('Activity content generated', {
      companyId: data.companyId,
      userId: session.user.id,
      type: data.type,
      model: aiModel,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error generating activity:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
