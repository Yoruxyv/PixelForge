import { test, expect } from '@playwright/test';

test.describe('responsive and accessibility smoke', () => {
  test('main navigation is keyboard accessible and Escape restores focus', async ({
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

    await editMenu.focus();
    await page.keyboard.press('Enter');

    await expect(editMenu).toHaveAttribute('aria-expanded', 'true');
    await expect(
      nav.getByRole('link', { name: 'Image Editor' }),
    ).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(editMenu).toHaveAttribute('aria-expanded', 'false');
    await expect(editMenu).toBeFocused();
  });

  test('skip link reaches the main content', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', {
      name: 'Skip to content',
    });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });

  test('mobile viewport has no obvious horizontal overflow and controls remain reachable', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      )
      .toBeLessThanOrEqual(1);

    await page.getByRole('button', {
      name: 'Open tool menu',
    }).click();

    await expect(
      page
        .getByRole('navigation', { name: 'Primary navigation' })
        .getByRole('link', { name: 'Resize Image' }),
    ).toBeVisible();

    await page.goto('/resize-image');

    await expect(
      page.getByRole('heading', { name: 'Output dimensions' }),
    ).toBeVisible();
    await expect(
      page.getByText('Click, drop, drag or paste', { exact: true }),
    ).toBeVisible();

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      )
      .toBeLessThanOrEqual(1);
  });
});
