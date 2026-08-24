/**
 * Browser-side image optimization helpers.
 *
 * These helpers downscale oversized images before upload so the backend,
 * Azure storage, and AI providers receive safer payloads. Backend validation
 * remains the security boundary because browser-side optimization can be
 * bypassed.
 */

/**
 * Return whether an image exceeds the configured pixel limit.
 *
 * @param {{pixels: number}} metadata - Decoded image metadata.
 * @param {number} maxPixels - Maximum recommended pixel count.
 * @returns {boolean} Whether the image should be optimized.
 */
export const shouldOptimizeResolution = (metadata, maxPixels) =>
  metadata.pixels > maxPixels;

/**
 * Resolve the browser canvas output MIME type for an uploaded image.
 *
 * @param {File|Blob} file - Uploaded image file.
 * @returns {string} Canvas output MIME type.
 */
const getOutputMimeType = (file) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return file.type;
  }

  return 'image/jpeg';
};

/**
 * Encode a canvas into a Blob.
 *
 * @param {HTMLCanvasElement} canvas - Canvas containing the resized image.
 * @param {string} mimeType - Output MIME type.
 * @param {number|undefined} quality - Optional lossy encoding quality.
 * @returns {Promise<Blob>} Encoded image blob.
 */
const canvasToBlob = (
  canvas,
  mimeType,
  quality = mimeType === 'image/png' ? undefined : 0.92,
) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to optimize image.'));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });

const OUTPUT_QUALITIES = [0.92, 0.85, 0.78, 0.7, 0.62];

const getTargetDimensions = (metadata, maxPixels) => {
  if (metadata.pixels <= maxPixels) {
    return { width: metadata.width, height: metadata.height };
  }

  const scale = Math.sqrt(maxPixels / metadata.pixels);
  return {
    width: Math.max(1, Math.floor(metadata.width * scale)),
    height: Math.max(1, Math.floor(metadata.height * scale)),
  };
};

const drawImageToCanvas = (file, image, width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', {
    alpha: file.type === 'image/png' || file.type === 'image/webp',
  });

  if (!context) {
    throw new Error('Image optimization is not supported in this browser.');
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas;
};

const replaceFileExtension = (filename, mimeType) => {
  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
  const base = filename.replace(/\.[^.]+$/, '');
  return `${base}.${extension}`;
};

const encodeWithinLimit = async (canvas, file, maxFileSizeBytes) => {
  const sourceMimeType = getOutputMimeType(file);
  const candidates =
    sourceMimeType === 'image/png'
      ? [
          { mimeType: 'image/png', quality: undefined },
          ...OUTPUT_QUALITIES.map((quality) => ({
            mimeType: 'image/webp',
            quality,
          })),
        ]
      : OUTPUT_QUALITIES.map((quality) => ({
          mimeType: sourceMimeType,
          quality,
        }));

  for (const candidate of candidates) {
    const blob = await canvasToBlob(
      canvas,
      candidate.mimeType,
      candidate.quality,
    );
    if (blob.size <= maxFileSizeBytes) return blob;
  }

  throw new Error(
    'This image could not be optimized below the AI upload limit without reducing quality further. Choose another image.',
  );
};

/**
 * Downscale an image file so its total pixels fit within ``maxPixels``.
 *
 * @param {File} file - Original uploaded image file.
 * @param {HTMLImageElement} image - Loaded browser image.
 * @param {{width: number, height: number, pixels: number}} metadata - Original metadata.
 * @param {number} maxPixels - Target pixel limit.
 * @returns {Promise<{file: File, metadata: object, optimization: object}>}
 * Optimized file, updated metadata, and optimization details.
 */
export const optimizeImageResolution = async (
  file,
  image,
  metadata,
  maxPixels,
) => {
  const { width, height } = getTargetDimensions(metadata, maxPixels);
  const canvas = drawImageToCanvas(file, image, width, height);

  const mimeType = getOutputMimeType(file);
  const blob = await canvasToBlob(canvas, mimeType);
  const optimizedFile = new File([blob], file.name, {
    type: mimeType,
    lastModified: Date.now(),
  });

  return {
    file: optimizedFile,
    metadata: {
      width,
      height,
      pixels: width * height,
      megapixels: (width * height) / 1_000_000,
    },
    optimization: {
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      originalPixels: metadata.pixels,
      optimizedWidth: width,
      optimizedHeight: height,
      optimizedPixels: width * height,
    },
  };
};

/**
 * Encode an AI source beneath the backend byte limit, resizing only when the
 * decoded image also exceeds the backend processing-resolution limit.
 */
export const optimizeImageForUpload = async (
  file,
  image,
  metadata,
  maxPixels,
  maxFileSizeBytes,
) => {
  const { width, height } = getTargetDimensions(metadata, maxPixels);
  const canvas = drawImageToCanvas(file, image, width, height);
  const blob = await encodeWithinLimit(canvas, file, maxFileSizeBytes);
  const mimeType = blob.type || getOutputMimeType(file);
  const optimizedFile = new File(
    [blob],
    mimeType === file.type
      ? file.name
      : replaceFileExtension(file.name, mimeType),
    {
      type: mimeType,
      lastModified: Date.now(),
    },
  );

  return {
    file: optimizedFile,
    metadata: {
      width,
      height,
      pixels: width * height,
      megapixels: (width * height) / 1_000_000,
    },
    optimization: {
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      originalPixels: metadata.pixels,
      optimizedWidth: width,
      optimizedHeight: height,
      optimizedPixels: width * height,
      originalBytes: file.size,
      optimizedBytes: optimizedFile.size,
      formatChanged: mimeType !== file.type,
    },
  };
};
