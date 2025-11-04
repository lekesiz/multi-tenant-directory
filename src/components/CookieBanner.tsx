'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAllCookies = () => {
    // Set consent for all cookie types
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setIsVisible(false);
    
    // Initialize Google Analytics after consent
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
  };

  const acceptNecessaryOnly = () => {
    // Only accept necessary cookies
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setIsVisible(false);
    
    // Deny Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍪 Nous utilisons des cookies
            </h3>
            <p className="text-sm text-gray-600">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site, 
              analyser le trafic et personnaliser le contenu. En cliquant sur "Accepter tout", 
              vous consentez à l'utilisation de tous les cookies. Vous pouvez également 
              choisir de n'accepter que les cookies essentiels.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Pour plus d'informations, consultez notre{' '}
              <a
                href="/politique-de-confidentialite"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
              >
                politique de confidentialité
              </a>
              .
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={acceptNecessaryOnly}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cookies essentiels seulement
            </button>
            <button
              onClick={acceptAllCookies}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Accepter tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Types for window.gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: any) => void;
  }
}