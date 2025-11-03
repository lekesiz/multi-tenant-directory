import { logger } from '@/lib/logger';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

interface ImageGenerationParams {
  companyName: string;
  category: string;
  description?: string;
  city?: string;
}

/**
 * Generate a prompt for AI image generation
 * Based on company details to create contextually appropriate cover images
 */
function generateImagePrompt(params: ImageGenerationParams): string {
  const { companyName, category, description, city } = params;

  // Category-specific keywords
  const categoryKeywords: Record<string, string> = {
    restaurant: 'fine dining restaurant, modern interior, warm lighting, professional food photography',
    cafe: 'cozy café, coffee shop, warm ambiance, aesthetic setup',
    bar: 'elegant bar, cocktails, sophisticated atmosphere',
    bakery: 'artisan bakery, fresh bread, traditional oven',
    pharmacy: 'modern pharmacy, professional healthcare setting',
    hospital: 'modern hospital, professional medical facility',
    doctor: 'medical clinic, professional healthcare environment',
    dentist: 'dental clinic, modern equipment, professional',
    car_repair: 'professional auto repair shop, vehicles',
    bank: 'modern bank, financial services, professional',
    hotel: 'luxury hotel, elegant lobby, professional hospitality',
    gym: 'fitness center, exercise equipment, athletic environment',
    hair_salon: 'modern hair salon, professional styling station',
    spa: 'luxury spa, relaxation, wellness environment',
    cinema: 'movie theater, cinema seats, entertainment',
    museum: 'museum gallery, art exhibition, cultural space',
    park: 'beautiful park, outdoor nature, scenic landscape',
    plumber: 'professional plumbing service, tools, expertise',
    electrician: 'professional electrician, tools, expertise',
    school: 'modern school building, educational environment',
    supermarket: 'modern supermarket, retail store, organized shelves',
  };

  const keywords = categoryKeywords[category] || 'modern professional business establishment';

  let prompt = `Create a professional cover image for a ${category} business called "${companyName}"`;

  if (city) {
    prompt += ` located in ${city}`;
  }

  prompt += `. The image should show a ${keywords}. `;

  if (description) {
    // Extract key terms from description
    const keyTerms = description
      .split(' ')
      .filter(word => word.length > 5)
      .slice(0, 3)
      .join(', ');
    prompt += `The business specializes in: ${keyTerms}. `;
  }

  prompt += `Style: professional, high-quality, suitable for business website header.
Lighting: bright, professional lighting.
Composition: horizontal composition, 16:9 aspect ratio suitable for website hero.
Avoid: people, faces, logos, text overlays.`;

  return prompt;
}

/**
 * Generate an image using Claude's vision capabilities via Replicate
 * (Claude doesn't generate images, but we can use Replicate's Flux model via API)
 */
export async function generateCoverImage(params: ImageGenerationParams): Promise<string | null> {
  try {
    if (!REPLICATE_API_TOKEN) {
      logger.warn('Replicate API token not configured, skipping image generation');
      return null;
    }

    const prompt = generateImagePrompt(params);

    // Use Replicate API to generate image with Flux model
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: 'fed7785dc6c8f0491705af34c33eec70e322b0e6e4d62a01eacf51bd5fd5ad80', // Flux Pro model
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: '16:9',
          output_quality: 90,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('Replicate API error:', error);
      return null;
    }

    const data: any = await response.json();

    // Replicate returns a prediction with ID, we need to poll for completion
    let prediction = data;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5s intervals

    while (prediction.status === 'processing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
      });

      if (!pollResponse.ok) {
        logger.error('Failed to poll prediction');
        return null;
      }

      prediction = await pollResponse.json();
      attempts++;
    }

    if (prediction.status !== 'succeeded') {
      logger.error('Image generation failed:', prediction.error);
      return null;
    }

    // Extract the image URL from the output
    const imageUrl = prediction.output?.[0];
    if (!imageUrl) {
      logger.error('No image URL in response:', prediction);
      return null;
    }

    return imageUrl;
  } catch (error) {
    logger.error('Error generating cover image:', error);
    return null;
  }
}

