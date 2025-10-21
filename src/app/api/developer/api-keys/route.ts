import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiKeyService } from '@/lib/api-ecosystem';
import { prisma } from '@/lib/prisma';

// GET /api/developer/api-keys - Get API keys for business owner
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
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

    const apiKeys = await ApiKeyService.getApiKeys(businessOwner.id);

    return NextResponse.json({
      success: true,
      apiKeys,
    });

  } catch (error) {
    logger.error('Get API keys error:', error);
    return NextResponse.json(
      { error: 'Failed to get API keys' },
      { status: 500 }
    );
  }
}

// POST /api/developer/api-keys - Create new API key
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
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

    const data = await request.json();
    const { name, permissions = ['read'] } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    // Check if business owner has developer access
    const developerAccount = await prisma.developerAccount.findUnique({
      where: { businessOwnerId: businessOwner.id },
    });

    if (!developerAccount?.isApproved) {
      return NextResponse.json(
        { error: 'Developer access not approved. Please apply for API access first.' },
        { status: 403 }
      );
    }

    const apiKeyResult = await ApiKeyService.generateApiKey(
      businessOwner.id,
      name,
      permissions
    );

    return NextResponse.json({
      success: true,
      apiKey: apiKeyResult,
      warning: 'This is the only time you will see the full API key. Please save it securely.',
    });

  } catch (error) {
    logger.error('Create API key error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}