<script setup lang="ts">
import { monthName } from '~/lib/dates';
import { money, moneyShort } from '~/lib/format';
import type { TrendPoint } from '~/lib/types';

const props = defineProps<{ months: TrendPoint[]; current: string; currency: string }>();
const max = computed(() => Math.max(...props.months.map((t) => t.total), 1));
</script>

<template>
  <div class="trend">
    <div
      v-for="t in months"
      :key="t.month"
      class="col"
      :class="{ now: t.month === current }"
      :title="`${monthName(t.month)}: ${money(t.total, currency)}`"
    >
      <span class="val">{{ t.total ? moneyShort(t.total, currency) : '–' }}</span>
      <i :style="{ height: `${(t.total / max) * 70}%` }" />
      <span>{{ monthName(t.month, { month: 'short' }) }}</span>
    </div>
  </div>
</template>
