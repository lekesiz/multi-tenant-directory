import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// GET /api/admin/campaigns - List campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const domainId = searchParams.get('domainId');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (domainId) {
      where.domainId = domainId;
    }

    const campaigns = await prisma.emailCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        domain: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (error) {
    logger.error('Failed to fetch campaigns', { error });
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/campaigns - Create campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, subject, htmlContent, domainId, scheduledAt } = body;

    // Validation
    if (!name || !subject || !htmlContent || !domainId) {
      return NextResponse.json(
        { success: false, message: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Verify domain exists
    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      return NextResponse.json(
        { success: false, message: 'Domaine introuvable' },
        { status: 404 }
      );
    }

    // Create campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        subject,
        htmlContent,
        domainId,
        status: 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: session.user.email,
      },
    });

    logger.info('Campaign created', {
      campaignId: campaign.id,
      name: campaign.name,
      domainId: campaign.domainId,
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    logger.error('Failed to create campaign', { error });
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

