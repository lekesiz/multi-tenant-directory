/**
 * URL Matcher Utility
 * Provides smart URL matching for 404 pages with automatic redirect suggestions
 */

// Known static routes in the application
const STATIC_ROUTES = [
  '/',
  '/annuaire',
  '/categories',
  '/contact',
  '/tarifs',
  '/pricing',
  '/rejoindre',
  '/search',
  '/auth/login',
  '/auth/register',
  '/business/login',
  '/business/register',
  '/business/dashboard',
  '/business/dashboard/profile',
  '/business/dashboard/photos',
  '/business/dashboard/hours',
  '/business/dashboard/reviews',
  '/business/dashboard/settings',
  '/business/dashboard/billing',
  '/business/dashboard/analytics',
  '/business/dashboard/activities',
  '/admin',
  '/admin/login',
  '/admin/dashboard',
  '/admin/companies',
  '/admin/categories',
  '/admin/users',
  '/admin/domains',
  '/admin/reviews',
  '/admin/leads',
  '/admin/settings',
  '/admin/seo-settings',
  '/admin/newsletter',
  '/admin/campaigns',
  '/admin/inquiries',
  '/admin/subscriptions',
  '/admin/ai-tools',
  '/dashboard',
  '/dashboard/subscription',
  '/unsubscribe/success',
  '/unsubscribe/error',
];

// Common URL typos and their corrections
const COMMON_TYPOS: Record<string, string> = {
  // Contact typos
  '/contac': '/contact',
  '/contactt': '/contact',
  '/contacttt': '/contact',
  '/kontact': '/contact',
  '/contat': '/contact',
  '/cotact': '/contact',

  // Annuaire typos
  '/annnuaire': '/annuaire',
  '/annuare': '/annuaire',
  '/anuaire': '/annuaire',
  '/annuairee': '/annuaire',
  '/annuair': '/annuaire',

  // Categories typos
  '/categorie': '/categories',
  '/category': '/categories',
  '/catégories': '/categories',
  '/categoriess': '/categories',
  '/categoris': '/categories',

  // Tarifs typos
  '/tarif': '/tarifs',
  '/tarrifs': '/tarifs',
  '/tarrif': '/tarifs',
  '/prix': '/tarifs',
  '/price': '/pricing',
  '/prices': '/pricing',

  // Other French pages
  '/rejoinder': '/rejoindre',
  '/join': '/rejoindre',
  '/recherche': '/search',
  '/chercher': '/search',
  '/searchh': '/search',

  // Auth typos
  '/login': '/auth/login',
  '/signin': '/auth/login',
  '/connexion': '/auth/login',
  '/loginn': '/auth/login',
  '/register': '/auth/register',
  '/signup': '/auth/register',
  '/inscription': '/auth/register',
  '/registerr': '/auth/register',

  // Business typos
  '/business': '/business/dashboard',
  '/dashboard/business': '/business/dashboard',
  '/pro': '/business/dashboard',
  '/professionnel': '/business/dashboard',
  '/mon-compte': '/business/dashboard',
  '/businesss': '/business/dashboard',

  // Admin typos
  '/administration': '/admin/dashboard',
  '/admin/home': '/admin/dashboard',
  '/admin/entreprises': '/admin/companies',
  '/admin/societes': '/admin/companies',
  '/admin/utilisateurs': '/admin/users',
  '/admin/avis': '/admin/reviews',
  '/admin/parametres': '/admin/settings',
  '/adminn': '/admin',

  // Common misspellings
  '/accueil': '/',
  '/home': '/',
  '/index': '/',
  '/homee': '/',
};

// Pattern-based redirects (regex patterns)
const PATTERN_REDIRECTS: Array<{ pattern: RegExp; redirect: string | ((match: RegExpMatchArray) => string) }> = [
  // /categorie/X -> /categories/X
  { pattern: /^\/categorie\/(.+)$/, redirect: (m) => `/categories/${m[1]}` },
  { pattern: /^\/category\/(.+)$/, redirect: (m) => `/categories/${m[1]}` },

  // /entreprise/X -> /companies/X
  { pattern: /^\/entreprise\/(.+)$/, redirect: (m) => `/companies/${m[1]}` },
  { pattern: /^\/company\/(.+)$/, redirect: (m) => `/companies/${m[1]}` },
  { pattern: /^\/societe\/(.+)$/, redirect: (m) => `/companies/${m[1]}` },

  // /admin/company/X -> /admin/companies/X
  { pattern: /^\/admin\/company\/(.+)$/, redirect: (m) => `/admin/companies/${m[1]}` },
  { pattern: /^\/admin\/categorie\/(.+)$/, redirect: (m) => `/admin/categories/${m[1]}` },
  { pattern: /^\/admin\/user\/(.+)$/, redirect: (m) => `/admin/users/${m[1]}` },

  // /business/X -> /business/dashboard/X
  { pattern: /^\/business\/(profile|photos|hours|reviews|settings|billing|analytics|activities)$/, redirect: (m) => `/business/dashboard/${m[1]}` },
];

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create matrix
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  // Initialize first column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  // Initialize first row
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score (0-1) between two strings
 */
