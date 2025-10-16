import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE: Remove special hour
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    // Get the user's company
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Get business hours
    const businessHours = await prisma.businessHours.findUnique({
      where: {
        companyId: ownership.companyId,
      },
    });

    if (!businessHours) {
      return NextResponse.json({ error: 'Horaires non trouvés' }, { status: 404 });
    }

    // Remove special hour
    const specialHours = (businessHours.specialHours as any[]) || [];
    const updatedSpecialHours = specialHours.filter((h: any) => h.id !== id);

    await prisma.businessHours.update({
      where: {
        companyId: ownership.companyId,
      },
      data: {
        specialHours: updatedSpecialHours,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting special hour:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
