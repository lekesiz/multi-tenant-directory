/**
 * AI Helper Functions
 * Provides unified interface for OpenAI and Anthropic APIs
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AI_CONFIG, AI_PROMPTS, isAIAvailable } from '@/config/ai';

/**
 * AI Response Type
 */
export interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
  provider: 'openai' | 'anthropic';
  model: string;
  tokensUsed?: number;
  costCents?: number;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string): Promise<AIResponse> {
  const { apiKey, model, temperature, maxTokens } = AI_CONFIG.openai;

  if (!apiKey) {
    return {
      success: false,
      content: '',
      error: 'OpenAI API key not configured',
      provider: 'openai',
      model,
    };
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'Vous êtes un assistant IA spécialisé dans le marketing local et la gestion d\'avis clients en France.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      success: true,
      content,
      provider: 'openai',
      model,
      tokensUsed,
      costCents: calculateCost('openai', model, tokensUsed),
    };
  } catch (error) {
    console.error('[AI] OpenAI error:', error);
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'openai',
      model,
    };
  }
}

/**
 * Call Anthropic (Claude) API
 */
async function callAnthropic(prompt: string): Promise<AIResponse> {
  const { apiKey, model, maxTokens } = AI_CONFIG.anthropic;

  if (!apiKey) {
    return {
      success: false,
      content: '',
      error: 'Anthropic API key not configured',
      provider: 'anthropic',
      model,
    };
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content =
      message.content[0]?.type === 'text' ? message.content[0].text : '';
    const tokensUsed =
      (message.usage.input_tokens || 0) + (message.usage.output_tokens || 0);

    return {
      success: true,
      content,
      provider: 'anthropic',
      model,
      tokensUsed,
      costCents: calculateCost('anthropic', model, tokensUsed),
    };
  } catch (error) {
    console.error('[AI] Anthropic error:', error);
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'anthropic',
      model,
    };
  }
}

/**
 * Calculate cost based on tokens used
 */
function calculateCost(
  provider: 'openai' | 'anthropic',
  model: string,
  tokens: number
): number {
  // Approximate cost calculation
  // OpenAI: gpt-4o-mini is $0.15/$0.60 per 1M tokens (input/output)
  // Anthropic: claude-3-5-haiku is $0.25/$1.25 per 1M tokens

  if (provider === 'openai' && model === 'gpt-4o-mini') {
    return (tokens / 1000000) * 0.375; // Average of input/output
  }

  if (provider === 'anthropic' && model === 'claude-3-5-haiku-20241022') {
    return (tokens / 1000000) * 0.75; // Average of input/output
  }

  return 0;
}

/**
 * Main AI call function (auto-selects provider)
 */
async function callAI(prompt: string): Promise<AIResponse> {
  if (!isAIAvailable()) {
    return {
      success: false,
      content: '',
      error: 'AI provider not configured',
      provider: AI_CONFIG.provider,
      model: '',
    };
  }

  if (AI_CONFIG.provider === 'openai') {
    return callOpenAI(prompt);
  }

  if (AI_CONFIG.provider === 'anthropic') {
    return callAnthropic(prompt);
  }

  return {
    success: false,
    content: '',
    error: 'Invalid AI provider',
    provider: AI_CONFIG.provider,
    model: '',
  };
}

/**
 * Generate business description
 */
export async function generateBusinessDescription(data: {
  name: string;
  category: string;
  city: string;
  address?: string;
  existingDescription?: string;
}): Promise<AIResponse> {
  const prompt = AI_PROMPTS.generateDescription(data);
  return callAI(prompt);
}

/**
 * Analyze review sentiment and extract insights
 */
export async function analyzeReview(review: {
  rating: number;
  comment: string;
  authorName: string;
}): Promise<AIResponse> {
  const prompt = AI_PROMPTS.analyzeReview(review);
  const response = await callAI(prompt);

  if (response.success) {
    try {
      // Validate JSON response
      JSON.parse(response.content);
    } catch (error) {
      return {
        ...response,
        success: false,
        error: 'Invalid JSON response from AI',
      };
    }
  }

  return response;
}

/**
 * Generate review response
 */
export async function generateReviewResponse(data: {
  companyName: string;
  rating: number;
  comment: string;
  authorName: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}): Promise<AIResponse> {
  const prompt = AI_PROMPTS.generateReviewResponse(data);
  return callAI(prompt);
}

/**
 * Generate SEO keywords
 */
export async function generateSEOKeywords(data: {
  name: string;
  category: string;
  city: string;
  services?: string[];
}): Promise<AIResponse> {
  const prompt = AI_PROMPTS.generateKeywords(data);
  const response = await callAI(prompt);

  if (response.success) {
    try {
      // Validate JSON array response
      const keywords = JSON.parse(response.content);
      if (!Array.isArray(keywords)) {
        throw new Error('Response is not an array');
      }
    } catch (error) {
      return {
        ...response,
        success: false,
        error: 'Invalid JSON array response from AI',
      };
    }
  }

  return response;
}

/**
 * Analyze multiple reviews for insights
 */
export async function analyzeMultipleReviews(
  reviews: Array<{ rating: number; comment: string }>
): Promise<AIResponse> {
  const prompt = AI_PROMPTS.analyzeMultipleReviews(reviews);
  const response = await callAI(prompt);

  if (response.success) {
    try {
      // Validate JSON response
      JSON.parse(response.content);
    } catch (error) {
      return {
        ...response,
        success: false,
        error: 'Invalid JSON response from AI',
      };
    }
  }

  return response;
}

/**
 * Retry logic for AI calls
 */
export async function callAIWithRetry(
  fn: () => Promise<AIResponse>,
  maxRetries = 3
): Promise<AIResponse> {
  let lastError: AIResponse | null = null;

  for (let i = 0; i < maxRetries; i++) {
    const result = await fn();

    if (result.success) {
      return result;
    }

    lastError = result;

    // Wait before retry (exponential backoff)
    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  return (
    lastError || {
      success: false,
      content: '',
      error: 'Max retries exceeded',
      provider: AI_CONFIG.provider,
      model: '',
    }
  );
}

/**
 * Parse JSON response safely
 */
export function parseAIJSON<T = any>(content: string): T | null {
  try {
    // Remove markdown code blocks if present
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('[AI] Failed to parse JSON:', error);
    return null;
  }
}
