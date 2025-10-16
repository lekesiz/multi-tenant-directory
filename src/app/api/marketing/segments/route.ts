import { NextResponse } from 'next/server';
import { marketingAutomation } from '@/lib/marketing-automation';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSegmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  rules: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in']),
    value: z.any(),
    logicalOperator: z.enum(['AND', 'OR']).optional(),
  })),
  dynamicRefresh: z.boolean().default(true),
});

// GET - List segments
export async function GET(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const segments = await prisma.customerSegment.findMany({
      where: {
        businessOwnerId: authResult.user.userId,
      },
      include: {
        _count: {
          select: {
            members: true,
            campaigns: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSegments = segments.map(segment => ({
      id: segment.id,
      name: segment.name,
      description: segment.description,
      rules: segment.rules,
      dynamicRefresh: segment.dynamicRefresh,
      memberCount: segment._count.members,
      campaignCount: segment._count.campaigns,
      lastRefreshed: segment.lastRefreshed,
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      segments: formattedSegments,
    });

  } catch (error) {
    console.error('Get segments error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des segments' },
      { status: 500 }
    );
  }
}

// POST - Create segment
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
    const validatedData = createSegmentSchema.parse(body);

    const segment = await marketingAutomation.createSegment(
      authResult.user.userId,
      {
        name: validatedData.name,
        description: validatedData.description,
        rules: validatedData.rules,
        dynamicRefresh: validatedData.dynamicRefresh,
      }
    );

    return NextResponse.json({
      success: true,
      segment,
      message: 'Segment créé avec succès',
    });

  } catch (error) {
    console.error('Create segment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du segment' },
      { status: 500 }
    );
  }
}