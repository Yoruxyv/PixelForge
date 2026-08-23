import { test, expect } from '@playwright/test';
import { mockPixelForgeApi } from './support/apiMocks';
import { fixturePaths } from './support/fixturePaths';

async function uploadCardFile(page, filePath) {
  await page.locator('input[type="file"]').setInputFiles(filePath);
}

async function uploadDropzoneFile(page, filePath) {
  const chooserPromise = page.waitForEvent('filechooser');

  await page.getByRole('button', {
    name: 'Upload image file',
  }).click();

  const chooser = await chooserPromise;
  await chooser.setFiles(filePath);
}

test.describe('browser-side edit tools', () => {
  test.beforeEach(async ({ page }) => {
    await mockPixelForgeApi(page);
  });

  test('image editor updates the live preview and exports', async ({
    page,
  }) => {
    await page.goto('/image-editor');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    const editedPreview = page.getByAltText('Edited preview');
    await expect(editedPreview).toBeVisible();

    const initialSrc = await editedPreview.getAttribute('src');

    await page.getByLabel('Brightness').fill('35');

    await expect
      .poll(() => editedPreview.getAttribute('src'))
      .not.toBe(initialSrc);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', {
      name: 'Export Image',
      exact: true,
    }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/edited.*\.jpg$/i);
  });

  test('resize changes dimensions and exposes a download', async ({ page }) => {
    await page.goto('/resize-image');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await expect(page.getByLabel('Width')).toHaveValue('96');
    await expect(page.getByLabel('Height')).toHaveValue('64');

    await page.getByLabel('Width').fill('48');

    await expect(page.getByLabel('Height')).toHaveValue('32');
    await expect(page.getByText('48 × 32 px')).toBeVisible();

    await page.getByRole('button', {
      name: 'Apply Resize',
      exact: true,
    }).click();

    const downloadLink = page.getByRole('link', {
      name: 'Download 48x32 Image',
    });
    await expect(downloadLink).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/48x32.*\.jpg$/i);
  });

  test('crop applies a square frame and exposes the result', async ({
    page,
  }) => {
    await page.goto('/crop-image');

    await expect(
      page.getByRole('heading', { name: 'Focus crop' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Upload image file' }),
    ).toBeVisible();

    const applyButton = page.getByRole('button', {
      name: 'Apply Crop',
      exact: true,
    });
    await expect(applyButton).toBeDisabled();
    await expect(
      page.getByRole('button', {
        name: 'Square (1:1)',
        exact: true,
      }),
    ).toBeDisabled();

    await uploadDropzoneFile(page, fixturePaths.colorJpeg);

    await expect(page.getByAltText('Crop preview')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Focus crop' }),
    ).toBeVisible();

    await page.getByRole('button', {
      name: 'Square (1:1)',
      exact: true,
    }).click();

    await expect(applyButton).toBeEnabled();
    await applyButton.click();

    await expect(
      page.getByRole('heading', { name: 'Crop ready' }),
    ).toBeVisible();

    const downloadLink = page.getByRole('link', {
      name: 'Download Image',
    });
    await expect(downloadLink).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/crop.*\.jpg$/i);
  });

  test('rotate and flip updates preview state and exports', async ({
    page,
  }) => {
    await page.goto('/rotate-flip');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await page.getByRole('button', {
      name: 'Right',
      exact: true,
    }).click();
    await page.getByRole('button', {
      name: 'Horizontal',
      exact: true,
    }).click();

    await expect(
      page.getByText('90° · H flip · V normal'),
    ).toBeVisible();

    await page.getByRole('button', {
      name: 'Apply Transform',
      exact: true,
    }).click();

    const downloadLink = page.getByRole('link', {
      name: 'Download Transformed Image',
    });
    await expect(downloadLink).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/rotated.*\.jpg$/i);
  });

  test('watermark placement is keyboard-movable and exportable', async ({
    page,
  }) => {
    await page.goto('/watermark-adder');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await page
      .getByRole('textbox', { name: 'Watermark Text', exact: true })
      .fill('PixelForge E2E');

    const overlay = page.getByRole('group', {
      name: /Watermark overlay/,
    });
    await expect(overlay).toContainText('PixelForge E2E');

    await overlay.focus();
    await page.keyboard.press('ArrowRight');

    await expect(overlay).toBeFocused();
    await expect(
      page.getByRole('button', { name: 'Delete watermark' }),
    ).toBeVisible();

    await page.getByRole('button', {
      name: 'Add Watermark',
      exact: true,
    }).click();

    const downloadLink = page.getByRole('link', {
      name: 'Download Protected Image',
    });
    await expect(downloadLink).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/watermarked.*\.jpg$/i);
  });
  test('image editor keeps loaded actions visible on a short desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/image-editor');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await expect(page.getByAltText('Edited preview')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));

    await expect(
      page.getByRole('button', {
        name: 'Export Image',
        exact: true,
      }),
    ).toBeInViewport();
    await expect(
      page.getByRole('button', {
        name: 'Reset Filters',
        exact: true,
      }),
    ).toBeInViewport();
  });

  test('watermark keeps placement actions visible on a short desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/watermark-adder');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await expect(page.getByAltText('Base workspace')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));

    await expect(
      page.getByRole('button', {
        name: 'Add Watermark',
        exact: true,
      }),
    ).toBeInViewport();
    await expect(
      page.getByRole('button', {
        name: 'Reset',
        exact: true,
      }),
    ).toBeInViewport();
  });

});
