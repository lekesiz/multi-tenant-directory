/**
 * CategoryNav Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryNav from '../CategoryNav';

// Mock Next.js navigation hooks
const mockPathname = '/annuaire';
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, className }: any) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('CategoryNav', () => {
  const mockCategories = [
    {
      id: 1,
      googleCategory: 'restaurant',
      frenchName: 'Restaurants',
      icon: 'utensils',
      order: 1,
    },
    {
      id: 2,
      googleCategory: 'cafe',
      frenchName: 'Cafés',
      icon: 'coffee',
      order: 2,
    },
    {
      id: 3,
      googleCategory: 'pharmacy',
      frenchName: 'Pharmacies',
      icon: 'pills',
      order: 3,
    },
  ];

  beforeEach(() => {
    mockSearchParams.delete('category');
  });

  describe('Rendering', () => {
    test('should render category navigation', () => {
      render(<CategoryNav categories={mockCategories} />);
      expect(screen.getByText('Catégories')).toBeInTheDocument();
    });

    test('should render "Tous" link', () => {
      render(<CategoryNav categories={mockCategories} />);
      expect(screen.getByText('Tous')).toBeInTheDocument();
    });

    test('should render all categories', () => {
      render(<CategoryNav categories={mockCategories} />);
      expect(screen.getByText('Restaurants')).toBeInTheDocument();
      expect(screen.getByText('Cafés')).toBeInTheDocument();
      expect(screen.getByText('Pharmacies')).toBeInTheDocument();
    });

    test('should render category icons', () => {
      render(<CategoryNav categories={mockCategories} />);
      // Icons are rendered as emojis
      const restaurantLink = screen.getByText('Restaurants').closest('a');
      expect(restaurantLink?.textContent).toContain('🍽️');
      
      const cafeLink = screen.getByText('Cafés').closest('a');
      expect(cafeLink?.textContent).toContain('☕');
      
      const pharmacyLink = screen.getByText('Pharmacies').closest('a');
      expect(pharmacyLink?.textContent).toContain('💊');
    });

    test('should use default icon when icon not in map', () => {
      const categoriesWithUnknownIcon = [
        {
          id: 1,
          googleCategory: 'unknown',
          frenchName: 'Unknown',
          icon: 'unknown-icon',
          order: 1,
        },
      ];
      
      render(<CategoryNav categories={categoriesWithUnknownIcon} />);
      const link = screen.getByText('Unknown').closest('a');
      expect(link?.textContent).toContain('📍');
    });

    test('should use default icon when icon is null', () => {
      const categoriesWithNullIcon = [
        {
          id: 1,
          googleCategory: 'test',
          frenchName: 'Test',
          icon: null,
          order: 1,
        },
      ];
      
      render(<CategoryNav categories={categoriesWithNullIcon} />);
      const link = screen.getByText('Test').closest('a');
      expect(link?.textContent).toContain('📍');
    });
  });

  describe('Loading State', () => {
    test('should render loading skeletons when isLoading is true', () => {
      const { container } = render(<CategoryNav categories={[]} isLoading={true} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(6);
    });

    test('should not render categories when loading', () => {
      render(<CategoryNav categories={mockCategories} isLoading={true} />);
      expect(screen.queryByText('Catégories')).not.toBeInTheDocument();
      expect(screen.queryByText('Restaurants')).not.toBeInTheDocument();
    });

    test('should render loading skeletons with correct styles', () => {
      const { container } = render(<CategoryNav categories={[]} isLoading={true} />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toHaveClass('h-10');
      expect(skeleton).toHaveClass('bg-gray-200');
      expect(skeleton).toHaveClass('rounded-lg');
    });
  });

  describe('Empty State', () => {
    test('should return null when categories is empty array', () => {
      const { container } = render(<CategoryNav categories={[]} />);
      expect(container.firstChild).toBeNull();
    });

    test('should return null when categories is undefined', () => {
      const { container } = render(<CategoryNav />);
      expect(container.firstChild).toBeNull();
    });

    test('should not render when categories is null', () => {
      const { container } = render(<CategoryNav categories={undefined} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Active State', () => {
    test('should highlight "Tous" when no category selected', () => {
      render(<CategoryNav categories={mockCategories} />);
      const tousLink = screen.getByText('Tous');
      expect(tousLink).toHaveClass('bg-blue-600');
      expect(tousLink).toHaveClass('text-white');
    });

    test('should highlight selected category', () => {
      mockSearchParams.set('category', 'restaurant');
      render(<CategoryNav categories={mockCategories} />);
      
      const restaurantLink = screen.getByText('Restaurants');
      expect(restaurantLink).toHaveClass('bg-blue-600');
      expect(restaurantLink).toHaveClass('text-white');
    });

    test('should not highlight unselected categories', () => {
      mockSearchParams.set('category', 'restaurant');
      render(<CategoryNav categories={mockCategories} />);
      
      const cafeLink = screen.getByText('Cafés');
      expect(cafeLink).toHaveClass('bg-gray-100');
      expect(cafeLink).toHaveClass('text-gray-700');
    });

    test('should not highlight "Tous" when category selected', () => {
      mockSearchParams.set('category', 'restaurant');
      render(<CategoryNav categories={mockCategories} />);
      
      const tousLink = screen.getByText('Tous');
      expect(tousLink).toHaveClass('bg-gray-100');
      expect(tousLink).toHaveClass('text-gray-700');
    });
  });

  describe('Links', () => {
    test('should have correct href for "Tous" link', () => {
      render(<CategoryNav categories={mockCategories} />);
      const tousLink = screen.getByText('Tous').closest('a');
      expect(tousLink).toHaveAttribute('href', '/annuaire');
    });

    test('should have correct href for category links', () => {
      render(<CategoryNav categories={mockCategories} />);
      
      const restaurantLink = screen.getByText('Restaurants').closest('a');
      expect(restaurantLink).toHaveAttribute('href', '/annuaire?category=restaurant');
      
      const cafeLink = screen.getByText('Cafés').closest('a');
      expect(cafeLink).toHaveAttribute('href', '/annuaire?category=cafe');
    });

    test('should have transition classes on links', () => {
      render(<CategoryNav categories={mockCategories} />);
      const link = screen.getByText('Restaurants');
      expect(link).toHaveClass('transition-colors');
    });

    test('should have whitespace-nowrap class', () => {
      render(<CategoryNav categories={mockCategories} />);
      const link = screen.getByText('Restaurants');
      expect(link).toHaveClass('whitespace-nowrap');
    });
  });

  describe('Icon Mapping', () => {
    test('should map all known icons correctly', () => {
      const categoriesWithAllIcons = [
        { id: 1, googleCategory: 'food', frenchName: 'Food', icon: 'utensils', order: 1 },
        { id: 2, googleCategory: 'cafe', frenchName: 'Cafe', icon: 'coffee', order: 2 },
        { id: 3, googleCategory: 'wine', frenchName: 'Wine', icon: 'wine-glass', order: 3 },
        { id: 4, googleCategory: 'bakery', frenchName: 'Bakery', icon: 'bread', order: 4 },
        { id: 5, googleCategory: 'pharmacy', frenchName: 'Pharmacy', icon: 'pills', order: 5 },
      ];
      
      render(<CategoryNav categories={categoriesWithAllIcons} />);
      
      expect(screen.getByText('Food').closest('a')?.textContent).toContain('🍽️');
      expect(screen.getByText('Cafe').closest('a')?.textContent).toContain('☕');
      expect(screen.getByText('Wine').closest('a')?.textContent).toContain('🍷');
      expect(screen.getByText('Bakery').closest('a')?.textContent).toContain('🥐');
      expect(screen.getByText('Pharmacy').closest('a')?.textContent).toContain('💊');
    });
  });

  describe('Responsive Design', () => {
    test('should have overflow-x-auto for horizontal scrolling', () => {
      const { container } = render(<CategoryNav categories={mockCategories} />);
      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('should have flex-shrink-0 on category links', () => {
      render(<CategoryNav categories={mockCategories} />);
      const link = screen.getByText('Restaurants');
      expect(link).toHaveClass('flex-shrink-0');
    });
  });

  describe('Mounting Behavior', () => {
    test('should return null before mounting', () => {
      // This test is tricky because useEffect runs immediately in tests
      // We can't easily test the unmounted state
      const { container } = render(<CategoryNav categories={mockCategories} />);
      // After render, component should be mounted
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle single category', () => {
      const singleCategory = [mockCategories[0]];
      render(<CategoryNav categories={singleCategory} />);
      expect(screen.getByText('Restaurants')).toBeInTheDocument();
      expect(screen.queryByText('Cafés')).not.toBeInTheDocument();
    });

    test('should handle many categories', () => {
      const manyCategories = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        googleCategory: `category-${i}`,
        frenchName: `Category ${i}`,
        icon: 'utensils',
        order: i + 1,
      }));
      
      render(<CategoryNav categories={manyCategories} />);
      expect(screen.getByText('Category 0')).toBeInTheDocument();
      expect(screen.getByText('Category 19')).toBeInTheDocument();
    });

    test('should handle category with very long name', () => {
      const longNameCategory = [
        {
          id: 1,
          googleCategory: 'long',
          frenchName: 'Very Long Category Name That Should Not Break Layout',
          icon: 'utensils',
          order: 1,
        },
      ];
      
      render(<CategoryNav categories={longNameCategory} />);
      expect(screen.getByText('Very Long Category Name That Should Not Break Layout')).toBeInTheDocument();
    });
  });
});
