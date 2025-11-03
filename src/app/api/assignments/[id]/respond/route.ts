import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, declineReason, notes } = await request.json();

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const assignment = await prisma.leadAssignment.findUnique({
      where: { id },
      include: {
        lead: true,
        company: true
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const responseTime = Math.floor(
      (Date.now() - assignment.offeredAt.getTime()) / 1000
    );

    // Update assignment
    const updatedAssignment = await prisma.leadAssignment.update({
      where: { id },
      data: {
        status,
        respondedAt: new Date(),
        responseTime,
        declineReason: status === 'declined' ? declineReason : null,
        notes
      }
    });

    // If accepted, update lead status
    if (status === 'accepted') {
      await prisma.lead.update({
        where: { id: assignment.leadId },
        data: { status: 'won' }
      });

      // Cancel other assignments for this lead
      await prisma.leadAssignment.updateMany({
        where: {
          leadId: assignment.leadId,
          id: { not: id },
          status: 'sent'
        },
        data: { status: 'expired' }
      });
    }

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      message: `Demande ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès`
    });

  } catch (error) {
    console.error('Assignment response error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réponse à l\'assignment' },
      { status: 500 }
    );
  }
}
