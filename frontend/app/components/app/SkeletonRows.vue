<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 3 });
</script>

<template>
  <div class="skeleton" aria-busy="true" aria-label="Loading">
    <span v-for="i in rows" :key="i" :style="{ width: `${90 - (i - 1) * 18}%` }" />
  </div>
</template>
