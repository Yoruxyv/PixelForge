import { test, expect } from '@playwright/test';
import { mockPixelForgeApi } from './support/apiMocks';
import { fixturePaths } from './support/fixturePaths';
import { mockTurnstile } from './support/turnstileMock';

const AI_CASES = [
  {
    route: '/upscale',
    feature: 'upscale',
    maxLimit: 3,
    submitName: 'Upscale Image',
    fixture: fixturePaths.colorJpeg,
  },
  {
    route: '/remove-bg',
    feature: 'rembg',
    maxLimit: 5,
    submitName: 'Remove Background',
    fixture: fixturePaths.colorJpeg,
  },
  {
    route: '/color-restoration',
    feature: 'colorrestore',
    maxLimit: 5,
    submitName: 'Restore Color',
    fixture: fixturePaths.grayscalePng,
  },
  {
    route: '/object-remove',
    feature: 'objectremove',
    maxLimit: 5,
    submitName: 'Remove Object',
    fixture: fixturePaths.colorJpeg,
  },
];

async function uploadDropzoneFile(page, filePath) {
  const chooserPromise = page.waitForEvent('filechooser');

  await page.getByRole('button', {
    name: 'Upload image file',
  }).click();

  const chooser = await chooserPromise;
  await chooser.setFiles(filePath);
}

async function uploadGeneratedAiImage(
  page,
  { width = 2000, height = 2000, paddingBytes = 0 } = {},
) {
  await page.locator('input[type="file"]').evaluate(async (input, options) => {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#777';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([blob, new Uint8Array(options.paddingBytes)], 'oversized.png', {
        type: 'image/png',
      }),
    );
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, { width, height, paddingBytes });
}

async function paintObjectMask(page) {
  const canvas = page.getByLabel('Object removal mask');
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  const startX = box.x + box.width * 0.4;
  const startY = box.y + box.height * 0.45;
  const endX = box.x + box.width * 0.6;
  const endY = box.y + box.height * 0.55;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 5 });
  await page.mouse.up();

  await expect(
    page.getByText('Selection ready. Refine it on the canvas if needed.'),
  ).toBeVisible();
}

