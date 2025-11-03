import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch business hours
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Get the user's company
    const ownership = await prisma.companyOwnership.findFirst({
      where: {
        ownerId: session.user.id,
      },
      include: {
        company: {
          include: {
            hours: true,
          },
        },
      },
    });

    if (!ownership) {
      return NextResponse.json({ weeklySchedule: null, specialHours: [] });
    }

    const businessHours = ownership.company.hours;

    if (!businessHours) {
      return NextResponse.json({ weeklySchedule: null, specialHours: [] });
    }

    // Convert individual day fields to weeklySchedule format
    const weeklySchedule = {
      monday: businessHours.monday || { isOpen: false, openTime: '09:00', closeTime: '18:00' },
      tuesday: businessHours.tuesday || { isOpen: false, openTime: '09:00', closeTime: '18:00' },
      wednesday: businessHours.wednesday || { isOpen: false, openTime: '09:00', closeTime: '18:00' },
      thursday: businessHours.thursday || { isOpen: false, openTime: '09:00', closeTime: '18:00' },
      friday: businessHours.friday || { isOpen: false, openTime: '09:00', closeTime: '18:00' },
      saturday: businessHours.saturday || { isOpen: false, openTime: '09:00', closeTime: '18:00' },
      sunday: businessHours.sunday || { isOpen: false, openTime: '09:00', closeTime: '18:00' },
    };

    return NextResponse.json({
      weeklySchedule,
      specialHours: businessHours.specialHours || [],
    });
  } catch (error) {
    logger.error('Error fetching hours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT: Update weekly schedule
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { weeklySchedule } = await req.json();

    if (!weeklySchedule) {
      return NextResponse.json(
        { error: 'Horaires requis' },
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

    // Upsert business hours - store each day separately
    await prisma.businessHours.upsert({
      where: {
        companyId: ownership.companyId,
      },
      update: {
        monday: weeklySchedule.monday,
        tuesday: weeklySchedule.tuesday,
        wednesday: weeklySchedule.wednesday,
        thursday: weeklySchedule.thursday,
        friday: weeklySchedule.friday,
        saturday: weeklySchedule.saturday,
        sunday: weeklySchedule.sunday,
      },
      create: {
        companyId: ownership.companyId,
        monday: weeklySchedule.monday,
        tuesday: weeklySchedule.tuesday,
        wednesday: weeklySchedule.wednesday,
        thursday: weeklySchedule.thursday,
        friday: weeklySchedule.friday,
        saturday: weeklySchedule.saturday,
        sunday: weeklySchedule.sunday,
        specialHours: [],
      },
    });

    // Also sync to Company.businessHours for backward compatibility
    await prisma.company.update({
      where: { id: ownership.companyId },
      data: {
        businessHours: weeklySchedule,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error updating hours:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
