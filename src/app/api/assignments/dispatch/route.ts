import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLeadNotificationEmail } from '@/lib/email-templates';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Get pending assignments for this lead
    const assignments = await prisma.leadAssignment.findMany({
      where: { 
        leadId: leadId, 
        status: 'sent' 
      },
      include: {
        company: {
          include: {
            ownerships: {
              include: {
                owner: true
              }
            }
          }
        },
        lead: {
          include: {
            category: true
          }
        }
      }
    });

    if (assignments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune assignation en attente pour ce prospect'
      });
    }

    // Send email notifications to companies
    const notificationResults = await Promise.allSettled(
      assignments.map(async (assignment) => {
        const companyOwner = assignment.company.ownerships.find(o => o.role === 'owner')?.owner;
        
        if (companyOwner?.email) {
          const emailSent = await sendLeadNotificationEmail(companyOwner.email, {
            lead: {
              id: assignment.lead.id,
              postalCode: assignment.lead.postalCode,
              phone: assignment.lead.phone,
              email: assignment.lead.email,
              note: assignment.lead.note,
              category: assignment.lead.category,
              createdAt: assignment.lead.createdAt
            },
            company: {
              id: assignment.company.id,
              name: assignment.company.name,
              email: companyOwner.email
            },
            assignment: {
              id: assignment.id,
              score: assignment.score,
              rank: assignment.rank
            }
          });

          // Log communication
          await prisma.communicationLog.create({
            data: {
              leadId: assignment.leadId,
              companyId: assignment.companyId,
              channel: 'email',
              templateId: 'lead_notification',
              status: emailSent ? 'sent' : 'failed',
              recipient: companyOwner.email,
              subject: `Nouveau prospect pour ${assignment.company.name}`,
              content: `Prospect ${assignment.lead.id} - Score: ${assignment.score}/100`,
              sentAt: emailSent ? new Date() : null,
              failedAt: !emailSent ? new Date() : null,
              errorMessage: !emailSent ? 'Email sending failed' : null
            }
          });

          return { assignmentId: assignment.id, emailSent, companyEmail: companyOwner.email };
        } else {
          logger.warn(`No owner email found for company ${assignment.companyId}`);
          return { assignmentId: assignment.id, emailSent: false, companyEmail: null };
        }
      })
    );

    // Update lead status to dispatched
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'dispatched' }
    });

    const successfulNotifications = notificationResults.filter(r => 
      r.status === 'fulfilled' && r.value.emailSent
    ).length;

    logger.info(`Lead ${leadId} dispatched to ${assignments.length} companies, ${successfulNotifications} notifications sent`);

    return NextResponse.json({
      success: true,
      assignments: assignments.length,
      notificationsSent: successfulNotifications,
      message: `Demande distribuée à ${assignments.length} entreprises, ${successfulNotifications} notifications envoyées`
    });

  } catch (error) {
    logger.error('Assignment dispatch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la distribution de la demande' },
      { status: 500 }
    );
  }
}
