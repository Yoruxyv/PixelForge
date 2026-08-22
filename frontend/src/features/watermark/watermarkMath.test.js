import { describe, expect, it } from 'vitest';
import { constrainOverlayPosition } from './watermarkMath';

describe('constrainOverlayPosition', () => {
  it('keeps a keyboard-moved overlay inside the image bounds', () => {
    const bounds = { left: 10, right: 90, top: 20, bottom: 80 };

    expect(constrainOverlayPosition({ x: -5, y: 95 }, bounds)).toEqual({
      x: 10,
      y: 80,
    });
  });
});
