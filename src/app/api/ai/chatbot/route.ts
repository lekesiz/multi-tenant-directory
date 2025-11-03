import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { generateChatbotResponse } from '@/lib/ai/user-experience';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await generateChatbotResponse(
      message,
      conversationHistory || [],
      context
    );

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to generate chatbot response' },
      { status: 500 }
    );
  }
}