test.describe('AI workspaces', () => {
  test.beforeEach(async ({ page }) => {
    await mockTurnstile(page);
  });

  test('workspace renders before usage metadata resolves', async ({ page }) => {
    const api = await mockPixelForgeApi(page, {
      deferUsageFeature: 'upscale',
      usageSequences: { upscale: [2] },
    });

    await page.goto('/upscale');

    await expect(
      page.getByRole('button', { name: 'Upload image file' }),
    ).toBeVisible();
    await expect(page.getByText('Checking usage…')).toBeVisible();

    api.releaseUsage();

    await expect(
      page.getByText('2 of 3 uses available'),
    ).toBeVisible();
  });

  test('shared upload validation surfaces a non-image error', async ({
    page,
  }) => {
    await mockPixelForgeApi(page, {
      usageSequences: { upscale: [2] },
    });
    await page.goto('/upscale');

    await uploadDropzoneFile(page, fixturePaths.invalidText);

    await expect(
      page
        .getByRole('button', { name: 'Upload image file' })
        .getByText(/Are you trying to attack the web/),
    ).toBeVisible();
  });

  test('color restoration rejects already-colorized input', async ({
    page,
  }) => {
    await mockPixelForgeApi(page, {
      usageSequences: { colorrestore: [4] },
    });
    await page.goto('/color-restoration');

    await uploadDropzoneFile(page, fixturePaths.colorJpeg);

    await expect(
      page
        .getByRole('button', { name: 'Upload image file' })
        .getByText(
          'This image already has color! Please upload a black and white image.',
        ),
    ).toBeVisible();
  });

  test('all AI tools require consent before resizing oversized input', async ({
    page,
  }) => {
    await mockPixelForgeApi(page);

    for (const aiCase of AI_CASES) {
      await page.goto(aiCase.route);
      await uploadGeneratedAiImage(page);

      await expect(
        page.getByRole('heading', { name: 'Resize for AI processing?' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Resize & continue' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Choose another image' }),
      ).toBeVisible();
      await expect(page.getByAltText('Upload preview')).not.toBeVisible();

      if (aiCase.feature === 'upscale') {
        await page.getByRole('button', { name: 'Resize & continue' }).click();
        await expect(page.getByAltText('Upload preview')).toBeVisible();
      } else if (aiCase.feature === 'rembg') {
        const chooserPromise = page.waitForEvent('filechooser');
        await page
          .getByRole('button', { name: 'Choose another image' })
          .click();
        const chooser = await chooserPromise;
        await chooser.setFiles([]);
        await expect(
          page.getByRole('heading', { name: 'Resize for AI processing?' }),
        ).not.toBeVisible();
      }
    }
  });

  test('AI file-size overflow is optimized only after consent', async ({
    page,
  }) => {
    const api = await mockPixelForgeApi(page, {
      usageSequences: { upscale: [2] },
    });
    await page.goto('/upscale');

    await uploadGeneratedAiImage(page, {
      width: 1200,
      height: 1000,
      paddingBytes: 11 * 1024 * 1024,
    });

    await expect(
      page.getByRole('heading', { name: 'Image exceeds the upload limit' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Optimize & continue' }),
    ).toBeVisible();
    expect(api.state.initBodies.upscale ?? []).toHaveLength(0);

    await page.getByRole('button', { name: 'Optimize & continue' }).click();

    await expect(page.getByAltText('Upload preview')).toBeVisible();
    expect(api.state.initBodies.upscale ?? []).toHaveLength(0);
  });

  test('combined AI file-size and resolution overflow uses one confirmation', async ({
    page,
  }) => {
    await mockPixelForgeApi(page, {
      usageSequences: { upscale: [2] },
    });
    await page.goto('/upscale');

    await uploadGeneratedAiImage(page, {
      paddingBytes: 11 * 1024 * 1024,
    });

    await expect(
      page.getByRole('heading', { name: 'Image exceeds the upload limit' }),
    ).toBeVisible();
    await expect(page.getByText(/resolution also exceeds/)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Resize for AI processing?' }),
    ).not.toBeVisible();

    await page.getByRole('button', { name: 'Optimize & continue' }).click();
    await expect(page.getByAltText('Upload preview')).toBeVisible();
  });

  for (const aiCase of AI_CASES) {
    test(`${aiCase.feature} completes the mocked job flow`, async ({
      page,
    }) => {
      const initialRemaining = aiCase.maxLimit - 1;
      const api = await mockPixelForgeApi(page, {
        usageSequences: {
          [aiCase.feature]: [
            initialRemaining,
            initialRemaining - 1,
          ],
        },
      });

      await page.goto(aiCase.route);

      await expect(
        page.getByText(
          `${initialRemaining} of ${aiCase.maxLimit} uses available`,
        ),
      ).toBeVisible();

      await uploadDropzoneFile(page, aiCase.fixture);

      if (aiCase.feature === 'objectremove') {
        await paintObjectMask(page);
      } else {
        await expect(
          page.getByAltText('Upload preview'),
        ).toBeVisible();
      }

      if (aiCase.feature === 'upscale') {
        await page.getByRole('button', {
          name: '3x',
          exact: true,
        }).click();
      }

      await page.getByRole('button', {
        name: aiCase.submitName,
        exact: true,
      }).click();

      await expect(
        page
          .getByRole('complementary')
          .getByText('Processing', { exact: true }),
      ).toBeVisible();

      await expect(
        page.getByAltText('Processed result'),
      ).toBeVisible({ timeout: 12_000 });

      await expect(
        page.getByRole('link', { name: 'Export result' }),
      ).toBeVisible();

      expect(api.state.initBodies[aiCase.feature]).toHaveLength(1);
      expect(api.state.startBodies[aiCase.feature]).toHaveLength(1);
      expect(api.state.polls[aiCase.feature]).toBeGreaterThanOrEqual(2);

      if (aiCase.feature === 'upscale') {
        expect(api.state.startBodies.upscale[0].scale).toBe(3);
      }

      if (aiCase.feature === 'objectremove') {
        const objectUploads = api.state.uploads.filter((entry) =>
          entry.url.includes('/objectremove/'),
        );
        expect(objectUploads).toHaveLength(2);
        expect(
          objectUploads.some((entry) => entry.url.endsWith('/mask')),
        ).toBe(true);
      }
    });
  }

  test('object removal requires a painted selection', async ({ page }) => {
    await mockPixelForgeApi(page, {
      usageSequences: { objectremove: [4] },
    });
    await page.goto('/object-remove');

    await uploadDropzoneFile(page, fixturePaths.colorJpeg);

    await page.getByRole('button', {
      name: 'Remove Object',
      exact: true,
    }).click();

    await expect(
      page.getByRole('heading', { name: 'Selection required' }),
    ).toBeVisible();
    await expect(
      page.getByText('Please paint the object area first.'),
    ).toBeVisible();
  });

  test('mocked provider failure renders the shared failure state', async ({
    page,
  }) => {
    await mockPixelForgeApi(page, {
      usageSequences: { rembg: [4] },
      jobOutcomes: { rembg: 'failed' },
    });
    await page.goto('/remove-bg');

    await uploadDropzoneFile(page, fixturePaths.colorJpeg);
    await page.getByRole('button', {
      name: 'Remove Background',
      exact: true,
    }).click();

    await expect(
      page.getByRole('heading', { name: 'Processing failed' }),
    ).toBeVisible();
    await expect(
      page.getByText('E2E provider failure'),
    ).toBeVisible();
  });

  test('initial exhausted usage renders the quota card', async ({ page }) => {
    await mockPixelForgeApi(page, {
      usageSequences: { upscale: [0] },
    });
    await page.goto('/upscale');

    await expect(
      page.getByRole('heading', { name: 'Daily limit reached.' }),
    ).toBeVisible();
  });

  test('LIMIT_REACHED updates quota without inventing a modal contract', async ({
    page,
  }) => {
    await mockPixelForgeApi(page, {
      usageSequences: { upscale: [1, 0] },
      limitReachedFeature: 'upscale',
    });
    await page.goto('/upscale');

    await uploadDropzoneFile(page, fixturePaths.colorJpeg);
    await page.getByRole('button', {
      name: 'Upscale Image',
      exact: true,
    }).click();

    await expect(
      page.getByText('0 of 3 uses available'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Upscale Image',
        exact: true,
      }),
    ).toBeVisible();
  });
  test('object removal keeps mask actions visible on a short desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await mockPixelForgeApi(page, {
      usageSequences: { objectremove: [4] },
    });
    await page.goto('/object-remove');

    await uploadDropzoneFile(page, fixturePaths.colorJpeg);
    await page.evaluate(() => window.scrollTo(0, 0));

    const mask = page.getByLabel('Object removal mask');
    await expect(mask).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Clear Mask' }),
    ).toBeInViewport();
    await expect(
      page.getByRole('button', {
        name: 'Remove Object',
        exact: true,
      }),
    ).toBeInViewport();
  });

});
