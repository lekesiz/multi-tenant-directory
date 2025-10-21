'use client';

import { logger } from '@/lib/logger';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('[Web Vitals]', metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Send to Vercel Analytics (automatically handled)
      // Or send to custom analytics endpoint
      const body = JSON.stringify(metric);
      const url = '/api/analytics/vitals';

      // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, {
          body,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        });
      }
    }
  });

  return null;
}

