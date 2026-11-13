<script setup lang="ts">
// A card with a soft light that follows the pointer.
function onMove(e: PointerEvent) {
  const card = e.currentTarget as HTMLElement;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}
</script>

<template>
  <div class="spotlight" @pointermove="onMove">
    <slot />
  </div>
</template>
