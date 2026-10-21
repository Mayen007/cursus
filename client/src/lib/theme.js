const THEME_STORAGE_KEY = "appearancePreference";

export function getThemePreference() {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark-theme", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function initializeTheme() {
  applyTheme(getThemePreference());
}

export function saveThemePreference(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}
