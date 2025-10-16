import { NextResponse } from 'next/server';
import { generateBusinessInsights } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { analyticsData, businessContext, companyId } = await request.json();

    if (!analyticsData || !businessContext || !companyId) {
      return NextResponse.json(
        { error: 'Données manquantes pour générer les insights' },
        { status: 400 }
      );
    }

    if (!businessContext.name || !businessContext.category || !businessContext.city) {
      return NextResponse.json(
        { error: 'Contexte business incomplet' },
        { status: 400 }
      );
    }

    // Generate AI-powered business insights
    const insights = await generateBusinessInsights(
      analyticsData,
      businessContext
    );

    // Add metadata and formatting
    const formattedInsights = {
      ...insights,
      metadata: {
        companyId,
        businessName: businessContext.name,
        generatedAt: new Date().toISOString(),
        analyticsTimeframe: getAnalyticsTimeframe(analyticsData),
        totalInsights: 
          (insights.strengths?.length || 0) +
          (insights.improvements?.length || 0) +
          (insights.recommendations?.length || 0) +
          (insights.alerts?.length || 0),
      },
      performance: analyzePerformanceMetrics(analyticsData),
    };

    return NextResponse.json(formattedInsights);

  } catch (error) {
    console.error('AI Insights API error:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la génération des insights' },
      { status: 500 }
    );
  }
}

// Helper function to determine analytics timeframe
function getAnalyticsTimeframe(analyticsData: any): string {
  if (analyticsData.weeklyData && analyticsData.weeklyData.length > 0) {
    const dataPoints = analyticsData.weeklyData.length;
    if (dataPoints <= 7) return '7 derniers jours';
    if (dataPoints <= 30) return '30 derniers jours';
    return '90 derniers jours';
  }
  return 'période récente';
}

// Helper function to analyze performance metrics
function analyzePerformanceMetrics(analyticsData: any) {
  const metrics = {
    profileViews: analyticsData.profileViews || 0,
    uniqueVisitors: analyticsData.uniqueVisitors || 0,
    phoneClicks: analyticsData.phoneClicks || 0,
    websiteClicks: analyticsData.websiteClicks || 0,
    emailClicks: analyticsData.emailClicks || 0,
    directionsClicks: analyticsData.directionsClicks || 0,
  };

  const totalClicks = metrics.phoneClicks + metrics.websiteClicks + metrics.emailClicks + metrics.directionsClicks;
  const conversionRate = metrics.profileViews > 0 ? (totalClicks / metrics.profileViews) * 100 : 0;
  
  // Calculate engagement score
  const engagementScore = calculateEngagementScore(metrics);
  
  // Detect trends
  const trends = detectTrends(analyticsData.weeklyData || []);

  return {
    totalViews: metrics.profileViews,
    totalClicks,
    conversionRate: Math.round(conversionRate * 100) / 100,
    engagementScore,
    trends,
    topAction: getTopAction(metrics),
    benchmarks: generateBenchmarks(metrics, analyticsData.businessContext),
  };
}

// Helper function to calculate engagement score
function calculateEngagementScore(metrics: any): number {
  const weights = {
    phoneClicks: 0.4,    // Highest value action
    directionsClicks: 0.3, // High intent
    websiteClicks: 0.2,   // Medium intent
    emailClicks: 0.1,     // Lower intent
  };

  const totalActions = metrics.phoneClicks + metrics.websiteClicks + metrics.emailClicks + metrics.directionsClicks;
  const weightedScore = 
    (metrics.phoneClicks * weights.phoneClicks) +
    (metrics.directionsClicks * weights.directionsClicks) +
    (metrics.websiteClicks * weights.websiteClicks) +
    (metrics.emailClicks * weights.emailClicks);

  // Normalize to 0-100 scale based on views
  const rawScore = metrics.profileViews > 0 ? (weightedScore / metrics.profileViews) * 100 : 0;
  
  // Apply scaling factor for business size
  let scalingFactor = 1;
  if (metrics.profileViews < 50) scalingFactor = 0.8;
  else if (metrics.profileViews > 500) scalingFactor = 1.2;

  return Math.min(100, Math.round(rawScore * scalingFactor));
}

