import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProductService } from '@/lib/ecommerce';
import { prisma } from '@/lib/prisma';

// GET /api/products - Get products for company
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type') as any;
    const status = searchParams.get('status') as any;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const products = await ProductService.getCompanyProducts(
      parseInt(companyId),
      {
        type,
        status,
        category: category || undefined,
        search: search || undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      }
    );

    return NextResponse.json({
      success: true,
      products,
    });

  } catch (error) {
    logger.error('Get products API error:', error);
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      companyId,
      name,
      description,
      price,
      compareAtPrice,
      type,
      sku,
      status,
      images,
      specifications,
      isBookingEnabled,
      bookingDuration,
      maxAdvanceBooking,
      allowOnlineBooking,
      inventoryTracked,
      stockQuantity,
      lowStockThreshold,
      categories,
      tags,
      seoTitle,
      seoDescription,
    } = data;

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
        { error: 'Unauthorized to manage this company' },
        { status: 403 }
      );
    }

    const product = await ProductService.createProduct(parseInt(companyId), {
      name,
      description,
      price: Math.round(price * 100), // Convert to cents
      compareAtPrice: compareAtPrice ? Math.round(compareAtPrice * 100) : undefined,
      type,
      sku,
      status,
      images,
      specifications,
      isBookingEnabled,
      bookingDuration,
      maxAdvanceBooking,
      allowOnlineBooking,
      inventoryTracked,
      stockQuantity,
      lowStockThreshold,
      categories,
      tags,
      seoTitle,
      seoDescription,
    });

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (error) {
    logger.error('Create product API error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}