import { useLenis } from 'lenis/vue';

const NAV_OFFSET = -84;

/** Smoothly scroll to a selector or position, through Lenis when it's running. */
export function useScrollTo() {
  const lenis = useLenis();

  return (target: string | number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis.value && !reduce) {
      lenis.value.scrollTo(target, { offset: typeof target === 'string' ? NAV_OFFSET : 0, duration: 1.2 });
      return;
    }
    if (typeof target === 'number') window.scrollTo({ top: target });
    else {
      const el = document.querySelector<HTMLElement>(target);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET });
    }
  };
}
