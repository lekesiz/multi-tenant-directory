/**
 * Business Intelligence Service
 * Handles AI-powered analytics and insights
 */

import { getGrokAI, safeGrokCall } from './grok';

export interface AnalyticsInsight {
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'negative' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  metrics?: {
    current: number;
    previous?: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  recommendations?: string[];
}

export interface TrendAnalysis {
  category: string;
  trend: 'growing' | 'declining' | 'stable';
  confidence: number;
  insights: string[];
  predictions?: {
    nextMonth: number;
    nextQuarter: number;
  };
  factors: string[];
}

export interface CompetitiveAnalysis {
  businessName: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  recommendations: string[];
}

export interface CustomerInsight {
  segment: string;
  characteristics: string[];
  preferences: string[];
  painPoints: string[];
  opportunities: string[];
  recommendedActions: string[];
}

/**
 * Generate analytics insights from business data
 */
export async function generateAnalyticsInsights(
  businessData: {
    name: string;
    category: string;
    metrics: {
      profileViews: number;
      previousProfileViews?: number;
      phoneClicks: number;
      previousPhoneClicks?: number;
      websiteClicks: number;
      previousWebsiteClicks?: number;
      reviewCount: number;
      averageRating: number;
      previousAverageRating?: number;
    };
    reviews?: Array<{
      rating: number;
      text: string;
      createdAt: Date;
    }>;
  }
): Promise<AnalyticsInsight[]> {
  const metricsText = `
Profile Views: ${businessData.metrics.profileViews} ${
    businessData.metrics.previousProfileViews
      ? `(Previous: ${businessData.metrics.previousProfileViews}, Change: ${((businessData.metrics.profileViews - businessData.metrics.previousProfileViews) / businessData.metrics.previousProfileViews * 100).toFixed(1)}%)`
      : ''
  }
Phone Clicks: ${businessData.metrics.phoneClicks} ${
    businessData.metrics.previousPhoneClicks
      ? `(Previous: ${businessData.metrics.previousPhoneClicks}, Change: ${((businessData.metrics.phoneClicks - businessData.metrics.previousPhoneClicks) / businessData.metrics.previousPhoneClicks * 100).toFixed(1)}%)`
      : ''
  }
Website Clicks: ${businessData.metrics.websiteClicks} ${
    businessData.metrics.previousWebsiteClicks
      ? `(Previous: ${businessData.metrics.previousWebsiteClicks}, Change: ${((businessData.metrics.websiteClicks - businessData.metrics.previousWebsiteClicks) / businessData.metrics.previousWebsiteClicks * 100).toFixed(1)}%)`
      : ''
  }
Reviews: ${businessData.metrics.reviewCount}
Average Rating: ${businessData.metrics.averageRating}/5 ${
    businessData.metrics.previousAverageRating
      ? `(Previous: ${businessData.metrics.previousAverageRating})`
      : ''
  }
`;

  const recentReviewsText =
    businessData.reviews && businessData.reviews.length > 0
      ? `
Recent Reviews (last 5):
${businessData.reviews
  .slice(0, 5)
  .map((r) => `- ${r.rating}★: "${r.text.substring(0, 100)}..."`)
  .join('\n')}
`
      : '';

  const prompt = `Analyze business performance data and generate actionable insights:

Business: ${businessData.name}
Category: ${businessData.category}

Metrics:
${metricsText}
${recentReviewsText}

Provide 3-5 key insights in JSON format:
[
  {
    "title": "Insight title in French",
    "description": "Detailed description in French",
    "type": "positive" | "neutral" | "negative" | "opportunity",
    "priority": "high" | "medium" | "low",
    "metrics": {
      "current": number,
      "previous": number (optional),
      "change": number (optional),
      "trend": "up" | "down" | "stable" (optional)
    } (optional),
    "recommendations": ["recommendation1", "recommendation2"] (optional)
  }
]

Focus on:
- Performance trends
- Engagement metrics
- Review sentiment
- Opportunities for improvement
- Competitive positioning`;

  const systemPrompt = `You are a business analytics expert. Analyze data and provide actionable insights.
Write in French. Be specific and data-driven. Focus on actionable recommendations.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<AnalyticsInsight[]>(prompt, systemPrompt, {
        temperature: 0.6,
        maxTokens: 1000,
      });
    },
    [
      {
        title: 'Performance Overview',
        description: 'Vos métriques sont en cours d\'analyse.',
        type: 'neutral',
        priority: 'medium',
      },
    ]
  );
}

/**
 * Analyze category trends
 */
export async function analyzeCategoryTrends(
  category: string,
  city: string,
  historicalData: Array<{
    month: string;
    businessCount: number;
    averageRating: number;
    totalReviews: number;
    searchVolume?: number;
  }>
): Promise<TrendAnalysis> {
  const dataText = historicalData
    .map(
      (d) =>
        `${d.month}: ${d.businessCount} businesses, ${d.averageRating}★ avg, ${d.totalReviews} reviews${d.searchVolume ? `, ${d.searchVolume} searches` : ''}`
    )
    .join('\n');

  const prompt = `Analyze trends for this business category:

Category: ${category}
City: ${city}

Historical Data:
${dataText}

Provide trend analysis in JSON:
{
  "category": "${category}",
  "trend": "growing" | "declining" | "stable",
  "confidence": 0 to 1,
  "insights": ["insight1", "insight2"],
  "predictions": {
    "nextMonth": estimated_business_count,
    "nextQuarter": estimated_business_count
  } (optional),
  "factors": ["factor1", "factor2"]
}

Analyze:
- Growth or decline patterns
- Seasonal variations
- Quality trends (ratings)
- Market saturation
- Demand indicators`;

  const systemPrompt = `You are a market trend analyst. Analyze historical data and identify patterns.
Provide data-driven insights and predictions. Write in French.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<TrendAnalysis>(prompt, systemPrompt, {
        temperature: 0.5,
        maxTokens: 600,
      });
    },
    {
      category,
      trend: 'stable',
      confidence: 0.5,
      insights: ['Données insuffisantes pour une analyse approfondie.'],
      factors: [],
    }
  );
}

