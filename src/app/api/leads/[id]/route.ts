import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TenantResolver } from '@/lib/multi-tenant-core';
import { logger } from '@/lib/logger';

const updateLeadStatusSchema = z.object({
  status: z.enum(['new', 'qualified', 'assigned', 'dispatched', 'won', 'lost', 'spam']),
  notes: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await TenantResolver.resolveTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const { id: leadId } = await params;
    const body = await request.json();
    const validatedData = updateLeadStatusSchema.parse(body);

    // Check if lead exists and belongs to tenant
    const existingLead = await prisma.lead.findFirst({
      where: { 
        id: leadId,
        tenantId: parseInt(tenant.id) 
      }
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update lead status
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: validatedData.status,
        updatedAt: new Date(),
      },
    });

    // Log the status change
    await prisma.communicationLog.create({
      data: {
        leadId: leadId,
        channel: 'admin',
        status: 'sent',
        recipient: 'admin',
        subject: `Lead status updated to ${validatedData.status}`,
        content: validatedData.notes || `Status changed from ${existingLead.status} to ${validatedData.status}`,
        metadata: {
          previousStatus: existingLead.status,
          newStatus: validatedData.status,
          updatedBy: 'admin',
          timestamp: new Date().toISOString()
        },
        sentAt: new Date(),
      },
    });

    logger.info(`Lead ${leadId} status updated from ${existingLead.status} to ${validatedData.status}`);

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      message: `Lead status updated to ${validatedData.status}`
    });

  } catch (error) {
    logger.error('Error updating lead status:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Get lead details with assignments and communication history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await TenantResolver.resolveTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const { id: leadId } = await params;

    const lead = await prisma.lead.findFirst({
      where: { 
        id: leadId,
        tenantId: parseInt(tenant.id) 
      },
      include: {
        category: true,
        assignments: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                website: true,
                address: true,
                postalCode: true,
                companyScore: true,
              }
            }
          },
          orderBy: { rank: 'asc' }
        },
        consentLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get communication history
    const communicationHistory = await prisma.communicationLog.findMany({
      where: { leadId: leadId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      lead: {
        ...lead,
        communicationHistory
      }
    });

  } catch (error) {
    logger.error('Error fetching lead details:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Delete lead (soft delete by marking as spam)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await TenantResolver.resolveTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const { id: leadId } = await params;

    // Check if lead exists and belongs to tenant
    const existingLead = await prisma.lead.findFirst({
      where: { 
        id: leadId,
        tenantId: parseInt(tenant.id) 
      }
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Soft delete by marking as spam
    const deletedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'spam',
        updatedAt: new Date(),
      },
    });

    // Log the deletion
    await prisma.communicationLog.create({
      data: {
        leadId: leadId,
        channel: 'admin',
        status: 'sent',
        recipient: 'admin',
        subject: 'Lead deleted',
        content: `Lead ${leadId} marked as spam and deleted`,
        metadata: {
          action: 'delete',
          deletedBy: 'admin',
          timestamp: new Date().toISOString()
        },
        sentAt: new Date(),
      },
    });

    logger.info(`Lead ${leadId} deleted (marked as spam)`);

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
