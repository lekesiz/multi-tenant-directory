/**
 * Production Monitoring & Error Tracking
 * Handles error reporting, performance monitoring, and health checks
 */

interface ErrorEvent {
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  userId?: string;
  success: boolean;
  metadata?: Record<string, any>;
}

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: Date;
  error?: string;
}

// Error Tracking Service
class ErrorTracker {
  
  /**
   * Report error to monitoring service
   */
  static async reportError(error: Error | ErrorEvent, context?: Record<string, any>) {
    try {
      const errorData: ErrorEvent = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        severity: 'medium',
        context,
      } : error;

      // In production, send to Sentry, LogRocket, or similar
      if (process.env.NODE_ENV === 'production') {
        await this.sendToMonitoringService(errorData);
      } else {
        // Development logging
        logger.error('🚨 Error tracked:', errorData);
      }

      // Store in database for analytics
      await this.storeErrorLog(errorData);

    } catch (reportingError) {
      // Fail silently - don't break the app if monitoring fails
      logger.error('Error reporting failed:', reportingError);
    }
  }

  /**
   * Report API error with request context
   */
  static async reportApiError(
    error: Error,
    request: {
      method: string;
      url: string;
      userId?: string;
      apiKey?: string;
    }
  ) {
    await this.reportError(error, {
      type: 'api_error',
      method: request.method,
      url: request.url,
      userId: request.userId,
      hasApiKey: !!request.apiKey,
    });
  }

  /**
   * Report database error
   */
  static async reportDatabaseError(error: Error, operation: string, table?: string) {
    await this.reportError({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      severity: 'high',
      context: {
        type: 'database_error',
        operation,
        table,
      },
    });
  }

  /**
   * Report payment error
   */
  static async reportPaymentError(error: Error, context: {
    businessOwnerId?: string;
    planId?: string;
    amount?: number;
    stripeEventId?: string;
  }) {
    await this.reportError({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      severity: 'critical', // Payment errors are critical
      context: {
        type: 'payment_error',
        ...context,
      },
    });
  }

  private static async sendToMonitoringService(errorData: ErrorEvent) {
    // Implement Sentry, Bugsnag, or similar integration
    /*
    if (process.env.SENTRY_DSN) {
      await fetch('https://sentry.io/api/...', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    }
    */
  }

  private static async storeErrorLog(errorData: ErrorEvent) {
    try {
      // Store in database for internal analytics
      // This helps track error patterns and frequency
      const { prisma } = await import('./prisma');
      
      await prisma.errorLog.create({
        data: {
          message: errorData.message,
          stack: errorData.stack,
          url: errorData.url,
          userId: errorData.userId,
          severity: errorData.severity,
          context: errorData.context || {},
          timestamp: errorData.timestamp,
        },
      });
    } catch (dbError) {
      // Fail silently if database is down
    }
  }
}

// Performance Monitoring
class PerformanceMonitor {
  
  /**
   * Track API performance
   */
  static async trackApiPerformance(
    operation: string,
    startTime: number,
    success: boolean,
    metadata?: Record<string, any>
  ) {
    const duration = Date.now() - startTime;
    
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      success,
      metadata,
    };

    await this.recordMetric(metric);

    // Alert on slow operations
    if (duration > 5000) { // 5 seconds
      await ErrorTracker.reportError({
        message: `Slow operation detected: ${operation}`,
        timestamp: new Date(),
        severity: 'medium',
        context: { duration, operation, metadata },
      });
    }
  }

  /**
   * Track database query performance
   */
  static async trackDbQuery(
    query: string,
    startTime: number,
    success: boolean,
    recordCount?: number
  ) {
    const duration = Date.now() - startTime;
    
    await this.recordMetric({
      operation: `db_query: ${query}`,
      duration,
      timestamp: new Date(),
      success,
      metadata: { recordCount },
    });

    // Alert on very slow queries
    if (duration > 3000) { // 3 seconds
      await ErrorTracker.reportError({
        message: `Slow database query: ${query}`,
        timestamp: new Date(),
        severity: 'medium',
        context: { duration, query, recordCount },
      });
    }
  }

  /**
   * Track Stripe operation performance
   */
  static async trackStripeOperation(
    operation: string,
    startTime: number,
    success: boolean,
    stripeEventId?: string
  ) {
    await this.trackApiPerformance(
      `stripe_${operation}`,
      startTime,
      success,
      { stripeEventId }
    );
  }

  private static async recordMetric(metric: PerformanceMetric) {
    try {
      // Store performance metrics for analytics
      const { prisma } = await import('./prisma');
      
      await prisma.performanceMetric.create({
        data: {
          operation: metric.operation,
          duration: metric.duration,
          timestamp: metric.timestamp,
          userId: metric.userId,
          success: metric.success,
          metadata: metric.metadata || {},
        },
      });
    } catch (error) {
      // Fail silently
    }
  }
}

