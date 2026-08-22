/**
 * Frontend runtime configuration for PixelForge.
 *
 * This module centralizes client-side constants used across tools, workspaces,
 * marketing showcases, storage keys, watermark controls, and validation UI. Keep
 * only browser-safe values here; secrets must stay on the backend.
 */

import logoIcon from './assets/PixelForge.png';
import logoTextBlack from './assets/PixelForgeAI_BlackText.png';
import logoTextWhite from './assets/PixelForgeAI_WhiteText.png';
import logoFullBlack from './assets/PixelForgeAI_Black.png';
import logoFullWhite from './assets/PixelForgeAI.png';
import logoSvg from './assets/PixelForge.svg';
import PixelForgeChatbot from './assets/PixelForgeChatbot.png';

export const AppConfig = {
  // Fallback limits only. Runtime validation should prefer GET /api/limits.
  MAX_FILE_SIZE_MB: 10,
  MAX_MEGAPIXELS: 3,
  MAX_PIXELS: 3_000_000,
  MAX_RESULT_FILE_SIZE_MB: 15,

  COMPRESS_MAX_SIZE_MB: 15,
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],

  RESULT_EXPIRATION_TIME: 10 * 60 * 1000,
  DAY_MS: 24 * 60 * 60 * 1000,

  API_URL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api',

  UPLOAD_DRAFT_EXPIRATION_TIME: 10 * 60 * 1000,
};

export const FILE_VALIDATION_CONFIG = {
  RUNTIME_LIMIT_CACHE_MS: 10 * 60 * 1000,
  IMAGE_LOAD_TIMEOUT_MS: 5000,

  GRAYSCALE_SAMPLE_SIZE: 100,
  GRAYSCALE_ALPHA_THRESHOLD: 20,
  GRAYSCALE_COLOR_DELTA_THRESHOLD: 35,
  GRAYSCALE_COLOR_RATIO_THRESHOLD: 0.05,
};

export const STORAGE_KEYS = {
  JOB_ID: 'pf_job_id',
  PROGRESS: 'pf_progress',
  RESULT_URL: 'pf_result_url',
  IS_PROCESSING: 'pf_is_processing',
  REFRESH_COUNT: 'pf_refresh_count',
  RESULT_TIMESTAMP: 'pf_result_timestamp',
  ALERT: 'pf_alert',
  UPSCALE_HISTORY: 'pf_upscale_history',
  UPLOAD_TIMESTAMP: 'pf_upload_timestamp',
  RUNTIME_LIMITS: 'pf_runtime_limits',
};

export const IMAGES = {
  icon: logoIcon,
  textBlack: logoTextBlack,
  textWhite: logoTextWhite,
  darkLogo: logoFullBlack,
  lightLogo: logoFullWhite,
  svg: logoSvg,
  chatbotIcon: PixelForgeChatbot,
};

export const FEATURE_LIMITS = {
  default: 3,
  upscale: 3,
  rembg: 5,
  colorrestore: 5,
  objectremove: 5,
  feedback: 3,
};

export const RESULT_LABELS = {
  upscale: 'Upscaled',
  rembg: 'Background Removed',
  colorrestore: 'Color Restored',
  objectremove: 'Object Removed',
};
