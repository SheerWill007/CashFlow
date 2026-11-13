<script setup lang="ts">
import type { IconName } from '~/lib/icons';

const ITEMS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'bolt', title: 'Easy', text: 'One screen tells you where you stand today.' },
  { icon: 'lock', title: 'Private', text: 'Your own login. Nobody else sees your expenses.' },
  { icon: 'check', title: 'Clear', text: 'Exact amounts, by category and by day.' },
  { icon: 'download', title: 'Portable', text: 'Export any month to a CSV file.' },
];
</script>

<template>
  <section class="section">
    <div class="split">
      <div>
        <span class="chip">Why Cashflow</span>
        <Words text="Discover the advantages of knowing" :dim-from="2" />
      </div>
      <div class="adv">
        <Reveal v-for="(item, i) in ITEMS" :key="item.title" :delay="i * 90">
          <SpotlightCard class="feature">
            <span class="ico soft"><Icon :name="item.icon" :size="20" /></span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </SpotlightCard>
        </Reveal>
      </div>
    </div>
  </section>
</template>
