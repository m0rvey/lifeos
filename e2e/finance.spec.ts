import { test, expect } from '@playwright/test';

test.describe('Finance CRUD flow', () => {
  test('can create, edit, and delete a transaction', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.locator('h1')).toContainText('Capital & Budget');

    // Create
    await page.locator('button', { hasText: 'Add transaction' }).click();
    await page.locator('input[placeholder="0"]').fill('1500');
    await page.locator('input[placeholder="Category"]').fill('Freelance');
    await page.locator('textarea[placeholder="Description"]').fill('E2E test income');
    await page.locator('button', { hasText: 'Record' }).click();
    await expect(page.locator('text=Freelance')).toBeVisible();

    // Edit
    await page.locator('button[aria-label="Edit transaction"]').first().click();
    await page.locator('input[placeholder="Category"]').fill('Freelance (Updated)');
    await page.locator('button', { hasText: 'Save' }).click();
    await expect(page.locator('text=Freelance (Updated)')).toBeVisible();

    // Delete
    await page.locator('button[aria-label="Delete transaction"]').first().click();
    await page.locator('button', { hasText: 'Delete' }).click();
    await expect(page.locator('text=Freelance (Updated)')).not.toBeVisible();
  });
});
