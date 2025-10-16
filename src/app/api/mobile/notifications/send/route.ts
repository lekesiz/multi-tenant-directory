import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileUser } from '@/lib/mobile-auth';

// Firebase Admin SDK for sending push notifications
// Note: You'll need to install firebase-admin and configure it
// npm install firebase-admin

export async function POST(request: Request) {
  try {
    const authResult = await authenticateMobileUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { type, companyId, message, targetUsers } = await request.json();

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Type et message requis' },
        { status: 400 }
      );
    }

    // Get business owner's companies to verify permission
    const ownerships = await prisma.companyOwnership.findMany({
      where: { businessOwnerId: authResult.user.userId },
      select: { companyId: true },
    });

    const ownedCompanyIds = ownerships.map(o => o.companyId);

    // Verify user owns the company if companyId is specified
    if (companyId && !ownedCompanyIds.includes(parseInt(companyId))) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette entreprise' },
        { status: 403 }
      );
    }

    // Define notification targets based on type
    let fcmTokens: string[] = [];

    switch (type) {
      case 'new_review':
        // Send to business owner of the company
        const owner = await prisma.businessOwner.findUnique({
          where: { id: authResult.user.userId },
          select: { fcmToken: true },
        });
        if (owner?.fcmToken) {
          fcmTokens.push(owner.fcmToken);
        }
        break;

      case 'marketing_blast':
        // Send to specified target users or all customers
        if (targetUsers && targetUsers.length > 0) {
          const users = await prisma.businessOwner.findMany({
            where: {
              id: { in: targetUsers },
              fcmToken: { not: null },
            },
            select: { fcmToken: true },
          });
          fcmTokens = users.map(u => u.fcmToken!).filter(Boolean);
        }
        break;

      case 'system_announcement':
        // Send to all active users (requires admin permission)
        const allUsers = await prisma.businessOwner.findMany({
          where: {
            fcmToken: { not: null },
            subscriptionStatus: 'active',
          },
          select: { fcmToken: true },
        });
        fcmTokens = allUsers.map(u => u.fcmToken!).filter(Boolean);
        break;

      default:
        return NextResponse.json(
          { error: 'Type de notification non supporté' },
          { status: 400 }
        );
    }

    if (fcmTokens.length === 0) {
      return NextResponse.json(
        { error: 'Aucun destinataire avec token FCM trouvé' },
        { status: 400 }
      );
    }

    // Here you would integrate with Firebase Admin SDK
    // This is a placeholder for the actual implementation
    const notificationResults = await sendPushNotifications(fcmTokens, {
      title: getNotificationTitle(type),
      body: message,
      data: {
        type,
        companyId: companyId?.toString(),
        timestamp: new Date().toISOString(),
      },
    });

    // Log notification in database
    await prisma.notification.createMany({
      data: fcmTokens.map(token => ({
        recipientId: authResult.user.userId, // This should be mapped to actual recipient
        type,
        title: getNotificationTitle(type),
        message,
        companyId: companyId ? parseInt(companyId) : null,
        sentAt: new Date(),
      })),
    });

    return NextResponse.json({
      success: true,
      sent: notificationResults.successCount,
      failed: notificationResults.failureCount,
      tokens: fcmTokens.length,
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la notification' },
      { status: 500 }
    );
  }
}

// Helper function to get notification title based on type
function getNotificationTitle(type: string): string {
  switch (type) {
    case 'new_review':
      return 'Nouvel avis reçu';
    case 'marketing_blast':
      return 'Promotion spéciale';
    case 'system_announcement':
      return 'Annonce système';
    default:
      return 'Notification';
  }
}

// Placeholder for Firebase push notification implementation
async function sendPushNotifications(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
): Promise<{ successCount: number; failureCount: number }> {
  // This would use Firebase Admin SDK
  // For now, return mock results
  console.log(`Sending push notifications to ${tokens.length} devices:`, notification);
  
  // Mock implementation
  return {
    successCount: tokens.length,
    failureCount: 0,
  };
  
  /* Real implementation would look like:
  const admin = require('firebase-admin');
  
  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data || {},
    tokens,
  };
  
  const response = await admin.messaging().sendMulticast(message);
  
  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
  };
  */
}