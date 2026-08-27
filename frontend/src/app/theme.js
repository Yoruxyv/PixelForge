export const THEME_STORAGE_KEY = 'pixelforge-theme';
export const THEME_OPTIONS = ['light', 'dark'];

export const readThemePreference = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (THEME_OPTIONS.includes(storedTheme)) return storedTheme;

  if (storedTheme === 'system') {
    const migratedTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, migratedTheme);
    return migratedTheme;
  }

  if (storedTheme !== null) {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  }

  return 'dark';
};
