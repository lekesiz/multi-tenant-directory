import { NextResponse } from 'next/server';
import { marketingAutomation } from '@/lib/marketing-automation';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['email', 'sms', 'push', 'automation']),
  triggers: z.array(z.object({
    type: z.enum(['time_based', 'event_based', 'behavior_based']),
    condition: z.any(),
    delay: z.number().optional(),
  })),
  actions: z.array(z.object({
    type: z.enum(['send_email', 'send_sms', 'send_push', 'update_score', 'add_tag']),
    template: z.string().optional(),
    content: z.any().optional(),
    delay: z.number().optional(),
  })),
  segmentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET - List campaigns
export async function GET(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query filters
    const where: any = {
      businessOwnerId: authResult.user.userId,
    };

    if (status) where.status = status;
    if (type) where.type = type;

    const campaigns = await prisma.marketingCampaign.findMany({
      where,
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            memberCount: true,
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalCount = await prisma.marketingCampaign.count({ where });

    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      triggers: campaign.triggers,
      actions: campaign.actions,
      segment: campaign.segment,
      analytics: campaign.analytics,
      eventCount: campaign._count.events,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      nextRunAt: campaign.nextRunAt,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      campaigns: formattedCampaigns,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des campagnes' },
      { status: 500 }
    );
  }
}

// POST - Create campaign
export async function POST(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCampaignSchema.parse(body);

    const campaign = await marketingAutomation.createCampaign(
      authResult.user.userId,
      {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        triggers: validatedData.triggers,
        actions: validatedData.actions,
        segmentId: validatedData.segmentId,
      }
    );

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campagne créée avec succès',
    });

  } catch (error) {
    console.error('Create campaign error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la campagne' },
      { status: 500 }
    );
  }
}