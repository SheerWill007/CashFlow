<script setup lang="ts">
defineProps<{ title?: string }>();
const slots = defineSlots<{ default(): unknown; actions?(): unknown }>();
</script>

<template>
  <section class="card">
    <div v-if="title || slots.actions" class="card-head">
      <h2 v-if="title">{{ title }}</h2>
      <slot name="actions" />
    </div>
    <slot />
  </section>
</template>
