<script setup lang="ts">
defineProps<{ label: string; value: string; detail?: string }>();
</script>

<template>
  <div class="tile">
    <div class="k">{{ label }}</div>
    <div class="v">{{ value }}</div>
    <div v-if="detail" class="d">{{ detail }}</div>
  </div>
</template>
