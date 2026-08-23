import { test, expect } from '@playwright/test';
import { mockPixelForgeApi } from './support/apiMocks';
import { fixturePaths } from './support/fixturePaths';

async function uploadCardFile(page, filePath) {
  await page.locator('input[type="file"]').setInputFiles(filePath);
}

test.describe('browser-side utility tools', () => {
  test.beforeEach(async ({ page }) => {
    await mockPixelForgeApi(page);
  });

  test('color palette renders sampled output and supports keyboard movement', async ({
    page,
  }) => {
    await page.goto('/color-palette');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await expect(
      page.getByRole('heading', { name: 'Palette' }),
    ).toBeVisible();

    const swatches = page.getByRole('button', {
      name: /^Copy #[0-9A-F]{6}$/,
    });
    await expect(swatches).toHaveCount(5);

    const picker = page.getByRole('button', {
      name: /Move color picker 1/,
    });
    await expect(picker).toBeVisible();

    const firstSwatch = swatches.first();
    const beforeSwatchLabel = await firstSwatch.getAttribute('aria-label');

    await picker.focus();
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Shift+ArrowRight');
    }

    await expect(picker).toBeFocused();
    await expect
      .poll(() => firstSwatch.getAttribute('aria-label'))
      .not.toBe(beforeSwatchLabel);
  });
});
