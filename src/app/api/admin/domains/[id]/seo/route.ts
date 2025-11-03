import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const domainId = parseInt(id);
    
    if (isNaN(domainId)) {
      return NextResponse.json(
        { error: 'Invalid domain ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { seo } = body;

    // Mevcut domain'i al
    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Mevcut settings'i al ve seo'yu güncelle
    const currentSettings = (domain.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      seo,
    };

    // Domain'i güncelle
    const updatedDomain = await prisma.domain.update({
      where: { id: domainId },
      data: {
        settings: updatedSettings,
      },
    });

    return NextResponse.json({
      success: true,
      domain: updatedDomain,
    });
  } catch (error) {
    logger.error('Error updating SEO settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

