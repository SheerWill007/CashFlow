const PATHS = {
  today: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6M12 8a4 4 0 100 8 4 4 0 000-8z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  pie: 'M12 3a9 9 0 109 9h-9V3zM15 3.5A9 9 0 0120.5 9H15V3.5z',
  gear: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 5v4M8 15v4',
  bolt: 'M13 3L5 13h6l-1 8 8-10h-6l1-8z',
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  bag: 'M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 016 0v2',
  fork: 'M7 3v8M5 3v4a2 2 0 004 0V3M7 11v10M16 3c-2 2-2 7 0 9v9',
  car: 'M4 16v-4l2-5h12l2 5v4M4 16h16M7 16v2M17 16v2M7.5 12.5h.01M16.5 12.5h.01',
  up: 'M6 18L18 6M9 6h9v9',
  sun: 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z',
  moon: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  plus: 'M12 5v14M5 12h14',
  logout: 'M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11',
  close: 'M6 6l12 12M18 6L6 18',
  wallet: 'M4 7a2 2 0 012-2h11v4M4 7v10a2 2 0 002 2h13V9H6a2 2 0 01-2-2zM16 14h.01',
  calendar: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
