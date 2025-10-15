import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authBusinessOptions } from '@/lib/auth-business';

// Business hours schema
const dayHoursSchema = z.object({
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  closed: z.boolean(),
}).nullable();

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
      // Return default hours if not set
      return NextResponse.json({
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '12:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true },
        specialHours: [],
        timezone: 'Europe/Paris',
      });
    }

    return NextResponse.json(businessHours);
  } catch (error) {
    console.error('Error fetching business hours:', error);
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
    // Check authentication
    const session = await getServerSession(authBusinessOptions);
    if (!session || session.user.role !== 'business_owner') {
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

    // Check ownership
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

    const body = await request.json();
    const validatedData = businessHoursSchema.parse(body);

    // Update or create business hours
    const businessHours = await prisma.businessHours.upsert({
      where: { companyId },
      update: {
        monday: validatedData.monday,
        tuesday: validatedData.tuesday,
        wednesday: validatedData.wednesday,
        thursday: validatedData.thursday,
        friday: validatedData.friday,
        saturday: validatedData.saturday,
        sunday: validatedData.sunday,
        specialHours: validatedData.specialHours,
        timezone: validatedData.timezone,
      },
      create: {
        companyId,
        monday: validatedData.monday,
        tuesday: validatedData.tuesday,
        wednesday: validatedData.wednesday,
        thursday: validatedData.thursday,
        friday: validatedData.friday,
        saturday: validatedData.saturday,
        sunday: validatedData.sunday,
        specialHours: validatedData.specialHours,
        timezone: validatedData.timezone,
      },
    });

    return NextResponse.json({
      success: true,
      data: businessHours,
    });
  } catch (error) {
    console.error('Error updating business hours:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid business hours data', details: error.errors },
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