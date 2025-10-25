import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentDomainInfo } from '@/lib/queries/domain';

// Extend global type for mock leads
declare global {
  var mockLeads: any[];
}

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
    const body = await request.json();
    const validatedData = createLeadSchema.parse(body);

    // Always return mock response for now (database not ready)
    console.log('Mock lead creation:', validatedData);
    
    // Create a new mock lead with the submitted data
    const newLead = {
      id: `mock-${Date.now()}`,
      tenantId: 1,
      categoryId: validatedData.categoryId,
      category: validatedData.categoryId ? getCategoryInfo(validatedData.categoryId) : null,
      postalCode: validatedData.postalCode,
      phone: validatedData.phone,
      email: validatedData.email,
      note: validatedData.note,
      budgetBand: validatedData.budgetBand,
      timeWindow: validatedData.timeWindow,
      attachments: validatedData.attachments || [],
      consentFlags: validatedData.consentFlags,
      source: 'web',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignments: []
    };
    
    // Store in a simple in-memory array (will reset on server restart)
    if (!global.mockLeads) {
      global.mockLeads = [];
    }
    global.mockLeads.unshift(newLead); // Add to beginning
    
    return NextResponse.json({
      success: true,
      leadId: newLead.id,
      message: 'Demande créée avec succès. Nous vous contacterons bientôt.'
    });

    // TODO: Uncomment when database is ready
    /*
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      // Mock response when database is not available
      console.log('Mock lead creation:', validatedData);
      return NextResponse.json({
        success: true,
        leadId: `mock-${Date.now()}`,
        message: 'Demande créée avec succès. Nous vous contacterons bientôt.'
      });
    }

    // Get tenant from request
    const { domainData } = await getCurrentDomainInfo();
    if (!domainData) {
      return NextResponse.json(
        { error: 'Invalid domain' },
        { status: 400 }
      );
    }

    // Check for duplicate phone number in same tenant (last 24 hours)
    const existingLead = await prisma.lead.findFirst({
      where: {
        tenantId: domainData.id,
        phone: validatedData.phone,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'Une demande avec ce numéro de téléphone a déjà été soumise aujourd\'hui' },
        { status: 409 }
      );
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        tenantId: domainData.id,
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

    // Trigger AI matching (async) - will be implemented
    // await triggerAIMatching(lead.id);

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Demande créée avec succès. Nous vous contacterons bientôt.'
    });
    */

  } catch (error) {
    console.error('Lead creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
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
    // Always return mock data for now (database not ready)
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'new';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Initialize global mock leads if not exists
    if (!global.mockLeads) {
      global.mockLeads = [
      {
        id: 'mock-lead-1',
        tenantId: 1,
        categoryId: 2, // Électricien
        category: {
          id: 2,
          frenchName: 'Électricien',
          googleCategory: 'electrician'
        },
        postalCode: '67500',
        phone: '0663907527',
        email: 'mikaillekesiz@gmail.com',
        note: 'je cherche peintre.',
        budgetBand: null,
        timeWindow: null,
        attachments: [],
        consentFlags: {
          marketing: false,
          sharing: true,
          calls: true,
          dataProcessing: true
        },
        source: 'web',
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignments: []
      },
      {
        id: 'mock-lead-2',
        tenantId: 1,
        categoryId: 1, // Plombier
        category: {
          id: 1,
          frenchName: 'Plombier',
          googleCategory: 'plumber'
        },
        postalCode: '67000',
        phone: '0612345678',
        email: 'test@example.com',
        note: 'Je cherche un plombier pour réparer une fuite.',
        budgetBand: null,
        timeWindow: null,
        attachments: [],
        consentFlags: {
          marketing: true,
          sharing: true,
          calls: true,
          dataProcessing: true
        },
        source: 'web',
        status: 'assigned',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        assignments: [
          {
            id: 'mock-assignment-1',
            leadId: 'mock-lead-2',
            companyId: 1,
            score: 85,
            rank: 1,
            status: 'sent',
            createdAt: new Date().toISOString(),
            company: {
              id: 1,
              name: 'Plomberie Martin',
              phone: '0612345678',
              email: 'contact@plomberie-martin.fr'
            }
          }
        ]
      }
      ];
    }

    // Filter by status
    const filteredLeads = global.mockLeads.filter(lead => lead.status === status);

    return NextResponse.json({
      leads: filteredLeads,
      pagination: {
        page,
        limit,
        total: filteredLeads.length,
        pages: Math.ceil(filteredLeads.length / limit)
      }
    });

    // TODO: Uncomment when database is ready
    /*
    // Admin only - get leads for tenant
    const { domainData } = await getCurrentDomainInfo();
    if (!domainData) {
      return NextResponse.json(
        { error: 'Invalid domain' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'new';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const leads = await prisma.lead.findMany({
      where: {
        tenantId: domainData.id,
        status
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
      where: {
        tenantId: domainData.id,
        status
      }
    });

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    */

  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}
