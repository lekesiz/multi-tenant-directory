/**
 * Data Processing Service
 * Handles AI-powered data analysis and processing
 */

import { getGrokAI, safeGrokCall } from './grok';

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  keywords: string[];
  aspects: {
    service?: 'positive' | 'neutral' | 'negative';
    quality?: 'positive' | 'neutral' | 'negative';
    price?: 'positive' | 'neutral' | 'negative';
    location?: 'positive' | 'neutral' | 'negative';
  };
}

export interface SpamDetectionResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
  category?: 'promotional' | 'fake' | 'irrelevant' | 'malicious';
}

export interface ContentModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flags: string[];
  categories: {
    profanity?: boolean;
    hate?: boolean;
    violence?: boolean;
    sexual?: boolean;
    spam?: boolean;
  };
  suggestedAction: 'approve' | 'review' | 'reject';
}

export interface AutoCategorizationResult {
  primaryCategory: string;
  confidence: number;
  secondaryCategories: string[];
  suggestedTags: string[];
}

/**
 * Analyze review sentiment
 */
export async function analyzeReviewSentiment(
  reviewText: string,
  rating?: number
): Promise<SentimentAnalysisResult> {
  const prompt = `Analyze the sentiment of this review in French:

Review: "${reviewText}"
${rating ? `Rating: ${rating}/5` : ''}

Provide a detailed sentiment analysis in JSON format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": -1 to 1 (where -1 is very negative, 0 is neutral, 1 is very positive),
  "confidence": 0 to 1,
  "keywords": ["keyword1", "keyword2"],
  "aspects": {
    "service": "positive" | "neutral" | "negative" (if mentioned),
    "quality": "positive" | "neutral" | "negative" (if mentioned),
    "price": "positive" | "neutral" | "negative" (if mentioned),
    "location": "positive" | "neutral" | "negative" (if mentioned)
  }
}`;

  const systemPrompt = `You are a sentiment analysis expert. Analyze French reviews and provide detailed sentiment insights.
Focus on identifying specific aspects like service quality, pricing, location, etc.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<SentimentAnalysisResult>(prompt, systemPrompt, {
        temperature: 0.3,
        maxTokens: 500,
      });
    },
    {
      sentiment: rating ? (rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative') : 'neutral',
      score: rating ? (rating - 3) / 2 : 0,
      confidence: 0.5,
      keywords: [],
      aspects: {},
    }
  );
}

/**
 * Detect spam in reviews or comments
 */
export async function detectSpam(
  text: string,
  authorName?: string,
  metadata?: { email?: string; phone?: string }
): Promise<SpamDetectionResult> {
  const prompt = `Analyze if this content is spam:

Text: "${text}"
${authorName ? `Author: ${authorName}` : ''}
${metadata?.email ? `Email: ${metadata.email}` : ''}
${metadata?.phone ? `Phone: ${metadata.phone}` : ''}

Detect spam indicators and provide analysis in JSON:
{
  "isSpam": true | false,
  "confidence": 0 to 1,
  "reasons": ["reason1", "reason2"],
  "category": "promotional" | "fake" | "irrelevant" | "malicious" (if spam)
}

Spam indicators:
- Promotional content or advertising
- Fake or generated reviews
- Irrelevant content
- Malicious links or content
- Repetitive patterns
- Excessive punctuation or caps`;

  const systemPrompt = `You are a spam detection expert. Analyze content for spam indicators.
Be conservative - only flag clear spam cases.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<SpamDetectionResult>(prompt, systemPrompt, {
        temperature: 0.2,
        maxTokens: 300,
      });
    },
    {
      isSpam: false,
      confidence: 0.5,
      reasons: [],
    }
  );
}

/**
 * Moderate content for appropriateness
 */
