import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getRedirectInfo, similarityScore } from '@/lib/url-matcher';

export const dynamic = 'force-dynamic';

interface CompanySuggestion {
  url: string;
  name: string;
  score: number;
}

async function findSimilarCompany(slug: string): Promise<CompanySuggestion | null> {
  try {
    // First, try exact match with common variations
    const variations = [
      slug,
      `${slug}-2`,
      `${slug}-3`,
      slug.replace(/-\d+$/, ''), // Remove trailing number
    ];

    const exactMatch = await prisma.company.findFirst({
      where: {
        slug: { in: variations },
        isActive: true,
      },
      select: { slug: true, name: true },
    });

    if (exactMatch) {
      return {
        url: `/companies/${exactMatch.slug}`,
        name: exactMatch.name,
        score: 1,
      };
    }

    // Search for similar slugs using database
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
        slug: {
          contains: slug.split('-').slice(0, 2).join('-'), // Match first 2 parts
        },
      },
      select: { slug: true, name: true },
      take: 10,
    });

    if (companies.length === 0) {
      // Broader search - just the first word
      const firstWord = slug.split('-')[0];
      const broadSearch = await prisma.company.findMany({
        where: {
          isActive: true,
          slug: { startsWith: firstWord },
        },
        select: { slug: true, name: true },
        take: 10,
      });
      companies.push(...broadSearch);
    }

    // Find best match using similarity score
    let bestMatch: CompanySuggestion | null = null;

    for (const company of companies) {
      const score = similarityScore(slug, company.slug);
      if (score > 0.6 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          url: `/companies/${company.slug}`,
          name: company.name,
          score,
        };
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('Error finding similar company:', error);
    return null;
  }
}

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  let companySuggestion: CompanySuggestion | null = null;

  // Check if this is a company page
  const companyMatch = pathname.match(/^\/companies\/(.+)$/);
  if (companyMatch) {
    const requestedSlug = companyMatch[1];
    companySuggestion = await findSimilarCompany(requestedSlug);

    // Auto-redirect if very high confidence match
    if (companySuggestion && companySuggestion.score > 0.85) {
      redirect(companySuggestion.url);
    }
  }

  // Get static route suggestions
  const redirectInfo = getRedirectInfo(pathname);

  // Auto-redirect for static routes
  if (redirectInfo.shouldRedirect && redirectInfo.redirectUrl) {
    redirect(redirectInfo.redirectUrl);
  }

  // Determine which suggestion to show
  const topSuggestion = companySuggestion || redirectInfo.suggestions.find(s => s.score > 0.6);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 text-center">
          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse scale-125" />
              <div className="relative flex items-center justify-center w-20 h-20 bg-red-50 rounded-full">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 404 Title */}
          <h1 className="text-5xl font-bold text-slate-900 mb-2">404</h1>

          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Page Non Trouvée
          </h2>

          {/* Description */}
          <p className="text-slate-600 mb-6 leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas.
            <br />
            <span className="text-sm text-slate-500">
              Elle a peut-être été déplacée ou supprimée.
            </span>
          </p>

          {/* URL Info */}
          <div className="mb-6 px-4 py-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500">URL demandée</span>
            <code className="block text-sm text-slate-700 font-mono mt-1 truncate">
              {pathname}
            </code>
          </div>

          {/* Company Suggestion */}
          {companySuggestion && (
            <div className="mb-6 px-4 py-4 bg-green-50 border border-green-100 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-medium text-green-700">Entreprise trouvée</span>
              </div>
              <p className="text-sm text-green-600 mb-3">{companySuggestion.name}</p>
              <Link
                href={companySuggestion.url}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200"
              >
                Voir cette entreprise
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}

          {/* Static Route Suggestion */}
          {!companySuggestion && topSuggestion && (
            <div className="mb-6 px-4 py-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-700">Vouliez-vous dire ?</span>
              </div>
              <Link
                href={topSuggestion.url}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <code className="text-sm">{topSuggestion.url}</code>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Retour à l'Accueil
            </Link>

            <Link
              href="/annuaire"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Voir l'Annuaire
            </Link>
          </div>
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Besoin d'aide ?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
