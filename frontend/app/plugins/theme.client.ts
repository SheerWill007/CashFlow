import { THEME_KEY } from '~/lib/theme-script';

export default defineNuxtPlugin(() => {
  const { theme, setTheme } = useTheme();

  // Read the theme the <head> script chose only once hydration has finished, so server and
  // client markup match. (The knob's position comes from CSS, so nothing visibly changes.)
  onNuxtReady(() => {
    theme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  });

  // With no saved choice, keep following the operating system.
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {}
    if (!saved) setTheme(mq.matches ? 'dark' : 'light', false);
  });
});
