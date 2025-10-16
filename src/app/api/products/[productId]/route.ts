import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProductService } from '@/lib/ecommerce';
import { prisma } from '@/lib/prisma';

// GET /api/products/[productId] - Get single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        company: {
          select: { name: true, slug: true }
        },
        variants: {
          where: { isActive: true }
        },
        bookings: {
          where: { 
            status: { in: ['confirmed', 'pending'] },
            startTime: { gte: new Date() }
          },
          orderBy: { startTime: 'asc' },
          take: 10
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (error) {
    console.error('Get product API error:', error);
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[productId] - Update product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { productId } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Get product to verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
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

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Verify user owns the company
    const userOwnership = product.company.ownerships.find(
      ownership => ownership.owner.email === session.user.email
    );

    if (!userOwnership) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this product' },
        { status: 403 }
      );
    }

    // Convert price to cents if provided
    if (data.price !== undefined) {
      data.price = Math.round(data.price * 100);
    }
    if (data.compareAtPrice !== undefined) {
      data.compareAtPrice = Math.round(data.compareAtPrice * 100);
    }

    const updatedProduct = await ProductService.updateProduct(productId, data);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });

  } catch (error) {
    console.error('Update product API error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[productId] - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { productId } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get product to verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        company: {
          include: {
            ownerships: {
              include: { owner: true }
            }
          }
        },
        orderItems: true,
        bookings: {
          where: { status: { in: ['confirmed', 'pending'] } }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Verify user owns the company
    const userOwnership = product.company.ownerships.find(
      ownership => ownership.owner.email === session.user.email
    );

    if (!userOwnership) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this product' },
        { status: 403 }
      );
    }

    // Check if product has active orders or bookings
    if (product.orderItems.length > 0 || product.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with active orders or bookings' },
        { status: 400 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Delete product API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}