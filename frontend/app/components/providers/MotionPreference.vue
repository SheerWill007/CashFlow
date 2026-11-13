<script setup lang="ts">
import { useLenis } from 'lenis/vue';

// Respect "reduce motion": keep Lenis mounted but fall back to native wheel scrolling.
const lenis = useLenis();
let mq: MediaQueryList | undefined;

const update = () => {
  if (lenis.value && mq) lenis.value.options.smoothWheel = !mq.matches;
};

onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', update);
  update();
});
watch(lenis, update);
onBeforeUnmount(() => mq?.removeEventListener('change', update));
</script>

<template>
  <span hidden />
</template>
