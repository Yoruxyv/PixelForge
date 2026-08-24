import {
  encodeImageCanvas,
  prepareImageCanvas,
} from '@/shared/lib/image/imageUtils';

export const MIN_TARGET_QUALITY = 0.1;
export const MAX_TARGET_QUALITY = 0.9;
export const TARGET_SEARCH_ITERATIONS = 7;
export const MAX_TARGET_ENCODE_ATTEMPTS = TARGET_SEARCH_ITERATIONS + 2;

const BYTES_PER_MB = 1024 * 1024;

/** Convert and validate a maximum target size entered in megabytes. */
export const validateTargetSize = (value, sourceBytes) => {
  if (String(value).trim() === '') {
    return { isValid: false, targetBytes: null };
  }

  const targetMB = Number(value);
  const targetBytes = targetMB * BYTES_PER_MB;
  const isValid =
    Number.isFinite(targetMB) &&
    targetMB > 0 &&
    Number.isFinite(sourceBytes) &&
    sourceBytes > 0 &&
    targetBytes < sourceBytes;

  return { isValid, targetBytes: isValid ? targetBytes : null };
};

/**
 * Find the highest practical JPEG quality at or below a target byte size.
 * The source is decoded and drawn once; only canvas encoding is repeated.
 */
export const compressImageToTargetSize = async (file, targetBytes) => {
  if (!Number.isFinite(targetBytes) || targetBytes <= 0) {
    throw new Error('Enter a valid target size.');
  }

  const canvas = await prepareImageCanvas(file, { fillBackground: true });
  const width = canvas.width;
  const height = canvas.height;
  let attempts = 0;

  const encode = async (quality) => {
    attempts += 1;
    return encodeImageCanvas(canvas, 'image/jpeg', quality);
  };

  try {
    const maximumQualityBlob = await encode(MAX_TARGET_QUALITY);
    if (maximumQualityBlob.size <= targetBytes) {
      return {
        blob: maximumQualityBlob,
        quality: MAX_TARGET_QUALITY,
        targetReached: true,
        attempts,
        width,
        height,
      };
    }

    const minimumQualityBlob = await encode(MIN_TARGET_QUALITY);
    if (minimumQualityBlob.size > targetBytes) {
      return {
        blob: minimumQualityBlob,
        quality: MIN_TARGET_QUALITY,
        targetReached: false,
        attempts,
        width,
        height,
      };
    }

    let lowerQuality = MIN_TARGET_QUALITY;
    let upperQuality = MAX_TARGET_QUALITY;
    let bestBlob = minimumQualityBlob;
    let bestQuality = MIN_TARGET_QUALITY;

    for (let index = 0; index < TARGET_SEARCH_ITERATIONS; index += 1) {
      const candidateQuality = (lowerQuality + upperQuality) / 2;
      const candidateBlob = await encode(candidateQuality);

      if (candidateBlob.size <= targetBytes) {
        bestBlob = candidateBlob;
        bestQuality = candidateQuality;
        lowerQuality = candidateQuality;
      } else {
        upperQuality = candidateQuality;
      }
    }

    return {
      blob: bestBlob,
      quality: bestQuality,
      targetReached: true,
      attempts,
      width,
      height,
    };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
};
