<script setup lang="ts">
import type { LenisOptions } from 'lenis';

const lenisOptions: LenisOptions = { lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 };

useHead({ titleTemplate: (title) => (title ? `${title} · Cashflow` : 'Cashflow') });
</script>

<template>
  <VueLenis root :options="lenisOptions">
    <MotionPreference />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
  </VueLenis>
</template>
