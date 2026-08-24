/**
 * Public file validation entrypoint for PixelForge uploads.
 *
 * This module intentionally keeps ``validateImageUpload`` as the stable public
 * function used by upload hooks/components, while delegating each validation
 * responsibility to focused modules under ``utils/file/validation``.
 *
 * Validation flow:
 *   1. Ensure a file exists.
 *   2. Resolve backend-owned runtime upload/result limits.
 *   3. Check file byte size.
 *   4. Check MIME type.
 *   5. Decode the image and read metadata.
 *   6. Check decoded resolution.
 *   7. Optionally check grayscale suitability for color restoration.
 *
 * Frontend validation improves UX only. Backend validation remains the security
 * boundary because client-side checks can be bypassed.
 */

import { ERROR_MESSAGES, invalidResult } from './validators/errorMessages';
import {
  getFallbackLimits,
  getRuntimeLimits,
  resolveUploadSizeLimit,
} from './validators/runtimeLimits';
import { UPLOAD_POLICIES } from '@/shared/config/imageValidation';
import {
  getAllowedMimeTypes,
  validateMimeType,
} from './validators/mimeValidation';
import { loadImageMetadata } from './validators/imageMetadata';
import { validateResolution } from './validators/resolutionValidation';
import { validateGrayscaleImage } from './validators/grayscaleValidation';
import {
  optimizeImageForUpload,
  optimizeImageResolution,
  shouldOptimizeResolution,
} from './validators/imageOptimization';

/**
 * Build a successful validation result.
 *
 * @param {File|Blob} file - Original uploaded file/blob.
 * @param {object} metadata - Decoded image metadata.
 * @returns {{isValid: true, file: File|Blob, metadata: object}} Success result.
 */
const validResult = (file, metadata, extra = {}) => ({
  isValid: true,
  file,
  metadata,
  ...extra,
});

/**
 * Validate uploaded image byte size.
 *
 * @param {File|Blob} file - User-selected file/blob.
 * @param {object} limits - Runtime limits from backend or fallback config.
 * @param {number|null} customMaxSizeMB - Optional upload-size override in MB.
 * @returns {{isValid: false, error: string}|null} Invalid result, or ``null``
 * when the file is within the allowed byte limit.
 */
const validateFileSize = (file, limits, customMaxSizeMB = null) => {
  const { limitMB, maxFileSizeBytes } = resolveUploadSizeLimit(
    limits,
    customMaxSizeMB,
  );

  if (file.size > maxFileSizeBytes) {
    return invalidResult(`File size exceeds the ${limitMB}MB limit.`);
  }

  return null;
};

/** Apply the selected policy when decoded resolution exceeds the active limit. */
const handleResolutionPolicy = async ({
  file,
  image,
  metadata,
  limits,
  uploadPolicy,
  requireGrayscale,
}) => {
  const resolutionLimit =
    uploadPolicy.resolutionMode === 'warn'
      ? uploadPolicy.warningPixels
      : limits.upload.max_pixels;

  if (!shouldOptimizeResolution(metadata, resolutionLimit)) {
    return { file, image, metadata };
  }

  if (uploadPolicy.resolutionMode === 'warn') {
    return {
      result: validResult(file, metadata, {
        requiresLargeImageConfirmation: true,
        warningPixelThreshold: uploadPolicy.warningPixels,
      }),
    };
  }

  if (uploadPolicy.resolutionMode === 'confirm') {
    if (requireGrayscale) {
      const grayscaleError = validateGrayscaleImage(image);
      if (grayscaleError) return { result: grayscaleError };
    }

    const { limitMB } = resolveUploadSizeLimit(limits);

    return {
      result: validResult(file, metadata, {
        requiresResizeConfirmation: true,
        fileSizeLimitMB: limitMB,
        resolutionLimit: {
          maxPixels: limits.upload.max_pixels,
          maxMegapixels: limits.upload.max_megapixels,
        },
      }),
    };
  }

  if (uploadPolicy.resolutionMode !== 'auto') {
    return { file, image, metadata };
  }

  const optimized = await optimizeImageResolution(
    file,
    image,
    metadata,
    limits.upload.max_pixels,
  );
  const sizeError = validateFileSize(optimized.file, limits);

  if (sizeError) return { result: sizeError };

  const imageResult = await loadImageMetadata(optimized.file);
  if (!imageResult.isValid) return { result: imageResult };

  return {
    file: optimized.file,
    image: imageResult.image,
    metadata: imageResult.metadata,
    wasOptimized: true,
    optimization: optimized.optimization,
  };
};

