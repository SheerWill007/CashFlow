<script setup lang="ts">
import { inr } from '~/lib/format';
import { SAMPLE } from '~/lib/sample';
</script>

<template>
  <section class="stage hero-stage dark glow">
    <Words as="h1" text="Your money, one day at a time" :dim-from="2" immediate />
    <Reveal as="p" class="lead" immediate :delay="350">
      Track what you spend, see what is left for today, and find out where the rest went. All in one place.
    </Reveal>
    <Reveal immediate :delay="500">
      <NuxtLink class="btn white big" to="/signup">Open your Cashflow account</NuxtLink>
    </Reveal>

    <Reveal immediate :delay="650">
      <div class="mock" aria-hidden="true">
        <div class="mock-side">
          <div class="logo">CASHFLOW</div>
          <ul>
            <li class="on">Today</li>
            <li>Expenses</li>
            <li>Where it goes</li>
            <li>Settings</li>
          </ul>
        </div>
        <div class="mock-main">
          <div class="mock-head">
            <span>Today</span>
            <span class="user-chip"><span class="avatar">AK</span><span class="name">Asha Kapoor</span></span>
          </div>
          <div class="mock-grid">
            <div>
              <div class="muted small">Left to spend today</div>
              <div class="figure">{{ inr(124500) }}</div>
              <BudgetMeter :spent="2070000" :budget="5400000" :pace="46" />
              <div class="muted small">{{ inr(2070000) }} of {{ inr(5400000) }} spent this month</div>
            </div>
            <div>
              <div class="muted small" style="margin-bottom: 12px">Statistic</div>
              <Donut :parts="SAMPLE" locale="en-IN" />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
    <div class="scroll-hint">Scroll</div>
  </section>
</template>
