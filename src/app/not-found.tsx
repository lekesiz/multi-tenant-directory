import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { similarityScore } from '@/lib/url-matcher';

export const dynamic = 'force-dynamic';

interface SmartMatch {
  url: string;
  label: string;
  score: number;
  type: 'company' | 'static' | 'typo';
}

// Static routes in the application
const STATIC_ROUTES = [
  { path: '/', label: 'Accueil' },
  { path: '/annuaire', label: 'Annuaire' },
  { path: '/categories', label: 'Catégories' },
  { path: '/contact', label: 'Contact' },
  { path: '/tarifs', label: 'Tarifs' },
  { path: '/pricing', label: 'Tarifs' },
  { path: '/rejoindre', label: 'Rejoindre' },
  { path: '/search', label: 'Recherche' },
  { path: '/auth/login', label: 'Connexion' },
  { path: '/auth/register', label: 'Inscription' },
  { path: '/business/login', label: 'Connexion Pro' },
  { path: '/business/register', label: 'Inscription Pro' },
  { path: '/business/dashboard', label: 'Tableau de bord Pro' },
  { path: '/admin', label: 'Administration' },
  { path: '/admin/login', label: 'Connexion Admin' },
  { path: '/admin/dashboard', label: 'Tableau de bord Admin' },
  { path: '/admin/companies', label: 'Entreprises' },
  { path: '/admin/categories', label: 'Catégories' },
  { path: '/admin/users', label: 'Utilisateurs' },
  { path: '/admin/reviews', label: 'Avis' },
  { path: '/admin/settings', label: 'Paramètres' },
  { path: '/dashboard', label: 'Tableau de bord' },
];

// Common typos mapping
const TYPO_MAP: Record<string, string> = {
  'contac': '/contact',
  'contactt': '/contact',
  'contacttt': '/contact',
  'kontact': '/contact',
  'contat': '/contact',
  'annuare': '/annuaire',
  'anuaire': '/annuaire',
  'annnuaire': '/annuaire',
  'categorie': '/categories',
  'category': '/categories',
  'tarif': '/tarifs',
  'login': '/auth/login',
  'signin': '/auth/login',
  'register': '/auth/register',
  'signup': '/auth/register',
  'home': '/',
  'accueil': '/',
  'recherche': '/search',
};

async function findSmartMatch(pathname: string): Promise<SmartMatch | null> {
  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, '').trim();
  const pathParts = normalizedPath.split('/').filter(Boolean);

  const allMatches: SmartMatch[] = [];

  // Extract the key part for matching
  // For /companies/contactt -> "contactt"
  // For /contacttt -> "contacttt"
  const lastPart = pathParts[pathParts.length - 1] || '';
  const isCompanyPath = pathParts[0] === 'companies';

  // 1. Check direct typo corrections for the last part
  if (TYPO_MAP[lastPart]) {
    allMatches.push({
      url: TYPO_MAP[lastPart],
      label: 'Page corrigée',
      score: 1,
      type: 'typo'
    });
  }

  // 2. Check if the full path matches a typo
  const fullPathKey = normalizedPath.replace(/^\//, '');
  if (TYPO_MAP[fullPathKey]) {
    allMatches.push({
      url: TYPO_MAP[fullPathKey],
      label: 'Page corrigée',
      score: 1,
      type: 'typo'
    });
  }

  // 3. Compare against all static routes
  for (const route of STATIC_ROUTES) {
    // Compare full path
    const fullScore = similarityScore(normalizedPath, route.path);
    if (fullScore > 0.6) {
      allMatches.push({
        url: route.path,
        label: route.label,
        score: fullScore,
        type: 'static'
      });
    }

    // Also compare just the last part against route paths
    const routeLastPart = route.path.split('/').filter(Boolean).pop() || '';
    if (routeLastPart && lastPart) {
      const partScore = similarityScore(lastPart, routeLastPart);
      if (partScore > 0.7) {
        allMatches.push({
          url: route.path,
          label: route.label,
          score: partScore * 0.95, // Slightly lower priority
          type: 'static'
        });
      }
    }
  }

  // 4. Search for similar companies in database
  if (lastPart && lastPart.length > 2) {
    try {
      // Try exact variations first
      const variations = [
        lastPart,
        `${lastPart}-2`,
        `${lastPart}-3`,
        lastPart.replace(/-\d+$/, ''),
      ];

      const exactMatch = await prisma.company.findFirst({
        where: {
          slug: { in: variations },
          isActive: true,
        },
        select: { slug: true, name: true },
      });

      if (exactMatch) {
        allMatches.push({
          url: `/companies/${exactMatch.slug}`,
          label: exactMatch.name,
          score: 1,
          type: 'company'
        });
      }

      // Search for similar slugs
      const searchTerms = lastPart.split('-').slice(0, 3).join('-');
      const companies = await prisma.company.findMany({
        where: {
          isActive: true,
          OR: [
            { slug: { contains: searchTerms } },
            { slug: { startsWith: lastPart.split('-')[0] } },
          ]
        },
        select: { slug: true, name: true },
        take: 20,
      });

      for (const company of companies) {
        const score = similarityScore(lastPart, company.slug);
        if (score > 0.6) {
          allMatches.push({
            url: `/companies/${company.slug}`,
            label: company.name,
            score: score,
            type: 'company'
          });
        }
      }
    } catch (error) {
      console.error('Database search error:', error);
    }
  }

  // Sort by score and return best match
  allMatches.sort((a, b) => b.score - a.score);

  // Remove duplicates (keep highest score)
  const seen = new Set<string>();
  const uniqueMatches = allMatches.filter(m => {
    if (seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });

  return uniqueMatches[0] || null;
}

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  // Find the best match
  const bestMatch = await findSmartMatch(pathname);

  // Auto-redirect if very high confidence
  if (bestMatch && bestMatch.score >= 0.85) {
    redirect(bestMatch.url);
  }

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

          {/* Smart Suggestion */}
          {bestMatch && bestMatch.score > 0.6 && (
            <div className={`mb-6 px-4 py-4 rounded-lg border ${
              bestMatch.type === 'company'
                ? 'bg-green-50 border-green-100'
                : 'bg-blue-50 border-blue-100'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {bestMatch.type === 'company' ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className={`text-sm font-medium ${
                  bestMatch.type === 'company' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {bestMatch.type === 'company' ? 'Entreprise trouvée' : 'Vouliez-vous dire ?'}
                </span>
              </div>
              <p className={`text-sm mb-3 ${
                bestMatch.type === 'company' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {bestMatch.label}
              </p>
              <Link
                href={bestMatch.url}
                className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-all duration-200 ${
                  bestMatch.type === 'company'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {bestMatch.type === 'company' ? 'Voir cette entreprise' : 'Aller à cette page'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-xs text-slate-400 mt-2">
                Confiance: {Math.round(bestMatch.score * 100)}%
              </p>
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
