import { describe, expect, it } from 'vitest';
import { nudgePoint } from './paletteMath';

describe('nudgePoint', () => {
  it('moves a sampling point and keeps it inside the image', () => {
    expect(nudgePoint({ id: 1, x: 0.5, y: 0.5 }, 0.1, -0.2)).toEqual({
      id: 1,
      x: 0.6,
      y: 0.3,
    });
    expect(nudgePoint({ id: 1, x: 0.98, y: 0.02 }, 1, -1)).toEqual({
      id: 1,
      x: 0.98,
      y: 0.02,
    });
  });
});
