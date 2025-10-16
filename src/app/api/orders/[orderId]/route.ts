import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OrderService } from '@/lib/ecommerce';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[orderId] - Get single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        company: {
          select: { name: true, slug: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, type: true, images: true }
            },
            variant: {
              select: { name: true, attributes: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('Get order API error:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[orderId] - Update order status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { orderId } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { status, trackingNumber } = data;

    // Get order to verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        company: {
          include: {
            ownerships: {
              include: { owner: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify user owns the company
    const userOwnership = order.company.ownerships.find(
      ownership => ownership.owner.email === session.user.email
    );

    if (!userOwnership) {
      return NextResponse.json(
        { error: 'Unauthorized to update this order' },
        { status: 403 }
      );
    }

    const updatedOrder = await OrderService.updateOrderStatus(orderId, status, trackingNumber);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully',
    });

  } catch (error) {
    console.error('Update order API error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}