<script setup lang="ts">
import { api, errorMessage } from '~/lib/api';
import type { User } from '~/lib/types';

const props = defineProps<{ mode: 'login' | 'signup' }>();
const signup = computed(() => props.mode === 'signup');

const route = useRoute();
const { me } = useApp();
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const busy = ref(false);

/** Only follow `?next=` back into the app, never to another site. */
function nextPath() {
  const next = route.query.next;
  return typeof next === 'string' && /^\/app(\/|$)/.test(next) ? next : '/app';
}

async function submit() {
  error.value = '';
  busy.value = true;
  try {
    await api<{ user: User }>('POST', signup.value ? '/api/signup' : '/api/login', {
      name: signup.value ? name.value : undefined,
      email: email.value,
      password: password.value,
    });
    me.value = null; // the dashboard loads the fresh session
    await navigateTo(signup.value ? '/app/settings' : nextPath(), { replace: true });
  } catch (e) {
    error.value = errorMessage(e);
    busy.value = false;
  }
}
</script>

<template>
  <div class="auth">
    <header class="topnav">
      <div class="left"><NuxtLink class="linkbtn" to="/">← Back</NuxtLink></div>
      <NuxtLink to="/" class="logo">CASHFLOW</NuxtLink>
      <div class="right"><ThemeToggle /></div>
    </header>
    <div class="auth-grid">
      <section class="auth-hero dark glow">
        <span class="chip" style="align-self: flex-start">Daily finances</span>
        <div>
          <Words as="h1" text="Know what you can spend today" :dim-from="5" immediate />
          <Reveal as="p" immediate :delay="400">
            Track every expense, get a daily allowance that adjusts as you spend, and see exactly where the money goes.
          </Reveal>
        </div>
      </section>
      <section class="auth-panel panel gridded">
        <div class="auth-card">
          <div class="tabs" role="tablist" aria-label="Account">
            <NuxtLink role="tab" :aria-selected="!signup" to="/login" replace>Log in</NuxtLink>
            <NuxtLink role="tab" :aria-selected="signup" to="/signup" replace>Sign up</NuxtLink>
          </div>
          <h2>{{ signup ? 'Create your account' : 'Welcome back' }}</h2>
          <form class="stack" @submit.prevent="submit">
            <label v-if="signup" class="field">
              Name
              <input v-model="name" name="name" required maxlength="60" autocomplete="name" />
            </label>
            <label class="field">
              Email
              <input v-model="email" name="email" type="email" required autocomplete="email" />
            </label>
            <label class="field">
              {{ signup ? 'Password (8+ characters)' : 'Password' }}
              <input
                v-model="password"
                name="password"
                type="password"
                required
                :minlength="signup ? 8 : undefined"
                :autocomplete="signup ? 'new-password' : 'current-password'"
              />
            </label>
            <div class="error" role="alert">{{ error }}</div>
            <button class="btn primary wide" type="submit" :disabled="busy">
              {{ busy ? 'Please wait…' : signup ? 'Create account' : 'Log in' }}
            </button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>
