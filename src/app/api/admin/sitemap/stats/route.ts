import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSitemapStats } from '@/lib/sitemap-generator';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active domains
    const domains = await prisma.domain.findMany({
      where: { isActive: true },
      select: { name: true },
    });

    // Get stats for each domain
    const statsPromises = domains.map(async (domain) => {
      try {
        return await getSitemapStats(domain.name);
      } catch (error) {
        console.error(`Error getting stats for ${domain.name}:`, error);
        return null;
      }
    });

    const statsResults = await Promise.all(statsPromises);
    const stats = statsResults.filter(Boolean);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching sitemap stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sitemap statistics' },
      { status: 500 }
    );
  }
}

