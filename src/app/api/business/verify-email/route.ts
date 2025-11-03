import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { verifyToken, deleteVerificationToken } from '@/lib/verification';


// Verify email with token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      );
    }

    // Verify the token using our new verification system
    const verification = await verifyToken(token, 'email_verification');

    if (!verification.valid) {
      return NextResponse.redirect(
        new URL(`/business/login?message=invalid-token&error=${encodeURIComponent(verification.error || 'Token invalide')}`, request.url)
      );
    }

    // Find business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: verification.email },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (businessOwner.isEmailVerified && businessOwner.emailVerified) {
      // Already verified, delete token and redirect to login
      if (verification.tokenId) {
        await deleteVerificationToken(verification.tokenId);
      }
      return NextResponse.redirect(
        new URL('/business/login?message=already-verified', request.url)
      );
    }

    // Update email verification status
    await prisma.businessOwner.update({
      where: { id: businessOwner.id },
      data: {
        emailVerified: new Date(),
        isEmailVerified: true,
      },
    });

    // Delete the verification token after successful verification
    if (verification.tokenId) {
      await deleteVerificationToken(verification.tokenId);
    }

    logger.info('Email verified successfully', { email: businessOwner.email });

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/business/login?message=email-verified', request.url)
    );
  } catch (error) {
    logger.error('Email verification error', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

// Resend verification email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Find business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email },
    });

    if (!businessOwner) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe, un lien de vérification a été envoyé.',
      });
    }

    if (businessOwner.isEmailVerified && businessOwner.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Cet email est déjà vérifié.',
      });
    }

    // Generate new verification token and send email
    if (process.env.RESEND_API_KEY) {
      try {
        const { createEmailVerificationToken } = await import('@/lib/verification');
        const verificationTokenRecord = await createEmailVerificationToken(businessOwner.email);
        const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/business/verify-email?token=${verificationTokenRecord.token}`;

        await sendVerificationEmail({
          to: businessOwner.email,
          verificationUrl,
          firstName: businessOwner.firstName ?? undefined,
        });
        logger.info('Verification email resent', { email: businessOwner.email });
      } catch (error) {
        logger.error('Error sending verification email', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un lien de vérification a été envoyé.',
    });
  } catch (error) {
    logger.error('Resend verification error', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi' },
      { status: 500 }
    );
  }
}