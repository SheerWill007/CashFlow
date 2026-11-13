<script setup lang="ts">
import type { IconName } from '~/lib/icons';

defineProps<{ icon: IconName; color: string; name: string; amount: string; share?: number }>();
</script>

<template>
  <div class="mini-row">
    <span class="ico" :style="{ background: color }"><Icon :name="icon" :size="15" /></span>
    <span class="grow">
      {{ name }}
      <span v-if="share !== undefined" class="bar"><i :style="{ width: `${share}%` }" /></span>
    </span>
    <span class="amt">{{ amount }}</span>
  </div>
</template>
