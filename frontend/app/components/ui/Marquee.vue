<script setup lang="ts">
// Endless horizontal ticker. The content is rendered twice so the loop is seamless; it pauses on hover.
defineProps<{ label: string; reverse?: boolean }>();
</script>

<template>
  <div class="marquee" :class="{ reverse }" role="region" :aria-label="label">
    <div class="marquee-track">
      <div class="marquee-group"><slot /></div>
      <div class="marquee-group" aria-hidden="true"><slot /></div>
    </div>
  </div>
</template>
