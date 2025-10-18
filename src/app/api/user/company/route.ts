import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: session.user.email },
      include: {
        ownerships: {
          include: {
            company: true,
          },
        },
      },
    });

    if (businessOwner && businessOwner.ownerships.length > 0) {
      // Return first company (users typically have one company)
      return NextResponse.json({
        company: businessOwner.ownerships[0].company,
      });
    }

    // Check if user is admin with companies
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user && user.role === 'admin') {
      // Admin can access any company, return first one
      const company = await prisma.company.findFirst();
      return NextResponse.json({ company });
    }

    // No company found
    return NextResponse.json({ company: null });
  } catch (error) {
    console.error('Error fetching user company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

