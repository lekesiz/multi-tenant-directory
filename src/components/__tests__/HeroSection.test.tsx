/**
 * HeroSection Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '../HeroSection';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, className }: any) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('HeroSection', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('Rendering', () => {
    test('should render hero section', () => {
      render(<HeroSection />);
      expect(screen.getByText(/Trouvez les Meilleures/i)).toBeInTheDocument();
    });

    test('should render with default domain', () => {
      render(<HeroSection />);
      expect(screen.getByText(/Entreprises de Haguenau/i)).toBeInTheDocument();
    });

    test('should render with custom domain', () => {
      render(<HeroSection domain="Paris" />);
      expect(screen.getByText(/Entreprises de Paris/i)).toBeInTheDocument();
    });

    test('should render search form', () => {
      render(<HeroSection />);
      expect(screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i)).toBeInTheDocument();
    });

    test('should render location input', () => {
      render(<HeroSection />);
      expect(screen.getByPlaceholderText('Haguenau')).toBeInTheDocument();
    });

    test('should render search button', () => {
      render(<HeroSection />);
      expect(screen.getByText('Rechercher')).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    test('should render "Commencer la Recherche" button', () => {
      render(<HeroSection />);
      expect(screen.getByText('Commencer la Recherche')).toBeInTheDocument();
    });

    test('should render "Je suis un Professionnel" button', () => {
      render(<HeroSection />);
      expect(screen.getByText('Je suis un Professionnel')).toBeInTheDocument();
    });

    test('should have correct href for directory link', () => {
      render(<HeroSection />);
      const link = screen.getByText('Commencer la Recherche').closest('a');
      expect(link).toHaveAttribute('href', '/annuaire');
    });

    test('should have correct href for business register link', () => {
      render(<HeroSection />);
      const link = screen.getByText('Je suis un Professionnel').closest('a');
      expect(link).toHaveAttribute('href', '/business/register');
    });
  });

  describe('Statistics', () => {
    test('should render business count', () => {
      render(<HeroSection />);
      expect(screen.getByText('5K+')).toBeInTheDocument();
      expect(screen.getByText('Entreprises Vérifiées')).toBeInTheDocument();
    });

    test('should render review count', () => {
      render(<HeroSection />);
      expect(screen.getByText('50K+')).toBeInTheDocument();
      expect(screen.getByText('Avis Clients')).toBeInTheDocument();
    });

    test('should render average rating', () => {
      render(<HeroSection />);
      expect(screen.getByText('4.8/5')).toBeInTheDocument();
      expect(screen.getByText('Note Moyenne')).toBeInTheDocument();
    });
  });

  describe('Popular Searches', () => {
    test('should render popular searches section', () => {
      render(<HeroSection />);
      expect(screen.getByText('Recherches Populaires')).toBeInTheDocument();
    });

    test('should render all popular search buttons', () => {
      render(<HeroSection />);
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Plombier')).toBeInTheDocument();
      expect(screen.getByText('Coiffeur')).toBeInTheDocument();
      expect(screen.getByText('Garage')).toBeInTheDocument();
      expect(screen.getByText('Médecin')).toBeInTheDocument();
    });

    test('should navigate when popular search is clicked', () => {
      render(<HeroSection />);
      const restaurantButton = screen.getByText('Restaurant');
      fireEvent.click(restaurantButton);
      
      expect(mockPush).toHaveBeenCalledWith('/annuaire?q=Restaurant&location=Haguenau');
    });

    test('should set search query when popular search is clicked', () => {
      render(<HeroSection />);
      const plombierButton = screen.getByText('Plombier');
      fireEvent.click(plombierButton);
      
      const searchInput = screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i) as HTMLInputElement;
      expect(searchInput.value).toBe('Plombier');
    });
  });

  describe('Search Form', () => {
    test('should update search query on input', () => {
      render(<HeroSection />);
      const searchInput = screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i) as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'Boulangerie' } });
      expect(searchInput.value).toBe('Boulangerie');
    });

    test('should update location on input', () => {
      render(<HeroSection />);
      const locationInput = screen.getByPlaceholderText('Haguenau') as HTMLInputElement;
      
      fireEvent.change(locationInput, { target: { value: 'Strasbourg' } });
      expect(locationInput.value).toBe('Strasbourg');
    });

    test('should navigate on form submit with query', () => {
      render(<HeroSection />);
      const searchInput = screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i);
      const form = screen.getByText('Rechercher').closest('form')!;
      
      fireEvent.change(searchInput, { target: { value: 'Boulangerie' } });
      fireEvent.submit(form);
      
      expect(mockPush).toHaveBeenCalledWith('/annuaire?q=Boulangerie&location=Haguenau');
    });

    test('should navigate on form submit with location', () => {
      render(<HeroSection />);
      const locationInput = screen.getByPlaceholderText('Haguenau');
      const form = screen.getByText('Rechercher').closest('form')!;
      
      fireEvent.change(locationInput, { target: { value: 'Paris' } });
      fireEvent.submit(form);
      
      expect(mockPush).toHaveBeenCalledWith('/annuaire?location=Paris');
    });

    test('should navigate on form submit with both query and location', () => {
      render(<HeroSection />);
      const searchInput = screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i);
      const locationInput = screen.getByPlaceholderText('Haguenau');
      const form = screen.getByText('Rechercher').closest('form')!;
      
      fireEvent.change(searchInput, { target: { value: 'Restaurant' } });
      fireEvent.change(locationInput, { target: { value: 'Lyon' } });
      fireEvent.submit(form);
      
      expect(mockPush).toHaveBeenCalledWith('/annuaire?q=Restaurant&location=Lyon');
    });

    test('should navigate on form submit without query', () => {
      render(<HeroSection />);
      const form = screen.getByText('Rechercher').closest('form')!;
      
      fireEvent.submit(form);
      
      expect(mockPush).toHaveBeenCalledWith('/annuaire?location=Haguenau');
    });

    test('should handle empty location', () => {
      render(<HeroSection />);
      const searchInput = screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i);
      const locationInput = screen.getByPlaceholderText('Haguenau');
      const form = screen.getByText('Rechercher').closest('form')!;
      
      fireEvent.change(searchInput, { target: { value: 'Café' } });
      fireEvent.change(locationInput, { target: { value: '' } });
      fireEvent.submit(form);
      
      expect(mockPush).toHaveBeenCalledWith('/annuaire?q=Caf%C3%A9');
    });
  });

  describe('Trust Indicators', () => {
    test('should render security message', () => {
      render(<HeroSection />);
      expect(screen.getByText(/Toutes les données sont sécurisées et vérifiées/i)).toBeInTheDocument();
    });

    test('should render RGPD compliance', () => {
      render(<HeroSection />);
      expect(screen.getByText(/RGPD compliant/i)).toBeInTheDocument();
    });

    test('should render trust badges', () => {
      render(<HeroSection />);
      expect(screen.getByText('✓ Transparent')).toBeInTheDocument();
      expect(screen.getByText('✓ Fiable')).toBeInTheDocument();
      expect(screen.getByText('✓ Facile')).toBeInTheDocument();
    });
  });

  describe('Promotional Elements', () => {
    test('should render free trial badge', () => {
      render(<HeroSection />);
      expect(screen.getByText(/14 Jours/i)).toBeInTheDocument();
      expect(screen.getByText(/Gratuits/i)).toBeInTheDocument();
    });

    test('should render discovery badge', () => {
      render(<HeroSection />);
      expect(screen.getByText('Découvrez les Meilleures Entreprises')).toBeInTheDocument();
    });
  });

  describe('Custom Domain', () => {
    test('should use custom domain in location input', () => {
      render(<HeroSection domain="Marseille" />);
      const locationInput = screen.getByPlaceholderText('Marseille') as HTMLInputElement;
      expect(locationInput.value).toBe('Marseille');
    });

    test('should use custom domain in navigation', () => {
      render(<HeroSection domain="Nice" />);
      const form = screen.getByText('Rechercher').closest('form')!;
      
      fireEvent.submit(form);
      
      expect(mockPush).toHaveBeenCalledWith('/annuaire?location=Nice');
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(<HeroSection />);
      const h1 = screen.getByText(/Trouvez les Meilleures/i);
      expect(h1.tagName).toBe('H1');
      
      const h2 = screen.getByText('Que cherchez-vous?');
      expect(h2.tagName).toBe('H2');
    });

    test('should have form with submit button', () => {
      render(<HeroSection />);
      const submitButton = screen.getByText('Rechercher');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('should have text inputs with proper types', () => {
      render(<HeroSection />);
      const searchInput = screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i);
      const locationInput = screen.getByPlaceholderText('Haguenau');
      
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(locationInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in search query', () => {
      render(<HeroSection />);
      const searchInput = screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i);
      const form = screen.getByText('Rechercher').closest('form')!;
      
      fireEvent.change(searchInput, { target: { value: 'Café & Restaurant' } });
      fireEvent.submit(form);
      
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('Caf%C3%A9'));
    });

    test('should handle very long search query', () => {
      render(<HeroSection />);
      const searchInput = screen.getByPlaceholderText(/Plombier, Restaurant, Coiffeur.../i);
      const longQuery = 'A'.repeat(200);
      
      fireEvent.change(searchInput, { target: { value: longQuery } });
      expect((searchInput as HTMLInputElement).value).toBe(longQuery);
    });

    test('should handle empty domain', () => {
      render(<HeroSection domain="" />);
      expect(screen.getByText(/Entreprises de/i)).toBeInTheDocument();
    });
  });
});
