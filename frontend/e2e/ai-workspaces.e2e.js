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
});
