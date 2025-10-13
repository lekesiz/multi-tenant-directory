import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await prisma.legalPage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching legal page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal page' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const page = await prisma.legalPage.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error updating legal page:', error);
    return NextResponse.json(
      { error: 'Failed to update legal page' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.legalPage.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting legal page:', error);
    return NextResponse.json(
      { error: 'Failed to delete legal page' },
      { status: 500 }
    );
  }
}

