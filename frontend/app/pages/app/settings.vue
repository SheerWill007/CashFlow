<script setup lang="ts">
import { api, errorMessage } from '~/lib/api';
import { monthlyBudget } from '~/lib/budget';
import { daysIn, thisMonth } from '~/lib/dates';
import { money, parseMoney } from '~/lib/format';
import type { User } from '~/lib/types';

definePageMeta({ layout: 'dashboard' });
useHead({ title: 'Settings' });

const { user, setUser, currencies } = useApp();
const { theme, setTheme } = useTheme();
const toast = useToast();

const toInput = (minor: number) => (minor ? String(minor / 100) : '');
const name = ref(user.value.name);
const currency = ref(user.value.currency);
const income = ref(toInput(user.value.income));
const fixed = ref(toInput(user.value.fixed));
const savings = ref(toInput(user.value.savings));
const error = ref('');
const busy = ref(false);
const days = daysIn(thisMonth());

const values = computed(() => {
  const i = parseMoney(income.value || '0');
  const f = parseMoney(fixed.value || '0');
  const s = parseMoney(savings.value || '0');
  return i === null || f === null || s === null ? null : { income: i, fixed: f, savings: s };
});
const budget = computed(() => (values.value ? monthlyBudget(values.value) : null));

async function save() {
  error.value = '';
  if (!values.value) {
    error.value = 'Amounts must be numbers, zero or more';
    return;
  }
  busy.value = true;
  try {
    const { user: updated } = await api<{ user: User }>('PUT', '/api/settings', {
      name: name.value.trim(),
      currency: currency.value,
      ...values.value,
    });
    setUser(updated);
    toast.show('Settings saved');
    await navigateTo('/app');
  } catch (e) {
    error.value = errorMessage(e);
    busy.value = false;
  }
}
</script>

<template>
  <div>
    <PageHead title="Settings" />
    <div class="stack">
      <AppCard title="Your monthly budget">
        <form class="stack" @submit.prevent="save">
          <div class="settings-form">
            <label class="field">
              Name
              <input v-model="name" required maxlength="60" />
            </label>
            <label class="field">
              Currency
              <select v-model="currency">
                <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
              </select>
            </label>
            <label class="field full">
              Monthly income (after tax)
              <input v-model="income" inputmode="decimal" placeholder="0" />
            </label>
            <label class="field">
              Fixed bills — rent, EMIs, subscriptions
              <input v-model="fixed" inputmode="decimal" placeholder="0" />
            </label>
            <label class="field">
              Savings goal per month
              <input v-model="savings" inputmode="decimal" placeholder="0" />
            </label>
          </div>
          <div>
            <div class="summary-line">
              <span>Free to spend each month</span>
              <strong>{{ budget === null ? '—' : money(budget, currency) }}</strong>
            </div>
            <div class="summary-line">
              <span>Roughly per day ({{ days }}-day month)</span>
              <strong>{{ budget === null ? '—' : money(Math.max(0, Math.round(budget / days)), currency) }}</strong>
            </div>
          </div>
          <div class="error" role="alert">{{ error }}</div>
          <div>
            <button class="btn primary" type="submit" :disabled="busy">{{ busy ? 'Saving…' : 'Save' }}</button>
          </div>
        </form>
      </AppCard>

      <AppCard title="Appearance">
        <div class="segmented" role="radiogroup" aria-label="Theme">
          <button
            v-for="t in ['light', 'dark'] as const"
            :key="t"
            type="button"
            role="radio"
            :aria-checked="theme === t"
            @click="setTheme(t)"
          >
            {{ t === 'light' ? 'Light' : 'Dark' }}
          </button>
        </div>
      </AppCard>

      <AppCard title="Account">
        <p class="muted">Signed in as {{ user.email }}</p>
      </AppCard>
    </div>
  </div>
</template>
