import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCoverImage, generateCoverImageFallback } from '@/lib/image-generation';

export async function POST(
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

    // Fetch company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        categories: true,
        address: true,
        city: true,
        coverImageUrl: true,
        content: {
          select: {
            customDescription: true,
          },
          take: 1,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // If already has cover image, don't overwrite
    if (company.coverImageUrl) {
      return NextResponse.json(
        { error: 'Company already has a cover image', hasExisting: true },
        { status: 400 }
      );
    }

    // Prepare image generation params
    const imageParams = {
      companyName: company.name,
      category: company.categories?.[0] || 'business',
      description: company.content?.[0]?.customDescription,
      city: company.city,
    };

    console.log('🎨 Generating cover image for:', company.name);

    // Try to generate image using Replicate (Flux model)
    let imageUrl = await generateCoverImage(imageParams);

    // Fallback to Unsplash if generation fails
    if (!imageUrl) {
      console.log('⚠️ Replicate failed, trying Unsplash fallback...');
      imageUrl = await generateCoverImageFallback(imageParams);
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate cover image. Please try again later.' },
        { status: 500 }
      );
    }

    // Update company with generated image
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { coverImageUrl: imageUrl },
      select: {
        id: true,
        name: true,
        coverImageUrl: true,
      },
    });

    console.log('✅ Cover image generated and saved for:', company.name);

    return NextResponse.json({
      success: true,
      message: 'Cover image generated successfully',
      imageUrl,
      company: updatedCompany,
    });
  } catch (error) {
    console.error('Error generating cover image:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover image' },
      { status: 500 }
    );
  }
}
