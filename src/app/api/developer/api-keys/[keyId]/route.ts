import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiKeyService } from '@/lib/api-ecosystem';
import { prisma } from '@/lib/prisma';

// DELETE /api/developer/api-keys/[keyId] - Revoke API key
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { keyId } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const businessOwner = await prisma.businessOwner.findUnique({
      where: { email: session.user.email },
    });

    if (!businessOwner) {
      return NextResponse.json(
        { error: 'Business owner not found' },
        { status: 404 }
      );
    }

    await ApiKeyService.revokeApiKey(businessOwner.id, keyId);

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });

  } catch (error) {
    logger.error('Revoke API key error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}