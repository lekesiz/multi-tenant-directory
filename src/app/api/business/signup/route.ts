import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createEmailVerificationToken } from '@/lib/verification';
import { sendVerificationEmail } from '@/lib/email';
import { validateRecaptcha } from '@/lib/recaptcha';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, businessName, phone, recaptchaToken } = body;

    // Verify reCAPTCHA token
    const recaptchaValidation = await validateRecaptcha(recaptchaToken, 'register', 0.5);
    if (!recaptchaValidation.valid) {
      logger.warn('reCAPTCHA validation failed', {
        email,
        error: recaptchaValidation.error,
        score: recaptchaValidation.score,
      });
      return NextResponse.json(
        {
          error: 'Vérification de sécurité échouée. Veuillez réessayer.',
          details: recaptchaValidation.error,
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !email || !password || !businessName) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check if email already exists
    const existingOwner = await prisma.businessOwner.findUnique({
      where: { email },
    });

    if (existingOwner) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create business owner
    const businessOwner = await prisma.businessOwner.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone || null,
      },
    });

    // Create company profile
    const company = await prisma.company.create({
      data: {
        name: businessName,
        slug: businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        city: 'Haguenau',
        ...(phone && { phone }),
        isActive: false, // Requires admin approval
        categories: [],
      },
    });

    // Create ownership relationship
    await prisma.companyOwnership.create({
      data: {
        ownerId: businessOwner.id,
        companyId: company.id,
        role: 'owner',
      },
    });

    // Create email verification token and send verification email
    let verificationEmailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const verificationTokenRecord = await createEmailVerificationToken(email);
        const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/business/verify-email?token=${verificationTokenRecord.token}`;

        await sendVerificationEmail({
          to: email,
          verificationUrl,
          firstName: firstName || undefined,
        });

        verificationEmailSent = true;
        logger.info('Verification email sent', { email, businessOwnerId: businessOwner.id });
      } catch (error) {
        logger.error('Error sending verification email', error);
        // Don't fail registration if email fails - user can resend later
      }
    }

    return NextResponse.json({
      success: true,
      message: verificationEmailSent
        ? 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.'
        : 'Compte créé avec succès. En attente d\'approbation.',
      businessOwnerId: businessOwner.id,
      companyId: company.id,
      requiresEmailVerification: !verificationEmailSent,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors de la création du compte',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

