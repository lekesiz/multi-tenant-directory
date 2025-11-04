import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenant, getDomainId } from '@/lib/api-guard';
import { requireAdmin } from '@/lib/auth-guard';
import { z } from 'zod';

// Validation schema for updating a company (all fields optional)
// Relaxed validation to be more forgiving with user input
const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  googlePlaceId: z.string().optional().nullable(),
  address: z.string().optional().nullable().transform(v => v?.trim() || null),
  city: z.string().optional().nullable().transform(v => v?.trim() || null),
  postalCode: z.string().optional().nullable().transform(v => v?.trim() || null), // Accept any format
  phone: z.string().optional().nullable().transform(v => v?.trim() || null),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  website: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  latitude: z.union([z.number().min(-90).max(90), z.string()]).optional().nullable(),
  longitude: z.union([z.number().min(-180).max(180), z.string()]).optional().nullable(),
  categories: z.array(z.string()).optional().nullable(),
  logoUrl: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  coverImageUrl: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  siren: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  siret: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  legalForm: z.string().optional().nullable().or(z.literal('')).transform(v => v === '' ? null : v),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewCount: z.number().min(0).optional().nullable(),
  businessHours: z.any().optional().nullable(),
});

// GET /api/companies/[id] - Şirket detayını getir
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve tenant
    const tenant = await resolveTenant(request);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant domain' },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const companyId = parseInt(id);

    // Şirketi getir
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        content: {
          where: {
            domainId: getDomainId(tenant),
          },
        },
        reviews: {
          orderBy: {
            reviewDate: 'desc',
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Bu domain'de görünür mü kontrol et
    const visibleContent = company.content.find(
      (c) => c.domainId === getDomainId(tenant) && c.isVisible
    );

    if (!visibleContent) {
      return NextResponse.json(
        { error: 'Company not available on this domain' },
        { status: 403 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    logger.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Şirketi güncelle (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input data
    const validation = updateCompanySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    // Convert latitude/longitude strings to floats with NaN validation
    const updateData: any = { ...validation.data };
    if (validation.data.latitude !== undefined) {
      if (validation.data.latitude === '' || validation.data.latitude === null) {
        updateData.latitude = null;
      } else if (typeof validation.data.latitude === 'string') {
        const lat = parseFloat(validation.data.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          return NextResponse.json(
            { error: 'Invalid latitude value. Must be between -90 and 90' },
            { status: 400 }
          );
        }
        updateData.latitude = lat;
      }
    }

    if (validation.data.longitude !== undefined) {
      if (validation.data.longitude === '' || validation.data.longitude === null) {
        updateData.longitude = null;
      } else if (typeof validation.data.longitude === 'string') {
        const lng = parseFloat(validation.data.longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          return NextResponse.json(
            { error: 'Invalid longitude value. Must be between -180 and 180' },
            { status: 400 }
          );
        }
        updateData.longitude = lng;
      }
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    return NextResponse.json(company);
  } catch (error) {
    logger.error('Error updating company:', error);

    // Provide more specific error messages
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'A company with this slug already exists' },
        { status: 409 }
      );
    }

    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Şirketi sil (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await context.params;
    const companyId = parseInt(id);

    await prisma.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    logger.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

