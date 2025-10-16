import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

// AI Models configuration
export const AI_MODELS = {
  CHAT: openai('gpt-4o-mini'), // Fast and cost-effective for chat
  CONTENT: openai('gpt-4o'), // Higher quality for content generation
  ANALYSIS: openai('gpt-4o-mini'), // Good for analysis tasks
} as const;

// Chatbot system prompt
export const CHATBOT_SYSTEM_PROMPT = `Tu es un assistant virtuel intelligent pour une plateforme d'annuaire professionnel français. 

Tu aides les utilisateurs avec:
- Trouver des entreprises locales
- Comprendre les services offerts
- Naviguer sur la plateforme
- Questions sur les tarifs et abonnements
- Support technique de base

Instructions:
- Réponds toujours en français
- Sois professionnel mais amical
- Propose des solutions concrètes
- Si tu ne connais pas une réponse spécifique, dirige vers le support humain
- Utilise des émojis occasionnellement pour rendre la conversation plus agréable
- Reste dans le contexte de l'annuaire professionnel

Évite:
- Les sujets non liés à la plateforme
- Les conseils médicaux ou juridiques
- Les informations personnelles sensibles`;

// Review response generator prompt
export const REVIEW_RESPONSE_PROMPT = `Tu es un assistant qui aide les propriétaires d'entreprises à répondre aux avis clients de manière professionnelle.

Génère une réponse appropriée selon ces critères:
- Ton professionnel et courtois
- Remercie toujours le client
- Adresse les points spécifiques mentionnés
- Propose une solution si c'est un avis négatif
- Encourage à revenir pour les avis positifs
- Maximum 150 mots
- En français

Contexte de l'entreprise: {businessContext}
Avis du client: {reviewText}
Note: {rating}/5 étoiles`;

// SEO content generation prompt
export const SEO_CONTENT_PROMPT = `Tu es un expert en rédaction SEO pour les entreprises locales françaises.

Génère un contenu optimisé SEO selon ces critères:
- Français naturel et engageant
- Mots-clés locaux intégrés naturellement
- Structure claire avec sous-titres
- Call-to-action à la fin
- Adapté au secteur d'activité

Informations sur l'entreprise:
- Nom: {businessName}
- Secteur: {category}
- Ville: {city}
- Services: {services}

Type de contenu à générer: {contentType}`;

// Business insights analysis prompt
export const INSIGHTS_PROMPT = `Tu es un analyste business qui fournit des insights actionnables basés sur les données d'une entreprise.

Analyse les métriques suivantes et fournis:
- 3 points forts identifiés
- 3 axes d'amélioration
- 2 recommandations concrètes
- 1 alerte si applicable

Données analytiques: {analyticsData}
Informations contextuelles: {businessContext}

Format de réponse en JSON:
{
  "strengths": ["point1", "point2", "point3"],
  "improvements": ["axe1", "axe2", "axe3"],
  "recommendations": ["rec1", "rec2"],
  "alerts": ["alerte"] ou []
}`;

// Helper function to generate chatbot response
export async function generateChatbotResponse(userMessage: string, conversationHistory: string[] = []) {
  try {
    const context = conversationHistory.length > 0 
      ? `Historique de conversation:\n${conversationHistory.join('\n')}\n\n`
      : '';

    const { text } = await generateText({
      model: AI_MODELS.CHAT,
      system: CHATBOT_SYSTEM_PROMPT,
      prompt: `${context}Utilisateur: ${userMessage}`,
      temperature: 0.7,
    });

    return text;
  } catch (error) {
    console.error('Error generating chatbot response:', error);
    throw new Error('Erreur lors de la génération de la réponse');
  }
}

// Helper function to generate streaming chatbot response
export async function streamChatbotResponse(userMessage: string, conversationHistory: string[] = []) {
  try {
    const context = conversationHistory.length > 0 
      ? `Historique de conversation:\n${conversationHistory.join('\n')}\n\n`
      : '';

    const result = await streamText({
      model: AI_MODELS.CHAT,
      system: CHATBOT_SYSTEM_PROMPT,
      prompt: `${context}Utilisateur: ${userMessage}`,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error streaming chatbot response:', error);
    throw new Error('Erreur lors de la génération de la réponse');
  }
}

// Helper function to generate review response
export async function generateReviewResponse(
  reviewText: string,
  rating: number,
  businessContext: { name: string; category: string; city: string }
) {
  try {
    const prompt = REVIEW_RESPONSE_PROMPT
      .replace('{businessContext}', `${businessContext.name} (${businessContext.category}) à ${businessContext.city}`)
      .replace('{reviewText}', reviewText)
      .replace('{rating}', rating.toString());

    const { text } = await generateText({
      model: AI_MODELS.CONTENT,
      prompt,
      temperature: 0.8,
    });

    return text;
  } catch (error) {
    console.error('Error generating review response:', error);
    throw new Error('Erreur lors de la génération de la réponse à l\'avis');
  }
}

// Helper function to generate SEO content
export async function generateSEOContent(
  businessData: {
    name: string;
    category: string;
    city: string;
    services: string[];
  },
  contentType: 'description' | 'about' | 'services' | 'meta'
) {
  try {
    const prompt = SEO_CONTENT_PROMPT
      .replace('{businessName}', businessData.name)
      .replace('{category}', businessData.category)
      .replace('{city}', businessData.city)
      .replace('{services}', businessData.services.join(', '))
      .replace('{contentType}', contentType);

    const { text } = await generateText({
      model: AI_MODELS.CONTENT,
      prompt,
      temperature: 0.7,
    });

    return text;
  } catch (error) {
    console.error('Error generating SEO content:', error);
    throw new Error('Erreur lors de la génération du contenu SEO');
  }
}

// Helper function to generate business insights
export async function generateBusinessInsights(
  analyticsData: any,
  businessContext: { name: string; category: string; city: string }
) {
  try {
    const prompt = INSIGHTS_PROMPT
      .replace('{analyticsData}', JSON.stringify(analyticsData))
      .replace('{businessContext}', JSON.stringify(businessContext));

    const { text } = await generateText({
      model: AI_MODELS.ANALYSIS,
      prompt,
      temperature: 0.3,
    });

    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating business insights:', error);
    throw new Error('Erreur lors de la génération des insights business');
  }
}

// Helper function to suggest business improvements
export async function suggestBusinessImprovements(businessData: {
  category: string;
  city: string;
  currentFeatures: string[];
  analytics: any;
}) {
  try {
    const prompt = `En tant qu'expert en développement commercial pour les entreprises locales, analyse cette entreprise et suggère 5 améliorations concrètes:

Secteur: ${businessData.category}
Ville: ${businessData.city}
Fonctionnalités actuelles: ${businessData.currentFeatures.join(', ')}
Analytics: ${JSON.stringify(businessData.analytics)}

Pour chaque suggestion, fournis:
- Le titre de l'amélioration
- Une explication courte (max 50 mots)
- L'impact estimé (Faible/Moyen/Élevé)
- La difficulté d'implémentation (Facile/Modéré/Difficile)

Format JSON attendu:
{
  "suggestions": [
    {
      "title": "Titre",
      "description": "Description",
      "impact": "Élevé",
      "difficulty": "Facile"
    }
  ]
}`;

    const { text } = await generateText({
      model: AI_MODELS.ANALYSIS,
      prompt,
      temperature: 0.6,
    });

    return JSON.parse(text);
  } catch (error) {
    console.error('Error suggesting business improvements:', error);
    throw new Error('Erreur lors de la génération des suggestions d\'amélioration');
  }
}