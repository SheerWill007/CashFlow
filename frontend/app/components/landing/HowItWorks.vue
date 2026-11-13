<script setup lang="ts">
// Explains the allowance maths, then lets the visitor try it with their own numbers.
import { inr } from '~/lib/format';

const DAYS = 30;
const income = ref(80000);
const bills = ref(25000);
const savings = ref(10000);
const budget = computed(() => income.value - bills.value - savings.value);
const perDay = computed(() => Math.max(0, Math.round(budget.value / DAYS)));
</script>

<template>
  <section id="how" class="stage steps-stage dark glow">
    <span class="chip">How it works</span>
    <Words text="The maths behind your daily number" :dim-from="3" />
    <Reveal as="p" class="sub">No bank connection and no guesswork. Three figures from you, and the rest is arithmetic.</Reveal>

    <Reveal class="steps">
      <div class="step">
        <span class="n">Step 1</span>
        <span class="big">Income</span>
        <p>Take what you earn each month, then subtract fixed bills and the amount you want to save.</p>
      </div>
      <div class="step">
        <span class="n">Step 2</span>
        <span class="big">÷ days left</span>
        <p>Whatever is still unspent is shared across the remaining days of the month.</p>
      </div>
      <div class="step">
        <span class="n">Step 3</span>
        <span class="big">It adjusts</span>
        <p>Each expense you add changes the figure straight away, for today and for the days ahead.</p>
      </div>
    </Reveal>

    <Reveal class="calc" :delay="120">
      <div class="calc-inputs">
        <h3>Try it with your numbers</h3>
        <RangeSlider v-model="income" label="Monthly income" :max="300000" :step="1000" />
        <RangeSlider v-model="bills" label="Fixed bills" :max="150000" :step="500" />
        <RangeSlider v-model="savings" label="Savings goal" :max="100000" :step="500" />
      </div>
      <div class="calc-result" aria-live="polite">
        <span class="muted small">You could spend</span>
        <span class="calc-figure" :class="{ over: budget < 0 }">{{ inr(perDay * 100) }}</span>
        <span class="muted small">a day, across a {{ DAYS }}-day month</span>
        <div class="calc-line">
          <span>Free to spend this month</span>
          <strong>{{ inr(budget * 100) }}</strong>
        </div>
        <p v-if="budget < 0" class="calc-warn">Bills and savings are more than your income.</p>
      </div>
    </Reveal>
  </section>
</template>
