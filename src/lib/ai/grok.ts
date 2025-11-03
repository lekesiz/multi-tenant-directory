/**
 * Grok AI Service
 * Base service for all Grok AI integrations
 */

import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface GrokCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finishReason: string;
    index: number;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Grok AI Client
 */
export class GrokAI {
  private apiKey: string;
  private baseUrl: string = 'https://api.x.ai/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.XAI_API_KEY || '';

    // Don't throw error at construction time for build compatibility
    // Will throw when actually calling the API if key is missing
  }

  /**
   * Create a chat completion
   */
  async createCompletion(
    messages: GrokMessage[],
    options: GrokCompletionOptions = {}
  ): Promise<GrokCompletionResponse> {
    if (!this.apiKey) {
      throw new Error('XAI_API_KEY is not configured');
    }

    const {
      model = 'grok-beta',
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
      stream = false,
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          stream,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Grok API error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Grok AI completion error:', error);
      throw error;
    }
  }

  /**
   * Generate text from a single prompt
   */
  async generate(
    prompt: string,
    systemPrompt?: string,
    options?: GrokCompletionOptions
  ): Promise<string> {
    const messages: GrokMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const response = await this.createCompletion(messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T = any>(
    prompt: string,
    systemPrompt?: string,
    options?: GrokCompletionOptions
  ): Promise<T> {
    const fullSystemPrompt = systemPrompt
      ? `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.`
      : 'Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.';

    const response = await this.generate(prompt, fullSystemPrompt, {
      ...options,
      temperature: options?.temperature || 0.3, // Lower temperature for more consistent JSON
    });

    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Failed to parse JSON response:', response);
      throw new Error(`Invalid JSON response from Grok AI: ${error}`);
    }
  }
}

/**
 * Get singleton Grok AI instance
 */
let grokInstance: GrokAI | null = null;

export function getGrokAI(): GrokAI {
  if (!grokInstance) {
    grokInstance = new GrokAI();
  }
  return grokInstance;
}

/**
 * Helper function to safely call Grok AI with error handling
 */
export async function safeGrokCall<T>(
  fn: (grok: GrokAI) => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const grok = getGrokAI();
    return await fn(grok);
  } catch (error) {
    logger.error('Grok AI call failed, using fallback:', error);
    return fallback;
  }
}

