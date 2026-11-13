import type { Ref } from 'vue';

/** `shown` turns true once `el` scrolls into view (or straight after mount with `immediate`). */
export function useReveal(el: Ref<HTMLElement | null>, immediate = false, threshold = 0.18) {
  const shown = ref(false);
  let io: IntersectionObserver | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  onMounted(() => {
    if (!el.value) return;
    if (immediate || !('IntersectionObserver' in window)) {
      timer = setTimeout(() => (shown.value = true), 60);
      return;
    }
    io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          shown.value = true;
          io?.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el.value);
  });

  onBeforeUnmount(() => {
    io?.disconnect();
    clearTimeout(timer);
  });

  return shown;
}
