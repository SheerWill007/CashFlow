'use client';

import { useEffect, useState } from 'react';
import { useScrollTo } from '../providers/SmoothScroll';
import { Icon } from './Icon';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const scrollTo = useScrollTo();
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' show' : ''}`}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => scrollTo(0)}
    >
      <Icon name="arrowUp" size={18} />
    </button>
  );
}
