'use client';

import { useTheme } from '../providers/ThemeProvider';
import { Icon } from './Icon';

/** Pill switch with a sliding knob: sun on the left, moon on the right. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
    >
      <span className="knob" aria-hidden="true" />
      <Icon name="sun" size={14} />
      <Icon name="moon" size={14} />
    </button>
  );
}
