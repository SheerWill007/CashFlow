<script setup lang="ts">
// One bar per day of the month, with the even daily budget as a dashed line and a hover tooltip.
import { dateIn, dayLabel, dayOf, daysIn, monthName } from '~/lib/dates';
import { money, moneyShort } from '~/lib/format';
import type { Expense } from '~/lib/types';

const props = defineProps<{ month: string; expenses: Expense[]; budgetPerDay: number; currency: string }>();

const W = 720, H = 240, L = 52, R = 8, T = 14, B = 26;
const iw = W - L - R;
const ih = H - T - B;

function niceMax(major: number) {
  if (major <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(major));
  for (const step of [1, 2, 2.5, 5, 10]) if (step * pow >= major) return step * pow;
  return 10 * pow;
}

const hover = ref<number | null>(null);
const n = computed(() => daysIn(props.month));
const totals = computed(() => {
  const t = Array<number>(n.value).fill(0);
  for (const e of props.expenses) t[dayOf(e.date) - 1]! += e.amount;
  return t;
});
const top = computed(() => niceMax(Math.max(...totals.value, props.budgetPerDay || 0) / 100) * 100);
const slot = computed(() => iw / n.value);
const bw = computed(() => Math.min(16, slot.value - 2));
const y = (v: number) => T + ih - (v / top.value) * ih;

const bars = computed(() =>
  totals.value.map((v, i) => {
    const cx = L + slot.value * i + slot.value / 2;
    const day = i + 1;
    let d = '';
    if (v > 0) {
      const bh = Math.max(2, (v / top.value) * ih);
      const r = Math.min(4, bw.value / 2, bh);
      const x0 = cx - bw.value / 2;
      const y0 = T + ih - bh;
      const yb = T + ih;
      d = `M${x0},${yb} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + bw.value - r} Q${x0 + bw.value},${y0} ${x0 + bw.value},${y0 + r} V${yb} Z`;
    }
    return { i, cx, d, label: day === 1 || day % 5 === 0 ? String(day) : '' };
  }),
);

const tip = computed(() => {
  if (hover.value === null) return null;
  const i = hover.value;
  const v = totals.value[i] ?? 0;
  return {
    left: `${((L + slot.value * i + slot.value / 2) / W) * 100}%`,
    top: `${(Math.min(y(v), y(0) - 8) / H) * 100}%`,
    amount: money(v, props.currency),
    day: dayLabel(dateIn(props.month, i + 1)),
  };
});
</script>

<template>
  <div>
    <div class="chart">
      <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Spending for each day of ${monthName(month)}`">
        <g v-for="f in [0, 0.5, 1]" :key="f">
          <line class="gridline" :x1="L" :x2="W - R" :y1="y(top * f)" :y2="y(top * f)" />
          <text :x="L - 8" :y="y(top * f) + 4" text-anchor="end">{{ moneyShort(top * f, currency) }}</text>
        </g>
        <g v-for="b in bars" :key="b.i">
          <path v-if="b.d" class="bar" :class="{ active: hover === b.i }" :d="b.d" />
          <text v-if="b.label" :x="b.cx" :y="H - 6" text-anchor="middle">{{ b.label }}</text>
        </g>
        <line v-if="budgetPerDay > 0" class="budget" :x1="L" :x2="W - R" :y1="y(budgetPerDay)" :y2="y(budgetPerDay)" />
        <!-- Full-height hit targets so thin bars and empty days are easy to hover. -->
        <rect
          v-for="b in bars"
          :key="`hit-${b.i}`"
          class="hit"
          :x="L + slot * b.i"
          :y="T"
          :width="slot"
          :height="ih"
          @pointerenter="hover = b.i"
          @pointerleave="hover = null"
        />
      </svg>
      <div v-if="tip" class="tip" :style="{ left: tip.left, top: tip.top }">
        <strong>{{ tip.amount }}</strong>{{ tip.day }}
      </div>
    </div>
    <div v-if="budgetPerDay > 0" class="key">
      <span class="k-bar">Spent that day</span>
      <span class="k-line">Even daily budget ({{ money(budgetPerDay, currency) }})</span>
    </div>
  </div>
</template>
