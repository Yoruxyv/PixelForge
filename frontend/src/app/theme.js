export const THEME_STORAGE_KEY = 'pixelforge-theme';
export const THEME_OPTIONS = ['system', 'light', 'dark'];

export const resolveTheme = (preference, prefersDark) => {
  if (preference !== 'system') return preference;
  return prefersDark ? 'dark' : 'light';
};

export const readThemePreference = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return THEME_OPTIONS.includes(storedTheme) ? storedTheme : 'system';
};
