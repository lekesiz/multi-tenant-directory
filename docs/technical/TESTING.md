# Testing Guide

## Overview

This project uses a comprehensive testing strategy with three layers:

1. **Unit Tests** (Jest + React Testing Library) - Component and utility function tests
2. **Integration Tests** (Jest) - API route and database interaction tests
3. **End-to-End Tests** (Playwright) - Full user flow tests across browsers

**Coverage Goals:**
- Global: >80% (statements, lines, functions)
- Critical paths: >90% (queries, validation, authentication)

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Running Tests](#running-tests)
- [Writing Unit Tests](#writing-unit-tests)
- [Writing Integration Tests](#writing-integration-tests)
- [Writing E2E Tests](#writing-e2e-tests)
- [Test Infrastructure](#test-infrastructure)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Testing](#cicd-testing)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

### What to Test

**✅ DO Test:**
- User-facing functionality (forms, buttons, navigation)
- Business logic (calculations, validations, transformations)
- API endpoints (request handling, validation, responses)
- Database queries (filtering, sorting, aggregations)
- Error handling (edge cases, invalid inputs)
- Multi-tenant isolation (domain filtering)

**❌ DON'T Test:**
- Third-party libraries (they have their own tests)
- Implementation details (focus on behavior, not code structure)
- Trivial functions (simple getters/setters)
- CSS styles (use visual regression if needed)

### Testing Pyramid

```
           /\
          /  \
         / E2E \          ← Few (10-20 tests, critical user flows)
        /______\
       /        \
      / API/INT  \        ← Medium (30-50 tests, business logic)
     /____________\
    /              \
   /  UNIT TESTS    \     ← Many (100+ tests, components & utilities)
  /__________________\
```

## Running Tests

### Unit Tests (Jest)

**Run all unit tests:**
```bash
npm test
```

**Watch mode (development):**
```bash
npm run test:watch
```

**With coverage:**
```bash
npm run test:coverage
```

**Specific test file:**
```bash
npm test -- ReviewCard.test.tsx
```

**Specific test case:**
```bash
npm test -- -t "should render 5 filled stars"
```

**Update snapshots:**
```bash
npm test -- -u
```

### Integration Tests

**Run integration tests (API routes):**
```bash
npm test -- src/__tests__/api
```

**Run with database:**
```bash
# Requires DATABASE_URL configured
DATABASE_URL="postgresql://..." npm test
```

### E2E Tests (Playwright)

**Install browsers (first time only):**
```bash
npx playwright install
```

**Run E2E tests:**
```bash
npm run test:e2e
```

**Run in UI mode (interactive):**
```bash
npx playwright test --ui
```

**Run specific browser:**
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Debug mode:**
```bash
npx playwright test --debug
```

**Generate code:**
```bash
npx playwright codegen http://localhost:3000
```

**View report:**
```bash
npx playwright show-report
```

### CI/CD Tests

**Full test suite (CI mode):**
```bash
npm run test:ci
```

This runs:
1. TypeScript type checking
2. ESLint code quality
3. Jest unit/integration tests
4. Coverage report
5. Build verification

## Writing Unit Tests

### Component Tests

**Location:** `src/__tests__/components/`

**Example: ReviewCard Component**

```typescript
// src/__tests__/components/ReviewCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ReviewCard } from '@/components/ReviewCard';

describe('ReviewCard', () => {
  const defaultProps = {
    id: 1,
    authorName: 'Jean Dupont',
    authorPhoto: 'https://example.com/photo.jpg',
    rating: 5,
    comment: 'Excellent service!',
    reviewDate: new Date('2025-01-15'),
    source: 'google' as const,
  };

  it('should render author name', () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('should render correct number of stars', () => {
    const { container } = render(<ReviewCard {...defaultProps} rating={4} />);
    const filledStars = container.querySelectorAll('svg.text-yellow-400');
    expect(filledStars).toHaveLength(4);
  });

  it('should show Google badge for Google reviews', () => {
    render(<ReviewCard {...defaultProps} source="google" />);
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByText(/15 janvier 2025/i)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    const { container } = render(<ReviewCard {...defaultProps} />);
    expect(container.querySelector('[role="article"]')).toBeInTheDocument();
  });
});
```

**Best Practices:**
- Use `screen.getByRole()` for accessibility
- Test user-visible behavior, not implementation
- Group related tests in `describe()` blocks
- Use descriptive test names starting with "should"
- Keep tests independent (no shared state)

### Utility Function Tests

**Location:** `src/__tests__/lib/`

**Example: Query Functions**

```typescript
// src/__tests__/lib/queries/company.test.ts
import { getCompanies, getCompanyBySlug } from '@/lib/queries/company';
import { prismaMock } from '@/__mocks__/prisma';
import { companyFixtures } from '@/test-utils/fixtures';

// Mock the db module
jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}));

describe('getCompanies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should filter by domain', async () => {
    prismaMock.company.findMany.mockResolvedValue([companyFixtures.bakery]);

    const result = await getCompanies({ domainId: 1 });

    expect(prismaMock.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          content: {
            some: {
              domainId: 1,
              isVisible: true,
            },
          },
        }),
      })
    );
  });

  it('should filter by category', async () => {
    prismaMock.company.findMany.mockResolvedValue([companyFixtures.bakery]);

    await getCompanies({ domainId: 1, category: 'Boulangerie' });

    expect(prismaMock.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categories: { has: 'Boulangerie' },
        }),
      })
    );
  });

  it('should handle empty results', async () => {
    prismaMock.company.findMany.mockResolvedValue([]);

    const result = await getCompanies({ domainId: 1 });

    expect(result).toEqual([]);
  });
});
```

## Writing Integration Tests

### API Route Tests

**Location:** `src/__tests__/api/`

**Example: Review Submission**

```typescript
// src/__tests__/api/reviews/submit.test.ts
import { POST } from '@/app/api/reviews/submit/route';
import { prismaMock } from '@/__mocks__/prisma';
import { createMockRequest } from '@/test-utils/api-test-helpers';
import { companyFixtures, reviewFixtures } from '@/test-utils/fixtures';

jest.mock('@/lib/db', () => ({ prisma: prismaMock }));

describe('POST /api/reviews/submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validReviewData = {
    companyId: 101,
    authorName: 'Test User',
    authorEmail: 'test@example.com',
    rating: 5,
    comment: 'Great service!',
  };

  it('should create a review successfully', async () => {
    prismaMock.company.findUnique.mockResolvedValue(companyFixtures.bakery);
    prismaMock.review.create.mockResolvedValue(reviewFixtures.positive);

    const request = createMockRequest({
      method: 'POST',
      body: validReviewData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(prismaMock.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: 101,
          rating: 5,
        }),
      })
    );
  });

  it('should validate required fields', async () => {
    const invalidData = { ...validReviewData, rating: undefined };

    const request = createMockRequest({
      method: 'POST',
      body: invalidData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/rating.*required/i);
  });

  it('should validate rating range (1-5)', async () => {
    const invalidData = { ...validReviewData, rating: 6 };

    const request = createMockRequest({
      method: 'POST',
      body: invalidData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/rating.*between 1 and 5/i);
  });

  it('should return 404 for non-existent company', async () => {
    prismaMock.company.findUnique.mockResolvedValue(null);

    const request = createMockRequest({
      method: 'POST',
      body: validReviewData,
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
  });
});
```

**Best Practices:**
- Mock Prisma using `prismaMock` from `@/__mocks__/prisma`
- Test happy path first, then error cases
- Validate request/response formats
- Test authentication/authorization
- Test rate limiting (if applicable)

## Writing E2E Tests

### User Flow Tests

**Location:** `src/__tests__/e2e/`

**Example: Search Flow**

```typescript
// src/__tests__/e2e/search-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Company Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage with search', async ({ page }) => {
    await expect(page).toHaveTitle(/Haguenau/i);

    const searchInput = page.getByPlaceholder(/rechercher/i);
    await expect(searchInput).toBeVisible();

    await expect(page.getByText(/catégories/i)).toBeVisible();
  });

  test('should search for businesses', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/rechercher/i);
    await searchInput.fill('restaurant');
    await searchInput.press('Enter');

    await page.waitForURL(/\/companies\?.*q=restaurant/);

    const results = page.locator('[data-testid="company-card"]');
    await expect(results.first()).toBeVisible();
    await expect(results.first()).toContainText(/restaurant/i);
  });

  test('should view company details', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForSelector('[data-testid="company-card"]');

    const firstCompany = page.locator('[data-testid="company-card"]').first();
    const companyName = await firstCompany.locator('h3').textContent();

    await firstCompany.click();

    await page.waitForURL(/\/companies\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      companyName || ''
    );
  });

  test('should submit a review', async ({ page }) => {
    await page.goto('/companies/boulangerie-patisserie-schneider-haguenau');

    await page.getByRole('button', { name: /laisser un avis/i }).click();

    await page.getByLabel(/nom/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.locator('[data-rating="5"]').click();
    await page
      .getByLabel(/commentaire/i)
      .fill('Excellent service et produits de qualité!');

    await page.getByRole('button', { name: /soumettre/i }).click();

    await expect(page.getByText(/merci.*avis.*soumis/i)).toBeVisible();
  });
});

test.describe('Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    const searchInput = page.getByPlaceholder(/rechercher/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('boulangerie');
    await searchInput.press('Enter');

    await page.waitForSelector('[data-testid="company-card"]');
    const results = page.locator('[data-testid="company-card"]');
    await expect(results.first()).toBeVisible();
  });
});
```

**Best Practices:**
- Use semantic locators (`getByRole`, `getByLabel`, `getByPlaceholder`)
- Add `data-testid` attributes for complex elements
- Test critical user flows only (not every edge case)
- Test across multiple browsers (Chromium, Firefox, WebKit)
- Test mobile viewports
- Wait for network/navigation (`waitForURL`, `waitForSelector`)

## Test Infrastructure

### Fixtures

**Location:** `src/test-utils/fixtures.ts`

**Purpose:** Reusable test data

```typescript
// Domain fixtures
export const domainFixtures = {
  haguenau: {
    id: 1,
    name: 'haguenau.pro',
    siteTitle: 'Haguenau Directory',
    isActive: true,
  },
  strasbourg: {
    id: 2,
    name: 'strasbourg.directory',
    siteTitle: 'Strasbourg Directory',
    isActive: true,
  },
};

// Company fixtures
export const companyFixtures = {
  bakery: {
    id: 101,
    name: 'Boulangerie Pâtisserie Schneider',
    slug: 'boulangerie-patisserie-schneider-haguenau',
    categories: ['Boulangerie', 'Pâtisserie'],
    city: 'Haguenau',
    rating: 4.8,
    reviewCount: 42,
  },
};

// Helper functions
export function createCompanyWithContent(
  company: Company,
  domainId: number,
  isVisible = true
) {
  return {
    ...company,
    content: [
      {
        id: 1,
        companyId: company.id,
        domainId,
        isVisible,
        priority: 0,
      },
    ],
  };
}
```

### Mocks

**Prisma Mock** (`src/__mocks__/prisma.ts`):
```typescript
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
```

**Usage:**
```typescript
import { prismaMock } from '@/__mocks__/prisma';

jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}));

// In test
prismaMock.company.findMany.mockResolvedValue([...]);
```

### API Test Helpers

**Location:** `src/test-utils/api-test-helpers.ts`

```typescript
import { NextRequest } from 'next/server';

export function createMockRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
}): NextRequest {
  const { method = 'GET', url = 'http://localhost:3000/api/test', body } = options;

  const requestInit: RequestInit = {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    }),
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

export async function expectJSONResponse(response: Response) {
  const data = await response.json();
  expect(response.headers.get('Content-Type')).toMatch(/application\/json/);
  return data;
}
```

## Coverage Requirements

### Configuration

**jest.config.js:**
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/lib/queries/': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/lib/validation/': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/generated/**',
    '!src/__tests__/**',
    '!src/__mocks__/**',
    '!src/test-utils/**',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
  ],
};
```

### Viewing Coverage

**Generate coverage report:**
```bash
npm run test:coverage
```

**View HTML report:**
```bash
open coverage/lcov-report/index.html
```

**Coverage types:**
- **Statements:** % of code statements executed
- **Branches:** % of if/else branches covered
- **Functions:** % of functions called
- **Lines:** % of lines executed

### Improving Coverage

**Find uncovered code:**
```bash
npm run test:coverage -- --verbose
```

Look for:
- Red lines in HTML report (uncovered code)
- Low branch coverage (missing if/else tests)
- Untested functions

**Add missing tests:**
1. Identify uncovered files in report
2. Add test file in `src/__tests__/`
3. Cover all code paths (happy path + errors)
4. Re-run coverage to verify

## CI/CD Testing

### GitHub Actions

**Location:** `.github/workflows/test.yml`

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:ci

      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hooks

**Install Husky:**
```bash
npm install -D husky
npx husky init
```

**Add pre-commit hook** (`.husky/pre-commit`):
```bash
#!/bin/sh
npm run type-check
npm run lint
npm run test:ci
```

## Troubleshooting

### Common Issues

**Issue: Tests fail with "Cannot find module '@/lib/db'"**

**Solution:** Check Jest module resolution in `jest.config.js`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

---

**Issue: Prisma mock not working**

**Solution:** Ensure mock is imported before the module:
```typescript
import { prismaMock } from '@/__mocks__/prisma';

jest.mock('@/lib/db', () => ({
  prisma: prismaMock,
}));

// Then import your module
import { getCompanies } from '@/lib/queries/company';
```

---

**Issue: E2E tests timeout**

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

Or for specific test:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // ...
});
```

---

**Issue: Coverage threshold not met**

**Solution:**
1. Check which files have low coverage:
   ```bash
   npm run test:coverage
   ```
2. Open HTML report to see uncovered lines
3. Add tests for uncovered code
4. If intentionally skipping coverage (e.g., config files), exclude in `jest.config.js`

---

**Issue: Tests pass locally but fail in CI**

**Solution:**
- Check environment variables (CI may not have `.env.local`)
- Use `process.env.CI` check for CI-specific behavior
- Ensure database is properly mocked (CI has no database)
- Check timezone differences (use UTC in tests)

---

**Issue: "Element not found" in Playwright**

**Solution:**
- Add `waitForSelector` before interaction
- Use more specific locators
- Check if element is inside a modal/dialog
- Increase timeout for slow-loading elements

## Best Practices Summary

✅ **DO:**
- Write tests before fixing bugs (TDD)
- Test user behavior, not implementation
- Keep tests independent and isolated
- Use descriptive test names
- Mock external dependencies
- Test error cases and edge cases
- Run tests before committing

❌ **DON'T:**
- Test third-party libraries
- Share state between tests
- Use hard-coded IDs/selectors
- Skip cleanup (unmount, reset mocks)
- Ignore failing tests
- Test private functions directly
- Copy-paste test code (use helpers)

## Related Documentation

- [Developer Guide](../guides/DEVELOPER_GUIDE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Reference](../api/API_REFERENCE.md)
