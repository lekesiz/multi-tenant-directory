/**
 * AI Configuration
 * Supports both OpenAI and Anthropic (Claude) APIs
 */

export const AI_CONFIG = {
  // Provider selection: 'openai' | 'anthropic'
  provider: (process.env.AI_PROVIDER || 'anthropic') as 'openai' | 'anthropic',

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // Cost-effective model
    temperature: 0.7,
    maxTokens: 1000,
  },

  // Anthropic (Claude) Configuration
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022', // Fast and cost-effective
    maxTokens: 1000,
  },

  // Feature flags
  features: {
    contentGeneration: process.env.AI_CONTENT_GENERATION === 'true',
    reviewAnalysis: process.env.AI_REVIEW_ANALYSIS === 'true',
    autoResponses: process.env.AI_AUTO_RESPONSES === 'true',
    sentimentAnalysis: process.env.AI_SENTIMENT_ANALYSIS === 'true',
  },

  // Rate limiting (requests per business owner per day)
  rateLimits: {
    free: 5,
    basic: 20,
    pro: 100,
    enterprise: -1, // unlimited
  },

  // Cost tracking (in cents per request, approximate)
  costs: {
    openai: {
      'gpt-4o-mini': 0.5,
      'gpt-4o': 2.5,
    },
    anthropic: {
      'claude-3-5-haiku-20241022': 0.3,
      'claude-3-5-sonnet-20241022': 1.0,
    },
  },
} as const;

/**
 * AI Prompt Templates
 */
export const AI_PROMPTS = {
  /**
   * Generate business description
   */
  generateDescription: (data: {
    name: string;
    category: string;
    city: string;
    address?: string;
    existingDescription?: string;
  }) => `Vous êtes un expert en rédaction de contenu pour annuaires professionnels locaux en France.

Créez une description professionnelle et engageante (150-200 mots) pour cette entreprise:

Nom: ${data.name}
Catégorie: ${data.category}
Ville: ${data.city}
${data.address ? `Adresse: ${data.address}` : ''}
${data.existingDescription ? `Description actuelle: ${data.existingDescription}` : ''}

La description doit:
- Être en français professionnel
- Mettre en valeur les points forts de l'entreprise
- Inclure des mots-clés SEO pertinents pour ${data.category} à ${data.city}
- Être naturelle et engageante (pas de langage marketing excessif)
- Encourager les clients locaux à visiter ou contacter l'entreprise
- Ne PAS mentionner d'informations que vous ne connaissez pas (horaires, prix, etc.)

Répondez UNIQUEMENT avec la description, sans préambule ni explication.`,

  /**
   * Analyze review sentiment
   */
  analyzeReview: (review: {
    rating: number;
    comment: string;
    authorName: string;
  }) => `Analysez cet avis client et extrayez les informations structurées suivantes:

Notation: ${review.rating}/5
Commentaire: "${review.comment}"
Auteur: ${review.authorName}

Retournez un JSON valide avec cette structure exacte:
{
  "sentiment": "positive" | "neutral" | "negative",
  "keywords": ["mot-clé1", "mot-clé2", ...],
  "topics": {
    "service": "positive" | "neutral" | "negative" | null,
    "quality": "positive" | "neutral" | "negative" | null,
    "price": "positive" | "neutral" | "negative" | null,
    "ambiance": "positive" | "neutral" | "negative" | null,
    "hygiene": "positive" | "neutral" | "negative" | null
  },
  "summary": "Résumé en 1-2 phrases",
  "strengths": ["point fort 1", "point fort 2", ...],
  "weaknesses": ["point faible 1", "point faible 2", ...]
}

Répondez UNIQUEMENT avec le JSON, sans markdown ni explication.`,

  /**
   * Generate review response
   */
  generateReviewResponse: (data: {
    companyName: string;
    rating: number;
    comment: string;
    authorName: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }) => `Vous êtes le responsable de ${data.companyName}. Rédigez une réponse professionnelle à cet avis client.

Avis de ${data.authorName}:
Notation: ${data.rating}/5
Commentaire: "${data.comment}"
${data.sentiment ? `Sentiment: ${data.sentiment}` : ''}

La réponse doit:
- Être en français professionnel et chaleureux
- Remercier le client pour son avis
- ${data.rating >= 4 ? 'Exprimer votre gratitude et encourager à revenir' : ''}
- ${data.rating <= 2 ? 'Présenter des excuses sincères et proposer une solution' : ''}
- ${data.rating === 3 ? 'Reconnaître les points positifs et promettre des améliorations' : ''}
- Être concise (50-100 mots)
- Signer avec "${data.companyName}"
- Ne PAS inventer de faits ou de promesses que vous ne pouvez pas tenir

Répondez UNIQUEMENT avec la réponse, sans préambule ni explication.`,

  /**
   * Generate SEO keywords
   */
  generateKeywords: (data: {
    name: string;
    category: string;
    city: string;
    services?: string[];
  }) => `Générez une liste de 15-20 mots-clés SEO pertinents pour cette entreprise locale:

Nom: ${data.name}
Catégorie: ${data.category}
Ville: ${data.city}
${data.services ? `Services: ${data.services.join(', ')}` : ''}

Les mots-clés doivent:
- Être en français
- Inclure des variantes locales (avec ville, département)
- Inclure des termes de recherche courante
- Être pertinents pour le référencement local
- Varier entre mots-clés courts et longue traîne

Format: Retournez un tableau JSON de strings.
Exemple: ["restaurant italien strasbourg", "pizzeria bas-rhin", ...]

Répondez UNIQUEMENT avec le tableau JSON, sans markdown ni explication.`,

  /**
   * Analyze multiple reviews for insights
   */
  analyzeMultipleReviews: (reviews: Array<{ rating: number; comment: string }>) => `Analysez ces ${reviews.length} avis clients et créez un rapport d'insights:

Avis:
${reviews.map((r, i) => `${i + 1}. [${r.rating}/5] "${r.comment}"`).join('\n')}

Retournez un JSON avec cette structure:
{
  "overallSentiment": "positive" | "neutral" | "negative",
  "averageRating": number,
  "topStrengths": ["point fort 1", "point fort 2", "point fort 3"],
  "topWeaknesses": ["point faible 1", "point faible 2"],
  "commonKeywords": ["mot 1", "mot 2", ...],
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3"],
  "summary": "Résumé global en 2-3 phrases"
}

Répondez UNIQUEMENT avec le JSON, sans markdown ni explication.`,
} as const;

