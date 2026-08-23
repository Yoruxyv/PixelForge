import { test, expect } from '@playwright/test';

test.describe('application shell', () => {
  test('homepage renders successfully', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1 }),
    ).toContainText('Images,');
    await expect(
      page.getByRole('navigation', { name: 'Primary navigation' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Enter the image editor' }),
    ).toBeVisible();
  });

  test('desktop dropdown opens, navigates, and closes on outside click', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const nav = page.getByRole('navigation', {
      name: 'Primary navigation',
    });
    const editMenu = nav.getByRole('button', {
      name: 'Edit',
      exact: true,
    });

    await editMenu.hover();
    await expect(editMenu).toHaveAttribute('aria-expanded', 'true');
    await expect(
      nav.getByRole('link', { name: 'Resize Image' }),
    ).toBeVisible();

    await page.mouse.click(20, 120);
    await expect(editMenu).toHaveAttribute('aria-expanded', 'false');

    await editMenu.hover();
    await nav.getByRole('link', { name: 'Resize Image' }).click();

    await expect(page).toHaveURL(/\/resize-image$/);
    await expect(
      page.getByRole('heading', { name: 'Output dimensions' }),
    ).toBeVisible();
  });

  test('mobile navigation reaches a major tool route', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const openMenu = page.getByRole('button', {
      name: 'Open tool menu',
    });
    await openMenu.click();

    await expect(
      page.getByRole('button', { name: 'Close tool menu' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Color Palette' }).click();

    await expect(page).toHaveURL(/\/color-palette$/);
    await expect(
      page.getByRole('heading', { name: 'Sampling controls' }),
    ).toBeVisible();
  });

  test('unknown routes render the 404 experience', async ({ page }) => {
    await page.goto('/definitely-not-a-pixelforge-route');

    await expect(
      page.getByRole('heading', { name: 'Lost in the pixels! 👾' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Return to Safety' }),
    ).toHaveAttribute('href', '/');
  });
});
