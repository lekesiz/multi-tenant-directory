import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';


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

    // Decode token
    let businessOwnerId: string;
    let timestampStr: string;
    
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      [businessOwnerId, timestampStr] = decoded.split(':');
      
      // Check if token is expired (24 hours)
      if (Date.now() - parseInt(timestampStr) > 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { error: 'Le lien de vérification a expiré' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 400 }
      );
    }

    // Find business owner
    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: businessOwnerId },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (businessOwner.emailVerified) {
      // Already verified, redirect to login
      return NextResponse.redirect(
        new URL('/business/login?message=already-verified', request.url)
      );
    }

    // Update email verification status
    await prisma.businessOwner.update({
      where: { id: businessOwnerId },
      data: { emailVerified: new Date() },
    });

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/business/login?message=email-verified', request.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);
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

    if (businessOwner.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Cet email est déjà vérifié.',
      });
    }

    // Generate new verification token and send email
    if (process.env.RESEND_API_KEY) {
      try {
        const verificationToken = Buffer.from(`${businessOwner.id}:${Date.now()}`).toString('base64');
        const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/business/verify-email?token=${verificationToken}`;
        
        await sendVerificationEmail({
          to: businessOwner.email,
          verificationUrl,
<<<<<<< HEAD
          firstName: businessOwner.firstName || undefined,
=======
          firstName: businessOwner.firstName ?? undefined,
>>>>>>> a0d8014 (fix: correct timestamp type in email verification route)
        });
        console.log('✅ Verification email resent to:', businessOwner.email);
      } catch (error) {
        console.error('Error sending verification email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un lien de vérification a été envoyé.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi' },
      { status: 500 }
    );
  }
}