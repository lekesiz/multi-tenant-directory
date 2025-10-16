import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/email';

// Validation schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if email already exists
    const existingUser = await prisma.businessOwner.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cette adresse email' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Create business owner
    const businessOwner = await prisma.businessOwner.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    
    // Send verification email
    if (process.env.RESEND_API_KEY) {
      try {
        const verificationToken = Buffer.from(`${businessOwner.id}:${Date.now()}`).toString('base64');
        const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/business/verify-email?token=${verificationToken}`;
        
        await sendVerificationEmail({
          to: businessOwner.email,
          verificationUrl,
          firstName: businessOwner.firstName || undefined,
        });
        console.log('✅ Verification email sent to:', businessOwner.email);
      } catch (error) {
        console.error('⚠️ Error sending verification email:', error);
        // Don't fail the registration if email fails
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
      user: businessOwner,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    );
  }
}