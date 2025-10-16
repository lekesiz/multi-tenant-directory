import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user still exists and is active
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        isEmailVerified: true,
      },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: businessOwner.id,
        email: businessOwner.email,
        type: 'business_owner',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      token: newToken,
      expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur de rafraîchissement du token' },
      { status: 500 }
    );
  }
}