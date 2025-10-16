import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

export interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      className={`flex ${className}`}
      aria-label="Breadcrumb"
    >
      <ol role="list" className="flex items-center space-x-2">
        {/* Home link */}
        <li>
          <div>
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Accueil"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {item.current ? (
                <span
                  className="ml-2 text-sm font-medium text-gray-900"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items for company page
 */
export function generateCompanyBreadcrumbs(
  companyName: string,
  companySlug: string,
  categoryName?: string,
  categorySlug?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Annuaire',
      href: '/annuaire',
    },
  ];

  if (categoryName && categorySlug) {
    breadcrumbs.push({
      name: categoryName,
      href: `/categories/${categorySlug}`,
    });
  }

  breadcrumbs.push({
    name: companyName,
    href: `/companies/${companySlug}`,
    current: true,
  });

  return breadcrumbs;
}

/**
 * Generate breadcrumb items for category page
 */
export function generateCategoryBreadcrumbs(categoryName: string): BreadcrumbItem[] {
  return [
    {
      name: 'Catégories',
      href: '/categories',
    },
    {
      name: categoryName,
      href: `/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for directory page
 */
export function generateDirectoryBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      name: 'Annuaire',
      href: '/annuaire',
      current: true,
    },
  ];
}

