<script setup lang="ts">
// Counts up from 0 to `value` when it first scrolls into view.
const props = withDefaults(defineProps<{ value: number; duration?: number }>(), { duration: 1400 });

const el = ref<HTMLElement | null>(null);
const current = ref(0);
let io: IntersectionObserver | undefined;
let frame = 0;

onMounted(() => {
  if (!el.value) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    current.value = props.value;
    return;
  }
  io = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      io?.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / props.duration);
        current.value = props.value * (1 - Math.pow(1 - t, 3));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    },
    { threshold: 0.4 },
  );
  io.observe(el.value);
});

onBeforeUnmount(() => {
  io?.disconnect();
  cancelAnimationFrame(frame);
});

const text = computed(() => Math.round(current.value).toLocaleString('en-IN'));
</script>

<template>
  <span ref="el" class="tabular">{{ text }}</span>
</template>
