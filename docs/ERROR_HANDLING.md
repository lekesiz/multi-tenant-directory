# Error Handling Guide

## Overview

This project uses a standardized error handling system with custom error classes, global error handlers, and middleware.

## Custom Error Classes

All errors extend from `AppError` base class:

```typescript
import {
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
} from '@/lib/errors';
```

## Usage Examples

### 1. Basic Error Throwing

```typescript
import { NotFoundError, BadRequestError } from '@/lib/errors';

// Throw not found error
if (!user) {
  throw new NotFoundError('User not found', { userId });
}

// Throw validation error
if (!email || !password) {
  throw new BadRequestError('Email and password are required');
}
```

### 2. API Route with Error Handler

```typescript
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/middleware/error-handler';
import { NotFoundError } from '@/lib/errors';

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    throw new BadRequestError('ID parameter is required');
  }

  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    throw new NotFoundError('Item not found', { id });
  }

  return NextResponse.json({ success: true, data: item });
});
```

### 3. Database Error Handling

```typescript
import { handlePrismaError } from '@/middleware/error-handler';
import { prisma } from '@/lib/prisma';

try {
  const user = await prisma.user.create({
    data: { email, name },
  });
  return user;
} catch (error) {
  throw handlePrismaError(error);
}
```

### 4. Payment Error Handling

```typescript
import { handleStripeError } from '@/middleware/error-handler';
import { stripe } from '@/lib/stripe';

try {
  const charge = await stripe.charges.create({
    amount: 1000,
    currency: 'usd',
    source: token,
  });
  return charge;
} catch (error) {
  throw handleStripeError(error);
}
```

### 5. External API Error Handling

```typescript
import { handleExternalAPIError } from '@/middleware/error-handler';
import axios from 'axios';

try {
  const response = await axios.get('https://api.example.com/data');
  return response.data;
} catch (error) {
  throw handleExternalAPIError(error, 'ExampleAPI');
}
```

### 6. Manual Error Handling

```typescript
import { globalErrorHandler } from '@/middleware/error-handler';

export async function POST(request: Request) {
  try {
    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return globalErrorHandler(error as Error, request);
  }
}
```

## Error Response Format

All errors return a standardized JSON response:

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "details": { "userId": "123" },
    "timestamp": "2025-10-21T12:00:00.000Z",
    "path": "/api/users/123"
  }
}
```

## HTTP Status Codes

| Error Class | Status Code | Use Case |
|------------|-------------|----------|
| BadRequestError | 400 | Invalid input data |
| UnauthorizedError | 401 | Authentication required |
| ForbiddenError | 403 | Insufficient permissions |
| NotFoundError | 404 | Resource not found |
| ConflictError | 409 | Duplicate resource |
| ValidationError | 422 | Validation failed |
| RateLimitError | 429 | Too many requests |
| InternalServerError | 500 | Unexpected error |
| ServiceUnavailableError | 503 | External service down |

## Best Practices

1. **Always use custom error classes** instead of throwing generic `Error`
2. **Wrap API routes** with `withErrorHandler()` for automatic error handling
3. **Include context** in error details for debugging
4. **Use specific error types** for different scenarios
5. **Don't expose sensitive data** in error messages (production)
6. **Log errors** with proper context using the logger

## Migration Guide

### Before (Old Way)

```typescript
export async function GET(request: Request) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    logger.error('Error fetching user', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### After (New Way)

```typescript
import { withErrorHandler } from '@/middleware/error-handler';
import { NotFoundError } from '@/lib/errors';

export const GET = withErrorHandler(async (request: Request) => {
  const user = await prisma.user.findUnique({ where: { id } });
  
  if (!user) {
    throw new NotFoundError('User not found', { id });
  }

  return NextResponse.json({ success: true, data: user });
});
```

## Testing

```typescript
import { NotFoundError, BadRequestError } from '@/lib/errors';

describe('Error Handling', () => {
  it('should throw NotFoundError', () => {
    expect(() => {
      throw new NotFoundError('Item not found');
    }).toThrow(NotFoundError);
  });

  it('should have correct status code', () => {
    const error = new BadRequestError('Invalid input');
    expect(error.statusCode).toBe(400);
  });
});
```

## Addresses

This error handling system addresses **Abacus.ai Report Critical Issue #3**: Error Handling Standardization.

