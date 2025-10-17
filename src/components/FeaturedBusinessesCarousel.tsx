'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Business {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  logoUrl: string | null;
  description?: string;
}

interface FeaturedBusinessesCarouselProps {
  businesses: Business[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function FeaturedBusinessesCarousel({
  businesses,
  autoPlay = true,
  autoPlayInterval = 5000,
}: FeaturedBusinessesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);

  const itemsPerSlide = 3;
  const maxIndex = Math.ceil(businesses.length / itemsPerSlide) - 1;

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlay, maxIndex, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    setIsAutoPlay(false);
  };

  const goNext = () => {
    goToSlide(currentIndex === maxIndex ? 0 : currentIndex + 1);
  };

  const goPrev = () => {
    goToSlide(currentIndex === 0 ? maxIndex : currentIndex - 1);
  };

  const startIndex = currentIndex * itemsPerSlide;
  const visibleBusinesses = businesses.slice(startIndex, startIndex + itemsPerSlide);

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Nos Meilleures Entreprises
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les entreprises les mieux notées et les plus populaires de notre plateforme
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Slides */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 overflow-hidden">
            {visibleBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/companies/${business.slug}`}
                className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                {/* Image/Logo Background */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                  {business.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt={business.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold opacity-20">
                      {business.name.charAt(0)}
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 flex items-center gap-1 shadow-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{business.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-600">({business.reviewCount})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {business.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">
                      {business.address}, {business.city}
                    </span>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {business.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                    {business.categories.length > 2 && (
                      <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                        +{business.categories.length - 2}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow">
                    Voir le Profil
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Buttons */}
          {businesses.length > itemsPerSlide && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-3 rounded-full bg-white border-2 border-gray-200 text-gray-900 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all group hidden md:flex items-center justify-center"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-3 rounded-full bg-white border-2 border-gray-200 text-gray-900 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all group hidden md:flex items-center justify-center"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Dots Navigation */}
          {businesses.length > itemsPerSlide && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-3 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-blue-600'
                      : 'w-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Auto-play toggle */}
        {autoPlay && (
          <div className="text-center mt-8">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isAutoPlay ? '⏸ Pause' : '▶ Reprendre'}
            </button>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/annuaire"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg transition-shadow"
          >
            Voir Toutes les Entreprises
          </Link>
        </div>
      </div>
    </section>
  );
}
