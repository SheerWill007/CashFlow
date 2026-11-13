'use client';

import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Adds `in` once the element scrolls into view (or straight away with `immediate`). */
function useReveal<T extends HTMLElement>(immediate = false) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (immediate || !('IntersectionObserver' in window)) {
      const t = window.setTimeout(() => setShown(true), 60);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return [ref, shown] as const;
}

/** Fades and lifts its content in when it scrolls into view. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  immediate = false,
  as = 'div',
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
  as?: 'div' | 'p' | 'article' | 'section' | 'li';
  style?: CSSProperties;
}) {
  const [ref, shown] = useReveal<HTMLElement>(immediate);
  return createElement(
    as,
    { ref, className: `rise${shown ? ' in' : ''} ${className}`, style: { ...style, transitionDelay: `${delay}ms` } },
    children,
  );
}

/** Headline whose words drift in one after another; words from `dimFrom` on are greyed. */
export function Words({
  text,
  as = 'h2',
  dimFrom = Infinity,
  immediate = false,
  className = '',
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  dimFrom?: number;
  immediate?: boolean;
  className?: string;
}) {
  const [ref, shown] = useReveal<HTMLHeadingElement>(immediate);
  const words = text.split(' ');
  return createElement(
    as,
    { ref, className: `words${shown ? ' in' : ''} ${className}`, 'aria-label': text },
    words.map((word, i) => (
      <span key={i} aria-hidden="true">
        <span className={`w${i >= dimFrom ? ' dim' : ''}`} style={{ transitionDelay: `${i * 90}ms` }}>
          {word}
        </span>{' '}
      </span>
    )),
  );
}
