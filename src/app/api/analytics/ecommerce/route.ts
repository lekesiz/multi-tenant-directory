import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EcommerceAnalytics } from '@/lib/ecommerce';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/ecommerce - Get e-commerce analytics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'month';

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns the company
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: session.user.email },
      include: {
        companies: {
          where: { companyId: parseInt(companyId) }
        }
      }
    });

    if (!businessOwner || businessOwner.companies.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized to view this company analytics' },
        { status: 403 }
      );
    }

    const analytics = await EcommerceAnalytics.getSalesAnalytics(
      parseInt(companyId),
      period
    );

    // Get additional stats
    const totalProducts = await prisma.product.count({
      where: { 
        companyId: parseInt(companyId),
        status: 'active'
      }
    });

    const lowStockProducts = await prisma.product.count({
      where: {
        companyId: parseInt(companyId),
        status: 'active',
        inventoryTracked: true,
        stockQuantity: {
          lte: prisma.product.fields.lowStockThreshold
        }
      }
    });

    const upcomingBookings = await prisma.booking.count({
      where: {
        product: { companyId: parseInt(companyId) },
        status: { in: ['confirmed', 'pending'] },
        startTime: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      }
    });

    return NextResponse.json({
      success: true,
      analytics: {
        ...analytics,
        inventory: {
          totalProducts,
          lowStockProducts,
          upcomingBookings,
        }
      },
      period,
    });

  } catch (error) {
    logger.error('Get e-commerce analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}