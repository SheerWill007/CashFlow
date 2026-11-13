<script setup lang="ts">
// Horizontal budget bar with a marker for where an even pace would be today.
const props = defineProps<{ spent: number; budget: number; pace: number }>();

const ratio = computed(() => (props.budget > 0 ? props.spent / props.budget : 0));
const label = computed(() => `${Math.round(ratio.value * 100)}% of budget spent, ${Math.round(props.pace)}% of the month gone`);
</script>

<template>
  <div class="meter" role="img" :aria-label="label">
    <i :class="{ over: spent > budget }" :style="{ width: `${Math.min(100, ratio * 100)}%` }" />
    <b :style="{ left: `calc(${Math.min(100, pace)}% - 1px)` }" title="Where an even pace would be today" />
  </div>
</template>
