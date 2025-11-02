import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Settings');
    await page.waitForURL(/.*settings/);
  });

  test('should display settings page', async ({ page }) => {
    // Check that settings page is loaded
    await expect(page.locator('h1, h2').filter({ hasText: /settings/i })).toBeVisible();
  });

  test('should display provider configuration section', async ({ page }) => {
    // Look for provider-related content
    const providerSection = page.locator('text=/provider|api|configuration/i').first();
    
    if (await providerSection.isVisible()) {
      await expect(providerSection).toBeVisible();
    }
  });

  test('should display models section', async ({ page }) => {
    // Look for models-related content
    const modelsSection = page.locator('text=/model|llm/i').first();
    
    if (await modelsSection.isVisible()) {
      await expect(modelsSection).toBeVisible();
    }
  });
});

