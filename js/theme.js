// Ali Internet & Xerox - Theme Manager (Light / Dark / System)
// Shared across index.html and counter.html. Runs immediately (no DOMContentLoaded needed)
// to apply the saved theme before first paint, avoiding any flash of wrong theme.
(function () {
  'use strict';

  const STORAGE_KEY = 'ali_site_theme'; // 'light' | 'dark' | 'system'
  const DEFAULT_THEME = 'light';       // Light is the default theme

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    try {
      const t = localStorage.getItem(STORAGE_KEY);
      return (t === 'light' || t === 'dark' || t === 'system') ? t : DEFAULT_THEME;
    } catch (e) {
      return DEFAULT_THEME;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* storage unavailable (private mode etc.) */ }
  }

  // Resolve an explicit preference ('light'|'dark'|'system') into a real theme
  function resolveTheme(pref) {
    if (pref === 'system') {
      return mediaQuery.matches ? 'dark' : 'light';
    }
    return pref;
  }

  // Apply the resolved theme to the document (CSS keys off html[data-theme])
  function applyTheme(pref) {
    const resolved = resolveTheme(pref);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved; // native controls/scrollbars follow suit
    return resolved;
  }

  // Update every toggle button on the page (main site + counter desk share this)
  function updateButtons(pref) {
    const icons = { light: '☀️', dark: '🌙', system: '💻' };
    const labels = { light: 'Light', dark: 'Dark', system: 'System' };
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.innerHTML = '<span aria-hidden="true">' + icons[pref] + '</span> <strong>' + labels[pref] + '</strong>';
      btn.setAttribute('aria-label', 'Theme: ' + labels[pref] + '. Click to change.');
      btn.title = 'Theme: ' + labels[pref] + ' (click to switch)';
    });
  }

  let currentPref = getStoredTheme();

  // Initial application (before DOM ready — <html> attribute works instantly)
  applyTheme(currentPref);

  function cycleTheme() {
    const order = ['light', 'dark', 'system'];
    currentPref = order[(order.indexOf(currentPref) + 1) % order.length];
    setStoredTheme(currentPref);
    applyTheme(currentPref);
    updateButtons(currentPref);
  }

  function bind() {
    updateButtons(currentPref);
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', cycleTheme);
    });
  }

  // When in 'system' mode, react live to OS-level theme changes
  const onSystemChange = () => {
    if (currentPref === 'system') applyTheme('system');
  };
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', onSystemChange);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(onSystemChange); // older Safari
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
