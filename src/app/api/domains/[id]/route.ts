import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const domainId = parseInt(id);

    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
      include: {
        _count: {
          select: {
            content: true,
          },
        },
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Error fetching domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const domainId = parseInt(id);
    const body = await request.json();

    const domain = await prisma.domain.update({
      where: { id: domainId },
      data: {
        isActive: body.isActive,
        siteTitle: body.siteTitle,
        siteDescription: body.siteDescription,
        logoUrl: body.logoUrl,
        primaryColor: body.primaryColor,
      },
      include: {
        _count: {
          select: {
            content: true,
          },
        },
      },
    });

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Error updating domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

