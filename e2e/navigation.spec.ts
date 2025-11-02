import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between different sections', async ({ page }) => {
    await page.goto('/');

    // Check initial page load
    await expect(page).toHaveTitle(/DLX Studios/);

    // Navigate to Dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to Dev Lab
    await page.click('text=Dev Lab');
    await expect(page).toHaveURL(/.*devlab/);

    // Navigate to Projects
    await page.click('text=Projects');
    await expect(page).toHaveURL(/.*projects/);

    // Navigate to Settings
    await page.click('text=Settings');
    await expect(page).toHaveURL(/.*settings/);
  });

  test('should display main navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check that main navigation items are visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Dev Lab')).toBeVisible();
    await expect(page.locator('text=Projects')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });
});

