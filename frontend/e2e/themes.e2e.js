import { test, expect } from '@playwright/test';

const themeRoot = (page) => page.locator('[data-theme]').first();

test.describe('themes', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('desktop toggle supports pointer and keyboard activation with persistence', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'dark');
    const toggle = page.getByRole('button', {
      name: 'Switch to light theme',
    });
    const themeButton = page
      .locator('nav button[aria-label$="theme"]')
      .first();
    const icons = themeButton.locator('[data-theme-icon]');
    const initialTransforms = await icons.evaluateAll((nodes) =>
      Object.fromEntries(
        nodes.map((node) => [
          node.dataset.themeIcon,
          getComputedStyle(node).transform,
        ]),
      ),
    );

    await expect(icons).toHaveCount(2);
    await expect(toggle).toContainText('Dark');
    await expect(toggle).not.toHaveAttribute('aria-expanded');
    await expect(page.locator('#desktop-theme-menu')).toHaveCount(0);
    await expect
      .poll(() =>
        themeButton.evaluate((button) => getComputedStyle(button).transitionDuration),
      )
      .toBe('0s');

    await toggle.click();
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'light');
    await expect(
      page.getByRole('button', { name: 'Switch to dark theme' }),
    ).toContainText('Light');
    await page.waitForTimeout(320);
    const lightTransforms = await icons.evaluateAll((nodes) =>
      Object.fromEntries(
        nodes.map((node) => [
          node.dataset.themeIcon,
          getComputedStyle(node).transform,
        ]),
      ),
    );
    expect(lightTransforms.moon).not.toBe(initialTransforms.moon);
    expect(lightTransforms.sun).not.toBe(initialTransforms.sun);

    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem('pixelforge-theme')),
      )
      .toBe('light');

    await page.reload();
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'light');

    await page
      .getByRole('button', { name: 'Switch to dark theme' })
      .press('Enter');
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'dark');

    await page
      .getByRole('button', { name: 'Switch to light theme' })
      .press('Space');
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'light');
  });

  test('legacy system preference migrates once and stops following the OS', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => {
      localStorage.setItem('pixelforge-theme', 'system');
    });
    await page.goto('/');

    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'dark');
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem('pixelforge-theme')),
      )
      .toBe('dark');

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'dark');
  });

  test('mobile navigation uses the same direct toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Open tool menu' }).click();
    const mobileNavigation = page.locator('#mobile-navigation');
    await expect(mobileNavigation.locator('details')).toHaveCount(0);

    await mobileNavigation
      .getByRole('button', { name: 'Switch to light theme' })
      .click();
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'light');
  });

  test('reduced motion swaps theme state without transitions', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const themeButton = page
      .locator('nav button[aria-label$="theme"]')
      .first();
    const iconDurations = await themeButton
      .locator('[data-theme-icon]')
      .evaluateAll((icons) =>
        icons.map((icon) => getComputedStyle(icon).transitionDuration),
      );
    const shellDuration = await themeRoot(page).evaluate(
      (root) => getComputedStyle(root).transitionDuration,
    );

    expect(iconDurations).toEqual(['0s', '0s']);
    expect(shellDuration).toBe('0s');

    await themeButton.click();
    await expect(themeRoot(page)).toHaveAttribute('data-theme', 'light');
  });
});
