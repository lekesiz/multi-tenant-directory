import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNewsletterDigestEmail } from '@/lib/emails/send';
import { logger } from '@/lib/logger';

/**
 * Weekly Newsletter Digest Cron Job
 * 
 * This endpoint should be called weekly (e.g., every Monday at 9 AM)
 * by a cron service like Vercel Cron, GitHub Actions, or external service.
 * 
 * It sends a weekly digest email to all active subscribers who have
 * opted in to receive weekly digests.
 * 
 * Security: Should be protected by a secret token in production
 */

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (production security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting weekly newsletter digest job');

    // Get current week number and year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    const year = now.getFullYear();

    // Get all active domains
    const activeDomains = await prisma.domain.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    let totalEmailsSent = 0;
    let totalErrors = 0;
    const results: any[] = [];

    // Process each domain separately
    for (const domain of activeDomains) {
      try {
        logger.info(`Processing domain: ${domain.name}`);

        // Get active subscribers for this domain who want weekly digest
        const subscribers = await prisma.newsletterSubscriber.findMany({
          where: {
            domainId: domain.id,
            status: 'active',
            preferences: {
              path: ['weeklyDigest'],
              equals: true,
            },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        if (subscribers.length === 0) {
          logger.info(`No subscribers for ${domain.name}, skipping`);
          results.push({
            domain: domain.name,
            subscribers: 0,
            sent: 0,
            errors: 0,
          });
          continue;
        }

        // Get new companies from the last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newCompanies = await prisma.company.findMany({
          where: {
            isActive: true,
            createdAt: { gte: oneWeekAgo },
            // Only companies visible on this domain
            companyContent: {
              some: {
                domainId: domain.id,
                isVisible: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            categories: true,
            rating: true,
            logoUrl: true,
            companyContent: {
              where: {
                domainId: domain.id,
              },
              select: {
                customDescription: true,
              },
            },
            _count: {
              select: {
                reviews: {
                  where: { isApproved: true },
                },
              },
            },
          },
        });

        // Get top-rated companies
        const topRatedCompanies = await prisma.company.findMany({
          where: {
            isActive: true,
            rating: { gte: 4.5 },
            companyContent: {
              some: {
                domainId: domain.id,
                isVisible: true,
              },
            },
          },
          take: 5,
          orderBy: [
            { rating: 'desc' },
            { reviewCount: 'desc' },
          ],
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            categories: true,
            rating: true,
            logoUrl: true,
            companyContent: {
              where: {
                domainId: domain.id,
              },
              select: {
                customDescription: true,
              },
            },
            _count: {
              select: {
                reviews: {
                  where: { isApproved: true },
                },
              },
            },
          },
        });

        // Skip if no content to send
        if (newCompanies.length === 0 && topRatedCompanies.length === 0) {
          logger.info(`No content for ${domain.name}, skipping`);
          results.push({
            domain: domain.name,
            subscribers: subscribers.length,
            sent: 0,
            errors: 0,
            reason: 'No content',
          });
          continue;
        }

        // Format companies for email template
        const formatCompanies = (companies: any[]) => companies.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          city: c.city,
          categories: c.categories,
          rating: c.rating,
          reviewCount: c._count.reviews,
          logoUrl: c.logoUrl,
          customDescription: c.companyContent[0]?.customDescription,
        }));

        const newCompaniesFormatted = formatCompanies(newCompanies);
        const topRatedCompaniesFormatted = formatCompanies(topRatedCompanies);

        // Send emails to all subscribers (batch processing)
        let domainEmailsSent = 0;
        let domainErrors = 0;

        for (const subscriber of subscribers) {
          try {
            await sendNewsletterDigestEmail({
              email: subscriber.email,
              firstName: subscriber.firstName || undefined,
              domainName: domain.name,
              domainUrl: `https://${domain.name}`,
              newCompanies: newCompaniesFormatted,
              topRatedCompanies: topRatedCompaniesFormatted,
              weekNumber,
              year,
            });

            // Log email
            await prisma.emailLog.create({
              data: {
                subscriberId: subscriber.id,
                email: subscriber.email,
                type: 'digest',
                subject: `📬 Votre résumé hebdomadaire - Semaine ${weekNumber} | ${domain.name}`,
                status: 'sent',
                metadata: {
                  domainId: domain.id,
                  domainName: domain.name,
                  weekNumber,
                  year,
                  newCompaniesCount: newCompaniesFormatted.length,
                  topRatedCount: topRatedCompaniesFormatted.length,
                },
              },
            });

            domainEmailsSent++;
            totalEmailsSent++;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            logger.error(`Failed to send digest to ${subscriber.email}:`, error);
            domainErrors++;
            totalErrors++;

            // Log failed email
            await prisma.emailLog.create({
              data: {
                subscriberId: subscriber.id,
                email: subscriber.email,
                type: 'digest',
                subject: `📬 Votre résumé hebdomadaire - Semaine ${weekNumber} | ${domain.name}`,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                  domainId: domain.id,
                  domainName: domain.name,
                  weekNumber,
                  year,
                },
              },
            });
          }
        }

        results.push({
          domain: domain.name,
          subscribers: subscribers.length,
          sent: domainEmailsSent,
          errors: domainErrors,
          newCompanies: newCompaniesFormatted.length,
          topRated: topRatedCompaniesFormatted.length,
        });

        logger.info(`Domain ${domain.name}: ${domainEmailsSent} sent, ${domainErrors} errors`);
      } catch (error) {
        logger.error(`Error processing domain ${domain.name}:`, error);
        results.push({
          domain: domain.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info(`Weekly digest job completed: ${totalEmailsSent} sent, ${totalErrors} errors`);

    return NextResponse.json({
      success: true,
      weekNumber,
      year,
      totalDomains: activeDomains.length,
      totalEmailsSent,
      totalErrors,
      results,
    });
  } catch (error) {
    logger.error('Weekly digest job failed:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST method for manual trigger (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;
    
    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call GET method
    return GET(request);
  } catch (error) {
    logger.error('Manual digest trigger failed:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

