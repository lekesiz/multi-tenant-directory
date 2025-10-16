/**
 * Content Generation Service
 * Handles all AI-powered content generation
 */

import { getGrokAI, safeGrokCall } from './grok';

export interface BusinessDescriptionInput {
  name: string;
  category: string;
  address?: string;
  phone?: string;
  website?: string;
  existingDescription?: string;
}

export interface SEOMetaInput {
  businessName: string;
  category: string;
  city: string;
  services?: string[];
}

export interface ReviewResponseInput {
  businessName: string;
  reviewText: string;
  rating: number;
  reviewerName?: string;
}

export interface CategoryDescriptionInput {
  categoryName: string;
  city: string;
  businessCount?: number;
}

/**
 * Generate business description
 */
export async function generateBusinessDescription(
  input: BusinessDescriptionInput
): Promise<string> {
  const prompt = `Generate a professional and engaging business description in French for the following business:

Business Name: ${input.name}
Category: ${input.category}
${input.address ? `Address: ${input.address}` : ''}
${input.phone ? `Phone: ${input.phone}` : ''}
${input.website ? `Website: ${input.website}` : ''}
${input.existingDescription ? `Current Description: ${input.existingDescription}` : ''}

Requirements:
- Write in French
- 2-3 paragraphs (150-200 words)
- Professional and welcoming tone
- Highlight the business's unique value proposition
- Include relevant services or specialties
- Make it SEO-friendly
- Do not include contact information in the description

${input.existingDescription ? 'Improve and expand the existing description.' : 'Create a compelling new description.'}`;

  const systemPrompt = `You are a professional copywriter specializing in local business descriptions. 
Write engaging, SEO-optimized content that helps businesses attract customers.
Always write in French for French businesses.`;

  return safeGrokCall(
    async (grok) => {
      const description = await grok.generate(prompt, systemPrompt, {
        temperature: 0.8,
        maxTokens: 500,
      });
      return description.trim();
    },
    input.existingDescription || `${input.name} est une entreprise située dans la catégorie ${input.category}.`
  );
}

/**
 * Generate SEO meta description
 */
export async function generateSEOMetaDescription(
  input: SEOMetaInput
): Promise<string> {
  const servicesText = input.services?.length
    ? `Services: ${input.services.join(', ')}`
    : '';

  const prompt = `Generate an SEO-optimized meta description in French for:

Business: ${input.businessName}
Category: ${input.category}
City: ${input.city}
${servicesText}

Requirements:
- Write in French
- Exactly 150-160 characters
- Include business name, category, and city
- Action-oriented and compelling
- Include a call-to-action
- SEO keywords naturally integrated`;

  const systemPrompt = `You are an SEO specialist. Create compelling meta descriptions that improve click-through rates.
Always write in French. Keep it under 160 characters.`;

  return safeGrokCall(
    async (grok) => {
      const meta = await grok.generate(prompt, systemPrompt, {
        temperature: 0.7,
        maxTokens: 100,
      });
      // Ensure it's within character limit
      return meta.trim().substring(0, 160);
    },
    `${input.businessName} - ${input.category} à ${input.city}. Découvrez nos services et contactez-nous.`
  );
}

/**
 * Generate automatic review response
 */
export async function generateReviewResponse(
  input: ReviewResponseInput
): Promise<string> {
  const ratingContext =
    input.rating >= 4
      ? 'positive review'
      : input.rating === 3
      ? 'neutral review'
      : 'negative review';

  const prompt = `Generate a professional and empathetic response to this ${ratingContext}:

Business: ${input.businessName}
Rating: ${input.rating}/5
${input.reviewerName ? `Reviewer: ${input.reviewerName}` : ''}
Review: "${input.reviewText}"

Requirements:
- Write in French
- Professional and friendly tone
- ${input.rating >= 4 ? 'Thank the customer warmly' : ''}
- ${input.rating < 4 ? 'Acknowledge concerns and offer to resolve issues' : ''}
- ${input.rating === 3 ? 'Thank them and ask for feedback on improvements' : ''}
- Keep it concise (2-3 sentences, max 100 words)
- Personalized to the specific review content
- Include business name
- End with an invitation to return or contact`;

  const systemPrompt = `You are a customer service expert writing review responses for local businesses.
Be genuine, professional, and empathetic. Always write in French.`;

  return safeGrokCall(
    async (grok) => {
      const response = await grok.generate(prompt, systemPrompt, {
        temperature: 0.8,
        maxTokens: 200,
      });
      return response.trim();
    },
    input.rating >= 4
      ? `Merci pour votre avis ! Nous sommes ravis de vous avoir servi.`
      : `Merci pour votre retour. Nous prenons vos commentaires au sérieux et aimerions améliorer votre expérience.`
  );
}

/**
 * Generate category description
 */
export async function generateCategoryDescription(
  input: CategoryDescriptionInput
): Promise<string> {
  const businessCountText = input.businessCount
    ? `There are ${input.businessCount} businesses in this category.`
    : '';

  const prompt = `Generate a compelling category page description in French for:

Category: ${input.categoryName}
City: ${input.city}
${businessCountText}

Requirements:
- Write in French
- 2-3 paragraphs (120-150 words)
- Explain what this category includes
- Highlight the importance of these businesses in the local community
- SEO-optimized for local search
- Include a call-to-action to browse businesses
- Professional and informative tone`;

  const systemPrompt = `You are a content writer specializing in local business directories.
Create engaging category descriptions that help users understand the category and encourage exploration.
Always write in French.`;

  return safeGrokCall(
    async (grok) => {
      const description = await grok.generate(prompt, systemPrompt, {
        temperature: 0.7,
        maxTokens: 400,
      });
      return description.trim();
    },
    `Découvrez les meilleurs professionnels de ${input.categoryName} à ${input.city}.`
  );
}

/**
 * Batch generate business descriptions
 */
export async function batchGenerateBusinessDescriptions(
  businesses: BusinessDescriptionInput[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    const promises = batch.map(async (business) => {
      const description = await generateBusinessDescription(business);
      return { name: business.name, description };
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ name, description }) => {
      results.set(name, description);
    });

    // Small delay between batches
    if (i + batchSize < businesses.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Generate business tagline/slogan
 */
export async function generateBusinessTagline(
  businessName: string,
  category: string
): Promise<string> {
  const prompt = `Generate a catchy, memorable tagline in French for:

Business: ${businessName}
Category: ${category}

Requirements:
- Write in French
- Maximum 8-10 words
- Memorable and unique
- Reflects the business category
- Professional yet creative`;

  const systemPrompt = `You are a creative copywriter specializing in brand taglines.
Create short, impactful phrases that capture the essence of a business.`;

  return safeGrokCall(
    async (grok) => {
      const tagline = await grok.generate(prompt, systemPrompt, {
        temperature: 0.9,
        maxTokens: 50,
      });
      return tagline.trim();
    },
    `${businessName} - Votre ${category} de confiance`
  );
}

