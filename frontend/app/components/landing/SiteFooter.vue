<script setup lang="ts">
const scrollTo = useScrollTo();
const SECTIONS = [
  ['#features', 'Features'],
  ['#tour', 'Tour'],
  ['#how', 'How it works'],
  ['#faq', 'FAQ'],
] as const;
</script>

<template>
  <footer class="footer">
    <div>
      <div class="logo">CASHFLOW</div>
      <p>Your money, one day at a time.</p>
    </div>
    <nav aria-label="Footer sections">
      <strong>Sections</strong>
      <a v-for="[href, label] in SECTIONS" :key="href" :href="href" @click.prevent="scrollTo(href)">{{ label }}</a>
    </nav>
    <nav aria-label="Account">
      <strong>Account</strong>
      <NuxtLink to="/login">Log in</NuxtLink>
      <NuxtLink to="/signup">Sign up</NuxtLink>
    </nav>
  </footer>
</template>
