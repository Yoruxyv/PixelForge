import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateImageUpload } from './fileValidation';
import {
  BROWSER_MEMORY_WARNING_PIXELS,
  UPLOAD_POLICIES,
} from '@/shared/config/imageValidation';

const mocks = vi.hoisted(() => ({
  getRuntimeLimits: vi.fn(),
  loadImageMetadata: vi.fn(),
  validateResolution: vi.fn(),
  optimizeImageResolution: vi.fn(),
  optimizeImageForUpload: vi.fn(),
}));

vi.mock('./validators/runtimeLimits', () => ({
  getRuntimeLimits: mocks.getRuntimeLimits,
  getFallbackLimits: () => runtimeLimits,
  resolveUploadSizeLimit: (limits, customMaxSizeMB = null) => ({
    limitMB: customMaxSizeMB ?? limits.upload.max_file_size_mb,
    maxFileSizeBytes:
      customMaxSizeMB != null
        ? customMaxSizeMB * 1024 * 1024
        : limits.upload.max_file_size_bytes,
  }),
}));

vi.mock('./validators/mimeValidation', () => ({
  getAllowedMimeTypes: () => ['image/png'],
  validateMimeType: () => null,
}));

vi.mock('./validators/imageMetadata', () => ({
  loadImageMetadata: mocks.loadImageMetadata,
}));

vi.mock('./validators/resolutionValidation', () => ({
  validateResolution: mocks.validateResolution,
}));

vi.mock('./validators/grayscaleValidation', () => ({
  validateGrayscaleImage: () => null,
}));

vi.mock('./validators/imageOptimization', () => ({
  shouldOptimizeResolution: (metadata, maxPixels) =>
    metadata.pixels > maxPixels,
  optimizeImageResolution: mocks.optimizeImageResolution,
  optimizeImageForUpload: mocks.optimizeImageForUpload,
}));

const runtimeLimits = {
  upload: {
    max_file_size_mb: 10,
    max_file_size_bytes: 10 * 1024 * 1024,
    max_megapixels: 3,
    max_pixels: 3_000_000,
  },
};

const oversizedMetadata = {
  width: 2000,
  height: 2000,
  pixels: 4_000_000,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getRuntimeLimits.mockResolvedValue(runtimeLimits);
  mocks.loadImageMetadata.mockResolvedValue({
    isValid: true,
    image: {},
    metadata: oversizedMetadata,
  });
  mocks.validateResolution.mockReturnValue({
    isValid: false,
    error: 'Image resolution is too large.',
  });
});

