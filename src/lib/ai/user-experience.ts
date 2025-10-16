/**
 * User Experience Service
 * Handles AI-powered user experience features
 */

import { getGrokAI, safeGrokCall } from './grok';

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  businessRecommendations?: Array<{
    name: string;
    category: string;
    reason: string;
  }>;
  followUpQuestions?: string[];
}

export interface SearchSuggestion {
  query: string;
  category?: string;
  confidence: number;
  type: 'business' | 'category' | 'service' | 'location';
}

export interface PersonalizedRecommendation {
  businessId: number;
  score: number;
  reasons: string[];
  matchedPreferences: string[];
}

/**
 * Generate chatbot response for business inquiries
 */
export async function generateChatbotResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  context?: {
    city?: string;
    availableCategories?: string[];
    recentSearches?: string[];
  }
): Promise<ChatbotResponse> {
  const contextInfo = context
    ? `
Available Context:
- City: ${context.city || 'Not specified'}
- Available Categories: ${context.availableCategories?.join(', ') || 'All categories'}
- Recent Searches: ${context.recentSearches?.join(', ') || 'None'}
`
    : '';

  const conversationContext =
    conversationHistory.length > 0
      ? `
Previous Conversation:
${conversationHistory.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}
`
      : '';

  const prompt = `You are a helpful assistant for a local business directory platform.

${contextInfo}
${conversationContext}

User Message: "${userMessage}"

Provide a helpful response in JSON format:
{
  "message": "Your response in French",
  "suggestions": ["suggestion1", "suggestion2"] (optional - quick action buttons),
  "businessRecommendations": [
    {
      "name": "Business name",
      "category": "Category",
      "reason": "Why recommended"
    }
  ] (optional - if user is looking for specific businesses),
  "followUpQuestions": ["question1", "question2"] (optional - to help user)
}

Guidelines:
- Always respond in French
- Be helpful and friendly
- Provide specific business recommendations when relevant
- Ask clarifying questions if needed
- Suggest relevant categories or searches
- Keep responses concise but informative`;

  const systemPrompt = `You are a friendly and knowledgeable assistant for a French local business directory.
Help users find businesses, answer questions about services, and provide recommendations.
Always respond in French. Be professional yet approachable.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<ChatbotResponse>(prompt, systemPrompt, {
        temperature: 0.8,
        maxTokens: 500,
      });
    },
    {
      message: 'Je suis désolé, je ne peux pas répondre pour le moment. Veuillez réessayer.',
      suggestions: ['Voir toutes les catégories', 'Rechercher un professionnel'],
    }
  );
}

/**
 * Generate smart search suggestions
 */
export async function generateSearchSuggestions(
  partialQuery: string,
  context?: {
    city?: string;
    recentSearches?: string[];
    popularCategories?: string[];
  }
): Promise<SearchSuggestion[]> {
  const contextInfo = context
    ? `
Context:
- City: ${context.city || 'Not specified'}
- Recent Searches: ${context.recentSearches?.join(', ') || 'None'}
- Popular Categories: ${context.popularCategories?.join(', ') || 'None'}
`
    : '';

  const prompt = `Generate smart search suggestions for this partial query:

Query: "${partialQuery}"
${contextInfo}

Provide 5-8 relevant search suggestions in JSON format:
[
  {
    "query": "Complete search query",
    "category": "Category name" (if applicable),
    "confidence": 0 to 1,
    "type": "business" | "category" | "service" | "location"
  }
]

Guidelines:
- Suggestions in French
- Mix of business names, categories, and services
- Consider user's location and context
- Order by relevance and confidence
- Include popular and trending searches`;

  const systemPrompt = `You are a search suggestion expert. Generate relevant and helpful search suggestions.
Consider French language and local business context.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<SearchSuggestion[]>(prompt, systemPrompt, {
        temperature: 0.6,
        maxTokens: 400,
      });
    },
    [
      {
        query: partialQuery,
        confidence: 0.5,
        type: 'business',
      },
    ]
  );
}

/**
 * Generate personalized business recommendations
 */
