'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Category {
  id: number;
  googleCategory: string;
  frenchName: string;
  icon?: string | null;
  order: number;
}

interface CategoryNavProps {
  categories?: Category[];
  isLoading?: boolean;
}

export default function CategoryNav({ categories = [], isLoading = false }: CategoryNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const selectedCategory = searchParams.get('category');

  const getIconEmoji = (icon?: string | null): string => {
    const iconMap: Record<string, string> = {
      utensils: '🍽️',
      coffee: '☕',
      'wine-glass': '🍷',
      bread: '🥐',
      drumstick: '🍗',
      'shopping-cart': '🛒',
      'shopping-basket': '🧺',
      pills: '💊',
      hospital: '🏥',
      stethoscope: '🩺',
      tooth: '🦷',
      wrench: '🔧',
      'gas-pump': '⛽',
      building: '🏢',
      mail: '📮',
      book: '📚',
      school: '🎓',
      bed: '🛏️',
      dumbbell: '💪',
      scissors: '✂️',
      spa: '💆',
      film: '🎬',
      image: '🖼️',
      trees: '🌳',
      zap: '⚡',
      key: '🔑',
      'paint-bucket': '🪣',
      hammer: '🔨',
    };
    return icon ? iconMap[icon] || '📍' : '📍';
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg min-w-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Catégories</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/annuaire"
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tous
        </Link>

        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/annuaire?category=${category.googleCategory}`}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0 flex items-center gap-2 ${
              selectedCategory === category.googleCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{getIconEmoji(category.icon)}</span>
            {category.frenchName}
          </Link>
        ))}
      </div>
    </div>
  );
}
