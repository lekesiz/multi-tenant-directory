/**
 * API Test Helpers
 *
 * Utilities for testing Next.js API routes
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body = null,
    headers: customHeaders = {},
    cookies = {},
  } = options;

  const requestInit: RequestInit = {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    }),
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestInit.body = JSON.stringify(body);
  }

  const request = new NextRequest(url, requestInit);

  // Add cookies
  Object.entries(cookies).forEach(([key, value]) => {
    request.cookies.set(key, value);
  });

  return request;
}

/**
 * Parse NextResponse JSON body
 */
export async function parseResponseJSON(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Assert API response status
 */
export function assertResponseStatus(response: Response, expectedStatus: number) {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Body: ${response.statusText}`
    );
  }
}

/**
 * Assert API response has error
 */
export async function assertResponseError(response: Response, errorMessage?: string) {
  const data = await parseResponseJSON(response);

  if (!data.error) {
    throw new Error('Expected response to have error property');
  }

  if (errorMessage && !data.error.includes(errorMessage)) {
    throw new Error(`Expected error message to include "${errorMessage}", got "${data.error}"`);
  }

  return data;
}

/**
 * Assert API response is successful
 */
export async function assertResponseSuccess(response: Response) {
  const data = await parseResponseJSON(response);

  if (!data.success) {
    throw new Error(`Expected response to be successful, got: ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Create authenticated request with session
 */
export function createAuthenticatedRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  userId: number;
  userRole?: 'ADMIN' | 'BUSINESS_OWNER' | 'USER';
}): NextRequest {
  const { userId, userRole = 'USER', ...requestOptions } = options;

  // Create session token (simplified for tests)
  const sessionToken = Buffer.from(
    JSON.stringify({
      userId,
      role: userRole,
      email: `user${userId}@example.com`,
    })
  ).toString('base64');

  return createMockRequest({
    ...requestOptions,
    cookies: {
      'next-auth.session-token': sessionToken,
    },
    headers: {
      ...requestOptions.headers,
      Authorization: `Bearer ${sessionToken}`,
    },
  });
}

/**
 * Create admin authenticated request
 */
export function createAdminRequest(options: {
  method?: string;
  url?: string;
  body?: any;
}): NextRequest {
  return createAuthenticatedRequest({
    ...options,
    userId: 1,
    userRole: 'ADMIN',
  });
}

/**
 * Create business owner authenticated request
 */
export function createBusinessOwnerRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  ownerId?: number;
}): NextRequest {
  const { ownerId = 1001, ...rest } = options;

  return createAuthenticatedRequest({
    ...rest,
    userId: ownerId,
    userRole: 'BUSINESS_OWNER',
  });
}

/**
 * Mock fetch function for API route tests
 */
export function mockFetch(mockResponse: any, status = 200) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(mockResponse),
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
    } as Response)
  );
}

/**
 * Reset fetch mock
 */
export function resetFetchMock() {
  if (global.fetch && 'mockRestore' in global.fetch) {
    (global.fetch as jest.Mock).mockRestore();
  }
}

/**
 * Test helper: Expect response to be JSON
 */
export async function expectJSONResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  expect(contentType).toContain('application/json');
  return parseResponseJSON(response);
}

/**
 * Test helper: Expect validation error
 */
export async function expectValidationError(
  response: Response,
  field?: string
) {
  expect(response.status).toBe(400);
  const data = await parseResponseJSON(response);
  expect(data.error).toBeDefined();

  if (field) {
    expect(data.error).toContain(field);
  }

  return data;
}

/**
 * Test helper: Expect unauthorized error
 */
export async function expectUnauthorized(response: Response) {
  expect(response.status).toBe(401);
  const data = await parseResponseJSON(response);
  expect(data.error).toBeDefined();
  return data;
}

/**
 * Test helper: Expect forbidden error
 */
export async function expectForbidden(response: Response) {
  expect(response.status).toBe(403);
  const data = await parseResponseJSON(response);
  expect(data.error).toBeDefined();
  return data;
}

/**
 * Test helper: Expect not found error
 */
export async function expectNotFound(response: Response) {
  expect(response.status).toBe(404);
  const data = await parseResponseJSON(response);
  expect(data.error).toBeDefined();
  return data;
}
