<script setup lang="ts">
// Facts about the product itself, not invented usage numbers.
const STATS = [
  { value: 3, label: 'numbers to set up your budget' },
  { value: 8, label: 'spending categories' },
  { value: 8, label: 'currencies supported' },
  { value: 0, label: 'bank logins needed' },
];
</script>

<template>
  <section class="section stats" aria-label="Cashflow at a glance">
    <Reveal v-for="(s, i) in STATS" :key="s.label" class="stat" :delay="i * 90">
      <span class="stat-value"><AnimatedNumber :value="s.value" /></span>
      <span class="stat-label">{{ s.label }}</span>
    </Reveal>
  </section>
</template>