/**
 * Alternative: Generate image using a simpler approach with Unsplash API for fallback
 * (Free service, good for MVP)
 */
export async function generateCoverImageFallback(params: ImageGenerationParams): Promise<string | null> {
  try {
    const { category, city } = params;

    // Map category to relevant Unsplash search terms
    const searchTerms: Record<string, string> = {
      restaurant: 'restaurant interior modern',
      cafe: 'coffee shop café',
      bar: 'bar cocktails elegant',
      bakery: 'bakery bread fresh',
      pharmacy: 'pharmacy healthcare',
      hospital: 'hospital medical',
      doctor: 'medical clinic',
      dentist: 'dental clinic',
      car_repair: 'auto repair garage',
      bank: 'bank finance',
      hotel: 'hotel luxury',
      gym: 'fitness gym exercise',
      hair_salon: 'hair salon styling',
      spa: 'spa wellness relax',
      cinema: 'cinema movies theater',
      museum: 'museum art gallery',
      park: 'park nature outdoor',
      plumber: 'plumbing tools',
      electrician: 'electrician tools',
      school: 'school education',
      supermarket: 'supermarket retail',
    };

    const search = searchTerms[category] || category;
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      logger.warn('Unsplash API key not configured');
      return null;
    }

    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(search)}&orientation=landscape&w=1600&h=900&client_id=${accessKey}`
    );

    if (!response.ok) {
      logger.error('Unsplash API error:', response.status);
      return null;
    }

    const data: any = await response.json();
    return data.urls?.full || data.urls?.regular || null;
  } catch (error) {
    logger.error('Error generating fallback cover image:', error);
    return null;
  }
}

/**
 * Generate a prompt description for image generation
 * Used by Claude to create AI-generated prompts
 */
export async function generateImagePromptDescription(params: ImageGenerationParams): Promise<string> {
  const { companyName, category, description } = params;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Create a detailed visual description for an AI image generator for this business:
Name: ${companyName}
Category: ${category}
Description: ${description || 'Professional business'}

Format your response as a concise visual prompt suitable for DALL-E or Midjourney. Focus on professional appearance, lighting, and composition.`,
        },
      ],
    });

    if (message.content[0].type === 'text') {
      return message.content[0].text;
    }
    return generateImagePrompt(params);
  } catch (error) {
    logger.error('Error generating image prompt description:', error);
    return generateImagePrompt(params);
  }
}

export default {
  generateCoverImage,
  generateCoverImageFallback,
  generateImagePromptDescription,
};

/**
 * Generate image using Google Gemini Imagen
 * Note: Gemini 2.0 Flash does not directly generate images, but we can use Gemini Pro to create prompts for Replicate
 */
export async function generateImage(
  prompt: string,
  options?: { style?: string; aspectRatio?: string; model?: string }
): Promise<string> {
  try {
    // First, use Replicate if available
    if (REPLICATE_API_TOKEN) {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: 'fed7785dc6c8f0491705af34c33eec70e322b0e6e4d62a01eacf51bd5fd5ad80', // Flux Pro
          input: {
            prompt: `${prompt}. ${options?.style || 'Professional, high-quality style'}. Aspect ratio: ${options?.aspectRatio || '16:9'}.`,
            num_outputs: 1,
            aspect_ratio: options?.aspectRatio || '16:9',
            output_quality: 90,
          },
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        let prediction = data;
        let attempts = 0;
        const maxAttempts = 30;

        while (prediction.status === 'processing' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
          });
          if (pollResponse.ok) {
            prediction = await pollResponse.json();
          }
          attempts++;
        }

        if (prediction.status === 'succeeded' && prediction.output?.[0]) {
          return prediction.output[0];
        }
      }
    }

    // Fallback to Unsplash
    logger.info('Using Unsplash as fallback for image generation');
    const searchQuery = prompt.split(' ').slice(0, 3).join(' ');
    return `https://source.unsplash.com/1600x900/?${encodeURIComponent(searchQuery)}`;
  } catch (error) {
    logger.error('Error generating image:', error);
    return `https://via.placeholder.com/1600x900.png?text=${encodeURIComponent('Activity Image')}`;
  }
}
