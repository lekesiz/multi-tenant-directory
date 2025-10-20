import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if business owner exists
    const owner = await prisma.businessOwner.findUnique({
      where: { id },
      include: {
        ownerships: {
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
    const hasActiveCompanies = owner.ownerships.some(o => o.company.isActive);
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
    console.error('Error deleting business owner:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

