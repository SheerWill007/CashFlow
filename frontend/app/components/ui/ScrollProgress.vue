<script setup lang="ts">
// Thin bar along the top edge that fills as the page is scrolled.
const bar = ref<HTMLElement | null>(null);
let frame = 0;

function update() {
  frame = 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (bar.value) bar.value.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(update);
};

onMounted(() => {
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  cancelAnimationFrame(frame);
});
</script>

<template>
  <div ref="bar" class="scroll-progress" aria-hidden="true" />
</template>
