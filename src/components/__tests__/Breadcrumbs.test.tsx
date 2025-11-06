/**
 * Breadcrumbs Component Tests
 */

import { render, screen } from '@testing-library/react';
import Breadcrumbs, {
  generateCompanyBreadcrumbs,
  generateCategoryBreadcrumbs,
  generateDirectoryBreadcrumbs,
} from '../Breadcrumbs';

describe('Breadcrumbs Component', () => {
  const mockItems = [
    { name: 'Category', href: '/category' },
    { name: 'Subcategory', href: '/category/sub' },
    { name: 'Current Page', href: '/category/sub/page', current: true },
  ];

  test('should render breadcrumb items', () => {
    render(<Breadcrumbs items={mockItems} />);
    
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Subcategory')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  test('should render home icon', () => {
    render(<Breadcrumbs items={mockItems} />);
    
    const homeLink = screen.getByLabelText('Accueil');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('should render current item as span', () => {
    render(<Breadcrumbs items={mockItems} />);
    
    const currentItem = screen.getByText('Current Page');
    expect(currentItem.tagName).toBe('SPAN');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  });

  test('should render non-current items as links', () => {
    render(<Breadcrumbs items={mockItems} />);
    
    const categoryLink = screen.getByText('Category');
    expect(categoryLink.tagName).toBe('A');
    expect(categoryLink).toHaveAttribute('href', '/category');
  });

  test('should apply custom className', () => {
    const { container } = render(<Breadcrumbs items={mockItems} className="custom-class" />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  test('should render with empty items array', () => {
    render(<Breadcrumbs items={[]} />);
    
    // Should still render home icon
    const homeLink = screen.getByLabelText('Accueil');
    expect(homeLink).toBeInTheDocument();
  });
});

describe('generateCompanyBreadcrumbs', () => {
  test('should generate breadcrumbs with category', () => {
    const breadcrumbs = generateCompanyBreadcrumbs(
      'Test Company',
      'test-company',
      'Restaurant',
      'restaurant'
    );

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({ name: 'Annuaire', href: '/annuaire' });
    expect(breadcrumbs[1]).toEqual({ name: 'Restaurant', href: '/categories/restaurant' });
    expect(breadcrumbs[2]).toEqual({
      name: 'Test Company',
      href: '/companies/test-company',
      current: true,
    });
  });

  test('should generate breadcrumbs without category', () => {
    const breadcrumbs = generateCompanyBreadcrumbs('Test Company', 'test-company');

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({ name: 'Annuaire', href: '/annuaire' });
    expect(breadcrumbs[1]).toEqual({
      name: 'Test Company',
      href: '/companies/test-company',
      current: true,
    });
  });

  test('should mark company as current page', () => {
    const breadcrumbs = generateCompanyBreadcrumbs('Test', 'test');
    const lastItem = breadcrumbs[breadcrumbs.length - 1];
    expect(lastItem.current).toBe(true);
  });
});

describe('generateCategoryBreadcrumbs', () => {
  test('should generate category breadcrumbs', () => {
    const breadcrumbs = generateCategoryBreadcrumbs('Restaurant');

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({ name: 'Catégories', href: '/categories' });
    expect(breadcrumbs[1].name).toBe('Restaurant');
    expect(breadcrumbs[1].current).toBe(true);
  });

  test('should convert category name to slug', () => {
    const breadcrumbs = generateCategoryBreadcrumbs('Boulangerie Pâtisserie');
    
    expect(breadcrumbs[1].href).toContain('boulangerie');
  });

  test('should mark category as current page', () => {
    const breadcrumbs = generateCategoryBreadcrumbs('Test Category');
    expect(breadcrumbs[1].current).toBe(true);
  });
});

describe('generateDirectoryBreadcrumbs', () => {
  test('should generate directory breadcrumbs', () => {
    const breadcrumbs = generateDirectoryBreadcrumbs();

    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      name: 'Annuaire',
      href: '/annuaire',
      current: true,
    });
  });

  test('should mark directory as current page', () => {
    const breadcrumbs = generateDirectoryBreadcrumbs();
    expect(breadcrumbs[0].current).toBe(true);
  });
});
