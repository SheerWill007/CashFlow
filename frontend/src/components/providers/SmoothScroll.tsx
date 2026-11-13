'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useCallback, useEffect, type ReactNode } from 'react';

/** Respect "reduce motion": keep Lenis mounted (so the tree never remounts) but use native wheel scrolling. */
function MotionPreference() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      lenis.options.smoothWheel = !mq.matches;
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 }}>
      <MotionPreference />
      {children}
    </ReactLenis>
  );
}

const NAV_OFFSET = -84;

/** Smoothly scroll to a selector or position, through Lenis when it's running. */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (target: string | number) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (lenis && !reduce) {
        lenis.scrollTo(target, { offset: typeof target === 'string' ? NAV_OFFSET : 0, duration: 1.2 });
        return;
      }
      if (typeof target === 'number') window.scrollTo({ top: target });
      else {
        const el = document.querySelector<HTMLElement>(target);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET });
      }
    },
    [lenis],
  );
}
