import { test, expect } from '@playwright/test';

const themeRoot = (page) => page.locator('[data-theme]').first();

async function chooseTheme(page, currentLabel, nextLabel) {
  const trigger = page.locator('#desktop-theme-menu-trigger');
  const menu = page.locator('#desktop-theme-menu');

  await expect(trigger).toContainText(currentLabel);
  await trigger.hover();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toHaveAttribute('aria-hidden', 'false');

  await menu.getByRole('button', {
    name: nextLabel,
    exact: true,
  }).click();
}

test.describe('themes', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('light preference persists after reload', async ({ page }) => {
    await page.goto('/');

    await chooseTheme(page, 'System', 'Light');
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'light');

    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem('pixelforge-theme')),
      )
      .toBe('light');

    await page.reload();
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'light');
  });

  test('dark preference persists after reload', async ({ page }) => {
    await page.goto('/');

    await chooseTheme(page, 'System', 'Dark');
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'dark');
  });

  test('system preference follows the browser color scheme', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'dark');

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'light');
  });
});
