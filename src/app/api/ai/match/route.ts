import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchLeadToCompanies } from '@/lib/ai/matching';
import { TenantResolver } from '@/lib/multi-tenant-core';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const tenant = await TenantResolver.resolveTenant(request);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Get lead details
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        category: true,
        domain: true
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Use the new AI matching system
    const matchResults = await matchLeadToCompanies(lead, parseInt(tenant.id));

    if (matchResults.length === 0) {
      logger.warn(`No companies matched for lead ${leadId}`);
      return NextResponse.json({
        success: true,
        matches: [],
        leadId,
        message: 'Aucune entreprise éligible trouvée'
      });
    }

    // Create LeadAssignments in database
    const assignments = await prisma.$transaction(
      matchResults.map((match, index) =>
        prisma.leadAssignment.create({
          data: {
            leadId: lead.id,
            companyId: match.company.id,
            score: match.score,
            rank: index + 1,
            status: 'sent',
          },
        })
      )
    );

    logger.info(`Lead ${leadId} matched with ${assignments.length} companies`);

    return NextResponse.json({
      success: true,
      matches: matchResults.map(match => ({
        companyId: match.company.id,
        companyName: match.company.name,
        score: match.score,
        reasons: match.reasons,
        explanation: match.explanation,
        phone: match.company.phone,
        email: match.company.email
      })),
      assignments: assignments.map(a => ({
        id: a.id,
        companyId: a.companyId,
        score: a.score,
        rank: a.rank
      })),
      leadId
    });

  } catch (error) {
    logger.error('AI matching error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la correspondance des entreprises' },
      { status: 500 }
    );
  }
}
