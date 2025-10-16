/**
 * Monitoring Middleware
 * Tracks API performance and errors automatically
 */

import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor, ErrorTracker } from '@/lib/monitoring';

export async function monitoringMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const { pathname, searchParams } = request.nextUrl;
  
  try {
    // Execute the API handler
    const response = await handler(request);
    
    // Track successful API call
    await PerformanceMonitor.trackApiPerformance(
      `${request.method} ${pathname}`,
      startTime,
      response.status < 400,
      {
        statusCode: response.status,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown',
        params: Object.fromEntries(searchParams.entries()),
      }
    );

    // Add performance headers to response
    const responseTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('X-Timestamp', new Date().toISOString());

    return response;

  } catch (error) {
    // Track failed API call
    await PerformanceMonitor.trackApiPerformance(
      `${request.method} ${pathname}`,
      startTime,
      false,
      {
        error: (error as Error).message,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown',
      }
    );

    // Report the error
    await ErrorTracker.reportApiError(error as Error, {
      method: request.method,
      url: pathname,
      userId: request.headers.get('x-user-id') || undefined,
      apiKey: request.headers.get('x-api-key') || undefined,
    });

    // Re-throw the error to be handled by the normal error flow
    throw error;
  }
}

/**
 * Higher-order function to wrap API routes with monitoring
 */
export function withMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    return monitoringMiddleware(request, handler);
  };
}

/**
 * Monitoring utility for manual tracking
 */
export async function trackOperation<T>(
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
      { ...context, error: (error as Error).message }
    );
    
    await ErrorTracker.reportError(error as Error, {
      operation,
      ...context,
    });
    
    throw error;
  }
}