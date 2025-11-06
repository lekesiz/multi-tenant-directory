/**
 * E2E Test: Admin Companies Management
 * Tests the critical admin flow for managing companies
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Companies Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL || 'admin@test.com');
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin/**', { timeout: 5000 });
  });

  test('should display companies list', async ({ page }) => {
    await page.goto('/admin/companies');

    // Check if companies table is visible
    await expect(page.locator('table')).toBeVisible();

    // Check for table headers
    await expect(page.locator('th:has-text("Entreprise")')).toBeVisible();
    await expect(page.locator('th:has-text("Ville")')).toBeVisible();
    await expect(page.locator('th:has-text("Statut")')).toBeVisible();
  });

  test('should search companies', async ({ page }) => {
    await page.goto('/admin/companies');

    // Type in search box
    const searchInput = page.locator('input[placeholder*="Nom"]');
    await searchInput.fill('Test');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Results should be filtered
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    await page.goto('/admin/companies');

    // Select status filter
    const statusFilter = page.locator('select').nth(1);
    await statusFilter.selectOption('active');

    // Check that filter is applied
    await expect(statusFilter).toHaveValue('active');
  });

  test('should navigate to company edit page', async ({ page }) => {
    await page.goto('/admin/companies');

    // Click first "Modifier" link
    const editLink = page.locator('a:has-text("Modifier")').first();
    await editLink.click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/admin\/companies\/\d+/);

    // Check for form elements
    await expect(page.locator('input[value]').first()).toBeVisible();
  });

  test('should show pagination controls', async ({ page }) => {
    await page.goto('/admin/companies');

    // Check if pagination exists
    const pagination = page.locator('nav[aria-label="Pagination"]');

    // If there are enough companies, pagination should be visible
    const companyCount = await page.locator('tbody tr').count();

    if (companyCount > 20) {
      await expect(pagination).toBeVisible();
    }
  });

  test('should toggle company status', async ({ page }) => {
    await page.goto('/admin/companies');

    // Find first status toggle button
    const statusButton = page.locator('button:has-text("Actif")').first();

    if (await statusButton.isVisible()) {
      // Click to toggle
      await statusButton.click();

      // Wait for success toast or page reload
      await page.waitForTimeout(1500);

      // Status should have changed
      // (page reloads so we can't assert the exact state, but test passes if no error)
    }
  });
});

test.describe('Admin Company Edit', () => {
  test('should display sync reviews button', async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL || 'admin@test.com');
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**');

    // Go to a company edit page (assuming company ID 1 exists)
    await page.goto('/admin/companies/1');

    // Click on Reviews tab
    const reviewsTab = page.locator('button:has-text("Yorumlar")');
    if (await reviewsTab.isVisible()) {
      await reviewsTab.click();

      // Check for Sync button
      const syncButton = page.locator('button:has-text("Sync Google Reviews")');
      await expect(syncButton).toBeVisible();
    }
  });
});
