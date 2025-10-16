import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Lazy load component with loading fallback
 */
export function lazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ssr: options?.ssr ?? true,
  });
}

/**
 * Preload component for better performance
 */
export function preloadComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return importFn();
}

/**
 * Lazy load components that are only needed on interaction
 * Note: Only include components that actually exist in the codebase
 */
export const LazyComponents = {
  // QR Code generator (exists)
  QRCode: lazyLoad(() => import('@/components/CompanyQRCode'), { ssr: false }),

  // TODO: Add these when components are created:
  // AdminDashboard: lazyLoad(() => import('@/components/AdminDashboard'), { ssr: false }),
  // Charts: lazyLoad(() => import('@/components/Charts'), { ssr: false }),
  // Map: lazyLoad(() => import('@/components/GoogleMap'), { ssr: false }),
  // RichTextEditor: lazyLoad(() => import('@/components/RichTextEditor'), { ssr: false }),
};

/**
 * Route-based code splitting helper
 * Note: These are commented out until the actual pages are created
 */
export const LazyPages = {
  // TODO: Add these when pages are created:
  // BusinessDashboard: lazyLoad(() => import('@/app/business/dashboard/page')),
  // BusinessSettings: lazyLoad(() => import('@/app/business/dashboard/settings/page')),
  // BusinessBilling: lazyLoad(() => import('@/app/business/dashboard/billing/page')),
  // AdminDashboard: lazyLoad(() => import('@/app/admin/dashboard/page'), { ssr: false }),
  // AdminUsers: lazyLoad(() => import('@/app/admin/users/page'), { ssr: false }),
};

/**
 * Intersection Observer based lazy loading
 */
export function useLazyLoadOnView(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
  }, options);

  return observer;
}