describe('validateImageUpload upload policies', () => {
  it('waits for AI consent before resizing an oversized image', async () => {
    const file = new File(['image'], 'large.png', { type: 'image/png' });

    const result = await validateImageUpload(file, UPLOAD_POLICIES.AI);

    expect(result).toMatchObject({
      isValid: true,
      file,
      requiresResizeConfirmation: true,
      fileSizeLimitMB: 10,
      resolutionLimit: { maxPixels: 3_000_000, maxMegapixels: 3 },
    });
    expect(mocks.optimizeImageResolution).not.toHaveBeenCalled();
    expect(mocks.validateResolution).not.toHaveBeenCalled();
  });

  it('preserves the existing resize path after consent', async () => {
    const file = new File(['image'], 'large.png', { type: 'image/png' });
    const resizedFile = new File(['resized'], 'large.png', {
      type: 'image/png',
    });
    const resizedMetadata = {
      width: 1732,
      height: 1732,
      pixels: 2_999_824,
    };

    mocks.optimizeImageResolution.mockResolvedValue({
      file: resizedFile,
      optimization: { optimizedPixels: resizedMetadata.pixels },
    });
    mocks.loadImageMetadata
      .mockResolvedValueOnce({
        isValid: true,
        image: {},
        metadata: oversizedMetadata,
      })
      .mockResolvedValueOnce({
        isValid: true,
        image: {},
        metadata: resizedMetadata,
      });
    mocks.validateResolution.mockReturnValue(null);

    const result = await validateImageUpload(file, {
      ...UPLOAD_POLICIES.AI,
      resolutionMode: 'auto',
    });

    expect(mocks.optimizeImageResolution).toHaveBeenCalledWith(
      file,
      {},
      oversizedMetadata,
      3_000_000,
    );
    expect(result).toMatchObject({
      isValid: true,
      file: resizedFile,
      wasOptimized: true,
    });
  });

  it.each([
    { width: 3000, height: 3000, pixels: 9_000_000 },
    { width: 6000, height: 5000, pixels: 30_000_000 },
  ])(
    'accepts a $pixels-pixel browser-only image unchanged',
    async (metadata) => {
      const file = new File(['image'], 'large.png', { type: 'image/png' });
      mocks.loadImageMetadata.mockResolvedValue({
        isValid: true,
        image: {},
        metadata,
      });

      const result = await validateImageUpload(file, UPLOAD_POLICIES.BROWSER);

      expect(result).toMatchObject({
        isValid: true,
        file,
        metadata,
      });
      expect(mocks.optimizeImageResolution).not.toHaveBeenCalled();
      expect(mocks.validateResolution).not.toHaveBeenCalled();
    },
  );

  it('accepts a browser-only file above the backend size limit', async () => {
    const file = {
      name: 'local-large.png',
      type: 'image/png',
      size: 16 * 1024 * 1024,
    };

    const result = await validateImageUpload(file, UPLOAD_POLICIES.BROWSER);

    expect(result).toMatchObject({ isValid: true, file });
    expect(mocks.getRuntimeLimits).not.toHaveBeenCalled();
  });

  it('warns instead of rejecting a very-high-resolution browser image', async () => {
    const file = new File(['image'], 'huge.png', { type: 'image/png' });
    const hugeMetadata = {
      width: 12000,
      height: 10000,
      pixels: 120_000_000,
    };
    mocks.loadImageMetadata.mockResolvedValue({
      isValid: true,
      image: {},
      metadata: hugeMetadata,
    });

    const result = await validateImageUpload(file, UPLOAD_POLICIES.BROWSER);

    expect(result).toMatchObject({
      isValid: true,
      file,
      metadata: hugeMetadata,
      requiresLargeImageConfirmation: true,
      warningPixelThreshold: BROWSER_MEMORY_WARNING_PIXELS,
    });
    expect(mocks.optimizeImageResolution).not.toHaveBeenCalled();
  });

  it('lets compression accept files above 10MB and images above 3MP', async () => {
    const file = {
      name: 'compress-locally.png',
      type: 'image/png',
      size: 16 * 1024 * 1024,
    };
    const metadata = { width: 6000, height: 5000, pixels: 30_000_000 };
    mocks.loadImageMetadata.mockResolvedValue({
      isValid: true,
      image: {},
      metadata,
    });

    const result = await validateImageUpload(
      file,
      UPLOAD_POLICIES.COMPRESSION,
    );

    expect(result).toMatchObject({
      isValid: true,
      file,
      metadata,
    });
    expect(mocks.optimizeImageResolution).not.toHaveBeenCalled();
    expect(mocks.validateResolution).not.toHaveBeenCalled();
  });

  it('offers optimization when an AI file exceeds the advertised size limit', async () => {
    mocks.getRuntimeLimits.mockResolvedValue({
      upload: {
        ...runtimeLimits.upload,
        max_file_size_mb: 8,
        max_file_size_bytes: 8 * 1024 * 1024,
      },
    });
    const file = {
      name: 'too-large.png',
      type: 'image/png',
      size: 8 * 1024 * 1024 + 1,
    };

    const result = await validateImageUpload(file, UPLOAD_POLICIES.AI);

    expect(result).toMatchObject({
      isValid: true,
      file,
      requiresAiOptimizationConfirmation: true,
      actualFileSizeBytes: file.size,
      fileSizeLimitMB: 8,
      fileSizeLimitBytes: 8 * 1024 * 1024,
      alsoExceedsResolution: true,
    });
    expect(mocks.optimizeImageForUpload).not.toHaveBeenCalled();
  });

  it('optimizes an oversized AI file before continuing through validation', async () => {
    const file = {
      name: 'large.jpg',
      type: 'image/jpeg',
      size: 14 * 1024 * 1024,
    };
    const metadata = { width: 1200, height: 1000, pixels: 1_200_000 };
    const optimizedFile = {
      name: 'large.jpg',
      type: 'image/jpeg',
      size: 7 * 1024 * 1024,
    };
    mocks.loadImageMetadata
      .mockResolvedValueOnce({ isValid: true, image: {}, metadata })
      .mockResolvedValueOnce({ isValid: true, image: {}, metadata });
    mocks.optimizeImageForUpload.mockResolvedValue({
      file: optimizedFile,
      optimization: {
        originalWidth: metadata.width,
        optimizedWidth: metadata.width,
      },
    });
    mocks.validateResolution.mockReturnValue(null);

    const result = await validateImageUpload(file, {
      ...UPLOAD_POLICIES.AI,
      fileSizeMode: 'optimize',
      resolutionMode: 'auto',
    });

    expect(mocks.optimizeImageForUpload).toHaveBeenCalledWith(
      file,
      {},
      metadata,
      3_000_000,
      10 * 1024 * 1024,
    );
    expect(result).toMatchObject({
      isValid: true,
      file: optimizedFile,
      wasOptimized: true,
    });
  });

  it('still rejects an image that the browser cannot decode', async () => {
    const file = new File(['broken'], 'broken.png', { type: 'image/png' });
    mocks.loadImageMetadata.mockResolvedValue({
      isValid: false,
      error: 'The image could not be decoded.',
    });

    const result = await validateImageUpload(file, UPLOAD_POLICIES.BROWSER);

    expect(result).toEqual({
      isValid: false,
      error: 'The image could not be decoded.',
    });
  });
});
