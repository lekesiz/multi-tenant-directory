import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().regex(/^\d{5}$/),
});

// GET: Fetch company profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Get the user's first company
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.user.id,
      },
      include: {
        company: true,
      },
    });

    if (!ownership) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const { company } = ownership;

    return NextResponse.json({
      name: company.name,
      email: company.email,
      phone: company.phone,
      website: company.website || '',
      address: company.address || '',
      city: company.city || '',
      postalCode: company.postalCode || '',
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT: Update company profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const result = profileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: result.error.issues },
        { status: 400 }
      );
    }

    // Get the user's company
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!ownership) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    // Update company
    await prisma.company.update({
      where: {
        id: ownership.companyId,
      },
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        website: result.data.website || null,
        address: result.data.address,
        city: result.data.city,
        postalCode: result.data.postalCode,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
