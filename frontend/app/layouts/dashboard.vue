<script setup lang="ts">
import { api, UNAUTHORIZED_EVENT } from '~/lib/api';
import type { IconName } from '~/lib/icons';
import type { MeResponse } from '~/lib/types';

const NAV: [string, string, IconName][] = [
  ['/app', 'Today', 'today'],
  ['/app/expenses', 'Expenses', 'list'],
  ['/app/insights', 'Where it goes', 'pie'],
  ['/app/settings', 'Settings', 'gear'],
];

const { me, leave } = useApp();
const failed = ref(false);

async function load() {
  failed.value = false;
  try {
    const data = await api<MeResponse>('GET', '/api/me');
    if (!data.user) await leave();
    else me.value = data;
  } catch {
    failed.value = true;
  }
}

const onUnauthorized = () => void leave();
onMounted(() => {
  window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  if (!me.value?.user) void load();
});
onBeforeUnmount(() => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized));
</script>

<template>
  <div v-if="failed" class="center-screen">
    <p>Could not reach the server. Is the backend running?</p>
    <button class="btn" @click="load">Try again</button>
  </div>
  <div v-else-if="!me?.user" class="center-screen" aria-busy="true">
    <span class="spinner" aria-label="Loading" />
  </div>
  <div v-else class="shell">
    <aside class="sidebar">
      <NuxtLink to="/" class="logo">CASHFLOW</NuxtLink>
      <nav class="nav" aria-label="Main">
        <NuxtLink v-for="[to, label, icon] in NAV" :key="to" :to="to" exact-active-class="" active-class="">
          <Icon :name="icon" :size="17" />
          <span>{{ label }}</span>
        </NuxtLink>
      </nav>
      <div class="who">
        <ThemeToggle />
        <button class="btn" @click="leave"><Icon name="logout" :size="16" /> Log out</button>
      </div>
    </aside>
    <main class="main">
      <slot />
    </main>
  </div>
</template>
