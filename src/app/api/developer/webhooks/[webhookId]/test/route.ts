import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WebhookService } from '@/lib/api-ecosystem';
import { prisma } from '@/lib/prisma';

// POST /api/developer/webhooks/[webhookId]/test - Test webhook endpoint
export async function POST(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { webhookId } = await params;
    
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

    // Verify webhook ownership
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: webhookId,
        businessOwnerId: businessOwner.id,
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    const results = await WebhookService.testWebhook(webhookId);

    return NextResponse.json({
      success: true,
      message: 'Test webhook sent',
      results,
    });

  } catch (error) {
    logger.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}