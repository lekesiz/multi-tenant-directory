import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Registration attempt:', body);

    // Minimal test - just return success
    return NextResponse.json({
      success: true,
      message: 'Test successful - API is working',
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

