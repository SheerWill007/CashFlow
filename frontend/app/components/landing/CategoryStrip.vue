<script setup lang="ts">
// Two tickers running in opposite directions: categories, then supported currencies.
import { CATEGORIES, CURRENCY_LABELS, colorOf } from '~/lib/categories';
</script>

<template>
  <section class="strip" aria-label="Categories and currencies">
    <Marquee label="Spending categories">
      <span v-for="c in CATEGORIES" :key="c" class="strip-pill">
        <span class="dot" :style="{ background: colorOf(c) }" />{{ c }}
      </span>
    </Marquee>
    <Marquee label="Supported currencies" reverse>
      <span v-for="c in CURRENCY_LABELS" :key="c" class="strip-pill ghost">{{ c }}</span>
    </Marquee>
  </section>
</template>
