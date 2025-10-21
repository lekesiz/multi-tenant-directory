/**
 * Dashboard Context Provider
 * Manages dashboard state, tenant context, and real-time updates
 */

'use client';

import { logger } from '@/lib/logger';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { TenantContext } from '@/lib/multi-tenant-core';

// Dashboard Context Types
interface DashboardContextType {
  tenant: TenantContext | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  checkLimit: (limitType: string, currentValue: number) => boolean;
  trackEvent: (event: string, data?: any) => void;
}

// Create Context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider Props
interface DashboardProviderProps {
  children: ReactNode;
  initialTenant?: TenantContext | null;
}

// Dashboard Provider Component
export function DashboardProvider({ children, initialTenant }: DashboardProviderProps) {
  const { data: session } = useSession();
  const [tenant, setTenant] = useState<TenantContext | null>(initialTenant || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize tenant context
  useEffect(() => {
    if (session?.user && !tenant) {
      fetchTenantContext();
    }
  }, [session, tenant]);

  // Fetch tenant context from headers or API
  const fetchTenantContext = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get tenant from middleware headers first
      const tenantConfig = document.querySelector('meta[name="x-tenant-config"]')?.getAttribute('content');
      
      if (tenantConfig) {
        const config = JSON.parse(tenantConfig);
        setTenant(config);
      } else {
        // Fallback to API call
        const response = await fetch('/api/tenant/current');
        if (response.ok) {
          const data = await response.json();
          setTenant(data.tenant);
        } else {
          throw new Error('Failed to fetch tenant context');
        }
      }
    } catch (err) {
      logger.error('Failed to fetch tenant context:', err);
      setError('Failed to load tenant information');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh tenant context
  const refreshTenant = async () => {
    await fetchTenantContext();
  };

  // Check if tenant has specific feature
  const hasFeature = (feature: string): boolean => {
    if (!tenant?.features) return false;
    
    return tenant.features[feature as keyof typeof tenant.features] === true;
  };

  // Check if current value exceeds tenant limit
  const checkLimit = (limitType: string, currentValue: number): boolean => {
    if (!tenant?.limits) return true;
    
    const limit = tenant.limits[limitType as keyof typeof tenant.limits];
    return typeof limit === 'number' ? currentValue < limit : true;
  };

  // Track events for analytics
  const trackEvent = async (event: string, data?: any) => {
    if (!tenant?.features.analytics) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          event,
          data: {
            ...data,
            timestamp: new Date().toISOString(),
            userId: session?.user?.id,
          },
        }),
      });
    } catch (error) {
      logger.warn('Failed to track event:', error);
    }
  };

  const value: DashboardContextType = {
    tenant,
    isLoading,
    error,
    refreshTenant,
    hasFeature,
    checkLimit,
    trackEvent,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook to use dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Hook for tenant-specific features
export function useTenantFeatures() {
  const { tenant, hasFeature } = useDashboard();

  return {
    hasAnalytics: hasFeature('analytics'),
    hasCustomDomain: hasFeature('customDomain'),
    hasApiAccess: hasFeature('apiAccess'),
    hasWhiteLabel: hasFeature('whiteLabel'),
    hasMultipleUsers: hasFeature('multipleUsers'),
    hasAdvancedSecurity: hasFeature('advancedSecurity'),
    integrations: tenant?.features.integrations || [],
  };
}

// Hook for tenant limits
export function useTenantLimits() {
  const { tenant, checkLimit } = useDashboard();

  return {
    limits: tenant?.limits,
    checkLimit,
    canAddUser: (currentUsers: number) => checkLimit('maxUsers', currentUsers),
    canAddCompany: (currentCompanies: number) => checkLimit('maxCompanies', currentCompanies),
    canMakeAPIRequest: (currentRequests: number) => checkLimit('maxAPIRequests', currentRequests),
    hasStorageLeft: (currentStorageGB: number) => checkLimit('storageGB', currentStorageGB),
  };
}

// Hook for real-time notifications
export function useRealTimeUpdates(tenantId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    // Set up WebSocket or SSE connection for real-time updates
    const eventSource = new EventSource(`/api/realtime/stream?tenantId=${tenantId}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'notification':
          setNotifications(prev => [data.payload, ...prev.slice(0, 9)]);
          break;
        
        case 'widget_update':
          // Broadcast widget update to all dashboard components
          window.dispatchEvent(new CustomEvent('dashboard:widget-update', {
            detail: data.payload
          }));
          break;
        
        default:
          logger.info('Unknown real-time event:', data);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [tenantId]);

  return {
    notifications,
    isConnected,
    clearNotifications: () => setNotifications([]),
  };
}

// Custom hook for dashboard analytics
export function useDashboardAnalytics(tenantId: string) {
  const { trackEvent } = useDashboard();

  const trackWidgetView = (widgetType: string) => {
    trackEvent('widget_viewed', { widgetType });
  };

  const trackWidgetInteraction = (widgetType: string, action: string) => {
    trackEvent('widget_interaction', { widgetType, action });
  };

  const trackDashboardCustomization = (action: string, details?: any) => {
    trackEvent('dashboard_customization', { action, ...details });
  };

  const trackFeatureUsage = (feature: string, details?: any) => {
    trackEvent('feature_usage', { feature, ...details });
  };

  return {
    trackWidgetView,
    trackWidgetInteraction,
    trackDashboardCustomization,
    trackFeatureUsage,
  };
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    apiResponseTime: 0,
  });

  useEffect(() => {
    // Monitor page load performance
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setMetrics(prev => ({
        ...prev,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      }));
    }

    // Monitor render performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.entryType === 'measure' && entry.name === 'dashboard-render') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration,
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, []);

  const measureApiCall = async (apiCall: () => Promise<any>) => {
    const start = performance.now();
    const result = await apiCall();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      apiResponseTime: end - start,
    }));

    return result;
  };

  return {
    metrics,
    measureApiCall,
  };
}

// Error boundary for dashboard
export class DashboardErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Dashboard error:', error, errorInfo);
    
    // Send error to monitoring service
    if (typeof window !== 'undefined') {
      fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        }),
      }).catch((error) => logger.error('Failed to send analytics event', error));
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Une erreur s'est produite
            </h2>
            <p className="text-gray-600 mb-4">
              Nous nous excusons pour ce désagrément. Veuillez recharger la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}