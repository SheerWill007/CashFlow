<template>
  <section class="stage cta-stage dark glow right">
    <Words text="Start with today. The month follows." :dim-from="3" />
    <Reveal class="cta-row">
      <NuxtLink class="btn white big" to="/signup">Get started today</NuxtLink>
      <NuxtLink class="btn glass big" to="/login">Log in</NuxtLink>
    </Reveal>
  </section>
</template>
