/**
 * Global Error Handler Middleware
 * 
 * Catches all errors in API routes and returns standardized responses
 */

import { NextResponse } from 'next/server';
import { AppError, handleError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Error Response Format
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    path?: string;
  };
}

/**
 * Global Error Handler
 * Use this in API route error boundaries
 */
export function globalErrorHandler(
  error: Error | AppError,
  request?: Request
): NextResponse<ErrorResponse> {
  const errorInfo = handleError(error);
  
  const response: ErrorResponse = {
    success: false,
    error: {
      message: errorInfo.message,
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      details: errorInfo.details,
      timestamp: new Date().toISOString(),
      path: request?.url,
    },
  };

  // Log the error with request context
  if (request) {
    logger.error('API Error', {
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
      statusCode: errorInfo.statusCode,
    });
  }

  return NextResponse.json(response, { status: errorInfo.statusCode });
}

/**
 * Async Route Handler Wrapper
 * Wraps API route handlers to catch errors automatically
 * 
 * Usage:
 * export const GET = withErrorHandler(async (request) => {
 *   // Your route logic
 * });
 */
export function withErrorHandler<T = any>(
  handler: (request: Request, context?: any) => Promise<NextResponse<T>>
) {
  return async (request: Request, context?: any): Promise<NextResponse<T | ErrorResponse>> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return globalErrorHandler(error as Error, request);
    }
  };
}

/**
 * Prisma Error Handler
 * Converts Prisma errors to AppErrors
 */
export function handlePrismaError(error: any): AppError {
  const { PrismaClientKnownRequestError, PrismaClientValidationError } = require('@prisma/client/runtime/library');

  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new (require('@/lib/errors').ConflictError)(
          'A record with this value already exists',
          { field: error.meta?.target }
        );
      case 'P2025':
        return new (require('@/lib/errors').NotFoundError)(
          'Record not found',
          { model: error.meta?.modelName }
        );
      case 'P2003':
        return new (require('@/lib/errors').BadRequestError)(
          'Foreign key constraint failed',
          { field: error.meta?.field_name }
        );
      default:
        return new (require('@/lib/errors').DatabaseError)(
          'Database operation failed',
          { code: error.code, meta: error.meta }
        );
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return new (require('@/lib/errors').ValidationError)(
      'Invalid data provided',
      { details: error.message }
    );
  }

  return new (require('@/lib/errors').DatabaseError)(
    'Database error occurred',
    { message: error.message }
  );
}

/**
 * Stripe Error Handler
 * Converts Stripe errors to AppErrors
 */
export function handleStripeError(error: any): AppError {
  const { PaymentError, BadRequestError } = require('@/lib/errors');

  switch (error.type) {
    case 'StripeCardError':
      return new PaymentError(
        error.message || 'Card payment failed',
        { code: error.code, decline_code: error.decline_code }
      );
    case 'StripeInvalidRequestError':
      return new BadRequestError(
        error.message || 'Invalid payment request',
        { param: error.param }
      );
    case 'StripeAPIError':
    case 'StripeConnectionError':
      return new (require('@/lib/errors').ServiceUnavailableError)(
        'Payment service temporarily unavailable',
        { type: error.type }
      );
    default:
      return new PaymentError(
        'Payment processing failed',
        { type: error.type, message: error.message }
      );
  }
}

/**
 * External API Error Handler
 * Converts external API errors to AppErrors
 */
export function handleExternalAPIError(
  error: any,
  serviceName: string
): AppError {
  const { ExternalAPIError, ServiceUnavailableError } = require('@/lib/errors');

  if (error.response) {
    // API returned error response
    return new ExternalAPIError(
      `${serviceName} API error: ${error.response.statusText}`,
      {
        status: error.response.status,
        data: error.response.data,
      }
    );
  }

  if (error.request) {
    // Request made but no response
    return new ServiceUnavailableError(
      `${serviceName} API is not responding`,
      { service: serviceName }
    );
  }

  // Something else happened
  return new ExternalAPIError(
    `${serviceName} API error: ${error.message}`,
    { service: serviceName }
  );
}

