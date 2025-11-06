import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const company = await prisma.company.findUnique({
      where: { id: 111 },
      select: {
        id: true,
        name: true,
        slug: true,
        googlePlaceId: true,
      }
    });
    
    const reviews = await prisma.review.findMany({
      where: {
        companyId: 111,
      },
      select: {
        id: true,
        authorName: true,
        rating: true,
        isApproved: true,
        isActive: true,
      },
      take: 20,
    });
    
    return NextResponse.json({
      success: true,
      company,
      reviewsCount: reviews.length,
      reviews,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    }, { status: 500 });
  }
}
