import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const specialHourSchema = z.object({
  date: z.string().min(1),
  reason: z.string().min(3),
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

// POST: Add special hour
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const result = specialHourSchema.safeParse(body);
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

    // Get or create business hours
    let businessHours = await prisma.businessHours.findUnique({
      where: {
        companyId: ownership.companyId,
      },
    });

    if (!businessHours) {
      businessHours = await prisma.businessHours.create({
        data: {
          companyId: ownership.companyId,
          specialHours: [],
        },
      });
    }

    // Add new special hour
    const specialHours = (businessHours.specialHours as any[]) || [];
    const newSpecialHour = {
      id: crypto.randomUUID(),
      ...result.data,
    };

    await prisma.businessHours.update({
      where: {
        companyId: ownership.companyId,
      },
      data: {
        specialHours: [...specialHours, newSpecialHour],
      },
    });

    return NextResponse.json({ specialHour: newSpecialHour });
  } catch (error) {
    logger.error('Error adding special hour:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
