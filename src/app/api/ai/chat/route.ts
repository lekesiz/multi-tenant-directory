import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { generateChatbotResponse } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate AI response
    const response = await generateChatbotResponse({
      userMessage: message,
      conversationHistory: history || [],
    });

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('AI Chat API error:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    );
  }
}