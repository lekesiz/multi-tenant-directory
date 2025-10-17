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
    const { youtubeVideos } = body;

    if (!Array.isArray(youtubeVideos)) {
      return NextResponse.json(
        { error: 'youtubeVideos must be an array' },
        { status: 400 }
      );
    }

    // Validate YouTube URLs
    if (youtubeVideos.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 videos allowed' },
        { status: 400 }
      );
    }

    // Update company
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { youtubeVideos },
      select: {
        id: true,
        name: true,
        youtubeVideos: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Videos updated successfully',
      company,
    });
  } catch (error) {
    console.error('Error updating videos:', error);
    return NextResponse.json(
      { error: 'Failed to update videos' },
      { status: 500 }
    );
  }
}
