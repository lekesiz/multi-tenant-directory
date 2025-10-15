import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CookieBanner from '@/components/CookieBanner';

// Mock localStorage
const localStorageMock = (function () {
  let store: { [key: string]: string } = {};
  
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.gtag
Object.defineProperty(window, 'gtag', {
  value: jest.fn(),
  writable: true,
});

describe('CookieBanner', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    // Clear gtag mock
    (window.gtag as jest.Mock).mockClear();
  });

  it('should render cookie banner when no consent is given', () => {
    render(<CookieBanner />);
    
    expect(screen.getByText(/Nous utilisons des cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepter tout/i)).toBeInTheDocument();
    expect(screen.getByText(/Cookies essentiels seulement/i)).toBeInTheDocument();
  });

  it('should not render cookie banner when consent exists', () => {
    // Set consent in localStorage
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    }));

    render(<CookieBanner />);
    
    expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
  });

  it('should save consent and hide banner when accepting all cookies', async () => {
    render(<CookieBanner />);
    
    const acceptButton = screen.getByText(/Accepter tout/i);
    fireEvent.click(acceptButton);

    await waitFor(() => {
      // Check localStorage
      const consent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
      expect(consent.necessary).toBe(true);
      expect(consent.analytics).toBe(true);
      expect(consent.marketing).toBe(true);
      expect(consent.preferences).toBe(true);
      expect(consent.timestamp).toBeDefined();

      // Check gtag was called
      expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });

      // Banner should be hidden
      expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
    });
  });

  it('should save limited consent when accepting necessary only', async () => {
    render(<CookieBanner />);
    
    const necessaryButton = screen.getByText(/Cookies essentiels seulement/i);
    fireEvent.click(necessaryButton);

    await waitFor(() => {
      // Check localStorage
      const consent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
      expect(consent.necessary).toBe(true);
      expect(consent.analytics).toBe(false);
      expect(consent.marketing).toBe(false);
      expect(consent.preferences).toBe(false);

      // Check gtag was called with denied
      expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });

      // Banner should be hidden
      expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
    });
  });

  it('should link to privacy policy', () => {
    render(<CookieBanner />);
    
    const privacyLink = screen.getByRole('link', { name: /politique de confidentialité/i });
    expect(privacyLink).toHaveAttribute('href', '/politique-confidentialite');
    expect(privacyLink).toHaveAttribute('target', '_blank');
  });
});