export async function moderateContent(
  text: string,
  context?: string
): Promise<ContentModerationResult> {
  const prompt = `Moderate this content for appropriateness:

Content: "${text}"
${context ? `Context: ${context}` : ''}

Check for inappropriate content and provide analysis in JSON:
{
  "isAppropriate": true | false,
  "confidence": 0 to 1,
  "flags": ["flag1", "flag2"],
  "categories": {
    "profanity": true | false,
    "hate": true | false,
    "violence": true | false,
    "sexual": true | false,
    "spam": true | false
  },
  "suggestedAction": "approve" | "review" | "reject"
}

Check for:
- Profanity or vulgar language
- Hate speech or discrimination
- Violence or threats
- Sexual content
- Spam or promotional content`;

  const systemPrompt = `You are a content moderation expert. Analyze content for policy violations.
Consider French language and cultural context. Be thorough but fair.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<ContentModerationResult>(prompt, systemPrompt, {
        temperature: 0.2,
        maxTokens: 400,
      });
    },
    {
      isAppropriate: true,
      confidence: 0.5,
      flags: [],
      categories: {},
      suggestedAction: 'approve',
    }
  );
}

/**
 * Auto-categorize business
 */
export async function autoCategorizeBusiness(
  businessName: string,
  description?: string,
  services?: string[],
  existingCategory?: string
): Promise<AutoCategorizationResult> {
  const prompt = `Categorize this business:

Business Name: ${businessName}
${description ? `Description: ${description}` : ''}
${services?.length ? `Services: ${services.join(', ')}` : ''}
${existingCategory ? `Current Category: ${existingCategory}` : ''}

Available categories (French):
- Restaurant
- Boulangerie
- Pâtisserie
- Café
- Bar
- Hôtel
- Pharmacie
- Médecin
- Dentiste
- Coiffeur
- Esthéticienne
- Garage
- Automobile
- Plombier
- Électricien
- Menuisier
- Peintre
- Architecte
- Avocat
- Comptable
- Banque
- Assurance
- Immobilier
- Informatique
- Fleuriste
- Bijouterie
- Librairie
- Vêtements
- Chaussures
- Sport
- Loisirs
- Autre

Provide categorization in JSON:
{
  "primaryCategory": "category name",
  "confidence": 0 to 1,
  "secondaryCategories": ["category1", "category2"],
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;

  const systemPrompt = `You are a business categorization expert. Analyze business information and suggest appropriate categories.
Use French category names. Be specific and accurate.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<AutoCategorizationResult>(prompt, systemPrompt, {
        temperature: 0.3,
        maxTokens: 300,
      });
    },
    {
      primaryCategory: existingCategory || 'Autre',
      confidence: 0.5,
      secondaryCategories: [],
      suggestedTags: [],
    }
  );
}

/**
 * Extract structured data from unstructured text
 */
export async function extractBusinessInfo(
  text: string
): Promise<{
  name?: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  services?: string[];
}> {
  const prompt = `Extract structured business information from this text:

"${text}"

Provide extracted data in JSON:
{
  "name": "business name" (if found),
  "category": "business category" (if found),
  "address": "full address" (if found),
  "phone": "phone number" (if found),
  "email": "email address" (if found),
  "website": "website URL" (if found),
  "hours": "business hours" (if found),
  "services": ["service1", "service2"] (if found)
}

Only include fields that are clearly mentioned in the text.`;

  const systemPrompt = `You are a data extraction expert. Extract structured information from unstructured text.
Be accurate and only extract information that is clearly stated.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON(prompt, systemPrompt, {
        temperature: 0.2,
        maxTokens: 500,
      });
    },
    {}
  );
}

/**
 * Batch analyze review sentiments
 */
export async function batchAnalyzeSentiments(
  reviews: Array<{ id: string; text: string; rating?: number }>
): Promise<Map<string, SentimentAnalysisResult>> {
  const results = new Map<string, SentimentAnalysisResult>();

  // Process in batches of 5
  const batchSize = 5;
  for (let i = 0; i < reviews.length; i += batchSize) {
    const batch = reviews.slice(i, i + batchSize);
    const promises = batch.map(async (review) => {
      const analysis = await analyzeReviewSentiment(review.text, review.rating);
      return { id: review.id, analysis };
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ id, analysis }) => {
      results.set(id, analysis);
    });

    // Small delay between batches
    if (i + batchSize < reviews.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Detect duplicate reviews
 */
export async function detectDuplicateReviews(
  newReview: string,
  existingReviews: string[]
): Promise<{
  isDuplicate: boolean;
  confidence: number;
  matchedReview?: string;
}> {
  if (existingReviews.length === 0) {
    return { isDuplicate: false, confidence: 1.0 };
  }

  const prompt = `Check if this new review is a duplicate of any existing reviews:

New Review: "${newReview}"

Existing Reviews:
${existingReviews.map((r, i) => `${i + 1}. "${r}"`).join('\n')}

Analyze and provide result in JSON:
{
  "isDuplicate": true | false,
  "confidence": 0 to 1,
  "matchedReview": "matched review text" (if duplicate found)
}

Consider:
- Exact or near-exact matches
- Same content with minor variations
- Translated versions
- Paraphrased versions`;

  const systemPrompt = `You are a duplicate detection expert. Identify if reviews are duplicates.
Be thorough but avoid false positives.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON(prompt, systemPrompt, {
        temperature: 0.2,
        maxTokens: 200,
      });
    },
    { isDuplicate: false, confidence: 0.5 }
  );
}

