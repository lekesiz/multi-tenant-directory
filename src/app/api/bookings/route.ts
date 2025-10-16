import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingService } from '@/lib/ecommerce';
import { prisma } from '@/lib/prisma';

// GET /api/bookings - Get bookings for company
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
    const productId = searchParams.get('productId');
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

    const bookings = await BookingService.getCompanyBookings(
      parseInt(companyId),
      {
        status,
        productId: productId || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      }
    );

    return NextResponse.json({
      success: true,
      bookings,
    });

  } catch (error) {
    console.error('Get bookings API error:', error);
    return NextResponse.json(
      { error: 'Failed to get bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      productId,
      customerName,
      customerEmail,
      customerPhone,
      startTime,
      endTime,
      notes,
      price,
    } = data;

    if (!productId || !customerName || !customerEmail || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await BookingService.createBooking({
      productId,
      customerName,
      customerEmail,
      customerPhone,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes,
      price: price ? Math.round(price * 100) : undefined, // Convert to cents
      paymentStatus: 'pending',
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking created successfully',
    });

  } catch (error) {
    console.error('Create booking API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not available')) {
        return NextResponse.json(
          { error: 'Time slot not available' },
          { status: 409 }
        );
      }
      if (error.message.includes('not enabled')) {
        return NextResponse.json(
          { error: 'Booking not enabled for this product' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}