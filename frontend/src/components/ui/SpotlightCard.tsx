'use client';

import type { PointerEvent, ReactNode } from 'react';

/** A card with a soft light that follows the pointer. */
export function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div className={`spotlight ${className}`} onPointerMove={onMove}>
      {children}
    </div>
  );
}
