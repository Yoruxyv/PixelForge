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

test.describe('browser-side optimize tools', () => {
  test.beforeEach(async ({ page }) => {
    await mockPixelForgeApi(page);
  });

  test('compress uses the chosen level and exposes a JPEG download', async ({
    page,
  }) => {
    await page.goto('/compress-image');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await page.getByLabel('Compression Level').fill('0.75');
    await expect(page.getByText('75%')).toBeVisible();

    await page.getByRole('button', {
      name: 'Compress Image',
      exact: true,
    }).click();

    const downloadLink = page.getByRole('link', {
      name: 'Download Compressed Image',
    });
    await expect(downloadLink).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/min.*\.jpg$/i);
  });

  test('convert format produces the selected output type', async ({
    page,
  }) => {
    await page.goto('/convert-format');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await page.getByLabel('Convert To').selectOption('png');
    await page.getByRole('button', {
      name: 'Convert Image',
      exact: true,
    }).click();

    const downloadLink = page.getByRole('link', {
      name: 'Download PNG',
    });
    await expect(downloadLink).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/converted.*\.png$/i);
  });

  test('same-format conversion dialog closes with Escape', async ({
    page,
  }) => {
    await page.goto('/convert-format');
    await uploadCardFile(page, fixturePaths.colorJpeg);

    await page.getByLabel('Convert To').selectOption('jpg');
    await page.getByRole('button', {
      name: 'Convert Image',
      exact: true,
    }).click();

    const dialogHeading = page.getByRole('heading', {
      name: 'Invalid Conversion',
    });
    await expect(dialogHeading).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialogHeading).not.toBeVisible();
  });

  test('remove metadata detects EXIF and exposes a clean download', async ({
    page,
  }) => {
    await page.goto('/metadata');
    await uploadDropzoneFile(page, fixturePaths.metadataJpeg);

    await expect(page.getByText('Detected metadata')).toBeVisible();
    await expect(page.getByText('Metadata stripped')).toBeVisible();
    await expect(
      page.getByText('PixelForge E2E', { exact: true }),
    ).toBeVisible();

    const downloadLink = page.getByRole('link', {
      name: 'Download clean image',
    });
    await expect(downloadLink).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^Cleaned-.*\.jpg$/i);
  });
});
