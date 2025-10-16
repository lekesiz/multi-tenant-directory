/**
 * Dashboard Layout Management API
 * Save and retrieve custom dashboard layouts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Save dashboard layout
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, userId, widgets } = await request.json();

    // Validate input
    if (!tenantId || !widgets || !Array.isArray(widgets)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Save or update dashboard layout
    const layout = await prisma.dashboardLayout.upsert({
      where: {
        tenantId_userId: {
          tenantId,
          userId: userId || session.user.id,
        },
      },
      update: {
        widgets: JSON.stringify(widgets),
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        userId: userId || session.user.id,
        widgets: JSON.stringify(widgets),
      },
    });

    return NextResponse.json({ 
      success: true, 
      layoutId: layout.id 
    });

  } catch (error) {
    console.error('Dashboard layout save error:', error);
    return NextResponse.json(
      { error: 'Failed to save dashboard layout' },
      { status: 500 }
    );
  }
}

// Get dashboard layout
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const userId = searchParams.get('userId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get user's dashboard layout
    const layout = await prisma.dashboardLayout.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: userId || session.user.id,
        },
      },
    });

    if (!layout) {
      // Return default layout if none exists
      const defaultWidgets = getDefaultDashboardLayout();
      return NextResponse.json({ widgets: defaultWidgets });
    }

    const widgets = JSON.parse(layout.widgets);
    return NextResponse.json({ widgets });

  } catch (error) {
    console.error('Dashboard layout fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard layout' },
      { status: 500 }
    );
  }
}

// Delete dashboard layout (reset to default)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, userId } = await request.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    await prisma.dashboardLayout.delete({
      where: {
        tenantId_userId: {
          tenantId,
          userId: userId || session.user.id,
        },
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Dashboard layout delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete dashboard layout' },
      { status: 500 }
    );
  }
}

// Default dashboard layout
function getDefaultDashboardLayout() {
  return [
    {
      id: 'widget-revenue-1',
      type: 'revenue-chart',
      title: 'Chiffre d\'affaires',
      size: 'large',
      position: { x: 0, y: 0 },
      config: {
        refreshInterval: 300, // 5 minutes
        dateRange: '30d',
        filters: {},
        displayOptions: {
          showGrowth: true,
          chartType: 'line',
        },
      },
    },
    {
      id: 'widget-visitors-1',
      type: 'visitor-stats',
      title: 'Statistiques visiteurs',
      size: 'medium',
      position: { x: 2, y: 0 },
      config: {
        refreshInterval: 60, // 1 minute
        dateRange: '7d',
        filters: {},
        displayOptions: {
          showDeviceBreakdown: true,
        },
      },
    },
    {
      id: 'widget-orders-1',
      type: 'recent-orders',
      title: 'Commandes récentes',
      size: 'medium',
      position: { x: 0, y: 1 },
      config: {
        refreshInterval: 30, // 30 seconds
        dateRange: '1d',
        filters: {},
        displayOptions: {
          maxItems: 5,
        },
      },
    },
    {
      id: 'widget-realtime-1',
      type: 'real-time-metrics',
      title: 'Temps réel',
      size: 'medium',
      position: { x: 1, y: 1 },
      config: {
        refreshInterval: 10, // 10 seconds
        dateRange: '1h',
        filters: {},
        displayOptions: {
          showActiveUsers: true,
          showConversions: true,
        },
      },
    },
    {
      id: 'widget-bookings-1',
      type: 'booking-calendar',
      title: 'Réservations du jour',
      size: 'medium',
      position: { x: 2, y: 1 },
      config: {
        refreshInterval: 120, // 2 minutes
        dateRange: '1d',
        filters: {},
        displayOptions: {
          showUpcoming: true,
        },
      },
    },
    {
      id: 'widget-traffic-1',
      type: 'traffic-sources',
      title: 'Sources de trafic',
      size: 'medium',
      position: { x: 0, y: 2 },
      config: {
        refreshInterval: 300, // 5 minutes
        dateRange: '7d',
        filters: {},
        displayOptions: {
          showPercentages: true,
        },
      },
    },
  ];
}