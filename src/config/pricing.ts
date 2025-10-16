/**
 * Pricing Configuration
 * Defines subscription tiers, features, and pricing
 */

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    interval: 'month' as const,
    stripePriceId: null,
    features: {
      maxPhotos: 3,
      maxReviewResponses: 5,
      analyticsRetention: 7, // days
      priorityBoost: 0,
      featured: false,
      aiReviewResponses: false,
      whatsappIntegration: false,
      competitorAnalysis: false,
      apiAccess: false,
      customDomain: false,
      removeBranding: false,
      dedicatedSupport: false,
      maxCoupons: 1,
      maxLocations: 1,
    },
    limits: {
      reviewResponsesPerMonth: 5,
      photosTotal: 3,
      couponsActive: 1,
    },
    popular: false,
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 29,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic_monthly',
    features: {
      maxPhotos: 20,
      maxReviewResponses: -1, // unlimited
      analyticsRetention: 30,
      priorityBoost: 50,
      featured: false,
      aiReviewResponses: false,
      whatsappIntegration: false,
      competitorAnalysis: false,
      apiAccess: false,
      customDomain: false,
      removeBranding: true,
      dedicatedSupport: false,
      maxCoupons: 3,
      maxLocations: 1,
    },
    limits: {
      reviewResponsesPerMonth: -1, // unlimited
      photosTotal: 20,
      couponsActive: 3,
    },
    popular: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 79,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    features: {
      maxPhotos: -1, // unlimited
      maxReviewResponses: -1,
      analyticsRetention: 365,
      priorityBoost: 100,
      featured: true,
      aiReviewResponses: true,
      whatsappIntegration: true,
      competitorAnalysis: true,
      apiAccess: false,
      customDomain: false,
      removeBranding: true,
      dedicatedSupport: true,
      maxCoupons: 10,
      maxLocations: 1,
    },
    limits: {
      reviewResponsesPerMonth: -1,
      photosTotal: -1,
      couponsActive: 10,
    },
    popular: false,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    features: {
      maxPhotos: -1,
      maxReviewResponses: -1,
      analyticsRetention: -1, // forever
      priorityBoost: 200,
      featured: true,
      aiReviewResponses: true,
      whatsappIntegration: true,
      competitorAnalysis: true,
      apiAccess: true,
      customDomain: true,
      removeBranding: true,
      dedicatedSupport: true,
      maxCoupons: -1,
      maxLocations: -1, // unlimited
    },
    limits: {
      reviewResponsesPerMonth: -1,
      photosTotal: -1,
      couponsActive: -1,
    },
    popular: false,
  },
} as const;

export type PlanId = keyof typeof PLANS;

/**
 * Get plan configuration by ID
 */
export function getPlan(planId: PlanId) {
  return PLANS[planId];
}

/**
 * Check if user has access to a feature
 */
export function hasFeature(
  planId: PlanId,
  feature: keyof (typeof PLANS)['free']['features']
): boolean {
  const plan = PLANS[planId];
  return plan.features[feature] as boolean;
}

/**
 * Get feature limit value
 */
export function getFeatureLimit(
  planId: PlanId,
  feature: keyof (typeof PLANS)['free']['features']
): number | boolean {
  const plan = PLANS[planId];
  return plan.features[feature];
}

/**
 * Check if user can perform an action based on their limit
 */
export function canPerformAction(
  planId: PlanId,
  action: 'uploadPhoto' | 'respondToReview' | 'createCoupon',
  currentUsage: number
): boolean {
  const plan = PLANS[planId];

  switch (action) {
    case 'uploadPhoto':
      return plan.limits.photosTotal === -1 || currentUsage < plan.limits.photosTotal;
    case 'respondToReview':
      return (
        plan.limits.reviewResponsesPerMonth === -1 ||
        currentUsage < plan.limits.reviewResponsesPerMonth
      );
    case 'createCoupon':
      return plan.limits.couponsActive === -1 || currentUsage < plan.limits.couponsActive;
    default:
      return false;
  }
}

/**
 * Feature comparison for pricing table
 */
export const FEATURE_LIST = [
  {
    category: 'Listing Features',
    features: [
      {
        name: 'Business listing',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Photos',
        free: '3 photos',
        basic: '20 photos',
        pro: 'Unlimited',
        enterprise: 'Unlimited',
      },
      {
        name: 'Priority in search',
        free: false,
        basic: '+50 priority',
        pro: '+100 priority',
        enterprise: '+200 priority',
      },
      {
        name: 'Featured on homepage',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Reviews & Engagement',
    features: [
      {
        name: 'Review responses',
        free: '5/month',
        basic: 'Unlimited',
        pro: 'Unlimited',
        enterprise: 'Unlimited',
      },
      {
        name: 'AI-powered review responses',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Email notifications',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'WhatsApp notifications',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Analytics',
    features: [
      {
        name: 'Basic analytics',
        free: '7 days',
        basic: '30 days',
        pro: '365 days',
        enterprise: 'Forever',
      },
      {
        name: 'Competitor analysis',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Custom reports',
        free: false,
        basic: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Marketing',
    features: [
      {
        name: 'Coupons & promotions',
        free: '1 active',
        basic: '3 active',
        pro: '10 active',
        enterprise: 'Unlimited',
      },
      {
        name: 'QR codes',
        free: false,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Custom subdomain',
        free: false,
        basic: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Support',
    features: [
      {
        name: 'Email support',
        free: true,
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Priority support',
        free: false,
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Dedicated account manager',
        free: false,
        basic: false,
        pro: false,
        enterprise: true,
      },
      {
        name: 'API access',
        free: false,
        basic: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
];

/**
 * Trial configuration
 */
export const TRIAL_CONFIG = {
  enabled: true,
  durationDays: 14,
  plans: ['basic', 'pro'] as PlanId[], // Which plans offer trial
};

/**
 * Referral rewards configuration
 */
export const REFERRAL_REWARDS = {
  referrer: {
    perSignup: 'none',
    perConversion: '1_month_free', // 1 month free on their plan
    milestones: [
      { count: 5, reward: '50_euro_credit' },
      { count: 10, reward: 'lifetime_pro' },
    ],
  },
  referred: {
    signup: '14_day_trial',
    firstPayment: '50_percent_discount', // First 2 months
  },
};
