'use client';

import { logger } from '@/lib/logger';
import { useEffect } from 'react';

interface TrackEventOptions {
  companyId: number;
  event: 'view' | 'phone' | 'website' | 'email' | 'directions';
  source?: 'organic' | 'search' | 'direct' | 'referral';
}

export function useAnalytics() {
  const trackEvent = async ({ companyId, event, source = 'organic' }: TrackEventOptions) => {
    try {
      await fetch(`/api/companies/${companyId}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event, source }),
      });
    } catch (error) {
      logger.error('Analytics tracking error:', error);
    }
  };

  const trackProfileView = (companyId: number) => {
    // Get source from URL parameters or referrer
    const urlParams = new URLSearchParams(window.location.search);
    let source: TrackEventOptions['source'] = 'organic';
    
    if (urlParams.get('utm_source')) {
      source = 'referral';
    } else if (document.referrer.includes('google.com')) {
      source = 'search';
    } else if (!document.referrer) {
      source = 'direct';
    }

    trackEvent({ companyId, event: 'view', source });
  };

  const trackPhoneClick = (companyId: number, phoneNumber: string) => {
    trackEvent({ companyId, event: 'phone' });
    window.location.href = `tel:${phoneNumber}`;
  };

  const trackWebsiteClick = (companyId: number, website: string) => {
    trackEvent({ companyId, event: 'website' });
    window.open(website, '_blank');
  };

  const trackEmailClick = (companyId: number, email: string) => {
    trackEvent({ companyId, event: 'email' });
    window.location.href = `mailto:${email}`;
  };

  const trackDirectionsClick = (companyId: number, lat: number, lng: number) => {
    trackEvent({ companyId, event: 'directions' });
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return {
    trackEvent,
    trackProfileView,
    trackPhoneClick,
    trackWebsiteClick,
    trackEmailClick,
    trackDirectionsClick,
  };
}

// Auto-track profile views
export function useAutoTrackProfileView(companyId: number | null) {
  const { trackProfileView } = useAnalytics();

  useEffect(() => {
    if (companyId) {
      trackProfileView(companyId);
    }
  }, [companyId]);
}