// Health Check Service
class HealthCheck {
  
  /**
   * Check overall system health
   */
  static async checkSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheckResult[];
    timestamp: Date;
  }> {
    const checks: HealthCheckResult[] = [];
    
    // Database health
    checks.push(await this.checkDatabase());
    
    // Stripe connectivity
    checks.push(await this.checkStripe());
    
    // External APIs
    checks.push(await this.checkExternalAPIs());
    
    // Storage health
    checks.push(await this.checkStorage());

    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date(),
    };
  }

  private static async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const { prisma } = await import('./prisma');
      await prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'database',
        status: responseTime > 1000 ? 'degraded' : 'healthy',
        responseTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: (error as Error).message,
      };
    }
  }

  private static async checkStripe(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simple Stripe API call to check connectivity
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = (await import('stripe')).default;
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);
        await stripeClient.balance.retrieve();
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'stripe',
        status: responseTime > 2000 ? 'degraded' : 'healthy',
        responseTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        service: 'stripe',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: (error as Error).message,
      };
    }
  }

  private static async checkExternalAPIs(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check critical external APIs (if any)
      // For now, just return healthy
      
      return {
        service: 'external_apis',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        service: 'external_apis',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: (error as Error).message,
      };
    }
  }

  private static async checkStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check file storage (Vercel Blob) if configured
      // For now, assume healthy
      
      return {
        service: 'storage',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        service: 'storage',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: (error as Error).message,
      };
    }
  }
}

// Monitoring utilities
class MonitoringUtils {
  
  /**
   * Wrapper for async operations with automatic error tracking
   */
  static async withMonitoring<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      
      await PerformanceMonitor.trackApiPerformance(
        operation,
        startTime,
        true,
        context
      );
      
      return result;
    } catch (error) {
      await PerformanceMonitor.trackApiPerformance(
        operation,
        startTime,
        false,
        context
      );
      
      await ErrorTracker.reportError(error as Error, {
        operation,
        ...context,
      });
      
      throw error;
    }
  }

  /**
   * Get monitoring dashboard data
   */
  static async getDashboardData(timeframe: 'hour' | 'day' | 'week' = 'day') {
    try {
      const { prisma } = await import('./prisma');
      
      const since = new Date();
      switch (timeframe) {
        case 'hour':
          since.setHours(since.getHours() - 1);
          break;
        case 'day':
          since.setDate(since.getDate() - 1);
          break;
        case 'week':
          since.setDate(since.getDate() - 7);
          break;
      }

      const [errorCount, avgResponseTime, totalRequests] = await Promise.all([
        prisma.errorLog.count({
          where: { timestamp: { gte: since } }
        }),
        prisma.performanceMetric.aggregate({
          where: { timestamp: { gte: since } },
          _avg: { duration: true }
        }),
        prisma.performanceMetric.count({
          where: { timestamp: { gte: since } }
        })
      ]);

      return {
        errorCount,
        avgResponseTime: avgResponseTime._avg.duration || 0,
        totalRequests,
        errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
        timeframe,
        timestamp: new Date(),
      };
    } catch (error) {
      await ErrorTracker.reportError(error as Error, {
        operation: 'get_dashboard_data',
        timeframe,
      });
      
      return {
        errorCount: 0,
        avgResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        timeframe,
        timestamp: new Date(),
        error: 'Failed to fetch monitoring data',
      };
    }
  }
}

// Export all monitoring services
export {
  ErrorTracker,
  PerformanceMonitor,
  HealthCheck,
  MonitoringUtils,
};