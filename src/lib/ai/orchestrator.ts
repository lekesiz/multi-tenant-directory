/**
 * AI Orchestration System (NETZ Team)
 *
 * Coordinates multiple AI models for enhanced analysis and decision-making
 * - Claude: Technical Lead (code analysis, debugging, system design)
 * - Gemini: Research & Innovation (creative solutions, data analysis)
 * - GPT-4: Strategy & Integration (general knowledge, problem solving)
 */

import { getN8nClient } from './n8n-client';

export interface AITask {
  id: string;
  type: 'analysis' | 'generation' | 'optimization' | 'research';
  prompt: string;
  context?: any;
  priority?: 'low' | 'medium' | 'high';
}

export interface AIResponse {
  taskId: string;
  model: 'claude' | 'gemini' | 'gpt4';
  response: string;
  confidence: number;
  timestamp: string;
  metadata?: any;
}

export interface OrchestrationResult {
  taskId: string;
  responses: AIResponse[];
  consensus?: string;
  recommendations: string[];
  executionTime: number;
}

export class AIOrchestrator {
  private n8nClient = getN8nClient();

  /**
   * Execute task with AI orchestration
   * Distributes task to multiple AI models and synthesizes results
   */
  async executeTask(task: AITask): Promise<OrchestrationResult> {
    const startTime = Date.now();

    try {
      // Call n8n webhook for AI orchestration
      const result = await this.n8nClient.callWebhook('ai-orchestrate', {
        taskId: task.id,
        type: task.type,
        prompt: task.prompt,
        context: task.context,
        priority: task.priority || 'medium',
        timestamp: new Date().toISOString(),
      });

      // Parse orchestration result
      const responses: AIResponse[] = result.data?.responses || [];
      const consensus = result.data?.consensus || '';
      const recommendations = result.data?.recommendations || [];

      return {
        taskId: task.id,
        responses,
        consensus,
        recommendations,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('AI orchestration failed:', error);

      // Fallback: Return empty result with error
      return {
        taskId: task.id,
        responses: [],
        consensus: 'AI orchestration unavailable',
        recommendations: ['Please check n8n configuration'],
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Analyze company description
   * Uses AI to improve company descriptions, extract keywords, suggest categories
   */
  async analyzeCompanyDescription(
    companyName: string,
    description: string,
    categories: string[]
  ): Promise<{
    improvedDescription: string;
    suggestedKeywords: string[];
    suggestedCategories: string[];
    seoScore: number;
  }> {
    const task: AITask = {
      id: `company-analysis-${Date.now()}`,
      type: 'analysis',
      prompt: `Analyze this company and provide improvements:
Company: ${companyName}
Description: ${description}
Current Categories: ${categories.join(', ')}

Please provide:
1. An improved, SEO-friendly description (150-200 words)
2. Relevant keywords for SEO
3. Suggested additional categories
4. SEO score (0-100)`,
      context: {
        companyName,
        description,
        categories,
      },
      priority: 'medium',
    };

    const result = await this.executeTask(task);

    // Parse AI responses
    const claudeResponse = result.responses.find((r) => r.model === 'claude');
    const geminiResponse = result.responses.find((r) => r.model === 'gemini');

    // Extract data from responses (simplified - in production, use proper parsing)
    return {
      improvedDescription: result.consensus || description,
      suggestedKeywords: this.extractKeywords(result.consensus),
      suggestedCategories: this.extractCategories(result.consensus),
      seoScore: this.calculateSeoScore(result.consensus),
    };
  }

  /**
   * Generate review response
   * Uses AI to generate professional responses to customer reviews
   */
  async generateReviewResponse(
    review: {
      rating: number;
      comment: string;
      authorName: string;
    },
    companyName: string,
    tone: 'professional' | 'friendly' | 'formal' = 'professional'
  ): Promise<string> {
    const task: AITask = {
      id: `review-response-${Date.now()}`,
      type: 'generation',
      prompt: `Generate a ${tone} response to this customer review:
Company: ${companyName}
Rating: ${review.rating}/5 stars
Author: ${review.authorName}
Comment: ${review.comment}

Generate a response that:
1. Thanks the customer
2. ${review.rating >= 4 ? 'Expresses appreciation' : 'Addresses concerns professionally'}
3. ${review.rating < 3 ? 'Offers to resolve issues' : 'Invites them back'}
4. Maintains a ${tone} tone
5. Is 50-100 words`,
      context: {
        review,
        companyName,
        tone,
      },
      priority: 'high',
    };

    const result = await this.executeTask(task);
    return result.consensus || `Thank you for your review, ${review.authorName}!`;
  }

  /**
   * Optimize search query
   * Uses AI to improve search queries for better results
   */
  async optimizeSearchQuery(query: string, context?: {
    city?: string;
    category?: string;
    userIntent?: string;
  }): Promise<{
    optimizedQuery: string;
    suggestedFilters: any;
    searchStrategy: string;
  }> {
    const task: AITask = {
      id: `search-optimization-${Date.now()}`,
      type: 'optimization',
      prompt: `Optimize this search query:
Query: "${query}"
${context?.city ? `City: ${context.city}` : ''}
${context?.category ? `Category: ${context.category}` : ''}
${context?.userIntent ? `User Intent: ${context.userIntent}` : ''}

Provide:
1. Optimized query with better keywords
2. Suggested filters (category, location, rating, etc.)
3. Search strategy (exact match, fuzzy, semantic, etc.)`,
      context: {
        query,
        ...context,
      },
      priority: 'low',
    };

    const result = await this.executeTask(task);

    return {
      optimizedQuery: result.consensus || query,
      suggestedFilters: this.extractFilters(result.consensus),
      searchStrategy: 'semantic',
    };
  }

  /**
   * Generate SEO content
   * Creates SEO-optimized content for pages
   */
  async generateSeoContent(
    pageType: 'category' | 'city' | 'company',
    data: {
      name: string;
      description?: string;
      keywords?: string[];
    }
  ): Promise<{
    title: string;
    metaDescription: string;
    h1: string;
    content: string;
    structuredData: any;
  }> {
    const task: AITask = {
      id: `seo-content-${Date.now()}`,
      type: 'generation',
      prompt: `Generate SEO-optimized content for a ${pageType} page:
Name: ${data.name}
${data.description ? `Description: ${data.description}` : ''}
${data.keywords ? `Keywords: ${data.keywords.join(', ')}` : ''}

Generate:
1. SEO title (50-60 characters)
2. Meta description (150-160 characters)
3. H1 heading
4. Page content (200-300 words, naturally incorporates keywords)
5. JSON-LD structured data`,
      context: {
        pageType,
        ...data,
      },
      priority: 'medium',
    };

    const result = await this.executeTask(task);

    // Parse result (simplified)
    return {
      title: this.extractTitle(result.consensus, data.name),
      metaDescription: this.extractMetaDescription(result.consensus),
      h1: data.name,
      content: result.consensus || '',
      structuredData: {},
    };
  }

  // Helper methods for parsing AI responses

  private extractKeywords(text: string): string[] {
    // Simplified keyword extraction
    // In production, use proper NLP or parse structured AI response
    const keywords: string[] = [];
    const keywordMatch = text.match(/keywords?:?\s*([^\n]+)/i);
    if (keywordMatch) {
      keywords.push(
        ...keywordMatch[1]
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      );
    }
    return keywords.slice(0, 10);
  }

  private extractCategories(text: string): string[] {
    const categories: string[] = [];
    const categoryMatch = text.match(/categor(?:y|ies):?\s*([^\n]+)/i);
    if (categoryMatch) {
      categories.push(
        ...categoryMatch[1]
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      );
    }
    return categories.slice(0, 5);
  }

  private calculateSeoScore(text: string): number {
    // Simplified SEO score calculation
    const scoreMatch = text.match(/(?:seo )?score:?\s*(\d+)/i);
    if (scoreMatch) {
      return parseInt(scoreMatch[1], 10);
    }
    return 75; // Default score
  }

  private extractFilters(text: string): any {
    // Simplified filter extraction
    return {};
  }

  private extractTitle(text: string, fallback: string): string {
    const titleMatch = text.match(/title:?\s*([^\n]+)/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    return fallback;
  }

  private extractMetaDescription(text: string): string {
    const metaMatch = text.match(/meta description:?\s*([^\n]+)/i);
    if (metaMatch) {
      return metaMatch[1].trim();
    }
    return '';
  }
}

// Singleton instance
let orchestrator: AIOrchestrator | null = null;

/**
 * Get AI orchestrator instance
 */
export function getAIOrchestrator(): AIOrchestrator {
  if (!orchestrator) {
    orchestrator = new AIOrchestrator();
  }
  return orchestrator;
}

/**
 * Quick helper: Analyze company with AI
 */
export async function analyzeCompanyWithAI(
  companyName: string,
  description: string,
  categories: string[]
) {
  return getAIOrchestrator().analyzeCompanyDescription(companyName, description, categories);
}

/**
 * Quick helper: Generate review response with AI
 */
export async function generateReviewResponseWithAI(
  review: { rating: number; comment: string; authorName: string },
  companyName: string,
  tone: 'professional' | 'friendly' | 'formal' = 'professional'
) {
  return getAIOrchestrator().generateReviewResponse(review, companyName, tone);
}
