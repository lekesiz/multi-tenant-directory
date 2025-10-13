import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';

export const dynamic = 'force-dynamic';

interface LegalPageProps {
  params: Promise<{
    legalSlug: string;
  }>;
}

async function getDomainInfo() {
  const headersList = await headers();
  let domain = headersList.get('x-tenant-domain') || 'bas-rhin.pro';
  domain = domain.replace('www.', '');
  
  if (domain.includes('.vercel.app')) {
    domain = 'bas-rhin.pro';
  }
  
  const cityName = domain.split('.')[0];
  const displayName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  
  return { domain, cityName, displayName };
}

async function getLegalPage(slug: string, domain: string) {
  // Önce domain'e özel sayfayı ara
  const domainData = await prisma.domain.findUnique({
    where: { name: domain },
  });

  let page = null;
  
  if (domainData) {
    page = await prisma.legalPage.findFirst({
      where: {
        slug,
        domainId: domainData.id,
        isActive: true,
      },
    });
  }

  // Domain'e özel sayfa yoksa global sayfayı al
  if (!page) {
    page = await prisma.legalPage.findFirst({
      where: {
        slug,
        domainId: null,
        isActive: true,
      },
    });
  }

  return page;
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { legalSlug } = await params;
  const { domain, displayName } = await getDomainInfo();
  const page = await getLegalPage(legalSlug, domain);

  if (!page) {
    return {
      title: 'Page non trouvée',
    };
  }

  return {
    title: `${page.title} - ${displayName}.PRO`,
    description: `${page.title} de l'annuaire des professionnels de ${displayName}`,
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { legalSlug } = await params;
  const { domain, displayName } = await getDomainInfo();
  const page = await getLegalPage(legalSlug, domain);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {displayName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900">{displayName}.PRO</div>
                <div className="text-xs text-gray-500">Les Professionnels de {displayName}</div>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Accueil
              </Link>
              <Link href="/annuaire" className="text-gray-600 hover:text-blue-600 transition-colors">
                Annuaire
              </Link>
              <Link href="/categories" className="text-gray-600 hover:text-blue-600 transition-colors">
                Catégories
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
          
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-700">{children}</h3>,
                p: ({ children }) => <p className="mb-4 text-gray-600 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-600">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600">{children}</ol>,
                li: ({ children }) => <li className="text-gray-600">{children}</li>,
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-600 hover:text-blue-800 underline">
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                hr: () => <hr className="my-8 border-gray-200" />,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                tbody: ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{children}</td>,
              }}
            >
              {page.content}
            </ReactMarkdown>
          </div>

          {/* Back to home */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-semibold mb-4">À propos</h5>
              <p className="text-gray-400 text-sm">
                Annuaire des professionnels de {displayName}
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Liens rapides</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/annuaire" className="hover:text-white transition-colors">
                    Annuaire
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-white transition-colors">
                    Catégories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Légal</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/mentions-legales" className="hover:text-white transition-colors">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link href="/politique-confidentialite" className="hover:text-white transition-colors">
                    Politique de Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-white transition-colors">
                    CGU
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>contact@{domain}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 {displayName}.PRO - Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}