/**
 * Helper function to check if AI features are available
 */
export function isAIAvailable(): boolean {
  const { provider, openai, anthropic } = AI_CONFIG;

  if (provider === 'openai') {
    return !!openai.apiKey;
  }

  if (provider === 'anthropic') {
    return !!anthropic.apiKey;
  }

  return false;
}

/**
 * Get rate limit for a subscription tier
 */
export function getAIRateLimit(tier: 'free' | 'basic' | 'pro' | 'enterprise'): number {
  return AI_CONFIG.rateLimits[tier];
}

/**
 * Get estimated cost for a request
 */
export function getEstimatedCost(provider: 'openai' | 'anthropic', model: string): number {
  if (provider === 'openai') {
    return AI_CONFIG.costs.openai[model as keyof typeof AI_CONFIG.costs.openai] || 0;
  }
  if (provider === 'anthropic') {
    return AI_CONFIG.costs.anthropic[model as keyof typeof AI_CONFIG.costs.anthropic] || 0;
  }
  return 0;
}



// Additional AI Prompts (extended)
export const AI_PROMPTS_EXTENDED = {
  /**
   * Chatbot conversation
   */
  chatbot: `Vous êtes un assistant IA pour un annuaire d'entreprises locales.

Contexte: {context}
Historique: {history}
Message utilisateur: {message}

Répondez de manière utile et professionnelle en français.`,

  /**
   * Business insights
   */
  insights: `Analysez les performances de cette entreprise et générez des insights:

Entreprise: {companyName}
Catégorie: {category}
Avis: {reviews}
Statistiques: {stats}

Retournez un JSON avec: strengths, weaknesses, opportunities, threats.`,

  /**
   * Business recommendations
   */
  recommendations: `Suggérez des améliorations pour cette entreprise:

Entreprise: {companyName}
Catégorie: {category}
Note actuelle: {rating}/5
Problèmes courants: {issues}
Points forts: {strengths}

Retournez un JSON avec un tableau de recommendations.`,

  /**
   * SEO content generation
   */
  seoContent: `Générez du contenu SEO optimisé:

Entreprise: {companyName}
Catégorie: {category}
Localisation: {location}
Mots-clés: {keywords}
Type de contenu: {contentType}

Créez un contenu optimisé pour le SEO local en français.`,
};

// Merge extended prompts into main AI_PROMPTS
Object.assign(AI_PROMPTS, AI_PROMPTS_EXTENDED);

