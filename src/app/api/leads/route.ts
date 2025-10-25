import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { resolveTenant, getDomainId } from '@/lib/api-guard';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

const createLeadSchema = z.object({
  categoryId: z.number().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  note: z.string().optional(),
  budgetBand: z.enum(['low', 'medium', 'high', 'custom']).optional(),
  timeWindow: z.enum(['urgent', 'this_week', 'this_month', 'flexible']).optional(),
  attachments: z.array(z.string().url()).optional(),
  consentFlags: z.object({
    marketing: z.boolean().default(false),
    sharing: z.boolean().default(true), // Required for lead sharing
    calls: z.boolean().default(true),    // Required for phone calls
    dataProcessing: z.boolean().default(true)
  })
});

// Helper function to get category info
function getCategoryInfo(categoryId: number) {
  const categories = {
    1: { id: 1, frenchName: 'Plombier', googleCategory: 'plumber' },
    2: { id: 2, frenchName: 'Électricien', googleCategory: 'electrician' },
    3: { id: 3, frenchName: 'Chauffagiste', googleCategory: 'heating' },
    4: { id: 4, frenchName: 'Menuisier', googleCategory: 'carpenter' },
    5: { id: 5, frenchName: 'Peintre', googleCategory: 'painter' },
    6: { id: 6, frenchName: 'Carreleur', googleCategory: 'tiler' },
    7: { id: 7, frenchName: 'Jardinier', googleCategory: 'gardener' },
    8: { id: 8, frenchName: 'Nettoyage', googleCategory: 'cleaning' }
  };
  return categories[categoryId as keyof typeof categories] || null;
}

export async function POST(request: NextRequest) {
  try {
    logger.info('🚀 Lead creation request started');
    
    // Get host info for debugging
    const host = request.headers.get('host');
    logger.info('🌐 Request host:', { host: host || 'unknown' });
    
    const body = await request.json();
    logger.info('📝 Request body:', body);
    
    const validatedData = createLeadSchema.parse(body);
    logger.info('✅ Validation successful:', validatedData);

    // Resolve tenant using existing pattern
    let tenant;
    let domainId;
    
    try {
      tenant = await resolveTenant(request);
      domainId = getDomainId(tenant);
      logger.info('🏢 Tenant resolved:', { domainId, domainName: tenant.domain.name });
    } catch (error) {
      logger.warn('⚠️ Tenant resolution failed, using fallback:', { error: String(error) });
      // Use first active domain as fallback
      const fallbackDomain = await prisma.domain.findFirst({
        where: { isActive: true },
        select: { id: true, name: true }
      });
      
      if (!fallbackDomain) {
        throw new Error('No active domain found');
      }
      
      domainId = fallbackDomain.id;
      logger.info('🔄 Using fallback domain:', { domainId, domainName: fallbackDomain.name });
    }

    // Check for duplicate phone number in same tenant (last 24 hours)
    const existingLead = await prisma.lead.findFirst({
      where: {
        tenantId: domainId,
        phone: validatedData.phone,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (existingLead) {
      logger.warn('Duplicate lead attempt:', { phone: validatedData.phone, domainId });
      return NextResponse.json(
        { error: 'Une demande avec ce numéro de téléphone a déjà été soumise aujourd\'hui' },
        { status: 409 }
      );
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        tenantId: domainId,
        categoryId: validatedData.categoryId,
        postalCode: validatedData.postalCode,
        phone: validatedData.phone,
        email: validatedData.email,
        note: validatedData.note,
        budgetBand: validatedData.budgetBand,
        timeWindow: validatedData.timeWindow,
        attachments: validatedData.attachments || [],
        consentFlags: validatedData.consentFlags,
        source: 'web'
      }
    });

    logger.info('✅ Lead created successfully:', { leadId: lead.id, domainId });

    // Log consent
    await prisma.consentLog.create({
      data: {
        leadId: lead.id,
        channel: 'web',
        textHash: Buffer.from(JSON.stringify(validatedData.consentFlags)).toString('base64'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        consentType: 'sharing'
      }
    });

    logger.info('✅ Consent logged successfully');

    // Trigger AI matching (async) - will be implemented
    // await triggerAIMatching(lead.id);

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Demande créée avec succès. Nous vous contacterons bientôt.'
    });


  } catch (error) {
    logger.error('❌ Lead creation error:', error);
    
    if (error instanceof z.ZodError) {
      logger.error('❌ Validation error:', error.issues);
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }
    
    // Check if it's a tenant resolution error
    if (error instanceof Error && error.message.includes('Domain')) {
      logger.error('❌ Tenant resolution error:', error.message);
      return NextResponse.json(
        { error: 'Configuration du domaine invalide' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Resolve tenant using existing pattern
    const tenant = await resolveTenant(request);
    const domainId = getDomainId(tenant);
    logger.info('🔍 Getting leads for domain:', { domainId, domainName: tenant.domain.name });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'new';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause based on status filter
    const whereClause: any = {
      tenantId: domainId
    };
    
    // Only add status filter if not requesting all leads
    if (status !== 'all') {
      whereClause.status = status;
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        category: true,
        assignments: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true
              }
            }
          },
          orderBy: { rank: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.lead.count({
      where: whereClause
    });

    logger.info('✅ Leads retrieved:', { count: leads.length, total, status });

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });


  } catch (error) {
    logger.error('❌ Get leads error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}
