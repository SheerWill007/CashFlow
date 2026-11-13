import { THEME_KEY } from '~/lib/theme-script';

export type Theme = 'light' | 'dark';

function apply(theme: Theme) {
  const root = document.documentElement;
  // Briefly enable colour transitions so the switch fades instead of snapping.
  root.classList.add('theme-switching');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.setTimeout(() => root.classList.remove('theme-switching'), 350);
}

/** Light/dark theme. The real value is set in <head> before paint; the theme plugin syncs it here after hydration. */
export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light');

  function setTheme(next: Theme, persist = true) {
    apply(next);
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
    }
    theme.value = next;
  }

  const toggle = () => setTheme(theme.value === 'dark' ? 'light' : 'dark');

  return { theme, setTheme, toggle };
}
