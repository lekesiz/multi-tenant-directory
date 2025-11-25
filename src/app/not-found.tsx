import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { similarityScore } from '@/lib/url-matcher';

export const dynamic = 'force-dynamic';

interface SmartMatch {
  url: string;
  score: number;
}

// All static routes with variations
const STATIC_ROUTES: Record<string, string> = {
  // Home
  '': '/',
  'home': '/',
  'accueil': '/',
  'index': '/',
  'homee': '/',
  'hom': '/',

  // Main pages
  'annuaire': '/annuaire',
  'annuare': '/annuaire',
  'anuaire': '/annuaire',
  'annnuaire': '/annuaire',
  'annuairee': '/annuaire',
  'annuair': '/annuaire',
  'directory': '/annuaire',

  'categories': '/categories',
  'categorie': '/categories',
  'category': '/categories',
  'categoriess': '/categories',
  'categoris': '/categories',
  'cat': '/categories',

  'contact': '/contact',
  'contac': '/contact',
  'contactt': '/contact',
  'contacttt': '/contact',
  'kontact': '/contact',
  'contat': '/contact',
  'cotact': '/contact',
  'contacts': '/contact',

  'tarifs': '/tarifs',
  'tarif': '/tarifs',
  'tarrifs': '/tarifs',
  'tarrif': '/tarifs',
  'prix': '/tarifs',

  'pricing': '/pricing',
  'price': '/pricing',
  'prices': '/pricing',

  'rejoindre': '/rejoindre',
  'rejoinder': '/rejoindre',
  'join': '/rejoindre',
  'inscription-pro': '/rejoindre',

  'search': '/search',
  'recherche': '/search',
  'chercher': '/search',
  'searchh': '/search',

  // Legal pages - ALL VARIATIONS
  'mentions-legales': '/mentions-legales',
  'mentions-legale': '/mentions-legales',
  'mention-legales': '/mentions-legales',
  'mention-legale': '/mentions-legales',
  'mentionslegales': '/mentions-legales',
  'mentions': '/mentions-legales',
  'legal': '/mentions-legales',
  'legales': '/mentions-legales',

  'politique-de-confidentialite': '/politique-de-confidentialite',
  'politique-confidentialite': '/politique-de-confidentialite',
  'politiqueconfidentialite': '/politique-de-confidentialite',
  'politique-confidentialité': '/politique-de-confidentialite',
  'confidentialite': '/politique-de-confidentialite',
  'privacy': '/politique-de-confidentialite',
  'privacy-policy': '/politique-de-confidentialite',
  'donnees-personnelles': '/politique-de-confidentialite',

  'cgu': '/cgu',
  'conditions-generales': '/cgu',
  'conditions-utilisation': '/cgu',
  'terms': '/cgu',
  'tos': '/cgu',

  'cgv': '/cgv',
  'conditions-generales-vente': '/cgv',
  'conditions-vente': '/cgv',

  // Auth
  'login': '/auth/login',
  'signin': '/auth/login',
  'connexion': '/auth/login',
  'loginn': '/auth/login',
  'se-connecter': '/auth/login',

  'register': '/auth/register',
  'signup': '/auth/register',
  'inscription': '/auth/register',
  'registerr': '/auth/register',
  's-inscrire': '/auth/register',

  'auth': '/auth/login',
  'auth/connexion': '/auth/login',
  'auth/inscription': '/auth/register',

  // Business
  'business': '/business/dashboard',
  'business/login': '/business/login',
  'business/register': '/business/register',
  'business/connexion': '/business/login',
  'business/inscription': '/business/register',
  'pro': '/business/dashboard',
  'professionnel': '/business/dashboard',
  'mon-compte': '/business/dashboard',
  'businesss': '/business/dashboard',
  'espace-pro': '/business/dashboard',

  // Admin
  'admin': '/admin/dashboard',
  'admin/login': '/admin/login',
  'admin/connexion': '/admin/login',
  'administration': '/admin/dashboard',
  'adminn': '/admin/dashboard',
  'admin/home': '/admin/dashboard',
  'admin/entreprises': '/admin/companies',
  'admin/societes': '/admin/companies',
  'admin/utilisateurs': '/admin/users',
  'admin/avis': '/admin/reviews',
  'admin/parametres': '/admin/settings',

  // Dashboard
  'dashboard': '/dashboard',
  'tableau-de-bord': '/dashboard',
  'mon-espace': '/dashboard',

  // Unsubscribe
  'unsubscribe': '/unsubscribe/success',
  'desabonner': '/unsubscribe/success',
  'desabonnement': '/unsubscribe/success',
};

// Extract the meaningful part from path
function extractKey(pathname: string): string {
  const normalized = pathname.toLowerCase().replace(/^\/+|\/+$/g, '').trim();

  // If it starts with "companies/", extract what comes after
  if (normalized.startsWith('companies/')) {
    return normalized.substring('companies/'.length);
  }

  return normalized;
}

async function findBestMatch(pathname: string): Promise<SmartMatch> {
  const key = extractKey(pathname);
  const allMatches: SmartMatch[] = [];

  // 1. Direct match in static routes
  if (STATIC_ROUTES[key]) {
    return { url: STATIC_ROUTES[key], score: 1 };
  }

  // 2. Check all static routes for similarity
  for (const [routeKey, routeUrl] of Object.entries(STATIC_ROUTES)) {
    if (!routeKey) continue;

    const score = similarityScore(key, routeKey);
    if (score > 0.5) {
      allMatches.push({ url: routeUrl, score });
    }
  }

  // 3. Search database for legal pages
  try {
    const legalPages = await prisma.legalPage.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    for (const page of legalPages) {
      const score = similarityScore(key, page.slug);
      if (score > 0.5) {
        allMatches.push({ url: `/${page.slug}`, score });
      }

      // Also check if key directly matches
      if (key === page.slug) {
        return { url: `/${page.slug}`, score: 1 };
      }
    }
  } catch (error) {
    console.error('Legal pages lookup error:', error);
  }

  // 4. Search database for companies
  try {
    // Try exact match first with variations
    const variations = [key, `${key}-2`, `${key}-3`, key.replace(/-\d+$/, '')];

    const exactCompany = await prisma.company.findFirst({
      where: {
        slug: { in: variations },
        isActive: true,
      },
      select: { slug: true },
    });

    if (exactCompany) {
      return { url: `/companies/${exactCompany.slug}`, score: 1 };
    }

    // Search for similar companies
    if (key.length > 2) {
      const searchTerm = key.split('-').slice(0, 2).join('-');
      const companies = await prisma.company.findMany({
        where: {
          isActive: true,
          OR: [
            { slug: { contains: searchTerm } },
            { slug: { startsWith: key.split('-')[0] } },
          ],
        },
        select: { slug: true },
        take: 20,
      });

      for (const company of companies) {
        const score = similarityScore(key, company.slug);
        if (score > 0.5) {
          allMatches.push({ url: `/companies/${company.slug}`, score });
        }
      }
    }
  } catch (error) {
    console.error('Company lookup error:', error);
  }

  // 5. Sort and get best match
  allMatches.sort((a, b) => b.score - a.score);

  // Remove duplicates
  const seen = new Set<string>();
  const uniqueMatches = allMatches.filter(m => {
    if (seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });

  // Return best match or home page
  return uniqueMatches[0] || { url: '/', score: 0 };
}

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  // Find the best match - ALWAYS redirect, never show 404
  const bestMatch = await findBestMatch(pathname);

  // Redirect to best match (or home if no good match)
  redirect(bestMatch.url);
}
