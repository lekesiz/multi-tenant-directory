/**
 * Google Gemini AI Integration
 * For Activity content generation
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { logger } from '@/lib/logger';

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  logger.warn('[Gemini] API key not configured');
}

/**
 * Safety settings for Gemini
 */
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Generate activity content using Gemini
 */
export async function generateActivityContent(params: {
  type: string;
  companyName: string;
  categories: string[];
  city: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  topic?: string;
  prompt?: string;
}): Promise<{
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
}> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const { type, companyName, categories, city, tone = 'professionnel', length = 'medium', topic, prompt } = params;

  // Build the prompt
  const systemPrompt = `Tu es un expert en marketing de contenu pour les entreprises locales en France.
Génère du contenu ${length === 'short' ? 'concis (100-200 mots)' : length === 'medium' ? 'détaillé (300-500 mots)' : 'complet (600-1000 mots)'}
pour une entreprise appelée "${companyName}" située à ${city}.

Catégories d'activité: ${categories.join(', ')}
Type de contenu: ${type}
Ton: ${tone}
${topic ? `Sujet: ${topic}` : ''}

${prompt || `Crée un contenu ${type} engageant qui met en valeur l'entreprise et attire les clients locaux.`}

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide dans ce format exact:
{
  "title": "Un titre accrocheur",
  "content": "Le contenu principal en markdown",
  "excerpt": "Un résumé en 1-2 phrases",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      safetySettings,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: length === 'short' ? 500 : length === 'medium' ? 1000 : 2000,
      },
    });

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const generated = JSON.parse(jsonMatch[0]);

    return {
      title: generated.title || `${type} - ${companyName}`,
      content: generated.content || text,
      excerpt: generated.excerpt || text.substring(0, 150) + '...',
      tags: generated.tags || [type, city, ...categories.slice(0, 2)],
    };
  } catch (error) {
    logger.error('[Gemini] Error generating activity content:', error);
    throw error;
  }
}

/**
 * Generate image prompt using Gemini
 */
export async function generateImagePrompt(params: {
  type: string;
  title: string;
  content: string;
  companyName: string;
  categories: string[];
}): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const { type, title, content, companyName, categories } = params;

  const systemPrompt = `Tu es un expert en génération de prompts pour des modèles d'IA générative d'images.

Basé sur ce contenu d'activité:
- Type: ${type}
- Titre: ${title}
- Entreprise: ${companyName}
- Catégories: ${categories.join(', ')}
- Contenu: ${content.substring(0, 300)}...

Crée un prompt détaillé en anglais pour générer une image professionnelle et attrayante qui représente visuellement cette activité.

Le prompt doit:
- Être en anglais
- Décrire une scène professionnelle et de haute qualité
- Être adapté à l'activité (${type})
- Éviter les visages, logos ou texte
- Spécifier un style moderne et professionnel
- Inclure des détails sur l'éclairage et la composition

Réponds UNIQUEMENT avec le prompt (pas de JSON, pas d'explication supplémentaire).`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      safetySettings,
    });

    const result = await model.generateContent(systemPrompt);
    return result.response.text().trim();
  } catch (error) {
    logger.error('[Gemini] Error generating image prompt:', error);
    throw error;
  }
}

/**
 * Enhance existing activity content
 */
export async function enhanceActivityContent(params: {
  title: string;
  content: string;
  type: string;
  suggestions?: string;
}): Promise<{
  enhancedTitle: string;
  enhancedContent: string;
  newTags: string[];
}> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const { title, content, type, suggestions } = params;

  const systemPrompt = `Tu es un expert en amélioration de contenu marketing.

Contenu actuel:
Titre: ${title}
Type: ${type}
Contenu: ${content}
${suggestions ? `Suggestions d'amélioration: ${suggestions}` : ''}

Améliore ce contenu en:
1. Rendant le titre plus accrocheur
2. Enrichissant le contenu avec des détails pertinents
3. Ajoutant des mots-clés SEO appropriés
4. Conservant un ton professionnel

Réponds avec un objet JSON:
{
  "enhancedTitle": "Titre amélioré",
  "enhancedContent": "Contenu amélioré en markdown",
  "newTags": ["tag1", "tag2", "tag3"]
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      safetySettings,
    });

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    logger.error('[Gemini] Error enhancing content:', error);
    throw error;
  }
}

/**
 * Generate professional company profile from SIRET data
 * Uses Annuaire + Google data to create SEO-friendly description
 */
export async function generateCompanyProfile(params: {
  name: string;
  city: string;
  address?: string;
  categories: string[];
  nafCode?: string;
  legalForm?: string;
  employeeCount?: number;
  foundingDate?: Date;
  googleRating?: number;
  googleReviewCount?: number;
}): Promise<{
  description: string;
  seoTitle: string;
  seoDescription: string;
  services: string[];
  highlights: string[];
}> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const {
    name,
    city,
    address,
    categories,
    nafCode,
    legalForm,
    employeeCount,
    foundingDate,
    googleRating,
    googleReviewCount,
  } = params;

  const systemPrompt = `Tu es un expert en rédaction de profils d'entreprises pour un annuaire professionnel français.

Crée un profil professionnel et engageant pour cette entreprise vérifiée par les données officielles gouvernementales:

**Informations officielles:**
- Nom: ${name}
- Ville: ${city}
${address ? `- Adresse: ${address}` : ''}
- Catégories: ${categories.join(', ')}
${nafCode ? `- Code NAF: ${nafCode}` : ''}
${legalForm ? `- Forme juridique: ${legalForm}` : ''}
${employeeCount ? `- Effectif: ${employeeCount} salariés` : ''}
${foundingDate ? `- Fondée en: ${new Date(foundingDate).getFullYear()}` : ''}
${googleRating ? `- Note Google: ${googleRating}/5 (${googleReviewCount} avis)` : ''}

**Ta mission:**
Rédige un profil d'entreprise qui:
1. Met en valeur l'entreprise de manière professionnelle
2. Optimisé pour le référencement local (SEO)
3. Attire les clients potentiels
4. Reste factuel et crédible
5. Est rédigé en français professionnel

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide dans ce format exact:
{
  "description": "Une description complète de l'entreprise (200-300 mots), professionnelle, engageante et optimisée SEO",
  "seoTitle": "Titre SEO accrocheur (max 60 caractères) incluant le nom et la ville",
  "seoDescription": "Meta description SEO (max 160 caractères) qui incite au clic",
  "services": ["Service 1", "Service 2", "Service 3", "Service 4", "Service 5"],
  "highlights": ["Point fort 1", "Point fort 2", "Point fort 3"]
}

La description doit:
- Commencer par présenter l'entreprise et son expertise
- Mentionner sa localisation (${city})
- Décrire ses services principaux basés sur les catégories
- Mentionner les points forts (si données disponibles: ancienneté, note Google, effectif)
- Être naturelle et non robotique
- Éviter les superlatifs exagérés`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
      },
    });

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const generated = JSON.parse(jsonMatch[0]);

    logger.info('[Gemini] Company profile generated', {
      name,
      descriptionLength: generated.description?.length,
      servicesCount: generated.services?.length,
    });

    return {
      description: generated.description || '',
      seoTitle: generated.seoTitle || `${name} - ${city}`,
      seoDescription: generated.seoDescription || generated.description?.substring(0, 160) || '',
      services: generated.services || [],
      highlights: generated.highlights || [],
    };
  } catch (error) {
    logger.error('[Gemini] Error generating company profile:', error);
    throw error;
  }
}

export default {
  generateActivityContent,
  generateImagePrompt,
  enhanceActivityContent,
  generateCompanyProfile,
};
