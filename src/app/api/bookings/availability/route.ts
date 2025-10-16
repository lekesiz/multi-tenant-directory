import { NextResponse } from 'next/server';
import { BookingService } from '@/lib/ecommerce';

// GET /api/bookings/availability - Get available time slots
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const date = searchParams.get('date');
    const duration = searchParams.get('duration');

    if (!productId || !date) {
      return NextResponse.json(
        { error: 'Product ID and date are required' },
        { status: 400 }
      );
    }

    const requestedDate = new Date(date);
    const slotDuration = duration ? parseInt(duration) : 60; // Default 60 minutes

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
      return NextResponse.json(
        { error: 'Cannot book for past dates' },
        { status: 400 }
      );
    }

    const availableSlots = await BookingService.getAvailableSlots(
      productId,
      requestedDate,
      slotDuration
    );

    return NextResponse.json({
      success: true,
      date: requestedDate.toISOString().split('T')[0],
      duration: slotDuration,
      availableSlots,
      totalSlots: availableSlots.length,
    });

  } catch (error) {
    console.error('Get availability API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not enabled')) {
        return NextResponse.json(
          { error: 'Booking not enabled for this product' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to get availability' },
      { status: 500 }
    );
  }
}