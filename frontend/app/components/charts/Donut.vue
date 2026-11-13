<script setup lang="ts">
// Share of spending by category: a ring with a gap between segments, plus a legend of the top five.
import { colorOf } from '~/lib/categories';
import { money, moneyShort } from '~/lib/format';
import type { Slice } from '~/lib/types';

const props = withDefaults(defineProps<{ parts: Slice[]; currency?: string; locale?: string }>(), { currency: 'INR' });

const R = 50;
const C = 2 * Math.PI * R;

const total = computed(() => props.parts.reduce((t, p) => t + p.amount, 0));

const segments = computed(() => {
  let offset = 0;
  return props.parts.map((p) => {
    const len = total.value ? (p.amount / total.value) * C : 0;
    const gap = props.parts.length > 1 && len > 5 ? 2.5 : 0;
    const seg = {
      name: p.name,
      color: colorOf(p.name),
      dash: `${len - gap} ${C - len + gap}`,
      offset: -offset,
      title: `${p.name}: ${money(p.amount, props.currency, {}, props.locale)}`,
    };
    offset += len;
    return seg;
  });
});

const legend = computed(() =>
  props.parts.slice(0, 5).map((p) => ({
    name: p.name,
    color: colorOf(p.name),
    pct: total.value ? Math.round((p.amount / total.value) * 100) : 0,
  })),
);
</script>

<template>
  <div class="statistic">
    <svg viewBox="0 0 132 132" role="img" aria-label="Share of spending by category">
      <circle cx="66" cy="66" :r="R" fill="none" class="ring-track" stroke-width="14" />
      <circle
        v-for="s in segments"
        :key="s.name"
        cx="66"
        cy="66"
        :r="R"
        fill="none"
        :stroke="s.color"
        stroke-width="14"
        :stroke-dasharray="s.dash"
        :stroke-dashoffset="s.offset"
        transform="rotate(-90 66 66)"
      >
        <title>{{ s.title }}</title>
      </circle>
      <text class="center-k" x="66" y="60" text-anchor="middle">SPENT</text>
      <text class="center" x="66" y="78" text-anchor="middle">{{ moneyShort(total, currency, locale) }}</text>
    </svg>
    <div class="legend">
      <div v-for="l in legend" :key="l.name">
        <span class="dot" :style="{ background: l.color }" />
        <span>{{ l.name }}</span>
        <span>{{ l.pct }}%</span>
      </div>
    </div>
  </div>
</template>
