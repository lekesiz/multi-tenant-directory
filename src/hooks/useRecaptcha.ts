import { useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if reCAPTCHA is configured
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
      setIsReady(true); // Allow form submission even if not configured
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsReady(true);
      });
    };

    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
      setIsReady(true); // Allow form submission even if script fails
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      const existingScript = document.querySelector(
        `script[src*="recaptcha/api.js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      // reCAPTCHA not configured, return null (backend will handle)
      return null;
    }

    if (!isReady || !window.grecaptcha) {
      console.warn('reCAPTCHA not ready yet');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      return null;
    }
  };

  return { isReady, executeRecaptcha };
}
