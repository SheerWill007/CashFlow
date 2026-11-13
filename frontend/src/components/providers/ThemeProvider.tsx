'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'cashflow-theme';

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme.
 * Saved choice wins; otherwise follow the operating system.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t}catch(e){}})()`;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function apply(theme: Theme) {
  const root = document.documentElement;
  // Briefly enable colour transitions so the switch fades instead of snapping.
  root.classList.add('theme-switching');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.setTimeout(() => root.classList.remove('theme-switching'), 350);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    setThemeState(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch {}
      if (saved) return;
      const next: Theme = mq.matches ? 'dark' : 'light';
      apply(next);
      setThemeState(next);
    };
    mq.addEventListener('change', followSystem);
    return () => mq.removeEventListener('change', followSystem);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
