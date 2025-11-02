import { test, expect } from '@playwright/test';

test.describe('Token Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Dashboard');
    await page.waitForURL(/.*dashboard/);
  });

  test('should display dashboard', async ({ page }) => {
    // Check that dashboard is loaded
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i })).toBeVisible();
  });

  test('should display analytics widgets', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Look for common analytics terms
    const analyticsTerms = ['token', 'usage', 'cost', 'request', 'provider'];
    
    let foundAnalytics = false;
    for (const term of analyticsTerms) {
      const element = page.locator(`text=/${term}/i`).first();
      if (await element.isVisible()) {
        foundAnalytics = true;
        break;
      }
    }
    
    // Either analytics are shown or it's an empty state
    expect(foundAnalytics || await page.locator('text=/no data|empty|get started/i').isVisible()).toBeTruthy();
  });
});

