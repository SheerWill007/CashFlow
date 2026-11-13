<script setup lang="ts">
const visible = ref(false);
const scrollTo = useScrollTo();
const onScroll = () => (visible.value = window.scrollY > 700);

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <button
    type="button"
    class="back-to-top"
    :class="{ show: visible }"
    aria-label="Back to top"
    :tabindex="visible ? 0 : -1"
    @click="scrollTo(0)"
  >
    <Icon name="arrowUp" :size="18" />
  </button>
</template>
