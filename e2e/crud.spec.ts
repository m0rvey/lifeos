import { test, expect } from '@playwright/test';

test.describe('Journal CRUD flow', () => {
  test('can create, edit, and delete a journal entry', async ({ page }) => {
    // 1. Visit reflect journal module
    await page.goto('/reflect/journal');
    
    // Check that we are on the page
    await expect(page.locator('h2')).toContainText('Mood & Reflection Journal');

    // 2. Click "New entry"
    await page.locator('button', { hasText: 'New entry' }).click();

    // 3. Fill in the modal fields
    await page.fill('input[placeholder="Morning mood..."]', 'E2E Test Entry');
    await page.fill('textarea[placeholder="Today I felt..."]', 'Hello from E2E test script!');

    // 4. Submit the form
    await page.locator('button', { hasText: 'Record in journal' }).click();

    // 5. Verify the entry has been created and is listed on the page
    await expect(page.locator('h3', { hasText: 'E2E Test Entry' })).toBeVisible();
    await expect(page.locator('p', { hasText: 'Hello from E2E test script!' })).toBeVisible();

    // 6. Click the edit button
    // The edit button has class .btn--secondary and wraps the Edit2 icon
    await page.locator('.glass-panel').filter({ hasText: 'E2E Test Entry' }).locator('button').first().click();

    // 7. Update the title and content
    await page.fill('input[placeholder="Morning mood..."]', 'E2E Test Entry (Updated)');
    await page.locator('button', { hasText: 'Save changes' }).click();

    // 8. Verify the updated title
    await expect(page.locator('h3', { hasText: 'E2E Test Entry (Updated)' })).toBeVisible();

    // 9. Click the delete button
    // The delete button is the second button (class .btn-padding-4-6-red)
    await page.locator('.glass-panel').filter({ hasText: 'E2E Test Entry (Updated)' }).locator('button').nth(1).click();

    // 10. Confirm delete dialog
    await page.locator('button', { hasText: 'Delete' }).click();

    // 11. Verify entry is deleted
    await expect(page.locator('h3', { hasText: 'E2E Test Entry (Updated)' })).not.toBeVisible();
  });
});
