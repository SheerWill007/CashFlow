<script setup lang="ts">
import { monthName, shiftMonth, thisMonth } from '~/lib/dates';

const { month } = useApp();
</script>

<template>
  <div class="month-switch">
    <button class="btn icon" aria-label="Previous month" @click="month = shiftMonth(month, -1)">
      <Icon name="chevronLeft" :size="16" />
    </button>
    <span>{{ monthName(month) }}</span>
    <button class="btn icon" aria-label="Next month" :disabled="month >= thisMonth()" @click="month = shiftMonth(month, 1)">
      <Icon name="chevronRight" :size="16" />
    </button>
  </div>
</template>
