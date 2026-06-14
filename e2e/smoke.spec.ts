import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('homepage loads and shows LifeOS branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.app-logo')).toContainText('LifeOS');
  });

  test('navigation tabs are visible', async ({ page }) => {
    await page.goto('/hub');
    const tabs = page.locator('.app-module-tab');
    await expect(tabs.first()).toBeVisible();
    await expect(tabs).toHaveCount(6);
  });

  test('can navigate to social module', async ({ page }) => {
    await page.goto('/social');
    await expect(page).toHaveURL(/\/social/);
  });

  test('can navigate to reflect module', async ({ page }) => {
    await page.goto('/reflect');
    await expect(page).toHaveURL(/\/reflect/);
  });

  test('search overlay opens with Cmd+K or Control+K', async ({ page }) => {
    await page.goto('/hub');
    await page.locator('body').click();
    await page.keyboard.press('Control+k');
    await expect(page.locator('.search-overlay-input')).toBeVisible();
  });
});
