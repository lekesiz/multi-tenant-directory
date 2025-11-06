/**
 * CookieBanner Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import CookieBanner from '../CookieBanner';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.gtag
Object.defineProperty(window, 'gtag', {
  writable: true,
  value: jest.fn(),
});

describe('CookieBanner Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('should render banner when no consent given', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/Nous utilisons des cookies/i)).toBeInTheDocument();
  });

  test('should not render when consent already given', () => {
    localStorageMock.setItem('cookieConsent', JSON.stringify({ necessary: true }));
    
    render(<CookieBanner />);
    
    expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
  });

  test('should have accept all button', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/Accepter tout/i)).toBeInTheDocument();
  });

  test('should have necessary only button', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/Essentiels uniquement/i)).toBeInTheDocument();
  });

  test('should save consent when accepting all', () => {
    render(<CookieBanner />);
    
    const acceptButton = screen.getByText(/Accepter tout/i);
    fireEvent.click(acceptButton);

    const consent = JSON.parse(localStorageMock.getItem('cookieConsent')!);
    expect(consent.necessary).toBe(true);
    expect(consent.analytics).toBe(true);
    expect(consent.marketing).toBe(true);
    expect(consent.preferences).toBe(true);
  });

  test('should save consent when accepting necessary only', () => {
    render(<CookieBanner />);
    
    const necessaryButton = screen.getByText(/Essentiels uniquement/i);
    fireEvent.click(necessaryButton);

    const consent = JSON.parse(localStorageMock.getItem('cookieConsent')!);
    expect(consent.necessary).toBe(true);
    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
    expect(consent.preferences).toBe(false);
  });

  test('should hide banner after accepting all', () => {
    render(<CookieBanner />);
    
    const acceptButton = screen.getByText(/Accepter tout/i);
    fireEvent.click(acceptButton);

    expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
  });

  test('should hide banner after accepting necessary only', () => {
    render(<CookieBanner />);
    
    const necessaryButton = screen.getByText(/Essentiels uniquement/i);
    fireEvent.click(necessaryButton);

    expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
  });

  test('should update gtag consent when accepting all', () => {
    render(<CookieBanner />);
    
    const acceptButton = screen.getByText(/Accepter tout/i);
    fireEvent.click(acceptButton);

    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
    });
  });

  test('should update gtag consent when accepting necessary only', () => {
    render(<CookieBanner />);
    
    const necessaryButton = screen.getByText(/Essentiels uniquement/i);
    fireEvent.click(necessaryButton);

    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
    });
  });

  test('should have privacy policy link', () => {
    render(<CookieBanner />);
    
    const link = screen.getByText(/politique de confidentialité/i).closest('a');
    expect(link).toHaveAttribute('href', '/politique-de-confidentialite');
  });

  test('should save timestamp with consent', () => {
    render(<CookieBanner />);
    
    const acceptButton = screen.getByText(/Accepter tout/i);
    fireEvent.click(acceptButton);

    const consent = JSON.parse(localStorageMock.getItem('cookieConsent')!);
    expect(consent.timestamp).toBeDefined();
    expect(new Date(consent.timestamp)).toBeInstanceOf(Date);
  });

  test('should have cookie emoji', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/🍪/)).toBeInTheDocument();
  });

  test('should have description text', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/améliorer votre expérience/i)).toBeInTheDocument();
  });

  test('should be fixed at bottom', () => {
    const { container } = render(<CookieBanner />);
    
    const banner = container.querySelector('.fixed.bottom-0');
    expect(banner).toBeInTheDocument();
  });

  test('should have high z-index', () => {
    const { container } = render(<CookieBanner />);
    
    const banner = container.querySelector('.z-50');
    expect(banner).toBeInTheDocument();
  });

  test('should handle missing gtag gracefully', () => {
    // @ts-ignore
    delete window.gtag;
    
    render(<CookieBanner />);
    
    const acceptButton = screen.getByText(/Accepter tout/i);
    
    // Should not throw error
    expect(() => fireEvent.click(acceptButton)).not.toThrow();
  });
});
