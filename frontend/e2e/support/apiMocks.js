import { fixturePaths } from './fixturePaths';

const FEATURE_LIMITS = Object.freeze({
  upscale: 3,
  rembg: 5,
  colorrestore: 5,
  objectremove: 5,
});

const DISPLAY_NAMES = Object.freeze({
  upscale: 'Upscale',
  rembg: 'RemBG',
  colorrestore: 'Color Restore',
  objectremove: 'Object Remove',
});

const JOB_IDS = Object.freeze({
  upscale: '11111111111111111111111111111111',
  rembg: '22222222222222222222222222222222',
  colorrestore: '33333333333333333333333333333333',
  objectremove: '44444444444444444444444444444444',
});

const FEATURES_BY_JOB = Object.freeze(
  Object.fromEntries(
    Object.entries(JOB_IDS).map(([feature, jobId]) => [jobId, feature]),
  ),
);

const RESULT_PATH_PATTERN = /^\/api\/result\/([a-f0-9]{32})$/;

const RUNTIME_LIMITS = Object.freeze({
  upload: {
    max_file_size_mb: 10,
    max_file_size_bytes: 10 * 1024 * 1024,
    max_megapixels: 3,
    max_pixels: 3_000_000,
    allowed_extensions: ['jpg', 'jpeg', 'png', 'webp'],
  },
  result: {
    max_result_file_size_mb: 15,
    max_result_file_size_bytes: 15 * 1024 * 1024,
    max_image_dimension: 8192,
    min_output_dimension: 64,
    output_shrink_step: 0.9,
  },
  upscale: {
    default_scale: 2,
    max_output_pixels: 16_000_000,
  },
  features: FEATURE_LIMITS,
});

function sequenceValue(sequence, requestIndex, fallback) {
  if (!Array.isArray(sequence) || sequence.length === 0) return fallback;
  return sequence[Math.min(requestIndex, sequence.length - 1)];
}

function jsonResponse(route, body, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function mockPixelForgeApi(page, options = {}) {
  const {
    usageSequences = {},
    deferUsageFeature = null,
    jobOutcomes = {},
    limitReachedFeature = null,
  } = options;

  const state = {
    usageRequests: {},
    initBodies: {},
    startBodies: {},
    uploads: [],
    polls: {},
  };

  let releaseDeferredUsage = null;
  let deferredUsageReleased = deferUsageFeature == null;
  const deferredUsagePromise =
    deferUsageFeature == null
      ? Promise.resolve()
      : new Promise((resolve) => {
          releaseDeferredUsage = resolve;
        });

  const fulfillUsageRequest = async (route, feature) => {
    const currentIndex = state.usageRequests[feature] ?? 0;
    state.usageRequests[feature] = currentIndex + 1;

    if (
      feature === deferUsageFeature &&
      !deferredUsageReleased
    ) {
      await deferredUsagePromise;
    }

    const fallback = FEATURE_LIMITS[feature] ?? 3;
    const remaining = sequenceValue(
      usageSequences[feature],
      currentIndex,
      fallback,
    );

    await jsonResponse(route, {
      uses_remaining: remaining,
      reset_timestamp: 2_000_000_000_000,
    });
  };

  await page.route('**/__e2e-blob/**', async (route) => {
    state.uploads.push({
      url: route.request().url(),
      method: route.request().method(),
      contentType: route.request().headers()['content-type'] ?? '',
    });

    await route.fulfill({
      status: 201,
      body: '',
    });
  });

  await page.route('**/__e2e-result/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      path: fixturePaths.transparentPng,
    });
  });

  await page.route(
    /^https?:\/\/[^/]+\/api[/?]/,
    async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (pathname === '/api/limits') {
      await jsonResponse(route, RUNTIME_LIMITS);
      return;
    }

    if (pathname === '/api/usage') {
      const feature = url.searchParams.get('feature') || 'upscale';
      await fulfillUsageRequest(route, feature);
      return;
    }

    const initMatch = pathname.match(
      /^\/api\/(upscale|rembg|colorrestore|objectremove)\/init$/,
    );

    if (initMatch) {
      const feature = initMatch[1];
      const body = request.postDataJSON();
      state.initBodies[feature] = [
        ...(state.initBodies[feature] ?? []),
        body,
      ];

      if (feature === limitReachedFeature) {
        await jsonResponse(
          route,
          {
            detail: {
              code: 'LIMIT_REACHED',
              message: 'Daily limit reached.',
            },
          },
          429,
        );
        return;
      }

      const jobId = JOB_IDS[feature];
      const response = {
        job_id: jobId,
        safe_filename: `${jobId}-${body.filename}`,
        upload_url: `/__e2e-blob/${feature}/${jobId}/source`,
      };

      if (feature === 'objectremove') {
        response.mask_filename = `${jobId}-mask.png`;
        response.mask_upload_url =
          `/__e2e-blob/${feature}/${jobId}/mask`;
      }

      await jsonResponse(route, response);
      return;
    }

    const startMatch = pathname.match(
      /^\/api\/(upscale|rembg|colorrestore|objectremove)\/start$/,
    );

    if (startMatch) {
      const feature = startMatch[1];
      const body = request.postDataJSON();
      state.startBodies[feature] = [
        ...(state.startBodies[feature] ?? []),
        body,
      ];

      await jsonResponse(
        route,
        {
          message: `${DISPLAY_NAMES[feature]} started`,
          job_id: body.job_id,
        },
        202,
      );
      return;
    }

    const resultMatch = RESULT_PATH_PATTERN.exec(pathname);

    if (resultMatch) {
      const jobId = resultMatch[1];
      const feature = FEATURES_BY_JOB[jobId];
      const pollIndex = state.polls[feature] ?? 0;
      state.polls[feature] = pollIndex + 1;

      if (jobOutcomes[feature] === 'failed') {
        await jsonResponse(route, {
          status: 'failed',
          code: 'PROVIDER_ERROR',
          message: 'E2E provider failure',
        });
        return;
      }

      if (pollIndex === 0) {
        await jsonResponse(route, { status: 'processing' });
        return;
      }

      await jsonResponse(route, {
        status: 'ready',
        url: `/__e2e-result/${feature}.png`,
      });
      return;
    }

      await route.abort('blockedbyclient');
    },
  );

  return {
    state,
    releaseUsage() {
      deferredUsageReleased = true;
      releaseDeferredUsage?.();
    },
  };
}
