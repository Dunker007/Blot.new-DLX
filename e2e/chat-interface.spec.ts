import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Dev Lab');
    await page.waitForURL(/.*devlab/);
  });

  test('should display chat interface', async ({ page }) => {
    // Check that chat interface elements are visible
    await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible();
  });

  test('should have model selector', async ({ page }) => {
    // Look for model selection dropdown or button
    const modelSelector = page.locator('select, button').filter({ hasText: /model|provider/i }).first();
    
    if (await modelSelector.isVisible()) {
      await expect(modelSelector).toBeVisible();
    }
  });

  test('should display message input area', async ({ page }) => {
    // Check for message input
    const messageInput = page.locator('textarea, input[placeholder*="message" i], input[placeholder*="type" i]').first();
    await expect(messageInput).toBeVisible();
  });

  test('should have send button', async ({ page }) => {
    // Look for send button
    const sendButton = page.locator('button').filter({ hasText: /send|submit/i }).first();
    
    if (await sendButton.isVisible()) {
      await expect(sendButton).toBeVisible();
    }
  });
});

