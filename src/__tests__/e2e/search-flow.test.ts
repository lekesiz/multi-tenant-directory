/**
 * E2E Test: Company Search Flow
 *
 * Tests the complete user journey for searching and viewing companies
 */

import { test, expect } from '@playwright/test';

test.describe('Company Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage
    await page.goto('/');
  });

  test('should display homepage with search functionality', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Haguenau/i);

    // Check search bar exists
    const searchInput = page.getByPlaceholder(/rechercher/i);
    await expect(searchInput).toBeVisible();

    // Check categories are visible
    await expect(page.getByText(/catégories/i)).toBeVisible();
  });

  test('should search for businesses and display results', async ({ page }) => {
    // Type in search
    const searchInput = page.getByPlaceholder(/rechercher/i);
    await searchInput.fill('restaurant');

    // Submit search
    await searchInput.press('Enter');

    // Wait for results
    await page.waitForURL(/\/companies\?.*q=restaurant/);

    // Check results are displayed
    const results = page.locator('[data-testid="company-card"]');
    await expect(results.first()).toBeVisible();

    // Check result contains search term
    const firstResult = results.first();
    await expect(firstResult).toContainText(/restaurant/i);
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/companies');

    // Click on a category filter (e.g., "Restaurant")
    await page.getByRole('button', { name: /restaurant/i }).first().click();

    // Wait for filtered results
    await page.waitForURL(/\/companies\?.*category=Restaurant/);

    // Check all results are restaurants
    const results = page.locator('[data-testid="company-card"]');
    const count = await results.count();

    if (count > 0) {
      // Check at least first result has Restaurant category
      const firstResult = results.first();
      await expect(firstResult).toContainText(/restaurant/i);
    }
  });

  test('should view company details', async ({ page }) => {
    await page.goto('/companies');

    // Wait for companies to load
    await page.waitForSelector('[data-testid="company-card"]');

    // Click on first company
    const firstCompany = page.locator('[data-testid="company-card"]').first();
    const companyName = await firstCompany.locator('h3').textContent();

    await firstCompany.click();

    // Wait for company detail page
    await page.waitForURL(/\/companies\/.+/);

    // Check company details are displayed
    await expect(page.getByRole('heading', { level: 1 })).toContainText(companyName || '');

    // Check address is visible
    await expect(page.getByText(/adresse/i)).toBeVisible();

    // Check phone is visible
    await expect(page.getByText(/téléphone/i)).toBeVisible();

    // Check reviews section
    await expect(page.getByText(/avis/i)).toBeVisible();
  });

  test('should submit a review', async ({ page }) => {
    // Navigate to a company page
    await page.goto('/companies/boulangerie-patisserie-schneider-haguenau');

    // Scroll to review form
    await page.getByRole('button', { name: /laisser un avis/i }).click();

    // Fill out review form
    await page.getByLabel(/nom/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');

    // Select 5-star rating
    await page.locator('[data-rating="5"]').click();

    // Fill comment
    await page
      .getByLabel(/commentaire/i)
      .fill('Excellent service et produits de qualité!');

    // Submit review
    await page.getByRole('button', { name: /soumettre/i }).click();

    // Check success message
    await expect(
      page.getByText(/merci.*avis.*soumis/i)
    ).toBeVisible();
  });

  test('should display map view', async ({ page }) => {
    await page.goto('/companies');

    // Switch to map view
    await page.getByRole('button', { name: /carte/i }).click();

    // Check map is visible
    const map = page.locator('[data-testid="map-container"]');
    await expect(map).toBeVisible();

    // Check markers are present
    const markers = page.locator('[data-testid="map-marker"]');
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should filter by location', async ({ page }) => {
    await page.goto('/companies');

    // Open location filter
    await page.getByRole('button', { name: /localisation/i }).click();

    // Select a city
    await page.getByRole('option', { name: /haguenau/i }).click();

    // Wait for filtered results
    await page.waitForURL(/\/companies\?.*city=Haguenau/);

    // Check all results are in Haguenau
    const results = page.locator('[data-testid="company-card"]');
    const count = await results.count();

    if (count > 0) {
      const firstResult = results.first();
      await expect(firstResult).toContainText(/haguenau/i);
    }
  });

  test('should paginate results', async ({ page }) => {
    await page.goto('/companies');

    // Wait for results
    await page.waitForSelector('[data-testid="company-card"]');

    // Check if pagination exists (only if more than 20 results)
    const nextButton = page.getByRole('button', { name: /suivant/i });

    if (await nextButton.isVisible()) {
      // Get first company name
      const firstCompanyBefore = await page
        .locator('[data-testid="company-card"]')
        .first()
        .locator('h3')
        .textContent();

      // Click next page
      await nextButton.click();

      // Wait for page change
      await page.waitForURL(/\/companies\?.*page=2/);

      // Check different results are shown
      const firstCompanyAfter = await page
        .locator('[data-testid="company-card"]')
        .first()
        .locator('h3')
        .textContent();

      expect(firstCompanyBefore).not.toBe(firstCompanyAfter);
    }
  });

  test('should handle no search results', async ({ page }) => {
    // Search for something that doesn't exist
    const searchInput = page.getByPlaceholder(/rechercher/i);
    await searchInput.fill('xyzabc123nonexistent');
    await searchInput.press('Enter');

    // Wait for results page
    await page.waitForURL(/\/companies\?.*q=xyzabc123nonexistent/);

    // Check "no results" message
    await expect(
      page.getByText(/aucun résultat|pas de résultat/i)
    ).toBeVisible();
  });

  test('should preserve filters when navigating back', async ({ page }) => {
    // Apply filters
    await page.goto('/companies?category=Restaurant&city=Haguenau');

    // Wait for filtered results
    await page.waitForSelector('[data-testid="company-card"]');

    // Click on a company
    await page.locator('[data-testid="company-card"]').first().click();

    // Go back
    await page.goBack();

    // Check filters are still applied
    await expect(page).toHaveURL(/category=Restaurant/);
    await expect(page).toHaveURL(/city=Haguenau/);
  });
});

test.describe('Company Search Flow - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/');

    // Check mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    // Check search is accessible
    const searchInput = page.getByPlaceholder(/rechercher/i);
    await expect(searchInput).toBeVisible();

    // Perform search
    await searchInput.fill('boulangerie');
    await searchInput.press('Enter');

    // Check results are displayed
    await page.waitForSelector('[data-testid="company-card"]');
    const results = page.locator('[data-testid="company-card"]');
    await expect(results.first()).toBeVisible();
  });

  test('should toggle between list and map view on mobile', async ({ page }) => {
    await page.goto('/companies');

    // Switch to map view
    await page.getByRole('button', { name: /carte/i }).click();

    // Check map is visible
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();

    // Switch back to list
    await page.getByRole('button', { name: /liste/i }).click();

    // Check list is visible
    await expect(page.locator('[data-testid="company-card"]').first()).toBeVisible();
  });
});
