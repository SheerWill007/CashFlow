<script setup lang="ts">
// Headline whose words drift in one after another; words from `dimFrom` on are greyed.
const props = withDefaults(defineProps<{ text: string; as?: 'h1' | 'h2' | 'h3'; dimFrom?: number; immediate?: boolean }>(), {
  as: 'h2',
  dimFrom: Number.POSITIVE_INFINITY,
  immediate: false,
});

const el = ref<HTMLElement | null>(null);
const shown = useReveal(el, props.immediate);
const words = computed(() => props.text.split(' '));
</script>

<template>
  <component :is="as" ref="el" class="words" :class="{ in: shown }" :aria-label="text">
    <span v-for="(word, i) in words" :key="i" aria-hidden="true"
      ><span class="w" :class="{ dim: i >= dimFrom }" :style="{ transitionDelay: `${i * 90}ms` }">{{ word }}</span>{{ ' ' }}</span
    >
  </component>
</template>
