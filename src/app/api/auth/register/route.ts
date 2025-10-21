import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/emails/send';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Prénom requis').optional(),
  lastName: z.string().min(2, 'Nom requis').optional(),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone } = result.data;

    // Check if user already exists
    const existing = await prisma.businessOwner.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create business owner
    const owner = await prisma.businessOwner.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
      },
    });

    // Send welcome email (don't await - fire and forget)
    sendWelcomeEmail({
      firstName: owner.firstName || undefined,
      email: owner.email,
      unsubscribeToken: owner.unsubscribeToken,
    }).catch((error) => {
      logger.error('[Register] Failed to send welcome email:', error);
      // Don't fail registration if email fails
    });

    // Return success (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: owner.id,
        email: owner.email,
        firstName: owner.firstName,
        lastName: owner.lastName,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}
