<script setup lang="ts">
import { inr } from '~/lib/format';

const props = defineProps<{ label: string; max: number; step: number }>();
const value = defineModel<number>({ required: true });
const fill = computed(() => `${(value.value / props.max) * 100}%`);
</script>

<template>
  <label class="slider">
    <span class="slider-head">
      <span>{{ label }}</span>
      <strong>{{ inr(value * 100) }}</strong>
    </span>
    <input v-model.number="value" type="range" min="0" :max="max" :step="step" :style="{ '--p': fill }" />
  </label>
</template>
