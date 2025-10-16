'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PerformanceMonitor() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // First Contentful Paint (FCP)
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
        
        // Largest Contentful Paint (LCP)
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          // Send metrics to analytics endpoint
          fetch('/api/analytics/vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pathname,
              metric: 'LCP',
              value: lastEntry.startTime,
            }),
          }).catch(() => {
            // Silently fail
          });
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-input') {
              const inputDelay = (entry as any).processingStart - entry.startTime;
              
              fetch('/api/analytics/vitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  pathname,
                  metric: 'FID',
                  value: inputDelay,
                }),
              }).catch(() => {
                // Silently fail
              });
            }
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Time to First Byte (TTFB)
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
          const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
          
          fetch('/api/analytics/vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pathname,
              metric: 'TTFB',
              value: ttfb,
            }),
          }).catch(() => {
            // Silently fail
          });
        }

        // Cleanup on unmount
        return () => {
          observer.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          
          // Send final CLS value
          if (clsValue > 0) {
            fetch('/api/analytics/vitals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pathname,
                metric: 'CLS',
                value: clsValue,
              }),
            }).catch(() => {
              // Silently fail
            });
          }
        };
      } catch (error) {
        // Silently fail if Performance API is not supported
      }
    }
  }, [pathname]);

  return null;
}