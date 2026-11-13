<script setup lang="ts">
const LINKS = [
  ['#features', 'Features'],
  ['#tour', 'Tour'],
  ['#how', 'How it works'],
  ['#faq', 'FAQ'],
] as const;

const scrollTo = useScrollTo();
const scrolled = ref(false);
const onScroll = () => (scrolled.value = window.scrollY > 8);

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <header class="topnav" :class="{ scrolled }">
    <nav class="left" aria-label="Sections">
      <a v-for="[href, label] in LINKS" :key="href" class="linkbtn opt" :href="href" @click.prevent="scrollTo(href)">{{ label }}</a>
    </nav>
    <NuxtLink to="/" class="logo" aria-label="Cashflow home">CASHFLOW</NuxtLink>
    <div class="right">
      <ThemeToggle />
      <NuxtLink class="linkbtn" to="/login">Log in</NuxtLink>
      <NuxtLink class="btn invert" to="/signup">Sign up</NuxtLink>
    </div>
  </header>
</template>
