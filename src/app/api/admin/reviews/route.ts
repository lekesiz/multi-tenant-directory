import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Review filter schema
const filterSchema = z.object({
  companyId: z.number().optional(),
  isApproved: z.boolean().optional(),
  source: z.enum(['google', 'manual']).optional(),
  rating: z.number().min(1).max(5).optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

// GET reviews with filters
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = filterSchema.parse({
      companyId: searchParams.get('companyId') ? parseInt(searchParams.get('companyId')!) : undefined,
      isApproved: searchParams.get('isApproved') ? searchParams.get('isApproved') === 'true' : undefined,
      source: searchParams.get('source') || undefined,
      rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    });

    // Build where clause
    const where: any = {};
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.isApproved !== undefined) where.isApproved = filters.isApproved;
    if (filters.source) where.source = filters.source;
    if (filters.rating) where.rating = filters.rating;

    // Get total count
    const totalCount = await prisma.review.count({ where });

    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Approve/Reject review
export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewId, isApproved } = body;

    if (!reviewId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing reviewId or isApproved' },
        { status: 400 }
      );
    }

    // Update review
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
      include: {
        company: true,
      },
    });

    // Update company review count and rating
    const reviews = await prisma.review.findMany({
      where: {
        companyId: review.companyId,
        isApproved: true,
      },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    await prisma.company.update({
      where: { id: review.companyId },
      data: {
        reviewCount: reviews.length,
        rating: avgRating,
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// Delete review
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Missing review ID' },
        { status: 400 }
      );
    }

    // Get review before deletion
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Delete review
    await prisma.review.delete({
      where: { id: parseInt(reviewId) },
    });

    // Update company stats
    const reviews = await prisma.review.findMany({
      where: {
        companyId: review.companyId,
        isApproved: true,
      },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    await prisma.company.update({
      where: { id: review.companyId },
      data: {
        reviewCount: reviews.length,
        rating: avgRating,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}