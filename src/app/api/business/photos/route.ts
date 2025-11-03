import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put, del } from '@vercel/blob';

// GET: Fetch all photos for the business owner's company
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Get the user's first company (in real app, would need company selection)
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.user.id,
      },
      include: {
        company: {
          include: {
            photos: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!ownership) {
      return NextResponse.json({ photos: [] });
    }

    return NextResponse.json({ photos: ownership.company.photos });
  } catch (error) {
    logger.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST: Upload new photos
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Get the user's first company
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const formData = await req.formData();
    const files = formData.getAll('photos') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
    }

    // Check total photo limit
    const existingCount = await prisma.photo.count({
      where: { companyId: ownership.companyId },
    });

    if (existingCount + files.length > 50) {
      return NextResponse.json(
        { error: 'Limite de 50 photos atteinte' },
        { status: 400 }
      );
    }

    // Upload files to Vercel Blob
    const uploadedPhotos: any[] = [];

    for (const file of files) {
      const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true,
      });

      const photo = await prisma.photo.create({
        data: {
          url: blob.url,
          companyId: ownership.companyId,
          isPrimary: existingCount === 0 && uploadedPhotos.length === 0, // First photo is primary
        },
      });

      uploadedPhotos.push(photo);
    }

    return NextResponse.json({ photos: uploadedPhotos });
  } catch (error) {
    logger.error('Error uploading photos:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE: Delete selected photos
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { photoIds } = await req.json();

    if (!photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 });
    }

    // Verify ownership
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Get photos to delete (with URL for blob deletion)
    const photos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        companyId: ownership.companyId,
      },
    });

    // Delete from Vercel Blob
    for (const photo of photos) {
      try {
        await del(photo.url);
      } catch (error) {
        logger.error('Error deleting blob:', error);
        // Continue even if blob deletion fails
      }
    }

    // Delete from database
    await prisma.photo.deleteMany({
      where: {
        id: { in: photoIds },
        companyId: ownership.companyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting photos:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
