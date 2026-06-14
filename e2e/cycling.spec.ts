import { test, expect } from '@playwright/test';

test.describe('Cycling Rides CRUD flow', () => {
  test('can create, edit, and delete a ride', async ({ page }) => {
    await page.goto('/cycling/rides');
    await expect(page.locator('text=Training journal')).toBeVisible();

    // Create
    await page.locator('button', { hasText: 'Add ride' }).first().click();
    await page.locator('input[placeholder="E.g. Morning highway"]').fill('E2E Test Ride');
    await page.locator('input[placeholder="0"]').first().fill('25');
    await page.locator('input[placeholder="0"]').nth(1).fill('90');
    await page.locator('button', { hasText: 'Add ride' }).last().click();
    await expect(page.locator('text=E2E Test Ride')).toBeVisible();

    // Edit
    await page.locator('button[title="Edit"]').first().click();
    await page.locator('input[placeholder="E.g. Morning highway"]').fill('E2E Test Ride (Updated)');
    await page.locator('button', { hasText: 'Save changes' }).click();
    await expect(page.locator('text=E2E Test Ride (Updated)')).toBeVisible();

    // Delete
    await page.locator('button[title="Delete"]').first().click();
    await page.locator('button', { hasText: 'Delete' }).click();
    await expect(page.locator('text=E2E Test Ride (Updated)')).not.toBeVisible();
  });
});
