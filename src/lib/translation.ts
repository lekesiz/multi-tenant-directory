import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

/**
 * Detect the language of a text using Claude
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: `Detect the language of this text and respond with ONLY the ISO 639-1 language code (e.g., "en", "fr", "de", "es", "it"). Text: "${text}"`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      return response.text.trim().toLowerCase();
    }
    return 'en'; // Default to English
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en'; // Default to English on error
  }
}

/**
 * Translate text to French using Claude
 * Optimized for Google reviews (short texts with ratings)
 */
export async function translateToFrench(text: string, sourceLanguage: string = 'en'): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // If already in French, return as-is
  if (sourceLanguage === 'fr') {
    return text;
  }

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Translate this review/comment from ${sourceLanguage.toUpperCase()} to French. Keep the same tone and meaning. Respond with ONLY the translated text, no explanations:

"${text}"`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      return response.text.trim();
    }
    return text; // Return original if translation fails
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return original on error
  }
}

/**
 * Batch translate multiple reviews
 * Useful for syncing multiple Google reviews at once
 */
export async function translateReviewsBatch(
  reviews: Array<{
    id: number;
    text: string;
    language?: string;
  }>
): Promise<
  Array<{
    id: number;
    originalText: string;
    translatedText: string;
    language: string;
  }>
> {
  const results = [];

  for (const review of reviews) {
    const language = review.language || (await detectLanguage(review.text));
    const translated = language === 'fr' ? review.text : await translateToFrench(review.text, language);

    results.push({
      id: review.id,
      originalText: review.text,
      translatedText: translated,
      language,
    });

    // Rate limiting: Add small delay between API calls
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Generate French SEO-optimized description for a business
 * Used for AI content generation feature
 */
export async function generateBusinessDescription(businessInfo: {
  name: string;
  category: string;
  description?: string;
  location?: string;
  services?: string[];
}): Promise<string> {
  try {
    const existingContent = businessInfo.description ? `Improve and expand this existing description: "${businessInfo.description}"` : `Generate a new professional description`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${existingContent} for this business in French. Make it SEO-optimized and professional. The description should be 150-300 words.

Business Details:
- Name: ${businessInfo.name}
- Category: ${businessInfo.category}
- Location: ${businessInfo.location || 'Haguenau, France'}
${businessInfo.services?.length ? `- Services: ${businessInfo.services.join(', ')}` : ''}

Respond with ONLY the French description, no markdown or explanations.`,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      return response.text.trim();
    }
    return '';
  } catch (error) {
    console.error('Error generating business description:', error);
    return '';
  }
}

export default {
  detectLanguage,
  translateToFrench,
  translateReviewsBatch,
  generateBusinessDescription,
};
