import { NextResponse } from 'next/server';
import { CartService } from '@/lib/ecommerce';
import { cookies } from 'next/headers';

// Generate or get session ID from cookies
async function getSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('cart_session')?.value;
  
  if (!sessionId) {
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
  
  return sessionId;
}

// GET /api/cart - Get cart contents
export async function GET() {
  try {
    const sessionId = await getSessionId();
    const cart = await CartService.getCart(sessionId);

    const response = NextResponse.json({
      success: true,
      cart,
    });

    // Set session cookie
    response.cookies.set('cart_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;

  } catch (error) {
    console.error('Get cart API error:', error);
    return NextResponse.json(
      { error: 'Failed to get cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  try {
    const sessionId = await getSessionId();
    const data = await request.json();
    const { productId, variantId, quantity } = data;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    const cartItem = await CartService.addToCart(sessionId, {
      productId,
      variantId,
      quantity: parseInt(quantity),
    });

    const cart = await CartService.getCart(sessionId);

    const response = NextResponse.json({
      success: true,
      cartItem,
      cart,
      message: 'Item added to cart',
    });

    // Set session cookie
    response.cookies.set('cart_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;

  } catch (error) {
    console.error('Add to cart API error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE() {
  try {
    const sessionId = await getSessionId();
    await CartService.clearCart(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Cart cleared',
    });

  } catch (error) {
    console.error('Clear cart API error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}