'use client';

import { logger } from '@/lib/logger';
import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * Registers the service worker for PWA offline support
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          logger.info('[SW] Service Worker registered successfully', { scope: registration.scope });

          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, show update notification
                  logger.info('[SW] New service worker available. Refresh to update.');

                  // Optional: Show a notification to the user
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Mise à jour disponible', {
                      body: 'Une nouvelle version est disponible. Rafraîchissez la page.',
                      icon: '/icons/icon-192x192.svg',
                      badge: '/icons/icon-96x96.svg',
                    });
                  }
                }
              });
            }
          });

          // Check for updates every hour
          setInterval(
            () => {
              registration.update();
            },
            60 * 60 * 1000
          );
        })
        .catch((error) => {
          logger.error('[SW] Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        logger.info('[SW] Message from service worker', { data: event.data });

        if (event.data.type === 'CACHE_UPDATED') {
          logger.info('[SW] Cache has been updated');
        }
      });

      // Clean up old caches on page load
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAN_OLD_CACHES',
        });
      }
    }
  }, []);

  return null;
}
