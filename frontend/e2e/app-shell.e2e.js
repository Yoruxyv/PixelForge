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
    const mobileNavigation = page.locator('#mobile-navigation');
    await expect(mobileNavigation).toHaveAttribute('aria-hidden', 'true');
    await expect(mobileNavigation).toHaveAttribute('inert', '');

    await openMenu.click();

    const closeMenu = page.getByRole('button', { name: 'Close tool menu' });
    await expect(closeMenu).toBeVisible();
    await expect(closeMenu).toHaveAttribute('aria-expanded', 'true');
    await expect(mobileNavigation).toHaveAttribute('aria-hidden', 'false');
    await expect(mobileNavigation).not.toHaveAttribute('inert');

    await mobileNavigation
      .getByRole('link', { name: 'Color Palette', exact: true })
      .click();

    await expect(page).toHaveURL(/\/color-palette$/);
    await expect(
      page.getByRole('heading', { name: 'Sampling controls' }),
    ).toBeVisible();
  });

  test('mobile navigation handles rapid toggles with reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const mobileNavigation = page.locator('#mobile-navigation');
    const openMenu = page.getByRole('button', { name: 'Open tool menu' });

    await openMenu.click();
    await page.getByRole('button', { name: 'Close tool menu' }).click();
    await openMenu.click();

    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation).toHaveAttribute('aria-hidden', 'false');
    await expect(mobileNavigation).toHaveCSS('transition-duration', '0s');
    await expect(
      page.locator('.pf-mobile-menu-line').first(),
    ).toHaveCSS('transition-duration', '0s');
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
  test('AI showcase tabs update preview and contextual navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const cases = [
      {
        tab: 'Upscale',
        preview: 'Upscale example - After',
        cta: /OPEN UPSCALE/i,
        href: '/upscale',
      },
      {
        tab: 'Background removal',
        preview: 'Background removal example - After',
        cta: /OPEN BACKGROUND REMOVAL/i,
        href: '/remove-bg',
      },
      {
        tab: 'Color restoration',
        preview: 'Color restoration example - After',
        cta: /OPEN COLOR RESTORATION/i,
        href: '/color-restoration',
      },
      {
        tab: 'Object removal',
        preview: 'Object removal example - After',
        cta: /OPEN OBJECT REMOVAL/i,
        href: '/object-remove',
      },
    ];

    for (const showcaseCase of cases) {
      await page.getByRole('tab', { name: showcaseCase.tab }).click();

      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByAltText(showcaseCase.preview)).toBeVisible();
      await expect(
        page.getByRole('link', { name: showcaseCase.cta }),
      ).toHaveAttribute('href', showcaseCase.href);
    }

    await page
      .getByRole('link', { name: /OPEN OBJECT REMOVAL/i })
      .click();

    await expect(page).toHaveURL(/\/object-remove$/);
  });

  test('AI showcase remains functional with reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.getByRole('tab', { name: 'Color restoration' }).click();

    await expect(
      page.getByAltText('Color restoration example - After'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /OPEN COLOR RESTORATION/i }),
    ).toHaveAttribute('href', '/color-restoration');
    await expect(page).toHaveURL(/\/$/);
  });

});
