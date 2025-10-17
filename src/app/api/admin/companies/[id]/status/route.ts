import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await props.params;
    const companyId = parseInt(params.id, 10);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    // Update company status
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      company,
      message: isActive ? 'Entreprise activée' : 'Entreprise désactivée',
    });
  } catch (error) {
    console.error('Error updating company status:', error);
    return NextResponse.json(
      { error: 'Failed to update company status' },
      { status: 500 }
    );
  }
}
