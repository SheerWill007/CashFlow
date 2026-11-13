<script setup lang="ts">
// Fades and lifts its content in when it scrolls into view.
const props = withDefaults(defineProps<{ as?: string; delay?: number; immediate?: boolean }>(), {
  as: 'div',
  delay: 0,
  immediate: false,
});

const el = ref<HTMLElement | null>(null);
const shown = useReveal(el, props.immediate);
</script>

<template>
  <component :is="as" ref="el" class="rise" :class="{ in: shown }" :style="{ transitionDelay: `${delay}ms` }">
    <slot />
  </component>
</template>
