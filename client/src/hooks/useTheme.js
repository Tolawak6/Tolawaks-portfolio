import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'portfolio-theme';
const listeners = new Set();

function readInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Ignore cross-origin iframe / storage privacy restrictions.
  }
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
  }
  return 'dark';
}

let currentTheme = readInitialTheme();
let switchTimer = 0;

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.documentElement.style.colorScheme = currentTheme;
}

function applyThemeToDom(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('is-switching-theme');
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  if (document.body) {
    document.body.setAttribute('data-theme', theme);
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'light' ? '#FAF9F5' : '#000000');
  }

  if (typeof window !== 'undefined') {
    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(() => {
      root.classList.remove('is-switching-theme');
    }, 240);
  }
}

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return currentTheme;
}

function getServerSnapshot() {
  return 'dark';
}

export function setPortfolioTheme(nextOrUpdater) {
  const next = typeof nextOrUpdater === 'function' ? nextOrUpdater(currentTheme) : nextOrUpdater;
  const clean = next === 'light' ? 'light' : 'dark';
  if (clean === currentTheme) {
    // Still ensure DOM attribute matches in case HTML reset.
    applyThemeToDom(clean);
    return;
  }

  currentTheme = clean;
  applyThemeToDom(clean);

  try {
    localStorage.setItem(STORAGE_KEY, clean);
  } catch {
    // Ignore storage privacy restrictions inside sandboxed iframes.
  }

  listeners.forEach((listener) => listener());
}

/**
 * React 19 StrictMode-safe Light / Dark mode hook powered by
 * `useSyncExternalStore` (zero side effects inside render or state updaters).
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next) => {
    setPortfolioTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setPortfolioTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, isDark: theme === 'dark', setTheme, toggleTheme };
}

export default useTheme;
