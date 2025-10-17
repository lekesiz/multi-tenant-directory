/**
 * Get companies owned by current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business owner
    const owner = await prisma.businessOwner.findUnique({
      where: { email: session.user.email },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Business owner not found' }, { status: 404 });
    }

    // Get companies owned by this business owner
    const companies = await prisma.company.findMany({
      where: {
        ownerships: {
          some: {
            ownerId: owner.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEnd: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { companies },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Get companies error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
