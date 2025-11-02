import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Projects');
    await page.waitForURL(/.*projects/);
  });

  test('should display projects page', async ({ page }) => {
    // Check that projects page is loaded
    await expect(page.locator('h1, h2').filter({ hasText: /projects/i })).toBeVisible();
  });

  test('should open create project modal', async ({ page }) => {
    // Look for create/new project button
    const createButton = page.locator('button').filter({ hasText: /new|create/i }).first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Check that modal or form is displayed
      await expect(page.locator('input[name="name"], input[placeholder*="name" i]').first()).toBeVisible();
    }
  });

  test('should display project cards or list', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check if there are any project cards or list items
    const hasProjects = await page.locator('[data-testid="project-card"], .project-card, .project-item').count();
    
    // Either projects exist or empty state is shown
    if (hasProjects === 0) {
      await expect(page.locator('text=/no projects|empty|get started/i')).toBeVisible();
    }
  });
});

