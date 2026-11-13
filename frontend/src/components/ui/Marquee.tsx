import type { ReactNode } from 'react';

/** Endless horizontal ticker. The content is rendered twice so the loop is seamless; it pauses on hover. */
export function Marquee({ children, reverse = false, label }: { children: ReactNode; reverse?: boolean; label: string }) {
  return (
    <div className={`marquee${reverse ? ' reverse' : ''}`} role="region" aria-label={label}>
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
