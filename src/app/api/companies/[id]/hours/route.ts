import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authBusinessOptions } from '@/lib/auth-business';

// Business hours schema - supports both single shift and multiple shifts (split shifts)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const shiftSchema = z.object({
  open: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
  close: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
});

// Legacy format (single shift) or new format (multiple shifts)
const dayHoursSchema = z.union([
  // New format: multiple shifts (split shifts)
  z.object({
    closed: z.boolean(),
    shifts: z.array(shiftSchema).min(1).max(3).optional(), // Max 3 shifts per day
  }),
  // Legacy format: single shift (backwards compatible)
  z.object({
    open: z.string().regex(timeRegex),
    close: z.string().regex(timeRegex),
    closed: z.boolean(),
  }),
  z.null(),
]);

const businessHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
  specialHours: z.array(z.object({
    date: z.string(),
    closed: z.boolean(),
    note: z.string().optional(),
    open: z.string().optional(),
    close: z.string().optional(),
  })).optional(),
  timezone: z.string().default('Europe/Paris'),
});

/**
 * Normalize day hours to new format (with shifts array)
 * Supports both legacy format and new format
 */
function normalizeDayHours(dayData: any) {
  if (!dayData) return null;

  // Already in new format (has shifts array)
  if (dayData.shifts !== undefined) {
    return dayData;
  }

  // Legacy format: convert to new format
  if (dayData.open && dayData.close) {
    return {
      closed: dayData.closed || false,
      shifts: dayData.closed ? [] : [{ open: dayData.open, close: dayData.close }],
    };
  }

  // Closed day
  if (dayData.closed) {
    return { closed: true, shifts: [] };
  }

  return dayData;
}

// GET business hours
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const businessHours = await prisma.businessHours.findUnique({
      where: { companyId },
    });

    if (!businessHours) {
      // Return default hours if not set (new format with shifts support)
      return NextResponse.json({
        monday: { closed: false, shifts: [{ open: '09:00', close: '18:00' }] },
        tuesday: { closed: false, shifts: [{ open: '09:00', close: '18:00' }] },
        wednesday: { closed: false, shifts: [{ open: '09:00', close: '18:00' }] },
        thursday: { closed: false, shifts: [{ open: '09:00', close: '18:00' }] },
        friday: { closed: false, shifts: [{ open: '09:00', close: '18:00' }] },
        saturday: { closed: false, shifts: [{ open: '09:00', close: '12:00' }] },
        sunday: { closed: true, shifts: [] },
        specialHours: [],
        timezone: 'Europe/Paris',
      });
    }

    // Normalize hours to new format (backwards compatible)
    const normalizedHours = {
      ...businessHours,
      monday: normalizeDayHours(businessHours.monday),
      tuesday: normalizeDayHours(businessHours.tuesday),
      wednesday: normalizeDayHours(businessHours.wednesday),
      thursday: normalizeDayHours(businessHours.thursday),
      friday: normalizeDayHours(businessHours.friday),
      saturday: normalizeDayHours(businessHours.saturday),
      sunday: normalizeDayHours(businessHours.sunday),
    };

    return NextResponse.json(normalizedHours);
  } catch (error) {
    logger.error('Error fetching business hours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business hours' },
      { status: 500 }
    );
  }
}

// PUT/POST update business hours
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Try business authentication first, then admin authentication
    let session = await getServerSession(authBusinessOptions);
    let isAdmin = false;

    if (!session) {
      // Try admin authentication
      const { authOptions } = await import('@/lib/auth');
      session = await getServerSession(authOptions);
      isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    // Check ownership for business owners (admins can edit any company)
    if (!isAdmin && session.user.role === 'business_owner') {
      const ownership = await prisma.companyOwnership.findFirst({
        where: {
          companyId,
          ownerId: session.user.id,
        },
      });

      if (!ownership) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this company' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validatedData = businessHoursSchema.parse(body);

    // Update or create business hours
    const businessHours = await prisma.businessHours.upsert({
      where: { companyId },
      update: {
        monday: validatedData.monday || undefined,
        tuesday: validatedData.tuesday || undefined,
        wednesday: validatedData.wednesday || undefined,
        thursday: validatedData.thursday || undefined,
        friday: validatedData.friday || undefined,
        saturday: validatedData.saturday || undefined,
        sunday: validatedData.sunday || undefined,
        specialHours: validatedData.specialHours || undefined,
        timezone: validatedData.timezone,
      },
      create: {
        companyId,
        monday: validatedData.monday || undefined,
        tuesday: validatedData.tuesday || undefined,
        wednesday: validatedData.wednesday || undefined,
        thursday: validatedData.thursday || undefined,
        friday: validatedData.friday || undefined,
        saturday: validatedData.saturday || undefined,
        sunday: validatedData.sunday || undefined,
        specialHours: validatedData.specialHours || undefined,
        timezone: validatedData.timezone,
      },
    });

    // Also sync to Company.businessHours for backward compatibility
    await prisma.company.update({
      where: { id: companyId },
      data: {
        businessHours: {
          monday: validatedData.monday,
          tuesday: validatedData.tuesday,
          wednesday: validatedData.wednesday,
          thursday: validatedData.thursday,
          friday: validatedData.friday,
          saturday: validatedData.saturday,
          sunday: validatedData.sunday,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: businessHours,
    });
  } catch (error) {
    logger.error('Error updating business hours:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid business hours data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update business hours' },
      { status: 500 }
    );
  }
}

export { PUT as POST };