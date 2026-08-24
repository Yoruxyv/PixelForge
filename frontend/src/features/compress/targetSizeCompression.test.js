import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  compressImageToTargetSize,
  MAX_TARGET_ENCODE_ATTEMPTS,
  MAX_TARGET_QUALITY,
  MIN_TARGET_QUALITY,
  validateTargetSize,
} from './targetSizeCompression';

const mocks = vi.hoisted(() => ({
  encodeImageCanvas: vi.fn(),
  prepareImageCanvas: vi.fn(),
}));

vi.mock('@/shared/lib/image/imageUtils', () => ({
  encodeImageCanvas: mocks.encodeImageCanvas,
  prepareImageCanvas: mocks.prepareImageCanvas,
}));

const source = new File(['source'], 'source.png', { type: 'image/png' });
let preparedCanvas;

beforeEach(() => {
  vi.clearAllMocks();
  preparedCanvas = { width: 1600, height: 1200 };
  mocks.prepareImageCanvas.mockResolvedValue(preparedCanvas);
});

describe('compressImageToTargetSize', () => {
  it('chooses the highest bounded quality that satisfies an achievable target', async () => {
    const targetBytes = 5 * 1024 * 1024;
    mocks.encodeImageCanvas.mockImplementation((canvas, mimeType, quality) =>
      Promise.resolve({
        size: quality <= 0.7 ? 4 * 1024 * 1024 : 6 * 1024 * 1024,
      }),
    );

    const result = await compressImageToTargetSize(source, targetBytes);

    expect(result).toMatchObject({
      targetReached: true,
      width: 1600,
      height: 1200,
    });
    expect(result.blob.size).toBeLessThanOrEqual(targetBytes);
    expect(result.quality).toBeGreaterThanOrEqual(0.69);
    expect(result.quality).toBeLessThanOrEqual(0.7);
    expect(MAX_TARGET_ENCODE_ATTEMPTS).toBe(9);
    expect(result.attempts).toBeLessThanOrEqual(MAX_TARGET_ENCODE_ATTEMPTS);
    expect(mocks.prepareImageCanvas).toHaveBeenCalledTimes(1);
    expect(mocks.prepareImageCanvas).toHaveBeenCalledWith(source, {
      fillBackground: true,
    });
    expect(mocks.encodeImageCanvas).toHaveBeenCalledWith(
      preparedCanvas,
      'image/jpeg',
      expect.any(Number),
    );
    expect(
      new Set(mocks.encodeImageCanvas.mock.calls.map(([canvas]) => canvas)).size,
    ).toBe(1);
    expect(preparedCanvas).toEqual({ width: 0, height: 0 });
  });

  it('keeps quality 0.90 when it already satisfies the target', async () => {
    mocks.encodeImageCanvas.mockResolvedValue({ size: 4 * 1024 * 1024 });

    const result = await compressImageToTargetSize(source, 8 * 1024 * 1024);

    expect(result).toMatchObject({
      quality: MAX_TARGET_QUALITY,
      targetReached: true,
      attempts: 1,
    });
    expect(mocks.encodeImageCanvas).toHaveBeenCalledTimes(1);
  });

  it('returns the minimum-quality result when the target is impossible', async () => {
    mocks.encodeImageCanvas.mockImplementation((canvas, mimeType, quality) =>
      Promise.resolve({ size: quality === MIN_TARGET_QUALITY ? 650_000 : 900_000 }),
    );

    const result = await compressImageToTargetSize(source, 200_000);

    expect(result).toMatchObject({
      quality: MIN_TARGET_QUALITY,
      targetReached: false,
      attempts: 2,
      blob: { size: 650_000 },
    });
    expect(mocks.encodeImageCanvas).toHaveBeenCalledTimes(2);
  });
});

describe('validateTargetSize', () => {
  it.each(['', 0, -1, 'not-a-number', Number.POSITIVE_INFINITY])(
    'rejects invalid target %s',
    (value) => {
      expect(validateTargetSize(value, 10 * 1024 * 1024)).toEqual({
        isValid: false,
        targetBytes: null,
      });
    },
  );

  it.each([
    { relation: 'equal to', targetMB: 5 },
    { relation: 'larger than', targetMB: 6 },
  ])('rejects a target $relation the source', ({ targetMB }) => {
    expect(validateTargetSize(targetMB, 5 * 1024 * 1024).isValid).toBe(
      false,
    );
  });

  it('accepts a positive decimal target smaller than the source', () => {
    expect(validateTargetSize(1.5, 5 * 1024 * 1024)).toEqual({
      isValid: true,
      targetBytes: 1.5 * 1024 * 1024,
    });
  });

  it('does not impose an arbitrary positive minimum', () => {
    expect(validateTargetSize(0.000001, 5 * 1024 * 1024).isValid).toBe(true);
  });
});
