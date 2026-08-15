import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { id } = await params;

    // Check if business owner exists
    const owner = await prisma.businessOwner.findUnique({
      where: { id },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!owner) {
      return NextResponse.json(
        { error: 'Propriétaire non trouvé' },
        { status: 404 }
      );
    }

    // Check if owner has active companies
    const hasActiveCompanies = owner.companies.some(o => o.company.isActive);
    if (hasActiveCompanies) {
      return NextResponse.json(
        { error: 'Impossible de supprimer: le propriétaire a des entreprises actives' },
        { status: 400 }
      );
    }

    // Delete business owner (cascade will delete ownerships)
    await prisma.businessOwner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting business owner:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

