import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * POST /api/domains/[id]/companies
 * Assign companies to a domain
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const domainId = parseInt(id, 10);

    if (isNaN(domainId)) {
      return NextResponse.json({ error: 'Invalid domain ID' }, { status: 400 });
    }

    const body = await request.json();
    const { companyIds, isVisible = true } = body;

    if (!Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        { error: 'Company IDs are required' },
        { status: 400 }
      );
    }

    // Verify domain exists
    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Create or update CompanyContent records
    const results = await Promise.all(
      companyIds.map(async (companyId: number) => {
        // Check if company exists
        const company = await prisma.company.findUnique({
          where: { id: companyId },
        });

        if (!company) {
          logger.warn(`Company ${companyId} not found, skipping`);
          return null;
        }

        // Check if assignment already exists
        const existing = await prisma.companyContent.findFirst({
          where: {
            companyId: companyId,
            domainId: domainId,
          },
        });

        if (existing) {
          // Update visibility
          return await prisma.companyContent.update({
            where: { id: existing.id },
            data: { isVisible },
          });
        } else {
          // Create new assignment
          return await prisma.companyContent.create({
            data: {
              companyId: companyId,
              domainId: domainId,
              isVisible: isVisible,
            },
          });
        }
      })
    );

    // Filter out null results (companies not found)
    const successfulAssignments = results.filter((r) => r !== null);

    logger.info(
      `Assigned ${successfulAssignments.length} companies to domain ${domain.name}`
    );

    return NextResponse.json({
      success: true,
      count: successfulAssignments.length,
      message: `${successfulAssignments.length} companies assigned successfully`,
    });
  } catch (error) {
    logger.error('Error assigning companies to domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/domains/[id]/companies
 * Remove companies from a domain
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const domainId = parseInt(id, 10);

    if (isNaN(domainId)) {
      return NextResponse.json({ error: 'Invalid domain ID' }, { status: 400 });
    }

    const body = await request.json();
    const { companyIds } = body;

    if (!Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        { error: 'Company IDs are required' },
        { status: 400 }
      );
    }

    // Delete CompanyContent records
    const result = await prisma.companyContent.deleteMany({
      where: {
        domainId: domainId,
        companyId: {
          in: companyIds,
        },
      },
    });

    logger.info(
      `Removed ${result.count} companies from domain ${domainId}`
    );

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} companies removed successfully`,
    });
  } catch (error) {
    logger.error('Error removing companies from domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/domains/[id]/companies
 * Get companies assigned to a domain
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const domainId = parseInt(id, 10);

    if (isNaN(domainId)) {
      return NextResponse.json({ error: 'Invalid domain ID' }, { status: 400 });
    }

    const companies = await prisma.companyContent.findMany({
      where: {
        domainId: domainId,
      },
      include: {
        company: {
          include: {
            companyCategories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: companies.length,
      companies: companies.map((cc) => ({
        ...cc.company,
        isVisible: cc.isVisible,
      })),
    });
  } catch (error) {
    logger.error('Error fetching domain companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
