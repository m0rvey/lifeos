import { test, expect } from '@playwright/test';

test.describe('Social CRUD flow', () => {
  test('can create, edit, and delete a person', async ({ page }) => {
    await page.goto('/social');

    // Create
    await page.locator('button[aria-label="Add new contact"]').click();
    await page.locator('input[placeholder="John Doe"]').fill('E2E Test Person');
    await page.locator('button', { hasText: 'Create connection' }).click();
    await expect(page.locator('text=E2E Test Person')).toBeVisible();

    // Edit
    await page.locator('text=E2E Test Person').click();
    await page.locator('.detail-btn-edit').first().click();
    await page.locator('input[placeholder="John Doe"]').fill('E2E Test Person (Updated)');
    await page.locator('button', { hasText: 'Save changes' }).click();
    await expect(page.locator('text=E2E Test Person (Updated)')).toBeVisible();

    // Delete
    await page.locator('.detail-btn-delete').first().click();
    await page.locator('button', { hasText: 'Delete' }).click();
    await expect(page.locator('text=E2E Test Person (Updated)')).not.toBeVisible();
  });
});
