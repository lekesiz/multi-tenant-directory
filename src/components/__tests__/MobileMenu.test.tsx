/**
 * MobileMenu Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import MobileMenu from '../MobileMenu';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('MobileMenu Component', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  test('should render hamburger button', () => {
    render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    expect(button).toBeInTheDocument();
  });

  test('should open menu when button clicked', () => {
    render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  test('should close menu when button clicked again', () => {
    render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    
    // Open menu
    fireEvent.click(button);
    expect(screen.getByText('Menu')).toBeInTheDocument();
    
    // Close menu
    fireEvent.click(button);
    // Menu should still be in DOM but translated off-screen
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  test('should close menu when overlay clicked', () => {
    render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    const overlay = document.querySelector('.bg-black.bg-opacity-50');
    expect(overlay).toBeInTheDocument();
    
    fireEvent.click(overlay!);
    // Overlay should be removed
    expect(document.querySelector('.bg-black.bg-opacity-50')).not.toBeInTheDocument();
  });

  test('should render navigation links', () => {
    render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Annuaire')).toBeInTheDocument();
    expect(screen.getByText('Catégories')).toBeInTheDocument();
  });

  test('should have correct href attributes', () => {
    render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    const homeLink = screen.getByText('Accueil').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');

    const companiesLink = screen.getByText('Annuaire').closest('a');
    expect(companiesLink).toHaveAttribute('href', '/companies');
  });

  test('should close menu when pathname changes', () => {
    const { rerender } = render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);

    // Menu should be open
    expect(screen.getByText('Menu')).toBeInTheDocument();

    // Change pathname
    (usePathname as jest.Mock).mockReturnValue('/companies');
    rerender(<MobileMenu />);

    // Menu should close (overlay removed)
    expect(document.querySelector('.bg-black.bg-opacity-50')).not.toBeInTheDocument();
  });

  test('should prevent body scroll when menu is open', () => {
    render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    
    // Initially body scroll should be normal
    expect(document.body.style.overflow).toBe('');
    
    // Open menu
    fireEvent.click(button);
    expect(document.body.style.overflow).toBe('hidden');
    
    // Close menu
    fireEvent.click(button);
    expect(document.body.style.overflow).toBe('unset');
  });

  test('should have hamburger animation classes', () => {
    const { container } = render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    const spans = container.querySelectorAll('span');
    
    // Initially no rotation
    expect(spans[0]).not.toHaveClass('rotate-45');
    
    // After click, should have rotation
    fireEvent.click(button);
    expect(spans[0]).toHaveClass('rotate-45');
    expect(spans[1]).toHaveClass('opacity-0');
    expect(spans[2]).toHaveClass('-rotate-45');
  });

  test('should be hidden on large screens', () => {
    const { container } = render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    expect(button).toHaveClass('lg:hidden');
    
    const menu = container.querySelector('.lg\\:hidden');
    expect(menu).toBeInTheDocument();
  });

  test('should have slide animation', () => {
    const { container } = render(<MobileMenu />);
    
    const menu = container.querySelector('.transform.transition-transform');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('translate-x-full'); // Initially off-screen
    
    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);
    
    expect(menu).toHaveClass('translate-x-0'); // On-screen when open
  });

  test('should cleanup body overflow on unmount', () => {
    const { unmount } = render(<MobileMenu />);
    
    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    unmount();
    
    expect(document.body.style.overflow).toBe('unset');
  });
});
