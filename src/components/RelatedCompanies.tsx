'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';

interface Company {
  id: number;
  name: string;
  slug: string;
  city: string | null;
  logoUrl: string | null;
  categories: string[];
  rating: number | null;
  reviewCount: number;
}

interface RelatedCompaniesProps {
  companies: Company[];
  currentCompanyId: number;
  category?: string;
}

export default function RelatedCompanies({
  companies,
  currentCompanyId,
  category,
}: RelatedCompaniesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!companies || companies.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of card + gap
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Entreprises similaires
          </h2>
          {category && (
            <p className="text-sm text-gray-500 mt-1">
              Autres entreprises dans la catégorie {category}
            </p>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Précédent"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Suivant"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.slug}`}
            className="flex-shrink-0 w-72 sm:w-80 group"
          >
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
              {/* Company Logo/Image */}
              <div className="relative h-40 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={company.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="320px"
                  />
                ) : (
                  <div className="text-6xl font-bold text-blue-200">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {company.name}
                </h3>

                {company.city && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {company.city}
                  </p>
                )}

                {/* Categories */}
                {company.categories && company.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {company.categories.slice(0, 2).map((cat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {cat}
                      </span>
                    ))}
                    {company.categories.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        +{company.categories.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Rating */}
                {company.rating !== null && company.rating > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (company.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {company.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({company.reviewCount} avis)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Scroll Hint */}
      <div className="md:hidden text-center mt-3">
        <p className="text-xs text-gray-400">
          ← Faites défiler pour voir plus →
        </p>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