const handleFileSizePolicy = async ({
  file,
  imageResult,
  limits,
  uploadPolicy,
  requireGrayscale,
}) => {
  const exceedsFileSize =
    uploadPolicy.usesBackendLimits &&
    file.size > limits.upload.max_file_size_bytes;

  if (uploadPolicy.fileSizeMode === 'confirm' && exceedsFileSize) {
    if (requireGrayscale) {
      const grayscaleError = validateGrayscaleImage(imageResult.image);
      if (grayscaleError) return { result: grayscaleError };
    }

    return {
      result: validResult(file, imageResult.metadata, {
        requiresAiOptimizationConfirmation: true,
        alsoExceedsResolution: shouldOptimizeResolution(
          imageResult.metadata,
          limits.upload.max_pixels,
        ),
        fileSizeLimitMB: limits.upload.max_file_size_mb,
        fileSizeLimitBytes: limits.upload.max_file_size_bytes,
        actualFileSizeBytes: file.size,
        resolutionLimit: {
          maxPixels: limits.upload.max_pixels,
          maxMegapixels: limits.upload.max_megapixels,
        },
      }),
    };
  }

  if (uploadPolicy.fileSizeMode !== 'optimize' || !exceedsFileSize) {
    return { file, imageResult };
  }

  try {
    const optimized = await optimizeImageForUpload(
      file,
      imageResult.image,
      imageResult.metadata,
      limits.upload.max_pixels,
      limits.upload.max_file_size_bytes,
    );
    const optimizedImageResult = await loadImageMetadata(optimized.file);
    if (!optimizedImageResult.isValid) {
      return { result: optimizedImageResult };
    }

    return {
      file: optimized.file,
      imageResult: optimizedImageResult,
      wasOptimized: true,
      optimization: optimized.optimization,
    };
  } catch (error) {
    return {
      result: invalidResult(
        error instanceof Error
          ? error.message
          : 'This image could not be optimized for AI upload.',
      ),
    };
  }
};

/**
 * Validate whether an uploaded image is allowed.
 *
 * This function keeps the original return shape used by the rest of the app:
 *
 * Success:
 * ``{ isValid: true, file, metadata }``
 *
 * Failure:
 * ``{ isValid: false, error }``
 *
 * @param {File|Blob|null} file - File object from the dropzone/input.
 * @param {object} [uploadPolicy=UPLOAD_POLICIES.DEFAULT] - Tool-aware file-size
 * and decoded-resolution handling.
 * @param {boolean} [requireGrayscale=false] - If true, rejects images that
 * already contain significant color data.
 * @returns {Promise<
 *   | {isValid: true, file: File|Blob, metadata: object}
 *   | {isValid: false, error: string}
 * >} Validation result.
 */
export const validateImageUpload = async (
  file,
  uploadPolicy = UPLOAD_POLICIES.DEFAULT,
  requireGrayscale = false,
) => {
  if (!file) {
    return invalidResult(ERROR_MESSAGES.DEFAULT);
  }

  const limits =
    uploadPolicy.usesBackendLimits
      ? await getRuntimeLimits()
      : getFallbackLimits();

  const allowedMimeTypes = getAllowedMimeTypes(limits);
  const mimeError = validateMimeType(file, allowedMimeTypes);
  if (mimeError) return mimeError;

  const imageResult = await loadImageMetadata(file);

  if (!imageResult.isValid) return imageResult;

  const sizePrepared = await handleFileSizePolicy({
    file,
    imageResult,
    limits,
    uploadPolicy,
    requireGrayscale,
  });

  if (sizePrepared.result) return sizePrepared.result;

  const {
    file: workingFile,
    imageResult: preparedImageResult,
    wasOptimized: wasOptimizedForSize = false,
    optimization: sizeOptimization = null,
  } = sizePrepared;

  const prepared = await handleResolutionPolicy({
    file: workingFile,
    image: preparedImageResult.image,
    metadata: preparedImageResult.metadata,
    limits,
    uploadPolicy,
    requireGrayscale,
  });

  if (prepared.result) return prepared.result;

  const {
    file: validatedFile,
    image,
    metadata,
    wasOptimized = false,
    optimization = null,
  } = prepared;

  if (uploadPolicy.usesBackendLimits) {
    const sizeError = validateFileSize(validatedFile, limits);
    if (sizeError) return sizeError;

    const resolutionError = validateResolution(metadata, limits);
    if (resolutionError) return resolutionError;
  }

  if (requireGrayscale) {
    const grayscaleError = validateGrayscaleImage(image);
    if (grayscaleError) return grayscaleError;
  }

  return validResult(validatedFile, metadata, {
    wasOptimized: wasOptimized || wasOptimizedForSize,
    optimization: optimization || sizeOptimization,
  });
};