/**
 * Generate competitive analysis
 */
export async function generateCompetitiveAnalysis(
  business: {
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    description?: string;
  },
  competitors: Array<{
    name: string;
    rating: number;
    reviewCount: number;
    description?: string;
  }>
): Promise<CompetitiveAnalysis> {
  const competitorsText = competitors
    .map((c) => `- ${c.name}: ${c.rating}★ (${c.reviewCount} reviews)${c.description ? ` - ${c.description.substring(0, 100)}` : ''}`)
    .join('\n');

  const prompt = `Perform competitive analysis for this business:

Target Business:
- Name: ${business.name}
- Category: ${business.category}
- Rating: ${business.rating}★
- Reviews: ${business.reviewCount}
${business.description ? `- Description: ${business.description}` : ''}

Competitors:
${competitorsText}

Provide SWOT analysis in JSON:
{
  "businessName": "${business.name}",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "threats": ["threat1", "threat2"],
  "marketPosition": "leader" | "challenger" | "follower" | "niche",
  "recommendations": ["recommendation1", "recommendation2"]
}

Consider:
- Rating comparison
- Review volume
- Service differentiation
- Market positioning
- Growth opportunities`;

  const systemPrompt = `You are a competitive strategy analyst. Perform thorough SWOT analysis.
Provide actionable strategic recommendations. Write in French.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<CompetitiveAnalysis>(prompt, systemPrompt, {
        temperature: 0.6,
        maxTokens: 800,
      });
    },
    {
      businessName: business.name,
      strengths: ['Présence sur la plateforme'],
      weaknesses: [],
      opportunities: ['Améliorer la visibilité'],
      threats: [],
      marketPosition: 'follower',
      recommendations: ['Augmenter le nombre d\'avis'],
    }
  );
}

/**
 * Generate customer insights from reviews
 */
export async function generateCustomerInsights(
  reviews: Array<{
    rating: number;
    text: string;
    authorName?: string;
    createdAt: Date;
  }>,
  businessCategory: string
): Promise<CustomerInsight[]> {
  const reviewsText = reviews
    .slice(0, 50) // Limit to avoid token overflow
    .map((r) => `${r.rating}★: "${r.text}"`)
    .join('\n');

  const prompt = `Analyze customer reviews and identify customer segments and insights:

Business Category: ${businessCategory}

Reviews:
${reviewsText}

Identify 2-4 customer segments and provide insights in JSON:
[
  {
    "segment": "Segment name (e.g., 'Clients réguliers', 'Nouveaux clients')",
    "characteristics": ["characteristic1", "characteristic2"],
    "preferences": ["preference1", "preference2"],
    "painPoints": ["pain1", "pain2"],
    "opportunities": ["opportunity1", "opportunity2"],
    "recommendedActions": ["action1", "action2"]
  }
]

Analyze:
- Common themes in reviews
- Customer expectations
- Satisfaction drivers
- Pain points and complaints
- Opportunities for improvement`;

  const systemPrompt = `You are a customer insights specialist. Analyze reviews to understand customer needs.
Identify patterns and provide actionable recommendations. Write in French.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<CustomerInsight[]>(prompt, systemPrompt, {
        temperature: 0.6,
        maxTokens: 1000,
      });
    },
    [
      {
        segment: 'Clients généraux',
        characteristics: ['Variés'],
        preferences: ['Qualité de service'],
        painPoints: [],
        opportunities: ['Améliorer l\'expérience client'],
        recommendedActions: ['Recueillir plus d\'avis'],
      },
    ]
  );
}

