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

async function uploadGeneratedCompressionSource(page) {
  await page.locator('input[type="file"]').evaluate(async (input) => {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 2000;
    const context = canvas.getContext('2d');
    context.fillStyle = '#777';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const image = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    const file = new File(
      [image, new Uint8Array(11 * 1024 * 1024)],
      'large-compression-source.png',
      { type: 'image/png' },
    );
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

test.describe('browser-side optimize tools', () => {
  test.beforeEach(async ({ page }) => {
    await mockPixelForgeApi(page);
  });

  test('compress uses the chosen level and exposes a JPEG download', async ({
    page,
  }) => {
    await page.goto('/compress-image');
    await expect(
      page.getByText(
        'Large files welcome · Processed locally in your browser',
      ),
    ).toBeVisible();
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

  test('compresses toward a target size and reports the actual output', async ({
    page,
  }) => {
    await page.goto('/compress-image');
    await uploadGeneratedCompressionSource(page);

    await page.getByRole('button', { name: 'Target Size' }).click();
    await page.getByLabel('Target size').fill('5');
    await page.getByRole('button', {
      name: 'Compress Image',
      exact: true,
    }).click();

    const downloadLink = page.getByRole('link', {
      name: 'Download Compressed Image',
    });
    await expect(downloadLink).toBeVisible();

    const outputBytes = await downloadLink.evaluate(async (link) => {
      const response = await fetch(link.href);
      return (await response.blob()).size;
    });
    const outputMB = (outputBytes / (1024 * 1024)).toFixed(2);

    expect(outputBytes).toBeLessThanOrEqual(5 * 1024 * 1024);
    await expect(
      page.getByText(`Target 5.00 MB · Output ${outputMB} MB`, {
        exact: true,
      }),
    ).toBeVisible();
  });

  test('compress accepts sources above AI limits without changing them on selection', async ({
    page,
  }) => {
    await page.goto('/compress-image');

    await uploadGeneratedCompressionSource(page);

    await expect(page.getByText('large-compression-source.png')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Compress Image', exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole('link', { name: 'Download Compressed Image' }),
    ).not.toBeVisible();
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

    await expect(
      page.getByRole('heading', { name: 'What PixelForge inspects' }),
    ).toBeVisible();
    await expect(
      page.getByText('Processed locally', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Upload image file' }),
    ).toBeVisible();

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
