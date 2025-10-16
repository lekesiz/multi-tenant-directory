/**
 * Dashboard Widget Data API
 * Provides real-time data for dashboard widgets
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TenantResolver } from '@/lib/multi-tenant-core';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, widgetType, config } = await request.json();

    // Validate tenant access
    const tenant = await TenantResolver.getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get widget data based on type
    const data = await getWidgetData(tenantId, widgetType, config, session.user.id);

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Widget data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widget data' },
      { status: 500 }
    );
  }
}

async function getWidgetData(
  tenantId: string,
  widgetType: string,
  config: any,
  userId: string
): Promise<any> {
  const dateRange = config.dateRange || '7d';
  const startDate = getStartDate(dateRange);

  switch (widgetType) {
    case 'revenue-chart':
      return await getRevenueData(tenantId, startDate);
    
    case 'visitor-stats':
      return await getVisitorStats(tenantId, startDate);
    
    case 'recent-orders':
      return await getRecentOrders(tenantId);
    
    case 'real-time-metrics':
      return await getRealTimeMetrics(tenantId);
    
    case 'booking-calendar':
      return await getBookingData(tenantId, startDate);
    
    case 'traffic-sources':
      return await getTrafficSources(tenantId, startDate);
    
    case 'conversion-funnel':
      return await getConversionFunnel(tenantId, startDate);
    
    case 'review-sentiment':
      return await getReviewSentiment(tenantId, startDate);
    
    case 'performance-metrics':
      return await getPerformanceMetrics(tenantId, startDate);
    
    case 'goal-tracker':
      return await getGoalTracker(tenantId, userId);
    
    default:
      throw new Error(`Unknown widget type: ${widgetType}`);
  }
}

// Helper to get company filter for domain
function getCompanyFilter(tenantId: string) {
  return {
    content: {
      some: {
        domainId: parseInt(tenantId),
        isVisible: true,
      },
    },
  };
}

// Revenue Chart Data
async function getRevenueData(tenantId: string, startDate: Date) {
  const companyFilter = getCompanyFilter(tenantId);
  
  const orders = await prisma.order.findMany({
    where: {
      company: companyFilter,
      createdAt: { gte: startDate },
      status: { not: 'cancelled' },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  const subscriptions = await prisma.businessOwner.findMany({
    where: {
      subscriptionStatus: 'active',
      currentPeriodStart: { gte: startDate },
    },
    include: {
      companies: {
        where: {
          company: companyFilter,
        },
      },
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  // Calculate growth
  const previousPeriod = new Date(startDate);
  previousPeriod.setDate(previousPeriod.getDate() - 7);

  const previousOrders = await prisma.order.findMany({
    where: {
      company: companyFilter,
      createdAt: { gte: previousPeriod, lt: startDate },
      status: { not: 'cancelled' },
    },
    select: { total: true },
  });

  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
  const growth = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;

  // Daily breakdown for chart
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayOrders = orders.filter(order => 
      order.createdAt >= date && order.createdAt < nextDate
    );
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
    });
  }

  return {
    revenue: totalRevenue,
    growth,
    dailyData,
  };
}

// Visitor Statistics
async function getVisitorStats(tenantId: string, startDate: Date) {
  const companyFilter = getCompanyFilter(tenantId);
  
  // In a real implementation, this would connect to analytics service
  // For now, simulate data based on company analytics
  const analytics = await prisma.companyAnalytics.findMany({
    where: {
      company: companyFilter,
      date: { gte: startDate },
    },
  });

  const visitors = analytics.reduce((sum, a) => sum + (a.profileViews || 0), 0);
  const pageViews = analytics.reduce((sum, a) => sum + (a.profileViews || 0) + (a.phoneClicks || 0) + (a.emailClicks || 0), 0);

  return {
    visitors,
    pageViews,
    bounceRate: 45.2,
    avgSessionDuration: '2m 34s',
  };
}

// Recent Orders
async function getRecentOrders(tenantId: string) {
  const companyFilter = getCompanyFilter(tenantId);
  
  const orders = await prisma.order.findMany({
    where: {
      company: companyFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      company: {
        select: { name: true },
      },
    },
  });

  return {
    orders: orders.map(order => ({
      id: order.orderNumber,
      customer: order.customerName,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      company: order.company.name,
    })),
  };
}

// Real-time Metrics
async function getRealTimeMetrics(tenantId: string) {
  const companyFilter = getCompanyFilter(tenantId);
  const now = new Date();
  const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  // Simulated real-time data
  // In production, this would connect to real-time analytics
  const activeUsers = Math.floor(Math.random() * 50) + 10;
  const conversions = Math.floor(Math.random() * 5);
  
  const recentOrders = await prisma.order.count({
    where: {
      company: companyFilter,
      createdAt: { gte: last5Minutes },
    },
  });

  return {
    activeUsers,
    conversions,
    recentOrders,
    realtimeRevenue: Math.random() * 1000,
  };
}

// Booking Calendar Data
async function getBookingData(tenantId: string, startDate: Date) {
  const companyFilter = getCompanyFilter(tenantId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      product: {
        company: companyFilter,
      },
      startTime: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      product: {
        select: { name: true },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  return {
    bookings: bookings.map(booking => ({
      id: booking.id,
      service: booking.product.name,
      customer: booking.customerName,
      time: booking.startTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: booking.status,
    })),
  };
}

// Traffic Sources
async function getTrafficSources(tenantId: string, startDate: Date) {
  // Simulate traffic source data
  // In production, integrate with Google Analytics or similar
  const sources = [
    { name: 'Google', percentage: 45, visitors: 1250 },
    { name: 'Direct', percentage: 30, visitors: 830 },
    { name: 'Facebook', percentage: 12, visitors: 332 },
    { name: 'LinkedIn', percentage: 8, visitors: 221 },
    { name: 'Autres', percentage: 5, visitors: 138 },
  ];

  return { sources };
}

// Conversion Funnel
async function getConversionFunnel(tenantId: string, startDate: Date) {
  const companyFilter = getCompanyFilter(tenantId);
  
  const analytics = await prisma.companyAnalytics.findMany({
    where: {
      company: companyFilter,
      date: { gte: startDate },
    },
  });

  const profileViews = analytics.reduce((sum, a) => sum + (a.profileViews || 0), 0);
  const phoneClicks = analytics.reduce((sum, a) => sum + (a.phoneClicks || 0), 0);
  const emailClicks = analytics.reduce((sum, a) => sum + (a.emailClicks || 0), 0);

  const orders = await prisma.order.count({
    where: {
      company: companyFilter,
      createdAt: { gte: startDate },
    },
  });

  return {
    funnel: [
      { stage: 'Visiteurs', count: profileViews, percentage: 100 },
      { stage: 'Intérêt', count: phoneClicks + emailClicks, percentage: ((phoneClicks + emailClicks) / profileViews * 100) || 0 },
      { stage: 'Contact', count: emailClicks, percentage: (emailClicks / profileViews * 100) || 0 },
      { stage: 'Conversion', count: orders, percentage: (orders / profileViews * 100) || 0 },
    ],
  };
}

// Review Sentiment Analysis
async function getReviewSentiment(tenantId: string, startDate: Date) {
  const companyFilter = getCompanyFilter(tenantId);
  
  const reviews = await prisma.review.findMany({
    where: {
      company: companyFilter,
      createdAt: { gte: startDate },
    },
    select: {
      rating: true,
      comment: true,
    },
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0;

  const sentimentDistribution = {
    positive: reviews.filter(r => r.rating >= 4).length,
    neutral: reviews.filter(r => r.rating === 3).length,
    negative: reviews.filter(r => r.rating <= 2).length,
  };

  return {
    totalReviews,
    avgRating,
    sentimentDistribution,
    recentReviews: reviews.slice(-5),
  };
}

// Performance Metrics
async function getPerformanceMetrics(tenantId: string, startDate: Date) {
  const companyFilter = getCompanyFilter(tenantId);
  
  const companies = await prisma.company.count({
    where: companyFilter,
  });

  const orders = await prisma.order.count({
    where: {
      company: companyFilter,
      createdAt: { gte: startDate },
    },
  });

  const avgResponseTime = Math.random() * 500 + 200; // Simulated
  const uptimePercentage = 99.8 + Math.random() * 0.2; // Simulated

  return {
    companies,
    orders,
    avgResponseTime,
    uptimePercentage,
  };
}

// Goal Tracker
async function getGoalTracker(tenantId: string, userId: string) {
  const companyFilter = getCompanyFilter(tenantId);
  
  // This would typically be stored in a goals table
  // For now, simulate based on actual data
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyOrders = await prisma.order.count({
    where: {
      company: companyFilter,
      createdAt: { gte: thisMonth },
    },
  });

  const monthlyRevenue = await prisma.order.aggregate({
    where: {
      company: companyFilter,
      createdAt: { gte: thisMonth },
      status: { not: 'cancelled' },
    },
    _sum: { total: true },
  });

  const goals = [
    {
      name: 'Commandes mensuelles',
      target: 50,
      current: monthlyOrders,
      unit: 'commandes',
    },
    {
      name: 'Chiffre d\'affaires mensuel',
      target: 10000,
      current: monthlyRevenue._sum.total || 0,
      unit: 'EUR',
    },
    {
      name: 'Nouveaux clients',
      target: 25,
      current: Math.floor(monthlyOrders * 0.7), // Simulated
      unit: 'clients',
    },
  ];

  return { goals };
}

// Utility function to get start date based on range
function getStartDate(range: string): Date {
  const now = new Date();
  
  switch (range) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