// Helper function to detect trends
function detectTrends(weeklyData: any[]): any {
  if (!weeklyData || weeklyData.length < 7) {
    return { views: 'insufficient_data', clicks: 'insufficient_data' };
  }

  const recentData = weeklyData.slice(-7);
  const olderData = weeklyData.slice(-14, -7);

  if (olderData.length === 0) {
    return { views: 'insufficient_data', clicks: 'insufficient_data' };
  }

  const recentViews = recentData.reduce((sum, day) => sum + (day.views || 0), 0);
  const olderViews = olderData.reduce((sum, day) => sum + (day.views || 0), 0);
  const recentClicks = recentData.reduce((sum, day) => sum + (day.clicks || 0), 0);
  const olderClicks = olderData.reduce((sum, day) => sum + (day.clicks || 0), 0);

  const viewsTrend = olderViews > 0 ? ((recentViews - olderViews) / olderViews) * 100 : 0;
  const clicksTrend = olderClicks > 0 ? ((recentClicks - olderClicks) / olderClicks) * 100 : 0;

  return {
    views: {
      direction: viewsTrend > 5 ? 'up' : viewsTrend < -5 ? 'down' : 'stable',
      percentage: Math.round(Math.abs(viewsTrend)),
    },
    clicks: {
      direction: clicksTrend > 5 ? 'up' : clicksTrend < -5 ? 'down' : 'stable',
      percentage: Math.round(Math.abs(clicksTrend)),
    },
  };
}

// Helper function to get top action
function getTopAction(metrics: any): string {
  const actions = {
    'Appels téléphoniques': metrics.phoneClicks,
    'Clics site web': metrics.websiteClicks,
    'Demandes d\'itinéraire': metrics.directionsClicks,
    'Contacts email': metrics.emailClicks,
  };

  const topAction = Object.entries(actions).reduce((a, b) => 
    actions[a[0] as keyof typeof actions] > actions[b[0] as keyof typeof actions] ? a : b
  );

  return topAction[0];
}

// Helper function to generate industry benchmarks
function generateBenchmarks(metrics: any, businessContext: any) {
  // Mock industry benchmarks (in a real app, these would come from a database)
  const industryBenchmarks = {
    'restaurant': { conversionRate: 15, phoneClickRate: 8, directionsClickRate: 12 },
    'retail': { conversionRate: 12, phoneClickRate: 6, directionsClickRate: 18 },
    'service': { conversionRate: 18, phoneClickRate: 12, directionsClickRate: 8 },
    'healthcare': { conversionRate: 20, phoneClickRate: 15, directionsClickRate: 10 },
    'beauty': { conversionRate: 16, phoneClickRate: 10, directionsClickRate: 6 },
    'automotive': { conversionRate: 14, phoneClickRate: 9, directionsClickRate: 15 },
    'default': { conversionRate: 15, phoneClickRate: 8, directionsClickRate: 10 },
  };

  const category = businessContext?.category?.toLowerCase() || 'default';
  const benchmark = industryBenchmarks[category as keyof typeof industryBenchmarks] || industryBenchmarks.default;

  const totalClicks = metrics.phoneClicks + metrics.websiteClicks + metrics.emailClicks + metrics.directionsClicks;
  const conversionRate = metrics.profileViews > 0 ? (totalClicks / metrics.profileViews) * 100 : 0;
  const phoneClickRate = metrics.profileViews > 0 ? (metrics.phoneClicks / metrics.profileViews) * 100 : 0;
  const directionsClickRate = metrics.profileViews > 0 ? (metrics.directionsClicks / metrics.profileViews) * 100 : 0;

  return {
    conversionRate: {
      your: Math.round(conversionRate * 100) / 100,
      industry: benchmark.conversionRate,
      performance: conversionRate >= benchmark.conversionRate ? 'above' : 'below',
    },
    phoneClickRate: {
      your: Math.round(phoneClickRate * 100) / 100,
      industry: benchmark.phoneClickRate,
      performance: phoneClickRate >= benchmark.phoneClickRate ? 'above' : 'below',
    },
    directionsClickRate: {
      your: Math.round(directionsClickRate * 100) / 100,
      industry: benchmark.directionsClickRate,
      performance: directionsClickRate >= benchmark.directionsClickRate ? 'above' : 'below',
    },
  };
}