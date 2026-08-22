import { beforeEach, describe, expect, it } from 'vitest';
import { readThemePreference, resolveTheme, THEME_STORAGE_KEY } from './theme';

describe('theme preference', () => {
  beforeEach(() => localStorage.clear());

  it('resolves system mode and ignores invalid stored values', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');

    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(readThemePreference()).toBe('system');
  });
});
