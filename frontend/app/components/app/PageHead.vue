<script setup lang="ts">
defineProps<{ title: string }>();

const { user } = useApp();
const initials = computed(() =>
  user.value.name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);
</script>

<template>
  <div class="page-head">
    <h1>{{ title }}</h1>
    <div class="head-right">
      <slot />
      <ThemeToggle class="mobile-only" />
      <NuxtLink class="user-chip" to="/app/settings" title="Settings">
        <span class="avatar">{{ initials }}</span>
        <span class="name">{{ user.name }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
