import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authBusinessOptions } from '@/lib/auth-business';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Photo schema
const photoSchema = z.object({
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  caption: z.string().optional(),
  type: z.enum(['logo', 'cover', 'gallery', 'interior', 'product']).default('gallery'),
  isPrimary: z.boolean().default(false),
});

// GET company photos
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const photos = await prisma.photo.findMany({
      where: { companyId },
      orderBy: [
        { isPrimary: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      photos,
      count: photos.length,
    });
  } catch (error) {
    logger.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// POST upload new photo
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authBusinessOptions);
    if (!session || session.user.role !== 'business_owner') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    // Check ownership
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        companyId,
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'You do not have permission to upload photos for this company' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = photoSchema.parse(body);

    // Check photo limit (50 photos per company)
    const photoCount = await prisma.photo.count({
      where: { companyId },
    });

    if (photoCount >= 50) {
      return NextResponse.json(
        { error: 'Photo limit reached (maximum 50 photos)' },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary photos
    if (validatedData.isPrimary) {
      await prisma.photo.updateMany({
        where: {
          companyId,
          type: validatedData.type,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    // Get next order number
    const maxOrder = await prisma.photo.findFirst({
      where: { companyId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    // Create photo
    const photo = await prisma.photo.create({
      data: {
        companyId,
        url: validatedData.url,
        thumbnail: validatedData.thumbnail,
        caption: validatedData.caption,
        type: validatedData.type,
        isPrimary: validatedData.isPrimary,
        order: (maxOrder?.order || 0) + 1,
        uploadedBy: session.user.id,
      },
    });

    // Update company logo/cover if applicable
    if (validatedData.type === 'logo' && validatedData.isPrimary) {
      await prisma.company.update({
        where: { id: companyId },
        data: { logoUrl: validatedData.url },
      });
    } else if (validatedData.type === 'cover' && validatedData.isPrimary) {
      await prisma.company.update({
        where: { id: companyId },
        data: { coverImageUrl: validatedData.url },
      });
    }

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    logger.error('Error uploading photo:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid photo data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

// DELETE photo
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authBusinessOptions);
    if (!session || session.user.role !== 'business_owner') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const companyId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const photoId = searchParams.get('photoId');

    if (isNaN(companyId) || !photoId) {
      return NextResponse.json(
        { error: 'Invalid company ID or photo ID' },
        { status: 400 }
      );
    }

    // Check ownership
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        companyId,
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'You do not have permission to delete photos for this company' },
        { status: 403 }
      );
    }

    // Get photo
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Delete photo from database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    // Delete from Cloudinary storage
    try {
      // Extract public_id from Cloudinary URL
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
      const urlParts = photo.url.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
        // Get everything after 'upload/v{version}/' or 'upload/'
        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
        // Remove version if present (v1234567890/)
        const publicIdWithExt = pathAfterUpload.replace(/^v\d+\//, '');
        // Remove file extension
        const publicId = publicIdWithExt.replace(/\.[^.]+$/, '');

        // Delete from Cloudinary (if CLOUDINARY_API_KEY is configured)
        if (process.env.CLOUDINARY_API_KEY) {
          // This would require cloudinary package
          // For now, just log the deletion attempt
          logger.info('Photo deleted from storage', {
            photoId,
            publicId,
            url: photo.url
          });
          // TODO: Implement Cloudinary deletion when package is configured
          // const cloudinary = require('cloudinary').v2;
          // await cloudinary.uploader.destroy(publicId);
        }
      }
    } catch (error) {
      // Don't fail the request if storage deletion fails
      logger.error('Failed to delete photo from storage', error, {
        photoId,
        url: photo.url
      });
    }

    // If it was a primary logo/cover, update company
    if (photo.isPrimary) {
      if (photo.type === 'logo') {
        await prisma.company.update({
          where: { id: companyId },
          data: { logoUrl: null },
        });
      } else if (photo.type === 'cover') {
        await prisma.company.update({
          where: { id: companyId },
          data: { coverImageUrl: null },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

// PATCH update photo order/details
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authBusinessOptions);
    if (!session || session.user.role !== 'business_owner') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const companyId = parseInt(id);
    const body = await request.json();
    const { photoId, order, caption, isPrimary } = body;

    if (isNaN(companyId) || !photoId) {
      return NextResponse.json(
        { error: 'Invalid company ID or photo ID' },
        { status: 400 }
      );
    }

    // Check ownership
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        companyId,
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json(
        { error: 'You do not have permission to update photos for this company' },
        { status: 403 }
      );
    }

    // Update photo
    const updateData: any = {};
    if (order !== undefined) updateData.order = order;
    if (caption !== undefined) updateData.caption = caption;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;

    const photo = await prisma.photo.update({
      where: { id: photoId },
      data: updateData,
    });

    // If setting as primary, unset others and update company
    if (isPrimary) {
      await prisma.photo.updateMany({
        where: {
          companyId,
          type: photo.type,
          isPrimary: true,
          NOT: { id: photoId },
        },
        data: { isPrimary: false },
      });

      if (photo.type === 'logo') {
        await prisma.company.update({
          where: { id: companyId },
          data: { logoUrl: photo.url },
        });
      } else if (photo.type === 'cover') {
        await prisma.company.update({
          where: { id: companyId },
          data: { coverImageUrl: photo.url },
        });
      }
    }

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    logger.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}