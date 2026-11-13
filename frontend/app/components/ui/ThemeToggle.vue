<script setup lang="ts">
const { theme, toggle } = useTheme();
// The server can't know the visitor's theme, so the labels follow it only after mount.
// The knob's position comes from CSS on <html data-theme>, so nothing visibly changes.
const mounted = ref(false);
onMounted(() => (mounted.value = true));
const dark = computed(() => mounted.value && theme.value === 'dark');
</script>

<template>
  <!-- Pill switch with a sliding knob: sun on the left, moon on the right. -->
  <button
    type="button"
    class="theme-toggle"
    role="switch"
    :aria-checked="dark"
    aria-label="Dark mode"
    :title="dark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <span class="knob" aria-hidden="true" />
    <Icon name="sun" :size="14" />
    <Icon name="moon" :size="14" />
  </button>
</template>