export function similarityScore(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Normalize URL for comparison
 */
function normalizeUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/\/+$/, '')  // Remove trailing slashes
    .replace(/\/+/g, '/') // Remove duplicate slashes
    .trim();
}

export interface UrlMatch {
  url: string;
  score: number;
  type: 'exact' | 'typo' | 'pattern' | 'similar';
}

/**
 * Find the best matching URL for a given path
 */
export function findBestMatch(requestedPath: string, additionalRoutes: string[] = []): UrlMatch | null {
  const normalizedPath = normalizeUrl(requestedPath);

  // 1. Check exact typo corrections
  if (COMMON_TYPOS[normalizedPath]) {
    return {
      url: COMMON_TYPOS[normalizedPath],
      score: 1,
      type: 'typo'
    };
  }

  // 2. Check pattern-based redirects
  for (const { pattern, redirect } of PATTERN_REDIRECTS) {
    const match = normalizedPath.match(pattern);
    if (match) {
      const targetUrl = typeof redirect === 'function' ? redirect(match) : redirect;
      return {
        url: targetUrl,
        score: 1,
        type: 'pattern'
      };
    }
  }

  // 3. Find similar URLs using Levenshtein distance
  const allRoutes = [...STATIC_ROUTES, ...additionalRoutes];
  let bestMatch: UrlMatch | null = null;

  for (const route of allRoutes) {
    const score = similarityScore(normalizedPath, route);

    // Only consider matches with score > 0.6 (60% similar)
    if (score > 0.6 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = {
        url: route,
        score,
        type: 'similar'
      };
    }
  }

  return bestMatch;
}

/**
 * Find multiple URL suggestions for a given path
 */
export function findSuggestions(requestedPath: string, additionalRoutes: string[] = [], limit: number = 5): UrlMatch[] {
  const normalizedPath = normalizeUrl(requestedPath);
  const suggestions: UrlMatch[] = [];

  // 1. Check exact typo first
  if (COMMON_TYPOS[normalizedPath]) {
    suggestions.push({
      url: COMMON_TYPOS[normalizedPath],
      score: 1,
      type: 'typo'
    });
  }

  // 2. Check pattern-based redirects
  for (const { pattern, redirect } of PATTERN_REDIRECTS) {
    const match = normalizedPath.match(pattern);
    if (match) {
      const targetUrl = typeof redirect === 'function' ? redirect(match) : redirect;
      suggestions.push({
        url: targetUrl,
        score: 1,
        type: 'pattern'
      });
      break;
    }
  }

  // 3. Calculate similarity for all routes
  const allRoutes = [...STATIC_ROUTES, ...additionalRoutes];
  const routeScores: UrlMatch[] = allRoutes.map(route => ({
    url: route,
    score: similarityScore(normalizedPath, route),
    type: 'similar' as const
  }));

  // Sort by score and filter
  routeScores
    .filter(r => r.score > 0.4) // At least 40% similar
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .forEach(r => {
      // Don't add duplicates
      if (!suggestions.find(s => s.url === r.url)) {
        suggestions.push(r);
      }
    });

  return suggestions.slice(0, limit);
}

/**
 * Determine if a URL should be auto-redirected
 * Auto-redirect when confidence is reasonably high
 */
export function shouldAutoRedirect(match: UrlMatch | null): boolean {
  if (!match) return false;

  // Auto-redirect for exact typo corrections and pattern matches
  if (match.type === 'typo' || match.type === 'pattern') {
    return true;
  }

  // Auto-redirect for high similarity (> 75%)
  // This handles cases like /contacttt -> /contact (80% similar)
  if (match.type === 'similar' && match.score > 0.75) {
    return true;
  }

  return false;
}

/**
 * Get redirect info for 404 page
 */
export interface RedirectInfo {
  shouldRedirect: boolean;
  redirectUrl: string | null;
  suggestions: UrlMatch[];
  confidence: number;
}

export function getRedirectInfo(requestedPath: string, additionalRoutes: string[] = []): RedirectInfo {
  const bestMatch = findBestMatch(requestedPath, additionalRoutes);
  const suggestions = findSuggestions(requestedPath, additionalRoutes);

  return {
    shouldRedirect: shouldAutoRedirect(bestMatch),
    redirectUrl: bestMatch?.url || null,
    suggestions,
    confidence: bestMatch?.score || 0
  };
}
