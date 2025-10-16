'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
}

/**
 * Hook for monitoring component performance
 */
export function usePerformance(componentName: string) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log slow components in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(
          `⚠️ Slow component render: ${componentName} took ${duration.toFixed(2)}ms`
        );
      }

      // Send to analytics in production (optional)
      if (process.env.NODE_ENV === 'production' && duration > 1000) {
        // You can send this to your analytics service
        // Example: sendToAnalytics({ component: componentName, duration });
      }
    };
  }, [componentName]);
}

/**
 * Hook for measuring Web Vitals
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Measure Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry && 'renderTime' in lastEntry) {
        const lcp = (lastEntry as any).renderTime || (lastEntry as any).loadTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`LCP: ${lcp}ms`);
        }

        // Send to analytics
        // sendToAnalytics({ metric: 'LCP', value: lcp });
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser doesn't support this API
    }

    return () => observer.disconnect();
  }, []);
}

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  fn: () => T,
  label: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Measure async function execution time
 */
export async function measurePerformanceAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

