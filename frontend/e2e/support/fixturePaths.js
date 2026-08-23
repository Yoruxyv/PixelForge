import path from 'node:path';
import { fileURLToPath } from 'node:url';

const supportDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(supportDir, '../fixtures');

export const fixturePaths = Object.freeze({
  colorJpeg: path.join(fixturesDir, 'color-grid.jpg'),
  transparentPng: path.join(fixturesDir, 'transparent.png'),
  grayscalePng: path.join(fixturesDir, 'grayscale.png'),
  metadataJpeg: path.join(fixturesDir, 'metadata.jpg'),
  invalidText: path.join(fixturesDir, 'invalid.txt'),
});
