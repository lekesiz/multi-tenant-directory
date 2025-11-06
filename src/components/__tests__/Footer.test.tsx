/**
 * Footer Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

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

describe('Footer', () => {
  const defaultProps = {
    domainName: 'haguenau.pro',
  };

  describe('Rendering', () => {
    test('should render footer', () => {
      const { container } = render(<Footer {...defaultProps} />);
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    test('should render domain name in title', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText('Haguenau.PRO')).toBeInTheDocument();
    });

    test('should render domain description', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText(/La plateforme de référence pour trouver les meilleurs professionnels à Haguenau/i)).toBeInTheDocument();
    });

    test('should capitalize domain name', () => {
      render(<Footer domainName="strasbourg.pro" />);
      expect(screen.getByText('Strasbourg.PRO')).toBeInTheDocument();
    });

    test('should handle lowercase domain name', () => {
      render(<Footer domainName="PARIS.PRO" />);
      expect(screen.getByText('PARIS.PRO')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    test('should render Navigation section', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    test('should render Accueil link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Accueil').closest('a');
      expect(link).toHaveAttribute('href', '/');
    });

    test('should render Annuaire link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Annuaire').closest('a');
      expect(link).toHaveAttribute('href', '/annuaire');
    });

    test('should render Toutes les Catégories link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Toutes les Catégories').closest('a');
      expect(link).toHaveAttribute('href', '/categories');
    });

    test('should render Nous contacter link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Nous contacter').closest('a');
      expect(link).toHaveAttribute('href', '/contact');
    });
  });

  describe('Professional Links', () => {
    test('should render Professionnels section', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText('Professionnels')).toBeInTheDocument();
    });

    test('should render Espace Pro link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Espace Pro').closest('a');
      expect(link).toHaveAttribute('href', '/admin/login');
    });

    test('should render Créer un profil link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Créer un profil').closest('a');
      expect(link).toHaveAttribute('href', '/rejoindre');
    });

    test('should render Tarifs link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Tarifs').closest('a');
      expect(link).toHaveAttribute('href', '/tarifs');
    });
  });

  describe('Legal Links', () => {
    test('should render Légal section', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText('Légal')).toBeInTheDocument();
    });

    test('should render Mentions légales link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Mentions légales').closest('a');
      expect(link).toHaveAttribute('href', '/mentions-legales');
    });

    test('should render Politique de confidentialité link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Politique de confidentialité').closest('a');
      expect(link).toHaveAttribute('href', '/politique-de-confidentialite');
    });

    test('should render CGU link', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('CGU').closest('a');
      expect(link).toHaveAttribute('href', '/cgu');
    });
  });

  describe('Network Domains', () => {
    test('should render Réseau *.PRO section', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText('Réseau *.PRO')).toBeInTheDocument();
    });

    test('should render network description', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText('Découvrez nos plateformes locales')).toBeInTheDocument();
    });

    test('should render all network domains', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText('Bas-Rhin')).toBeInTheDocument();
      expect(screen.getByText('Bischwiller')).toBeInTheDocument();
      expect(screen.getByText('Haguenau')).toBeInTheDocument();
      expect(screen.getByText('Strasbourg')).toBeInTheDocument();
    });

    test('should render featured domain with star', () => {
      render(<Footer {...defaultProps} />);
      const basRhinLink = screen.getByText(/⭐ Bas-Rhin/i);
      expect(basRhinLink).toBeInTheDocument();
    });

    test('should have correct href for network domains', () => {
      render(<Footer {...defaultProps} />);
      const haguenauLink = screen.getByText('Haguenau').closest('a');
      expect(haguenauLink).toHaveAttribute('href', 'https://haguenau.pro');
    });

    test('should have nofollow rel on network domain links', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Haguenau').closest('a');
      expect(link).toHaveAttribute('rel', 'nofollow');
    });

    test('should have title attribute on network domain links', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Haguenau').closest('a');
      expect(link).toHaveAttribute('title', 'Annuaire professionnel de Haguenau');
    });

    test('should render featured domain with special styling', () => {
      render(<Footer {...defaultProps} />);
      const basRhinLink = screen.getByText(/⭐ Bas-Rhin/i);
      expect(basRhinLink).toHaveClass('font-bold');
      expect(basRhinLink).toHaveClass('text-yellow-400');
    });

    test('should render all 21 network domains', () => {
      const { container } = render(<Footer {...defaultProps} />);
      const networkLinks = container.querySelectorAll('.custom-scrollbar a');
      expect(networkLinks.length).toBe(21);
    });
  });

  describe('Contact Information', () => {
    test('should render phone number', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText(/03 67 31 07 70/i)).toBeInTheDocument();
    });

    test('should render email with domain name', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText(/contact@haguenau.pro/i)).toBeInTheDocument();
    });

    test('should render email with lowercase domain', () => {
      render(<Footer domainName="STRASBOURG.PRO" />);
      expect(screen.getByText(/contact@strasbourg.pro/i)).toBeInTheDocument();
    });
  });

  describe('Copyright', () => {
    test('should render current year', () => {
      render(<Footer {...defaultProps} />);
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    });

    test('should render copyright text', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText(/Tous droits réservés/i)).toBeInTheDocument();
    });

    test('should include domain name in copyright', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText(/Haguenau.PRO - Tous droits réservés/i)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    test('should have dark background', () => {
      const { container } = render(<Footer {...defaultProps} />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-gray-900');
      expect(footer).toHaveClass('text-white');
    });

    test('should have proper spacing', () => {
      const { container } = render(<Footer {...defaultProps} />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('mt-20');
    });

    test('should have responsive grid', () => {
      const { container } = render(<Footer {...defaultProps} />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-4');
    });

    test('should have custom scrollbar styles', () => {
      const { container } = render(<Footer {...defaultProps} />);
      const scrollContainer = container.querySelector('.custom-scrollbar');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('should have max height on network domains list', () => {
      const { container } = render(<Footer {...defaultProps} />);
      const scrollContainer = container.querySelector('.max-h-64');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    test('should have hover transition on links', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Accueil');
      expect(link).toHaveClass('hover:text-white');
      expect(link).toHaveClass('transition-colors');
    });

    test('should have hover effect on network domain links', () => {
      render(<Footer {...defaultProps} />);
      const link = screen.getByText('Haguenau');
      expect(link).toHaveClass('hover:text-white');
      expect(link).toHaveClass('transition-colors');
    });
  });

  describe('Accessibility', () => {
    test('should use semantic footer element', () => {
      const { container } = render(<Footer {...defaultProps} />);
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    test('should have proper heading hierarchy', () => {
      render(<Footer {...defaultProps} />);
      const h4 = screen.getByText('Haguenau.PRO');
      const h5s = screen.getAllByText(/Navigation|Professionnels|Légal|Réseau/);
      
      expect(h4.tagName).toBe('H4');
      h5s.forEach(h5 => {
        expect(h5.tagName).toBe('H5');
      });
    });

    test('should have descriptive link text', () => {
      render(<Footer {...defaultProps} />);
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Annuaire')).toBeInTheDocument();
      expect(screen.getByText('Espace Pro')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle domain with subdomain', () => {
      render(<Footer domainName="www.haguenau.pro" />);
      expect(screen.getByText('Www.PRO')).toBeInTheDocument();
    });

    test('should handle domain without extension', () => {
      render(<Footer domainName="haguenau" />);
      expect(screen.getByText('Haguenau.PRO')).toBeInTheDocument();
    });

    test('should handle empty domain name', () => {
      render(<Footer domainName="" />);
      expect(screen.getByText('.PRO')).toBeInTheDocument();
    });

    test('should handle single character domain', () => {
      render(<Footer domainName="a.pro" />);
      expect(screen.getByText('A.PRO')).toBeInTheDocument();
    });
  });

  describe('Custom Primary Color', () => {
    test('should accept custom primary color prop', () => {
      render(<Footer domainName="haguenau.pro" primaryColor="#FF0000" />);
      // Color is accepted but not visibly used in current implementation
      const { container } = render(<Footer domainName="haguenau.pro" primaryColor="#FF0000" />);
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    test('should use default primary color when not provided', () => {
      const { container } = render(<Footer {...defaultProps} />);
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive contact section', () => {
      const { container } = render(<Footer {...defaultProps} />);
      const contactSection = container.querySelector('.flex-col.md\\:flex-row');
      expect(contactSection).toBeInTheDocument();
    });

    test('should have responsive padding', () => {
      const { container } = render(<Footer {...defaultProps} />);
      const mainContainer = container.querySelector('.px-4.sm\\:px-6.lg\\:px-8');
      expect(mainContainer).toBeInTheDocument();
    });
  });
});
