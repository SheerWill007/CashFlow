<script setup lang="ts">
import { colorOf } from '~/lib/categories';
import { inr } from '~/lib/format';
import type { IconName } from '~/lib/icons';
import { SAMPLE } from '~/lib/sample';

interface Row {
  icon: IconName;
  color: string;
  name: string;
  amount: string;
  share?: number;
}

const sampleTotal = SAMPLE.reduce((t, s) => t + s.amount, 0);
const biggest = SAMPLE[0]?.amount ?? 1;

const TOUR: { label: string; icon: IconName; text: string; rows: Row[] }[] = [
  {
    label: 'Daily allowance',
    icon: 'today',
    text: 'Your budget for the rest of the month, split over the days you have left. Spend less today and tomorrow gets bigger.',
    rows: [
      { icon: 'today', color: 'var(--invert-bg)', name: 'Today', amount: inr(124500) },
      { icon: 'up', color: 'var(--invert-bg)', name: 'From tomorrow', amount: inr(131200) },
    ],
  },
  {
    label: 'Expense log',
    icon: 'list',
    text: 'A day-by-day list of everything you spent, with notes, so nothing goes missing.',
    rows: [
      { icon: 'fork', color: colorOf('Food & dining'), name: 'Lunch', amount: inr(45000) },
      { icon: 'car', color: colorOf('Transport'), name: 'Metro card', amount: inr(20000) },
      { icon: 'bag', color: colorOf('Groceries'), name: 'Vegetables', amount: inr(38000) },
    ],
  },
  {
    label: 'Where it goes',
    icon: 'pie',
    text: 'Totals for each category and each day of the month, set against your daily budget.',
    rows: SAMPLE.slice(0, 3).map((s) => ({
      icon: 'pie' as const,
      color: colorOf(s.name),
      name: s.name,
      amount: `${Math.round((s.amount / sampleTotal) * 100)}%`,
      share: (s.amount / biggest) * 100,
    })),
  },
  {
    label: 'Six-month trend',
    icon: 'up',
    text: 'See whether this month is running above or below the ones before it.',
    rows: [
      { icon: 'up', color: 'var(--invert-bg)', name: 'This month', amount: inr(2070000) },
      { icon: 'up', color: 'var(--muted)', name: 'Last month', amount: inr(4810000) },
    ],
  },
  {
    label: 'Light & dark',
    icon: 'moon',
    text: 'Switch themes from the toggle in the top bar. Cashflow remembers your choice, or follows your system setting.',
    rows: [
      { icon: 'sun', color: 'var(--invert-bg)', name: 'Light theme', amount: 'Bright' },
      { icon: 'moon', color: 'var(--invert-bg)', name: 'Dark theme', amount: 'Easy on the eyes' },
    ],
  },
  {
    label: 'CSV export',
    icon: 'download',
    text: 'Download any month as a spreadsheet file whenever you want a copy of your data.',
    rows: [{ icon: 'download', color: 'var(--invert-bg)', name: 'cashflow-2026-11.csv', amount: 'Ready' }],
  },
];

const active = ref(0);
const tab = computed(() => TOUR[active.value]!);
const tabs = ref<HTMLButtonElement[]>([]);

function onKey(e: KeyboardEvent) {
  const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
  const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
  if (!forward && !back) return;
  e.preventDefault();
  active.value = (active.value + (forward ? 1 : -1) + TOUR.length) % TOUR.length;
  tabs.value[active.value]?.focus();
}
</script>

<template>
  <section id="tour" class="section">
    <Reveal class="tabbed">
      <div class="tablist" role="tablist" aria-label="Features" aria-orientation="vertical" @keydown="onKey">
        <button
          v-for="(t, i) in TOUR"
          :id="`tour-tab-${i}`"
          :key="t.label"
          ref="tabs"
          type="button"
          role="tab"
          :aria-selected="i === active"
          aria-controls="tour-panel"
          :tabindex="i === active ? 0 : -1"
          @click="active = i"
        >
          {{ t.label }}
        </button>
      </div>
      <div id="tour-panel" class="panel tabpanel" role="tabpanel" :aria-labelledby="`tour-tab-${active}`">
        <h3>
          <span class="ico plain"><Icon :name="tab.icon" :size="16" /></span>
          {{ tab.label }}
        </h3>
        <p>{{ tab.text }}</p>
        <div :key="active" class="mini">
          <MiniRow v-for="r in tab.rows" :key="r.name" v-bind="r" />
        </div>
      </div>
    </Reveal>
  </section>
</template>
