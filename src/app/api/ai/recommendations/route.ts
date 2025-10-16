import { NextResponse } from 'next/server';
import { suggestBusinessImprovements } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { companyId, businessData } = await request.json();

    if (!companyId || !businessData) {
      return NextResponse.json(
        { error: 'Données manquantes pour générer les recommandations' },
        { status: 400 }
      );
    }

    if (!businessData.category || !businessData.city) {
      return NextResponse.json(
        { error: 'Informations business incomplètes' },
        { status: 400 }
      );
    }

    // Generate AI recommendations
    const aiResponse = await suggestBusinessImprovements({
      companyName: businessData.name || 'Entreprise',
      category: businessData.category,
      currentRating: businessData.analytics?.averageRating || 0,
      commonIssues: businessData.analytics?.commonIssues || [],
      strengths: businessData.analytics?.strengths || [],
    });

    // Parse AI response
    const suggestions = typeof aiResponse.content === 'string' 
      ? JSON.parse(aiResponse.content) 
      : aiResponse.content;

    // Add unique IDs and format for frontend
    const recommendationsList = Array.isArray(suggestions) ? suggestions : (suggestions.recommendations || suggestions.suggestions || []);
    const formattedSuggestions = recommendationsList.map((suggestion: any, index: number) => ({
      id: `${companyId}-${index}-${Date.now()}`,
      title: suggestion.title,
      description: suggestion.description,
      impact: suggestion.impact,
      difficulty: suggestion.difficulty,
      category: categorizeRecommendation(suggestion.title, suggestion.description),
      actionUrl: generateActionUrl(suggestion.title),
    }));

    return NextResponse.json({
      suggestions: formattedSuggestions,
      metadata: {
        companyId,
        businessName: businessData.name,
        generatedAt: new Date().toISOString(),
        totalSuggestions: formattedSuggestions.length,
      },
    });

  } catch (error) {
    console.error('AI Recommendations API error:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la génération des recommandations' },
      { status: 500 }
    );
  }
}

// Helper function to categorize recommendations
function categorizeRecommendation(title: string, description: string): string {
  const titleLower = title.toLowerCase();
  const descriptionLower = description.toLowerCase();
  
  if (titleLower.includes('seo') || titleLower.includes('référencement') || descriptionLower.includes('google')) {
    return 'seo';
  }
  
  if (titleLower.includes('photo') || titleLower.includes('image') || titleLower.includes('marketing')) {
    return 'marketing';
  }
  
  if (titleLower.includes('avis') || titleLower.includes('client') || titleLower.includes('service')) {
    return 'customer_service';
  }
  
  if (titleLower.includes('analytique') || titleLower.includes('statistique') || titleLower.includes('données')) {
    return 'analytics';
  }
  
  if (titleLower.includes('contenu') || titleLower.includes('description') || titleLower.includes('horaire')) {
    return 'content';
  }
  
  return 'marketing'; // default category
}

// Helper function to generate action URLs
function generateActionUrl(title: string): string | undefined {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('photo') || titleLower.includes('image')) {
    return '/business/dashboard/photos';
  }
  
  if (titleLower.includes('description') || titleLower.includes('profil')) {
    return '/business/dashboard/profile';
  }
  
  if (titleLower.includes('avis') || titleLower.includes('réponse')) {
    return '/business/dashboard/reviews';
  }
  
  if (titleLower.includes('horaire') || titleLower.includes('ouverture')) {
    return '/business/dashboard/hours';
  }
  
  if (titleLower.includes('analytique') || titleLower.includes('statistique')) {
    return '/business/dashboard/analytics';
  }
  
  return undefined;
}