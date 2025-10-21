import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { generateSEOContent } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { businessData, contentType } = await request.json();

    if (!businessData || !contentType) {
      return NextResponse.json(
        { error: 'Données manquantes pour générer le contenu SEO' },
        { status: 400 }
      );
    }

    if (!businessData.name || !businessData.category || !businessData.city) {
      return NextResponse.json(
        { error: 'Informations business incomplètes' },
        { status: 400 }
      );
    }

    const validContentTypes = ['description', 'about', 'services', 'meta'];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Type de contenu invalide' },
        { status: 400 }
      );
    }

    // Generate SEO content
    const aiResponse = await generateSEOContent({
      companyName: businessData.name,
      category: businessData.category,
      location: businessData.city,
      keywords: businessData.keywords || [],
      contentType: contentType,
    });

    // Parse AI response
    const content = typeof aiResponse.content === 'string' 
      ? aiResponse.content 
      : JSON.stringify(aiResponse.content);

    // Analyze content for SEO metrics
    const analysis = analyzeSEOContent(content, businessData, contentType);

    return NextResponse.json({
      content,
      analysis,
      metadata: {
        contentType,
        businessName: businessData.name,
        generatedAt: new Date().toISOString(),
        characterCount: content.length,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
      },
    });

  } catch (error) {
    logger.error('AI SEO Content API error:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la génération du contenu SEO' },
      { status: 500 }
    );
  }
}

// Helper function to analyze SEO content
function analyzeSEOContent(
  content: string, 
  businessData: any, 
  contentType: string
) {
  const contentLower = content.toLowerCase();
  
  // Check for key elements
  const hasBusinessName = contentLower.includes(businessData.name.toLowerCase());
  const hasCity = contentLower.includes(businessData.city.toLowerCase());
  const hasCategory = contentLower.includes(businessData.category.toLowerCase());
  
  // Count keywords
  const keywords = [
    businessData.name.toLowerCase(),
    businessData.city.toLowerCase(),
    businessData.category.toLowerCase(),
    ...(businessData.services || []).map((s: string) => s.toLowerCase()),
  ];
  
  const keywordDensity = keywords.reduce((acc, keyword) => {
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex);
    return acc + (matches ? matches.length : 0);
  }, 0);

  // Check length appropriateness
  const lengthLimits = {
    description: { min: 100, max: 300 },
    about: { min: 200, max: 500 },
    services: { min: 150, max: 400 },
    meta: { min: 120, max: 155 },
  };
  
  const limits = lengthLimits[contentType as keyof typeof lengthLimits];
  const isAppropriateLength = content.length >= limits.min && content.length <= limits.max;

  // Check for call-to-action
  const ctaKeywords = ['contactez', 'appelez', 'visitez', 'découvrez', 'réservez', 'demandez'];
  const hasCallToAction = ctaKeywords.some(cta => contentLower.includes(cta));

  return {
    seoScore: calculateSEOScore({
      hasBusinessName,
      hasCity,
      hasCategory,
      keywordDensity,
      isAppropriateLength,
      hasCallToAction,
    }),
    checks: {
      businessName: hasBusinessName,
      localKeywords: hasCity,
      categoryMention: hasCategory,
      appropriateLength: isAppropriateLength,
      callToAction: hasCallToAction,
      keywordDensity: keywordDensity > 0,
    },
    recommendations: generateSEORecommendations({
      hasBusinessName,
      hasCity,
      hasCategory,
      keywordDensity,
      isAppropriateLength,
      hasCallToAction,
      contentType,
    }),
  };
}

// Helper function to calculate SEO score
function calculateSEOScore(checks: any): number {
  const weights = {
    hasBusinessName: 20,
    hasCity: 25,
    hasCategory: 20,
    keywordDensity: 15,
    isAppropriateLength: 10,
    hasCallToAction: 10,
  };

  let score = 0;
  
  if (checks.hasBusinessName) score += weights.hasBusinessName;
  if (checks.hasCity) score += weights.hasCity;
  if (checks.hasCategory) score += weights.hasCategory;
  if (checks.keywordDensity > 0) score += weights.keywordDensity;
  if (checks.isAppropriateLength) score += weights.isAppropriateLength;
  if (checks.hasCallToAction) score += weights.hasCallToAction;

  return score;
}

// Helper function to generate SEO recommendations
function generateSEORecommendations(checks: any): string[] {
  const recommendations: string[] = [];

  if (!checks.hasBusinessName) {
    recommendations.push('Inclure le nom de l\'entreprise de manière naturelle');
  }
  
  if (!checks.hasCity) {
    recommendations.push('Ajouter des références à la localisation géographique');
  }
  
  if (!checks.hasCategory) {
    recommendations.push('Mentionner le secteur d\'activité principal');
  }
  
  if (checks.keywordDensity === 0) {
    recommendations.push('Intégrer plus de mots-clés pertinents');
  }
  
  if (!checks.isAppropriateLength) {
    if (checks.contentType === 'meta') {
      recommendations.push('Ajuster la longueur pour respecter les limites des meta descriptions');
    } else {
      recommendations.push('Ajuster la longueur du contenu pour un meilleur SEO');
    }
  }
  
  if (!checks.hasCallToAction) {
    recommendations.push('Ajouter un appel à l\'action clair');
  }

  if (recommendations.length === 0) {
    recommendations.push('Contenu bien optimisé pour le SEO !');
  }

  return recommendations;
}