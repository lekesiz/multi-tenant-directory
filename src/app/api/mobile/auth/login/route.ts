import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceId: z.string().optional(),
  deviceType: z.enum(['ios', 'android']).optional(),
  fcmToken: z.string().optional(), // Firebase Cloud Messaging token
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: validatedData.email },
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                city: true,
                rating: true,
                reviewCount: true,
              },
            },
          },
        },
      },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      businessOwner.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Update device info and FCM token if provided
    if (validatedData.deviceId || validatedData.fcmToken) {
      await prisma.businessOwner.update({
        where: { id: businessOwner.id },
        data: {
          deviceId: validatedData.deviceId,
          deviceType: validatedData.deviceType,
          fcmToken: validatedData.fcmToken,
          lastLoginAt: new Date(),
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: businessOwner.id,
        email: businessOwner.email,
        type: 'business_owner',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Prepare user data for mobile app
    const userData = {
      id: businessOwner.id,
      email: businessOwner.email,
      firstName: businessOwner.firstName,
      lastName: businessOwner.lastName,
      phone: businessOwner.phone,
      subscriptionTier: businessOwner.subscriptionTier,
      subscriptionStatus: businessOwner.subscriptionStatus,
      isEmailVerified: businessOwner.emailVerified ? true : false,
      profileImageUrl: null, // Add this field to BusinessOwner model if needed
      companies: businessOwner.companies.map(ownership => ownership.company),
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData,
      expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
    });

  } catch (error) {
    logger.error('Mobile login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur de connexion' },
      { status: 500 }
    );
  }
}