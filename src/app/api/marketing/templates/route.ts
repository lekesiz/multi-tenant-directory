import { NextResponse } from 'next/server';
import { authenticateMobileUser } from '@/lib/mobile-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  category: z.enum(['marketing', 'transactional', 'automation']).default('marketing'),
  variables: z.array(z.string()).default([]),
});

// GET - List email templates
export async function GET(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('active');

    const where: any = {
      businessOwnerId: authResult.user.userId,
    };

    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === 'true';

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: [{ lastUsed: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      templates,
    });

  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des templates' },
      { status: 500 }
    );
  }
}

// POST - Create email template
export async function POST(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    const template = await prisma.emailTemplate.create({
      data: {
        businessOwnerId: authResult.user.userId,
        name: validatedData.name,
        subject: validatedData.subject,
        htmlContent: validatedData.htmlContent,
        textContent: validatedData.textContent,
        category: validatedData.category,
        variables: validatedData.variables,
      },
    });

    return NextResponse.json({
      success: true,
      template,
      message: 'Template créé avec succès',
    });

  } catch (error) {
    console.error('Create template error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du template' },
      { status: 500 }
    );
  }
}