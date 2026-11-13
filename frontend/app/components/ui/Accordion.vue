<script setup lang="ts">
// One-open-at-a-time disclosure list with an animated height.
import type { AccordionItem } from '~/lib/types';

defineProps<{ items: AccordionItem[] }>();
const open = ref<number | null>(0);
const id = useId();
</script>

<template>
  <div class="accordion">
    <div v-for="(item, i) in items" :key="item.q" class="acc-item" :class="{ open: open === i }">
      <h3>
        <button
          :id="`${id}-h${i}`"
          type="button"
          :aria-expanded="open === i"
          :aria-controls="`${id}-p${i}`"
          @click="open = open === i ? null : i"
        >
          <span>{{ item.q }}</span>
          <Icon name="plus" :size="18" class="acc-icon" />
        </button>
      </h3>
      <div :id="`${id}-p${i}`" class="acc-panel" role="region" :aria-labelledby="`${id}-h${i}`">
        <div>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