/**
 * Generate performance report summary
 */
export async function generatePerformanceReport(
  period: string,
  metrics: {
    profileViews: number;
    phoneClicks: number;
    websiteClicks: number;
    directionsClicks: number;
    newReviews: number;
    averageRating: number;
    responseRate?: number;
  },
  previousMetrics?: {
    profileViews: number;
    phoneClicks: number;
    websiteClicks: number;
    directionsClicks: number;
    newReviews: number;
    averageRating: number;
  }
): Promise<string> {
  const changesText = previousMetrics
    ? `
Changes from previous period:
- Profile Views: ${((metrics.profileViews - previousMetrics.profileViews) / previousMetrics.profileViews * 100).toFixed(1)}%
- Phone Clicks: ${((metrics.phoneClicks - previousMetrics.phoneClicks) / previousMetrics.phoneClicks * 100).toFixed(1)}%
- Website Clicks: ${((metrics.websiteClicks - previousMetrics.websiteClicks) / previousMetrics.websiteClicks * 100).toFixed(1)}%
- New Reviews: ${metrics.newReviews - previousMetrics.newReviews}
- Rating: ${(metrics.averageRating - previousMetrics.averageRating).toFixed(2)}
`
    : '';

  const prompt = `Generate a performance report summary in French:

Period: ${period}

Current Metrics:
- Profile Views: ${metrics.profileViews}
- Phone Clicks: ${metrics.phoneClicks}
- Website Clicks: ${metrics.websiteClicks}
- Directions Clicks: ${metrics.directionsClicks}
- New Reviews: ${metrics.newReviews}
- Average Rating: ${metrics.averageRating}/5
${metrics.responseRate ? `- Response Rate: ${metrics.responseRate}%` : ''}
${changesText}

Write a concise performance summary (3-4 paragraphs) that:
- Highlights key achievements
- Identifies areas of concern
- Provides context for the numbers
- Suggests next steps
- Uses a professional yet encouraging tone`;

  const systemPrompt = `You are a business performance analyst. Write clear, insightful performance summaries.
Always write in French. Be specific and actionable.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generate(prompt, systemPrompt, {
        temperature: 0.7,
        maxTokens: 500,
      });
    },
    `Rapport de performance pour ${period}: Vos métriques sont en cours d'analyse.`
  );
}

/**
 * Predict future performance
 */
export async function predictFuturePerformance(
  historicalData: Array<{
    date: string;
    profileViews: number;
    phoneClicks: number;
    websiteClicks: number;
  }>,
  forecastPeriod: 'week' | 'month' | 'quarter'
): Promise<{
  predictions: {
    profileViews: number;
    phoneClicks: number;
    websiteClicks: number;
  };
  confidence: number;
  factors: string[];
}> {
  const dataText = historicalData
    .map((d) => `${d.date}: ${d.profileViews} views, ${d.phoneClicks} phone, ${d.websiteClicks} website`)
    .join('\n');

  const prompt = `Predict future performance based on historical data:

Historical Data:
${dataText}

Forecast Period: ${forecastPeriod}

Provide predictions in JSON:
{
  "predictions": {
    "profileViews": estimated_number,
    "phoneClicks": estimated_number,
    "websiteClicks": estimated_number
  },
  "confidence": 0 to 1,
  "factors": ["factor1", "factor2"]
}

Consider:
- Historical trends
- Seasonal patterns
- Growth rate
- External factors`;

  const systemPrompt = `You are a predictive analytics expert. Make data-driven forecasts.
Be realistic and explain your reasoning.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON(prompt, systemPrompt, {
        temperature: 0.4,
        maxTokens: 400,
      });
    },
    {
      predictions: {
        profileViews: historicalData[historicalData.length - 1]?.profileViews || 0,
        phoneClicks: historicalData[historicalData.length - 1]?.phoneClicks || 0,
        websiteClicks: historicalData[historicalData.length - 1]?.websiteClicks || 0,
      },
      confidence: 0.5,
      factors: ['Données historiques limitées'],
    }
  );
}

