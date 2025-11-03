import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OrderService } from '@/lib/ecommerce';
import { prisma } from '@/lib/prisma';

// GET /api/orders - Get orders for company
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
    const status = searchParams.get('status') as any;
    const customerEmail = searchParams.get('customerEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

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
        { error: 'Unauthorized to view this company data' },
        { status: 403 }
      );
    }

    const orders = await OrderService.getCompanyOrders(
      parseInt(companyId),
      {
        status,
        customerEmail: customerEmail || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      }
    );

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error) {
    logger.error('Get orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      companyId,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      billingAddress,
      items,
      shippingCost,
      taxAmount,
      discountAmount,
      couponCode,
      notes,
    } = data;

    if (!companyId || !customerEmail || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert prices to cents
    const processedItems = items.map((item: any) => ({
      ...item,
      price: Math.round(item.price * 100)
    }));

    const order = await OrderService.createOrder({
      companyId: parseInt(companyId),
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      billingAddress,
      items: processedItems,
      shippingCost: shippingCost ? Math.round(shippingCost * 100) : undefined,
      taxAmount: taxAmount ? Math.round(taxAmount * 100) : undefined,
      discountAmount: discountAmount ? Math.round(discountAmount * 100) : undefined,
      couponCode,
      notes,
    });

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully',
    });

  } catch (error) {
    logger.error('Create order API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Insufficient stock')) {
        return NextResponse.json(
          { error: 'Insufficient stock for some items' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}