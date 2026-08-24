import { afterEach, describe, expect, it, vi } from 'vitest';
import { optimizeImageForUpload } from './imageOptimization';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('optimizeImageForUpload', () => {
  it('tries progressively smaller encodings while preserving dimensions', async () => {
    const qualities = [];
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: vi.fn() }),
      toBlob: (callback, mimeType, quality) => {
        qualities.push(quality);
        const blob = new Blob(['encoded'], { type: mimeType });
        Object.defineProperty(blob, 'size', {
          value: quality > 0.78 ? 12 * 1024 * 1024 : 8 * 1024 * 1024,
        });
        callback(blob);
      },
    };
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) =>
      tagName === 'canvas' ? canvas : createElement(tagName),
    );
    const file = new File(['source'], 'photo.jpg', { type: 'image/jpeg' });

    const result = await optimizeImageForUpload(
      file,
      {},
      { width: 1600, height: 1200, pixels: 1_920_000 },
      3_000_000,
      10 * 1024 * 1024,
    );

    expect(qualities).toEqual([0.92, 0.85, 0.78]);
    expect(canvas).toMatchObject({ width: 1600, height: 1200 });
    expect(result.metadata).toMatchObject({
      width: 1600,
      height: 1200,
      pixels: 1_920_000,
    });
  });
});
