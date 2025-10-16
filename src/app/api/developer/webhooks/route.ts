import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WebhookService } from '@/lib/api-ecosystem';
import { prisma } from '@/lib/prisma';

// GET /api/developer/webhooks - Get webhooks for business owner
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

    const webhooks = await WebhookService.getWebhooks(businessOwner.id);

    return NextResponse.json({
      success: true,
      webhooks,
    });

  } catch (error) {
    console.error('Get webhooks error:', error);
    return NextResponse.json(
      { error: 'Failed to get webhooks' },
      { status: 500 }
    );
  }
}

// POST /api/developer/webhooks - Create new webhook
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
    const { url, events, description } = data;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Webhook URL and events are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL format' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = [
      'company.created',
      'company.updated',
      'review.created',
      'review.updated',
      'booking.created',
      'booking.updated',
      'order.created',
      'order.updated',
      'product.created',
      'product.updated',
    ];

    const invalidEvents = events.filter(event => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    const webhook = await WebhookService.registerWebhook(businessOwner.id, {
      url,
      events,
      description,
    });

    return NextResponse.json({
      success: true,
      webhook,
    });

  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}