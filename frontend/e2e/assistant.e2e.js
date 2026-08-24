import { test, expect } from '@playwright/test';

test.describe('PixelForge assistant', () => {
  test('launcher opens, closes, and completes an FAQ search flow', async ({
    page,
  }) => {
    const assistantAssetRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('PixelForgeChatbot')) {
        assistantAssetRequests.push(request.url());
      }
    });

    await page.goto('/');
    expect(assistantAssetRequests).toHaveLength(0);

    await page.getByRole('button', { name: 'Open help' }).click();
    await expect(
      page.getByRole('heading', { name: 'PixelForge Assistant' }),
    ).toBeVisible();
    expect(assistantAssetRequests.length).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Close help' }).click();
    await expect(
      page.getByRole('heading', { name: 'PixelForge Assistant' }),
    ).not.toBeVisible();

    await page.getByRole('button', { name: 'Open help' }).click();

    const search = page.getByPlaceholder(
      'Ask anything about PixelForge...',
    );
    await search.fill('upscale');

    const question = page.getByRole('button', {
      name: /How do I upscale an image\?/,
    });
    await expect(question).toBeVisible();
    await question.click();

    await expect(
      page.getByText(
        'Open Upscale Image, upload your file, and process. PixelForge enhances resolution while preserving details.',
      ),
    ).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', {
      name: 'Close chatbot',
    }).click();
    await expect(
      page.getByRole('button', { name: 'Open help' }),
    ).toBeVisible();
  });
});
