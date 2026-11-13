<script setup lang="ts">
import { colorOf } from '~/lib/categories';
import { inr } from '~/lib/format';
</script>

<template>
  <section id="features" class="section">
    <div class="section-head">
      <span class="chip">Daily finances</span>
      <Words text="Know your number before you spend" />
      <p>One figure each morning: what you can spend today.</p>
    </div>

    <div class="split">
      <Reveal>
        <span class="chip">Quick add</span>
        <h3>Log an expense in a few seconds</h3>
        <p>Amount, category, done. Your allowance for the day updates the moment you add it.</p>
      </Reveal>
      <Reveal class="panel gridded" :delay="120">
        <div class="widget">
          <h4>Amount</h4>
          <div class="muted small">Add expense</div>
          <div class="fake-input">
            <div>
              <strong>{{ inr(45000) }}</strong>
              <span class="muted small">Left today: {{ inr(124500) }}</span>
            </div>
            <span class="pill">INR</span>
          </div>
          <div class="muted small">What was it for?</div>
          <div class="fake-input">
            <span class="pill"><span class="dot" :style="{ background: colorOf('Food & dining') }" />Food &amp; dining</span>
            <span class="muted">Lunch</span>
          </div>
          <div class="done"><Icon name="check" :size="16" /> Added!</div>
        </div>
      </Reveal>
    </div>

    <div class="three">
      <Reveal>
        <SpotlightCard class="feature">
          <h3>Analytics</h3>
          <p>See which categories take the biggest share of your month, at a glance.</p>
          <div class="mini">
            <MiniRow icon="fork" :color="colorOf('Food & dining')" name="Food & dining" :amount="inr(820000)" :share="78" />
            <MiniRow icon="bag" :color="colorOf('Groceries')" name="Groceries" :amount="inr(540000)" :share="52" />
            <MiniRow icon="car" :color="colorOf('Transport')" name="Transport" :amount="inr(310000)" :share="30" />
          </div>
        </SpotlightCard>
      </Reveal>
      <Reveal :delay="90">
        <SpotlightCard class="feature">
          <h3>Budgeting</h3>
          <p>Income minus bills and savings gives a budget that follows you through the month.</p>
          <div class="mini">
            <div class="mini-row">
              <span class="ico invert"><Icon name="wallet" :size="15" /></span>
              <span class="grow">
                <span class="stat-big">{{ inr(5400000) }}</span><span class="badge">monthly</span>
                <div class="muted small">Free to spend</div>
              </span>
            </div>
          </div>
          <div class="mini">
            <div class="mini-row">
              <span class="ico invert"><Icon name="calendar" :size="15" /></span>
              <span class="grow">
                <span class="stat-big">{{ inr(180000) }}</span><span class="badge">per day</span>
                <div class="muted small">Daily allowance</div>
              </span>
            </div>
          </div>
        </SpotlightCard>
      </Reveal>
      <Reveal :delay="180">
        <SpotlightCard class="feature">
          <h3>Expenses</h3>
          <p>Every expense in one list, grouped by day, with a running total for each.</p>
          <div class="mini">
            <MiniRow icon="bag" :color="colorOf('Shopping')" name="Shopping" :amount="inr(33000)" />
            <MiniRow icon="fork" :color="colorOf('Food & dining')" name="Restaurants" :amount="inr(15400)" />
            <MiniRow icon="car" :color="colorOf('Transport')" name="Travel" :amount="inr(259200)" />
          </div>
        </SpotlightCard>
      </Reveal>
    </div>
  </section>
</template>
