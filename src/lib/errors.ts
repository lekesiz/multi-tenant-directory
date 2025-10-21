/**
 * Custom Error Classes for Multi-Tenant Directory
 * 
 * Standardized error handling with proper HTTP status codes,
 * logging, and user-friendly messages.
 */

import { logger } from './logger';

/**
 * Base Application Error
 * All custom errors extend from this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this);
  }
}

/**
 * 400 Bad Request
 * Client sent invalid data
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: any) {
    super(message, 400, true, 'BAD_REQUEST', details);
  }
}

/**
 * 401 Unauthorized
 * Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, true, 'UNAUTHORIZED', details);
  }
}

/**
 * 403 Forbidden
 * User doesn't have permission
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, true, 'FORBIDDEN', details);
  }
}

/**
 * 404 Not Found
 * Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', details?: any) {
    super(message, 404, true, 'NOT_FOUND', details);
  }
}

/**
 * 409 Conflict
 * Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details?: any) {
    super(message, 409, true, 'CONFLICT', details);
  }
}

/**
 * 422 Unprocessable Entity
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error', details?: any) {
    super(message, 422, true, 'VALIDATION_ERROR', details);
  }
}

/**
 * 429 Too Many Requests
 * Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too Many Requests', details?: any) {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED', details);
  }
}

/**
 * 500 Internal Server Error
 * Unexpected server error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', details?: any) {
    super(message, 500, false, 'INTERNAL_SERVER_ERROR', details);
  }
}

/**
 * 503 Service Unavailable
 * External service is down
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service Unavailable', details?: any) {
    super(message, 503, true, 'SERVICE_UNAVAILABLE', details);
  }
}

/**
 * Database Error
 * Database operation failed
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database Error', details?: any) {
    super(message, 500, false, 'DATABASE_ERROR', details);
  }
}

/**
 * External API Error
 * Third-party API call failed
 */
export class ExternalAPIError extends AppError {
  constructor(message: string = 'External API Error', details?: any) {
    super(message, 502, true, 'EXTERNAL_API_ERROR', details);
  }
}

/**
 * Payment Error
 * Payment processing failed
 */
export class PaymentError extends AppError {
  constructor(message: string = 'Payment Error', details?: any) {
    super(message, 402, true, 'PAYMENT_ERROR', details);
  }
}

/**
 * Error Handler Utility
 * Logs error and returns appropriate response
 */
export function handleError(error: Error | AppError): {
  statusCode: number;
  message: string;
  code?: string;
  details?: any;
} {
  if (error instanceof AppError) {
    // Log operational errors as warnings
    if (error.isOperational) {
      logger.warn(error.message, {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: error.stack,
      });
    } else {
      // Log non-operational errors as errors
      logger.error(error.message, {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: error.stack,
      });
    }

    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.details : undefined,
    };
  }

  // Unknown error - log as error
  logger.error('Unknown error occurred', {
    message: error.message,
    stack: error.stack,
  });

  return {
    statusCode: 500,
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal Server Error',
  };
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler<T>(
  fn: (req: Request, context?: any) => Promise<T>
) {
  return async (req: Request, context?: any): Promise<T> => {
    try {
      return await fn(req, context);
    } catch (error) {
      throw error; // Let global error handler catch it
    }
  };
}

