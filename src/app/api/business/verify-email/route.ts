import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';

// Generate verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Business owner not found' },
        { status: 404 }
      );
    }

    if (businessOwner.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      );
    }

    // Generate verification token
    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database (you might want to create a VerificationToken model)
    // For now, we'll use a simple approach with customFields or create a new table

    // TODO: Send email with verification link
    const verificationUrl = `${process.env.NEXTAUTH_URL}/business/verify-email?token=${token}&email=${email}`;
    
    console.log('Verification URL:', verificationUrl);
    // await sendEmail({
    //   to: email,
    //   subject: 'Vérifiez votre adresse email',
    //   html: `
    //     <h1>Bienvenue sur notre plateforme!</h1>
    //     <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email:</p>
    //     <a href="${verificationUrl}">Vérifier mon email</a>
    //     <p>Ce lien expire dans 24 heures.</p>
    //   `,
    // });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

// Verify email with token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    // TODO: Verify token from database
    // For now, we'll just verify the email

    // Find and update business owner
    const businessOwner = await prisma.businessOwner.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}