import { NextResponse } from 'next/server';
import { CartService } from '@/lib/ecommerce';
import { cookies } from 'next/headers';

// GET session ID from cookies
async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('cart_session')?.value;
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const sessionId = await getSessionId();
    const { itemId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No cart session found' },
        { status: 400 }
      );
    }

    await CartService.removeFromCart(sessionId, itemId);
    const cart = await CartService.getCart(sessionId);

    return NextResponse.json({
      success: true,
      cart,
      message: 'Item removed from cart',
    });

  } catch (error) {
    console.error('Remove from cart API error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}