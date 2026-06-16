import { test, expect } from '@playwright/test';

test.describe('Cycling Rides CRUD flow', () => {
  test('can create, edit, and delete a ride', async ({ page }) => {
    await page.goto('/cycling/rides');
    await expect(page.locator('text=Training journal')).toBeVisible();

    // Create
    await page.locator('button', { hasText: 'Record workout' }).first().click();
    await page.locator('form input[type="text"]').first().fill('E2E Test Ride');
    await page.locator('form input[type="number"]').first().fill('25');
    await page.locator('form input[type="number"]').nth(1).fill('90');
    await page.locator('button', { hasText: 'Add ride' }).last().click();
    await expect(page.locator('text=E2E Test Ride')).toBeVisible();

    // Edit
    await page.locator('.cycling-btn-sm-edit').first().click();
    await page.locator('form input[type="text"]').first().fill('E2E Test Ride (Updated)');
    await page.locator('button', { hasText: 'Save changes' }).click();
    await expect(page.locator('text=E2E Test Ride (Updated)')).toBeVisible();

    // Delete
    await page.locator('.cycling-btn-sm-delete').first().click();
    await page.locator('button', { hasText: 'Confirm' }).click();
    await expect(page.locator('text=E2E Test Ride (Updated)')).not.toBeVisible();
  });
});
