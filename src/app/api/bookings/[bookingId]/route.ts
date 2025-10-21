import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingService } from '@/lib/ecommerce';
import { prisma } from '@/lib/prisma';

// GET /api/bookings/[bookingId] - Get single booking
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: { company: true }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });

  } catch (error) {
    logger.error('Get booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to get booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[bookingId] - Update booking status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { bookingId } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { status, notes } = data;

    // Get booking to verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: {
            company: {
              include: {
                ownerships: {
                  include: { owner: true }
                }
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify user owns the company
    const userOwnership = booking.product.company.ownerships.find(
      ownership => ownership.owner.email === session.user.email
    );

    if (!userOwnership) {
      return NextResponse.json(
        { error: 'Unauthorized to update this booking' },
        { status: 403 }
      );
    }

    const updatedBooking = await BookingService.updateBookingStatus(bookingId, status, notes);

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking updated successfully',
    });

  } catch (error) {
    logger.error('Update booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[bookingId] - Cancel booking
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { bookingId } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get booking to verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: {
            company: {
              include: {
                ownerships: {
                  include: { owner: true }
                }
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify user owns the company or is the customer
    const userOwnership = booking.product.company.ownerships.find(
      ownership => ownership.owner.email === session.user.email
    );

    if (!userOwnership && booking.customerEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this booking' },
        { status: 403 }
      );
    }

    // Update booking status to cancelled
    const cancelledBooking = await BookingService.updateBookingStatus(
      bookingId, 
      'cancelled', 
      'Booking cancelled by user'
    );

    return NextResponse.json({
      success: true,
      booking: cancelledBooking,
      message: 'Booking cancelled successfully',
    });

  } catch (error) {
    logger.error('Cancel booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}