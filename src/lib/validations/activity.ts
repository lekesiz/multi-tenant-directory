import { z } from 'zod';

// Activity type enum
export const activityTypeSchema = z.enum([
  'announcement',
  'event',
  'offer',
  'update',
  'story',
  'news',
]);

// Post type enum
export const postTypeSchema = z.enum(['daily', 'weekly', 'monthly']);

// Status enum
export const activityStatusSchema = z.enum(['draft', 'scheduled', 'published', 'archived']);

// Social platform enum
export const socialPlatformSchema = z.enum(['facebook', 'twitter', 'linkedin', 'instagram']);

// AI model enum
export const aiModelSchema = z.enum(['gemini', 'gpt-4', 'claude', 'veo-3']);

// Create Activity Schema
export const createActivitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(300, 'Excerpt is too long').optional(),
  type: activityTypeSchema,
  postType: postTypeSchema.default('daily'),
  status: activityStatusSchema.default('draft'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  imageCaption: z.string().max(200).optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  videoThumbnail: z.string().url('Invalid thumbnail URL').optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string().min(2).max(30)).max(10, 'Maximum 10 tags allowed').optional(),
  category: z.string().max(50).optional(),
  metaTitle: z.string().max(60, 'Meta title is too long').optional(),
  metaDescription: z.string().max(160, 'Meta description is too long').optional(),
  metaKeywords: z.array(z.string()).max(10, 'Maximum 10 keywords').optional(),
  scheduledFor: z
    .string()
    .datetime()
    .or(z.date())
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const scheduleDate = new Date(date);
        return scheduleDate > new Date();
      },
      { message: 'Scheduled date must be in the future' }
    ),
  expiresAt: z.string().datetime().or(z.date()).optional(),
});

// Update Activity Schema
export const updateActivitySchema = createActivitySchema.partial().extend({
  id: z.string().cuid(),
});

// Generate Activity Schema
export const generateActivitySchema = z.object({
  companyId: z.number().int().positive(),
  type: activityTypeSchema,
  postType: postTypeSchema.optional(),
  topic: z.string().min(3).max(200).optional(),
  prompt: z.string().min(10).max(1000).optional(),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'informative']).default('professional'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
});

// Generate Image Schema
export const generateImageSchema = z.object({
  activityId: z.string().cuid(),
  prompt: z.string().min(10).max(500).optional(),
  style: z.enum(['realistic', 'artistic', 'minimalist', 'vibrant']).default('realistic'),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '9:16']).default('16:9'),
});

// Generate Video Schema
export const generateVideoSchema = z.object({
  activityId: z.string().cuid(),
  prompt: z.string().min(10).max(500).optional(),
  duration: z.number().int().min(5).max(60).default(15), // 5-60 seconds
  style: z.enum(['cinematic', 'documentary', 'promotional', 'casual']).default('promotional'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
});

// Share Activity Schema
export const shareActivitySchema = z.object({
  activityId: z.string().cuid(),
  platforms: z.array(socialPlatformSchema).min(1, 'Select at least one platform'),
  customMessage: z.string().max(280).optional(), // Twitter limit
  scheduleTime: z.string().datetime().or(z.date()).optional(),
});

// List Activities Query Schema
export const listActivitiesQuerySchema = z.object({
  companyId: z.number().int().positive().optional(),
  status: z
    .union([activityStatusSchema, z.array(activityStatusSchema)])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return [val];
      return val;
    }),
  type: z
    .union([activityTypeSchema, z.array(activityTypeSchema)])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') return [val];
      return val;
    }),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'publishedAt', 'views', 'likes', 'shares']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
});

// Publish Activity Schema
export const publishActivitySchema = z.object({
  id: z.string().cuid(),
  publishNow: z.boolean().default(true),
  scheduledFor: z
    .string()
    .datetime()
    .or(z.date())
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const scheduleDate = new Date(date);
        return scheduleDate > new Date();
      },
      { message: 'Scheduled date must be in the future' }
    ),
});

// Slug generation helper
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Ensure unique slug
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Validate image URL format
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return validExtensions.some((ext) => urlObj.pathname.toLowerCase().endsWith(ext));
  } catch {
    return false;
  }
}

// Validate video URL format
export function isValidVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.mp4', '.webm', '.mov', '.avi'];
    const validHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'wistia.com'];

    return (
      validExtensions.some((ext) => urlObj.pathname.toLowerCase().endsWith(ext)) ||
      validHosts.some((host) => urlObj.hostname.includes(host))
    );
  } catch {
    return false;
  }
}

// Calculate reading time (words per minute)
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength: number = 150): string {
  // Remove HTML tags if any
  const plainText = content.replace(/<[^>]*>/g, '');

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

// Validate engagement metrics
export function isValidEngagementMetrics(metrics: {
  views: number;
  likes: number;
  shares: number;
  comments: number;
}): boolean {
  return (
    metrics.views >= 0 &&
    metrics.likes >= 0 &&
    metrics.shares >= 0 &&
    metrics.comments >= 0 &&
    metrics.likes <= metrics.views &&
    metrics.shares <= metrics.views
  );
}