export async function generatePersonalizedRecommendations(
  userProfile: {
    recentSearches?: string[];
    viewedBusinesses?: Array<{ name: string; category: string }>;
    reviewedBusinesses?: Array<{ name: string; category: string; rating: number }>;
    preferences?: string[];
    location?: string;
  },
  availableBusinesses: Array<{
    id: number;
    name: string;
    category: string;
    description?: string;
    rating?: number;
  }>,
  limit: number = 10
): Promise<PersonalizedRecommendation[]> {
  const prompt = `Generate personalized business recommendations based on user profile:

User Profile:
- Recent Searches: ${userProfile.recentSearches?.join(', ') || 'None'}
- Viewed Businesses: ${userProfile.viewedBusinesses?.map((b) => `${b.name} (${b.category})`).join(', ') || 'None'}
- Reviewed Businesses: ${userProfile.reviewedBusinesses?.map((b) => `${b.name} (${b.category}) - ${b.rating}★`).join(', ') || 'None'}
- Preferences: ${userProfile.preferences?.join(', ') || 'None'}
- Location: ${userProfile.location || 'Not specified'}

Available Businesses:
${availableBusinesses
  .map(
    (b) =>
      `ID: ${b.id} | ${b.name} | ${b.category} | ${b.rating ? `${b.rating}★` : 'No rating'} | ${b.description?.substring(0, 100) || 'No description'}`
  )
  .join('\n')}

Provide top ${limit} recommendations in JSON format:
[
  {
    "businessId": number,
    "score": 0 to 1,
    "reasons": ["reason1", "reason2"],
    "matchedPreferences": ["preference1", "preference2"]
  }
]

Consider:
- User's search history and interests
- Previously viewed/reviewed businesses
- Category preferences
- Ratings and quality
- Location relevance
- Diversity of recommendations`;

  const systemPrompt = `You are a recommendation engine expert. Analyze user behavior and preferences to suggest relevant businesses.
Provide personalized, diverse, and high-quality recommendations.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<PersonalizedRecommendation[]>(prompt, systemPrompt, {
        temperature: 0.5,
        maxTokens: 800,
      });
    },
    availableBusinesses.slice(0, limit).map((b) => ({
      businessId: b.id,
      score: 0.5,
      reasons: ['Popular business'],
      matchedPreferences: [],
    }))
  );
}

/**
 * Generate FAQ answers
 */
export async function generateFAQAnswer(
  question: string,
  context?: {
    businessName?: string;
    category?: string;
    city?: string;
  }
): Promise<string> {
  const contextInfo = context
    ? `
Context:
- Business: ${context.businessName || 'General'}
- Category: ${context.category || 'General'}
- City: ${context.city || 'General'}
`
    : '';

  const prompt = `Answer this frequently asked question:

Question: "${question}"
${contextInfo}

Requirements:
- Answer in French
- Be concise and helpful (2-4 sentences)
- Provide accurate information
- Professional and friendly tone
- Include relevant details based on context`;

  const systemPrompt = `You are a customer service expert. Answer FAQs clearly and helpfully.
Always respond in French. Be accurate and professional.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generate(prompt, systemPrompt, {
        temperature: 0.7,
        maxTokens: 200,
      });
    },
    'Je suis désolé, je ne peux pas répondre à cette question pour le moment.'
  );
}

/**
 * Generate onboarding tips for new users
 */
export async function generateOnboardingTips(
  userType: 'visitor' | 'business_owner',
  context?: {
    city?: string;
    interests?: string[];
  }
): Promise<string[]> {
  const prompt = `Generate helpful onboarding tips for a ${userType} on a local business directory platform:

${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide 5-7 actionable tips in JSON format:
["Tip 1", "Tip 2", "Tip 3", ...]

Requirements:
- Tips in French
- Specific and actionable
- Relevant to ${userType}
- Help them get the most value from the platform
- Progressive difficulty (start with basics)`;

  const systemPrompt = `You are an onboarding specialist. Create helpful tips that guide new users.
Make tips clear, actionable, and valuable.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generateJSON<string[]>(prompt, systemPrompt, {
        temperature: 0.7,
        maxTokens: 400,
      });
    },
    [
      'Explorez les catégories pour découvrir des professionnels locaux.',
      'Utilisez la recherche pour trouver rapidement ce dont vous avez besoin.',
      'Consultez les avis pour faire le meilleur choix.',
    ]
  );
}

/**
 * Generate contextual help text
 */
export async function generateContextualHelp(
  page: string,
  userAction?: string
): Promise<string> {
  const prompt = `Generate contextual help text for:

Page: ${page}
${userAction ? `User Action: ${userAction}` : ''}

Provide a brief, helpful explanation in French (1-2 sentences) that helps the user understand what they can do on this page or with this action.`;

  const systemPrompt = `You are a UX writing expert. Create clear, concise help text.
Always write in French. Be helpful without being verbose.`;

  return safeGrokCall(
    async (grok) => {
      return await grok.generate(prompt, systemPrompt, {
        temperature: 0.6,
        maxTokens: 100,
      });
    },
    'Besoin d\'aide ? Contactez notre support.'
  );
}

