import { test, expect } from '@playwright/test';

test.describe('Finance CRUD flow', () => {
  test('can create, edit, and delete a transaction', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.locator('h1')).toContainText('Capital & Budget');

    // Create
    await page.locator('button', { hasText: 'Add transaction' }).first().click();
    await page.locator('form input[type="number"]').first().fill('1500');
    await page.locator('form input[type="text"]').first().fill('Freelance');
    await page.locator('form textarea').first().fill('E2E test income');
    await page.locator('button', { hasText: 'Record' }).click();
    await expect(page.locator('td', { hasText: 'Freelance' }).first()).toBeVisible();

    // Edit
    await page.locator('button[aria-label="Edit transaction"]').first().click();
    await page.locator('form input[type="text"]').first().fill('Freelance (Updated)');
    await page.locator('button', { hasText: 'Save' }).click();
    await expect(page.locator('td', { hasText: 'Freelance (Updated)' }).first()).toBeVisible();

    // Delete
    await page.locator('button[aria-label="Delete transaction"]').first().click();
    await page.locator('button', { hasText: 'Confirm' }).click();
    await expect(page.locator('td', { hasText: 'Freelance (Updated)' }).first()).not.toBeVisible();
  });
});
