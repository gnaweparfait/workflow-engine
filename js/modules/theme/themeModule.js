import { SELECTORS, THEME_STORAGE_KEY, THEMES } from '../../core/constants.js';
import { $ } from '../../utils/dom.js';

/**
 * Module Theme — bascule mode clair / sombre + persistance localStorage.
 */
export function initThemeModule() {
  const btn = $(SELECTORS.BTN_THEME_TOGGLE);
  if (!btn) return;

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
    } catch {
      return THEMES.DARK;
    }
  }

  function applyTheme(theme) {
    const isLight = theme === THEMES.LIGHT;
    document.documentElement.setAttribute('data-theme', theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }

    btn.setAttribute('aria-pressed', String(isLight));
    btn.setAttribute(
      'aria-label',
      isLight ? 'Activer le mode sombre' : 'Activer le mode clair'
    );
    btn.title = isLight ? 'Mode clair actif — passer au sombre' : 'Mode sombre actif — passer au clair';
    btn.classList.toggle('theme-toggle--light', isLight);
  }

  function toggleTheme() {
    const next =
      document.documentElement.getAttribute('data-theme') === THEMES.LIGHT
        ? THEMES.DARK
        : THEMES.LIGHT;
    applyTheme(next);
  }

  btn.addEventListener('click', toggleTheme);
  applyTheme(getStoredTheme());
}
