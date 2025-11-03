import { Activity } from '@prisma/client';

// Activity types
export type ActivityType = 'announcement' | 'event' | 'offer' | 'update' | 'story' | 'news';
export type ActivityPostType = 'daily' | 'weekly' | 'monthly';
export type ActivityStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'instagram';
export type AIModel = 'gemini' | 'gpt-4' | 'claude' | 'veo-3';

// Create Activity Input
export interface CreateActivityInput {
  title: string;
  content: string;
  excerpt?: string;
  type: ActivityType;
  postType?: ActivityPostType;
  status?: ActivityStatus;
  imageUrl?: string;
  imageCaption?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  mediaUrls?: string[];
  tags?: string[];
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  scheduledFor?: Date | string;
  expiresAt?: Date | string;
}

// Update Activity Input
export interface UpdateActivityInput extends Partial<CreateActivityInput> {
  id: string;
}

// AI Generation Input
export interface GenerateActivityInput {
  companyId: number;
  type: ActivityType;
  postType?: ActivityPostType;
  topic?: string;
  prompt?: string;
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'informative';
  length?: 'short' | 'medium' | 'long';
}

// Image Generation Input
export interface GenerateImageInput {
  activityId: string;
  prompt?: string;
  style?: 'realistic' | 'artistic' | 'minimalist' | 'vibrant';
  aspectRatio?: '1:1' | '16:9' | '4:3' | '9:16';
}

// Video Generation Input
export interface GenerateVideoInput {
  activityId: string;
  prompt?: string;
  duration?: number; // seconds
  style?: 'cinematic' | 'documentary' | 'promotional' | 'casual';
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

// Social Sharing Input
export interface ShareActivityInput {
  activityId: string;
  platforms: SocialPlatform[];
  customMessage?: string;
  scheduleTime?: Date | string;
}

// Activity with metadata
export interface ActivityWithMetadata extends Activity {
  company?: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  engagementRate?: number;
  isScheduled?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

// List Activities Query
export interface ListActivitiesQuery {
  companyId?: number;
  status?: ActivityStatus | ActivityStatus[];
  type?: ActivityType | ActivityType[];
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'views' | 'likes' | 'shares';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tags?: string[];
  startDate?: Date | string;
  endDate?: Date | string;
}

// Activity Analytics
export interface ActivityAnalytics {
  totalActivities: number;
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  avgEngagementRate: number;
  topPerformingActivities: ActivityWithMetadata[];
  recentActivities: ActivityWithMetadata[];
  activityByType: Record<ActivityType, number>;
  activityByMonth: { month: string; count: number; views: number }[];
}

// Activity Response
export interface ActivityResponse {
  activity: ActivityWithMetadata;
  success: boolean;
  message?: string;
}

// Activities List Response
export interface ActivitiesListResponse {
  activities: ActivityWithMetadata[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  success: boolean;
}

// Share Status
export interface ShareStatus {
  platform: SocialPlatform;
  success: boolean;
  shareUrl?: string;
  error?: string;
  sharedAt?: Date;
}

// Share Response
export interface ShareActivityResponse {
  activityId: string;
  shares: ShareStatus[];
  success: boolean;
  message?: string;
}

// AI Generation Response
export interface AIGenerationResponse {
  content?: string;
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  videoUrl?: string;
  tags?: string[];
  success: boolean;
  model?: AIModel;
  tokensUsed?: number;
  error?: string;
}

// Validation errors
export interface ActivityValidationError {
  field: string;
  message: string;
}

// Activity constants
export const ACTIVITY_TYPES: ActivityType[] = [
  'announcement',
  'event',
  'offer',
  'update',
  'story',
  'news',
];

export const POST_TYPES: ActivityPostType[] = ['daily', 'weekly', 'monthly'];

export const ACTIVITY_STATUS: ActivityStatus[] = ['draft', 'scheduled', 'published', 'archived'];

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  'facebook',
  'twitter',
  'linkedin',
  'instagram',
];

// Rate limiting
export const ACTIVITY_RATE_LIMITS = {
  free: {
    activitiesPerDay: 5,
    aiGenerationsPerDay: 10,
    imageGenerationsPerDay: 5,
    videoGenerationsPerDay: 2,
  },
  basic: {
    activitiesPerDay: 20,
    aiGenerationsPerDay: 50,
    imageGenerationsPerDay: 20,
    videoGenerationsPerDay: 10,
  },
  pro: {
    activitiesPerDay: 100,
    aiGenerationsPerDay: 200,
    imageGenerationsPerDay: 100,
    videoGenerationsPerDay: 50,
  },
  premium: {
    activitiesPerDay: -1, // unlimited
    aiGenerationsPerDay: -1,
    imageGenerationsPerDay: -1,
    videoGenerationsPerDay: -1,
  },
};
