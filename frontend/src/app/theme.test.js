import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readThemePreference, THEME_STORAGE_KEY } from './theme';

describe('theme preference', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  it.each(['dark', 'light'])('reads a stored %s preference', (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    expect(readThemePreference()).toBe(theme);
  });

  it('defaults to dark when no preference is stored', () => {
    expect(readThemePreference()).toBe('dark');
  });

  it('replaces an invalid stored preference with dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    expect(readThemePreference()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it.each([
    [true, 'dark'],
    [false, 'light'],
  ])('migrates legacy system mode once', (matches, expectedTheme) => {
    window.matchMedia = vi.fn().mockReturnValue({ matches });
    localStorage.setItem(THEME_STORAGE_KEY, 'system');

    expect(readThemePreference()).toBe(expectedTheme);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(expectedTheme);
    expect(window.matchMedia).toHaveBeenCalledTimes(1);

    window.matchMedia.mockReturnValue({ matches: !matches });
    expect(readThemePreference()).toBe(expectedTheme);
    expect(window.matchMedia).toHaveBeenCalledTimes(1);
  });
});
