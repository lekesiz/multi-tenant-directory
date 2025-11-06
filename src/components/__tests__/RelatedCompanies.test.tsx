/**
 * RelatedCompanies Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RelatedCompanies from '../RelatedCompanies';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return ({ src, alt, fill, className }: any) => {
    return <img src={src} alt={alt} className={className} />;
  };
});

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: ({ className }: any) => <svg className={className} data-testid="chevron-left" />,
  ChevronRightIcon: ({ className }: any) => <svg className={className} data-testid="chevron-right" />,
}));

describe('RelatedCompanies', () => {
  const mockCompanies = [
    {
      id: 1,
      name: 'Company A',
      slug: 'company-a',
      city: 'Paris',
      logoUrl: 'https://example.com/logo-a.jpg',
      categories: ['Category 1', 'Category 2'],
      rating: 4.5,
      reviewCount: 10,
    },
    {
      id: 2,
      name: 'Company B',
      slug: 'company-b',
      city: 'Lyon',
      logoUrl: null,
      categories: ['Category 1'],
      rating: 5.0,
      reviewCount: 5,
    },
    {
      id: 3,
      name: 'Company C',
      slug: 'company-c',
      city: null,
      logoUrl: 'https://example.com/logo-c.jpg',
      categories: [],
      rating: null,
      reviewCount: 0,
    },
  ];

  const defaultProps = {
    companies: mockCompanies,
    currentCompanyId: 999,
  };

  describe('Rendering', () => {
    test('should render related companies section', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByText('Entreprises similaires')).toBeInTheDocument();
    });

    test('should not render when companies array is empty', () => {
      const { container } = render(
        <RelatedCompanies companies={[]} currentCompanyId={1} />
      );
      expect(container.firstChild).toBeNull();
    });

    test('should not render when companies is null', () => {
      const { container } = render(
        <RelatedCompanies companies={null as any} currentCompanyId={1} />
      );
      expect(container.firstChild).toBeNull();
    });

    test('should render all companies', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByText('Company A')).toBeInTheDocument();
      expect(screen.getByText('Company B')).toBeInTheDocument();
      expect(screen.getByText('Company C')).toBeInTheDocument();
    });

    test('should render category subtitle when provided', () => {
      render(<RelatedCompanies {...defaultProps} category="Test Category" />);
      expect(screen.getByText(/Autres entreprises dans la catégorie Test Category/)).toBeInTheDocument();
    });

    test('should not render category subtitle when not provided', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.queryByText(/Autres entreprises dans la catégorie/)).not.toBeInTheDocument();
    });
  });

  describe('Company Cards', () => {
    test('should render company names', () => {
      render(<RelatedCompanies {...defaultProps} />);
      mockCompanies.forEach(company => {
        expect(screen.getByText(company.name)).toBeInTheDocument();
      });
    });

    test('should render company cities when available', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('Lyon')).toBeInTheDocument();
    });

    test('should not render city when null', () => {
      render(<RelatedCompanies {...defaultProps} />);
      const companyC = screen.getByText('Company C').closest('a');
      expect(companyC).not.toHaveTextContent('null');
    });

    test('should render company logos when available', () => {
      render(<RelatedCompanies {...defaultProps} />);
      const logoA = screen.getByAlt('Company A');
      expect(logoA).toHaveAttribute('src', 'https://example.com/logo-a.jpg');
    });

    test('should render fallback letter when logo is null', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByText('B')).toBeInTheDocument(); // First letter of Company B
    });

    test('should render company links with correct href', () => {
      render(<RelatedCompanies {...defaultProps} />);
      const linkA = screen.getByText('Company A').closest('a');
      expect(linkA).toHaveAttribute('href', '/companies/company-a');
    });
  });

  describe('Categories', () => {
    test('should render categories when available', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    test('should limit categories to 2', () => {
      const companiesWithManyCategories = [
        {
          ...mockCompanies[0],
          categories: ['Cat 1', 'Cat 2', 'Cat 3', 'Cat 4'],
        },
      ];
      render(<RelatedCompanies companies={companiesWithManyCategories} currentCompanyId={1} />);
      expect(screen.getByText('Cat 1')).toBeInTheDocument();
      expect(screen.getByText('Cat 2')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.queryByText('Cat 3')).not.toBeInTheDocument();
    });

    test('should not render category section when empty', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const companyC = screen.getByText('Company C').closest('a');
      expect(companyC?.querySelector('.bg-blue-50')).not.toBeInTheDocument();
    });
  });

  describe('Ratings', () => {
    test('should render rating when available', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('5.0')).toBeInTheDocument();
    });

    test('should render review count', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByText('(10 avis)')).toBeInTheDocument();
      expect(screen.getByText('(5 avis)')).toBeInTheDocument();
    });

    test('should not render rating when null', () => {
      render(<RelatedCompanies {...defaultProps} />);
      const companyC = screen.getByText('Company C').closest('a');
      expect(companyC).not.toHaveTextContent('0.0');
    });

    test('should not render rating when 0', () => {
      const companiesWithZeroRating = [
        {
          ...mockCompanies[0],
          rating: 0,
        },
      ];
      render(<RelatedCompanies companies={companiesWithZeroRating} currentCompanyId={1} />);
      expect(screen.queryByText('0.0')).not.toBeInTheDocument();
    });

    test('should render 5 stars', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const stars = container.querySelectorAll('svg[fill="currentColor"]');
      // Each company with rating has 5 stars
      expect(stars.length).toBeGreaterThan(0);
    });

    test('should highlight correct number of stars based on rating', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const companyA = screen.getByText('Company A').closest('a');
      const yellowStars = companyA?.querySelectorAll('.text-yellow-400');
      expect(yellowStars?.length).toBe(5); // 4.5 rounds to 5 filled stars
    });
  });

  describe('Navigation', () => {
    test('should render navigation buttons on desktop', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    });

    test('should have correct aria labels on navigation buttons', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByLabelText('Précédent')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivant')).toBeInTheDocument();
    });

    test('should call scroll function when clicking left button', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLElement;
      
      // Mock scrollTo
      scrollContainer.scrollTo = jest.fn();
      
      const leftButton = screen.getByLabelText('Précédent');
      fireEvent.click(leftButton);
      
      expect(scrollContainer.scrollTo).toHaveBeenCalled();
    });

    test('should call scroll function when clicking right button', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLElement;
      
      // Mock scrollTo
      scrollContainer.scrollTo = jest.fn();
      
      const rightButton = screen.getByLabelText('Suivant');
      fireEvent.click(rightButton);
      
      expect(scrollContainer.scrollTo).toHaveBeenCalled();
    });

    test('should scroll left with correct amount', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLElement;
      
      // Mock scrollTo
      const scrollToMock = jest.fn();
      scrollContainer.scrollTo = scrollToMock;
      scrollContainer.scrollLeft = 500;
      
      const leftButton = screen.getByLabelText('Précédent');
      fireEvent.click(leftButton);
      
      expect(scrollToMock).toHaveBeenCalledWith({
        left: 180, // 500 - 320
        behavior: 'smooth',
      });
    });

    test('should scroll right with correct amount', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLElement;
      
      // Mock scrollTo
      const scrollToMock = jest.fn();
      scrollContainer.scrollTo = scrollToMock;
      scrollContainer.scrollLeft = 0;
      
      const rightButton = screen.getByLabelText('Suivant');
      fireEvent.click(rightButton);
      
      expect(scrollToMock).toHaveBeenCalledWith({
        left: 320,
        behavior: 'smooth',
      });
    });
  });

  describe('Mobile Scroll Hint', () => {
    test('should render mobile scroll hint', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByText('← Faites défiler pour voir plus →')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    test('should have correct container classes', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const mainContainer = container.querySelector('.bg-white.rounded-lg');
      expect(mainContainer).toBeInTheDocument();
    });

    test('should have scrollable container', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('should have hover effects on cards', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const card = container.querySelector('.hover\\:shadow-lg');
      expect(card).toBeInTheDocument();
    });

    test('should have transition effects', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const card = container.querySelector('.transition-all');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have semantic HTML structure', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    test('should have alt text for images', () => {
      render(<RelatedCompanies {...defaultProps} />);
      const logoA = screen.getByAlt('Company A');
      expect(logoA).toBeInTheDocument();
    });

    test('should have aria labels for buttons', () => {
      render(<RelatedCompanies {...defaultProps} />);
      expect(screen.getByLabelText('Précédent')).toBeInTheDocument();
      expect(screen.getByLabelText('Suivant')).toBeInTheDocument();
    });

    test('should have proper link structure', () => {
      render(<RelatedCompanies {...defaultProps} />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(mockCompanies.length);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single company', () => {
      render(<RelatedCompanies companies={[mockCompanies[0]]} currentCompanyId={1} />);
      expect(screen.getByText('Company A')).toBeInTheDocument();
      expect(screen.queryByText('Company B')).not.toBeInTheDocument();
    });

    test('should handle company with very long name', () => {
      const longNameCompany = {
        ...mockCompanies[0],
        name: 'A'.repeat(100),
      };
      render(<RelatedCompanies companies={[longNameCompany]} currentCompanyId={1} />);
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    test('should handle company with special characters in name', () => {
      const specialCharCompany = {
        ...mockCompanies[0],
        name: 'Company & Co. <Test>',
      };
      render(<RelatedCompanies companies={[specialCharCompany]} currentCompanyId={1} />);
      expect(screen.getByText('Company & Co. <Test>')).toBeInTheDocument();
    });

    test('should handle company with unicode in name', () => {
      const unicodeCompany = {
        ...mockCompanies[0],
        name: 'Company 测试 テスト 🎉',
      };
      render(<RelatedCompanies companies={[unicodeCompany]} currentCompanyId={1} />);
      expect(screen.getByText('Company 测试 テスト 🎉')).toBeInTheDocument();
    });

    test('should handle rating with decimals', () => {
      const decimalRatingCompany = {
        ...mockCompanies[0],
        rating: 4.7,
      };
      render(<RelatedCompanies companies={[decimalRatingCompany]} currentCompanyId={1} />);
      expect(screen.getByText('4.7')).toBeInTheDocument();
    });

    test('should handle zero review count', () => {
      const zeroReviewCompany = {
        ...mockCompanies[0],
        rating: 5.0,
        reviewCount: 0,
      };
      render(<RelatedCompanies companies={[zeroReviewCompany]} currentCompanyId={1} />);
      expect(screen.getByText('(0 avis)')).toBeInTheDocument();
    });

    test('should handle large review count', () => {
      const largeReviewCompany = {
        ...mockCompanies[0],
        reviewCount: 9999,
      };
      render(<RelatedCompanies companies={[largeReviewCompany]} currentCompanyId={1} />);
      expect(screen.getByText('(9999 avis)')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive classes', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      expect(container.querySelector('.sm\\:p-6')).toBeInTheDocument();
      expect(container.querySelector('.sm\\:text-2xl')).toBeInTheDocument();
    });

    test('should hide navigation on mobile', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const navButtons = container.querySelector('.hidden.md\\:flex');
      expect(navButtons).toBeInTheDocument();
    });

    test('should show scroll hint on mobile', () => {
      const { container } = render(<RelatedCompanies {...defaultProps} />);
      const scrollHint = container.querySelector('.md\\:hidden');
      expect(scrollHint).toBeInTheDocument();
    });
  });
});
