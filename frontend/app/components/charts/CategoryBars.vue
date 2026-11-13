<script setup lang="ts">
import { colorOf } from '~/lib/categories';
import { money } from '~/lib/format';
import type { Slice } from '~/lib/types';

const props = defineProps<{ parts: Slice[]; currency: string }>();

const total = computed(() => props.parts.reduce((t, p) => t + p.amount, 0));
const max = computed(() => props.parts[0]?.amount || 1);
</script>

<template>
  <div>
    <div v-for="c in parts" :key="c.name" class="cat" :style="{ '--c': colorOf(c.name) }">
      <span class="dot" />
      <span>{{ c.name }}</span>
      <div class="track"><i :style="{ width: `${(c.amount / max) * 100}%` }" /></div>
      <span class="num">{{ money(c.amount, currency) }}</span>
      <span class="pct">{{ Math.round((c.amount / total) * 100) }}%</span>
    </div>
  </div>
</template>
