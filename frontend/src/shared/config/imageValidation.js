/** Browser-side image limits used when backend runtime limits are unavailable. */
export const FILE_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_MEGAPIXELS: 3,
  MAX_PIXELS: 3_000_000,
  MAX_RESULT_FILE_SIZE_MB: 15,
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
};

/** Timing and sampling thresholds for shared upload validation. */
export const FILE_VALIDATION_CONFIG = {
  RUNTIME_LIMIT_CACHE_MS: 10 * 60 * 1000,
  IMAGE_LOAD_TIMEOUT_MS: 5000,
  GRAYSCALE_SAMPLE_SIZE: 100,
  GRAYSCALE_ALPHA_THRESHOLD: 20,
  GRAYSCALE_COLOR_DELTA_THRESHOLD: 35,
  GRAYSCALE_COLOR_RATIO_THRESHOLD: 0.05,
};
