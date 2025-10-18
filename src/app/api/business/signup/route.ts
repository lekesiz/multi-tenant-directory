import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, businessName, phone } = body;

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
        address: '',
        city: 'Haguenau',
        postalCode: '',
        phone: phone || '',
        isActive: false, // Requires admin approval
        isPremium: false,
        rating: 0,
        reviewCount: 0,
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

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès. En attente d\'approbation.',
      businessOwnerId: businessOwner.id,
      companyId: company.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors de la création du compte',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

