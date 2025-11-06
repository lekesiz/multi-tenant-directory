/**
 * Error Classes Tests
 */

import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalAPIError,
  PaymentError,
  handleError,
} from '../errors';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Error Classes', () => {
  describe('AppError', () => {
    test('should create error with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    test('should create error with custom values', () => {
      const error = new AppError('Custom error', 400, false, 'CUSTOM_CODE', { foo: 'bar' });
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.details).toEqual({ foo: 'bar' });
    });

    test('should have stack trace', () => {
      const error = new AppError('Test error');
      
      expect(error.stack).toBeDefined();
    });

    test('should be instance of Error', () => {
      const error = new AppError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('BadRequestError', () => {
    test('should create 400 error with default message', () => {
      const error = new BadRequestError();
      
      expect(error.message).toBe('Bad Request');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.isOperational).toBe(true);
    });

    test('should create 400 error with custom message', () => {
      const error = new BadRequestError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });

    test('should include details', () => {
      const error = new BadRequestError('Invalid input', { field: 'email' });
      
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('UnauthorizedError', () => {
    test('should create 401 error', () => {
      const error = new UnauthorizedError();
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    test('should create 401 error with custom message', () => {
      const error = new UnauthorizedError('Login required');
      
      expect(error.message).toBe('Login required');
    });
  });

  describe('ForbiddenError', () => {
    test('should create 403 error', () => {
      const error = new ForbiddenError();
      
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    test('should create 403 error with custom message', () => {
      const error = new ForbiddenError('Access denied');
      
      expect(error.message).toBe('Access denied');
    });
  });

  describe('NotFoundError', () => {
    test('should create 404 error', () => {
      const error = new NotFoundError();
      
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    test('should create 404 error with custom message', () => {
      const error = new NotFoundError('Company not found');
      
      expect(error.message).toBe('Company not found');
    });
  });

  describe('ConflictError', () => {
    test('should create 409 error', () => {
      const error = new ConflictError();
      
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });

    test('should create 409 error with custom message', () => {
      const error = new ConflictError('Email already exists');
      
      expect(error.message).toBe('Email already exists');
    });
  });

  describe('ValidationError', () => {
    test('should create 422 error', () => {
      const error = new ValidationError();
      
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    test('should create 422 error with details', () => {
      const error = new ValidationError('Invalid data', { errors: ['field1', 'field2'] });
      
      expect(error.details).toEqual({ errors: ['field1', 'field2'] });
    });
  });

  describe('RateLimitError', () => {
    test('should create 429 error', () => {
      const error = new RateLimitError();
      
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('should create 429 error with custom message', () => {
      const error = new RateLimitError('Too many requests, please try again later');
      
      expect(error.message).toBe('Too many requests, please try again later');
    });
  });

  describe('InternalServerError', () => {
    test('should create 500 error', () => {
      const error = new InternalServerError();
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.isOperational).toBe(false);
    });

    test('should be non-operational', () => {
      const error = new InternalServerError();
      
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ServiceUnavailableError', () => {
    test('should create 503 error', () => {
      const error = new ServiceUnavailableError();
      
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });

    test('should create 503 error with custom message', () => {
      const error = new ServiceUnavailableError('Database is down');
      
      expect(error.message).toBe('Database is down');
    });
  });

  describe('DatabaseError', () => {
    test('should create 500 database error', () => {
      const error = new DatabaseError();
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.isOperational).toBe(false);
    });

    test('should be non-operational', () => {
      const error = new DatabaseError();
      
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ExternalAPIError', () => {
    test('should create 502 error', () => {
      const error = new ExternalAPIError();
      
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_API_ERROR');
    });

    test('should create 502 error with custom message', () => {
      const error = new ExternalAPIError('Google API failed');
      
      expect(error.message).toBe('Google API failed');
    });
  });

  describe('PaymentError', () => {
    test('should create 402 error', () => {
      const error = new PaymentError();
      
      expect(error.statusCode).toBe(402);
      expect(error.code).toBe('PAYMENT_ERROR');
    });

    test('should create 402 error with custom message', () => {
      const error = new PaymentError('Payment declined');
      
      expect(error.message).toBe('Payment declined');
    });
  });

  describe('handleError', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should handle AppError with operational flag', () => {
      const error = new BadRequestError('Invalid input', { field: 'email' });
      const result = handleError(error);
      
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Invalid input');
      expect(result.code).toBe('BAD_REQUEST');
    });

    test('should handle AppError with non-operational flag', () => {
      const error = new InternalServerError('Server crashed');
      const result = handleError(error);
      
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Server crashed');
    });

    test('should handle unknown Error', () => {
      const error = new Error('Unknown error');
      const result = handleError(error);
      
      expect(result.statusCode).toBe(500);
    });

    test('should hide details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new BadRequestError('Invalid input', { field: 'email' });
      const result = handleError(error);
      
      expect(result.details).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should show details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new BadRequestError('Invalid input', { field: 'email' });
      const result = handleError(error);
      
      expect(result.details).toEqual({ field: 'email' });
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should hide error message in production for unknown errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Sensitive error message');
      const result = handleError(error);
      
      expect(result.message).toBe('Internal Server Error');
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should show error message in development for unknown errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Detailed error message');
      const result = handleError(error);
      
      expect(result.message).toBe('Detailed error message');
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});
