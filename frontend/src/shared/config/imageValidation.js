/** Browser-side image limits used when backend runtime limits are unavailable. */
export const FILE_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_MEGAPIXELS: 3,
  MAX_PIXELS: 3_000_000,
  MAX_RESULT_FILE_SIZE_MB: 15,
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
};

/**
 * Warn once a decoded RGBA buffer alone is roughly 400 MB; processing may
 * require multiple buffers, but the user can still continue on capable devices.
 */
export const BROWSER_MEMORY_WARNING_PIXELS = 100_000_000;
export const BROWSER_UPLOAD_HELPER_TEXT =
  'JPG, JPEG, PNG, WEBP · Processed locally in your browser';

const BROWSER_UPLOAD_POLICY = Object.freeze({
  fileSizeMode: 'none',
  resolutionMode: 'warn',
  warningPixels: BROWSER_MEMORY_WARNING_PIXELS,
});

/** Tool-aware upload behavior layered over shared format/decode validation. */
export const UPLOAD_POLICIES = Object.freeze({
  DEFAULT: BROWSER_UPLOAD_POLICY,
  BROWSER: BROWSER_UPLOAD_POLICY,
  AI: Object.freeze({
    fileSizeMode: 'confirm',
    resolutionMode: 'confirm',
    showAiLimits: true,
    usesBackendLimits: true,
  }),
  COMPRESSION: Object.freeze({
    fileSizeMode: 'none',
    resolutionMode: 'warn',
    warningPixels: BROWSER_MEMORY_WARNING_PIXELS,
  }),
});

/** Timing and sampling thresholds for shared upload validation. */
export const FILE_VALIDATION_CONFIG = {
  RUNTIME_LIMIT_CACHE_MS: 10 * 60 * 1000,
  IMAGE_LOAD_TIMEOUT_MS: 5000,
  GRAYSCALE_SAMPLE_SIZE: 100,
  GRAYSCALE_ALPHA_THRESHOLD: 20,
  GRAYSCALE_COLOR_DELTA_THRESHOLD: 35,
  GRAYSCALE_COLOR_RATIO_THRESHOLD: 0.05,
};
