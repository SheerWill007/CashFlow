<script setup lang="ts">
useHead({ title: '' });
</script>

<template>
  <div class="landing">
    <ScrollProgress />
    <SiteNav />
    <main>
      <HeroSection />
      <CategoryStrip />
      <StatsBand />
      <DailyFinance />
      <FeatureTour />
      <HowItWorks />
      <Advantages />
      <FaqSection />
      <CtaSection />
    </main>
    <SiteFooter />
    <BackToTop />
  </div>
</template>
