import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAllSitemaps } from '@/lib/sitemap-generator';

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate all sitemaps
    const results = await generateAllSitemaps();

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error generating sitemaps:', error);
    return NextResponse.json(
      { error: 'Failed to generate sitemaps' },
      { status: 500 }
    );
  }
}

