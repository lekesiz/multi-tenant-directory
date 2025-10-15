import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT: Set photo as primary
export async function PUT(
  req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { photoId } = params;

    // Get the user's company
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Verify photo belongs to this company
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        companyId: ownership.companyId,
      },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo non trouvée' }, { status: 404 });
    }

    // Update all photos for this company to not be primary
    await prisma.photo.updateMany({
      where: {
        companyId: ownership.companyId,
      },
      data: {
        isPrimary: false,
      },
    });

    // Set this photo as primary
    await prisma.photo.update({
      where: {
        id: photoId,
      },
      data: {
        isPrimary: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting primary photo:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
