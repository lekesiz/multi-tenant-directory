import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  fcmToken: z.string().optional(),
  deviceType: z.enum(['ios', 'android']).optional(),
  notificationSettings: z.object({
    pushNotifications: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    reviewNotifications: z.boolean().optional(),
  }).optional(),
});

// GET - Get user profile
export async function GET(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const businessOwner = await prisma.businessOwner.findUnique({
      where: { id: authResult.user.userId },
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
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const profile = {
      id: businessOwner.id,
      email: businessOwner.email,
      firstName: businessOwner.firstName,
      lastName: businessOwner.lastName,
      phone: businessOwner.phone,
      profileImageUrl: businessOwner.profileImageUrl,
      subscriptionTier: businessOwner.subscriptionTier,
      subscriptionStatus: businessOwner.subscriptionStatus,
      subscriptionEnd: businessOwner.subscriptionEnd,
      isEmailVerified: businessOwner.isEmailVerified,
      trialEnd: businessOwner.trialEnd,
      lastLoginAt: businessOwner.lastLoginAt,
      createdAt: businessOwner.createdAt,
      companies: businessOwner.companies.map(ownership => ownership.company),
      
      // App-specific settings
      deviceType: businessOwner.deviceType,
      notificationSettings: {
        pushNotifications: businessOwner.pushNotifications ?? true,
        emailNotifications: businessOwner.emailNotifications ?? true,
        marketingEmails: businessOwner.marketingEmails ?? false,
        reviewNotifications: businessOwner.reviewNotifications ?? true,
      },
    };

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Get mobile profile error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du profil' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Handle password change if requested
    let hashedPassword: string | undefined;
    if (validatedData.newPassword && validatedData.currentPassword) {
      // Verify current password
      const businessOwner = await prisma.businessOwner.findUnique({
        where: { id: authResult.user.userId },
        select: { password: true },
      });

      if (!businessOwner) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const isValidPassword = await bcrypt.compare(
        validatedData.currentPassword,
        businessOwner.password
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        );
      }

      hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
    }

    // Update profile
    const updateData: any = {};
    
    if (validatedData.firstName !== undefined) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName !== undefined) updateData.lastName = validatedData.lastName;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.profileImageUrl !== undefined) updateData.profileImageUrl = validatedData.profileImageUrl;
    if (validatedData.fcmToken !== undefined) updateData.fcmToken = validatedData.fcmToken;
    if (validatedData.deviceType !== undefined) updateData.deviceType = validatedData.deviceType;
    if (hashedPassword) updateData.password = hashedPassword;
    
    // Update notification settings
    if (validatedData.notificationSettings) {
      const settings = validatedData.notificationSettings;
      if (settings.pushNotifications !== undefined) updateData.pushNotifications = settings.pushNotifications;
      if (settings.emailNotifications !== undefined) updateData.emailNotifications = settings.emailNotifications;
      if (settings.marketingEmails !== undefined) updateData.marketingEmails = settings.marketingEmails;
      if (settings.reviewNotifications !== undefined) updateData.reviewNotifications = settings.reviewNotifications;
    }

    const updatedUser = await prisma.businessOwner.update({
      where: { id: authResult.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImageUrl: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        deviceType: true,
        pushNotifications: true,
        emailNotifications: true,
        marketingEmails: true,
        reviewNotifications: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      profile: updatedUser,
    });

  } catch (error) {
    console.error('Update mobile profile error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}