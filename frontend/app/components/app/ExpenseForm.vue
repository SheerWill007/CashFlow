<script setup lang="ts">
import { api, errorMessage } from '~/lib/api';
import { today } from '~/lib/dates';
import { money, parseMoney } from '~/lib/format';
import type { Expense } from '~/lib/types';

const props = defineProps<{ defaultDate: string }>();

const { categories, user, changed } = useApp();
const toast = useToast();

const amount = ref('');
const category = ref(categories.value[0] ?? 'Other');
const date = ref(props.defaultDate);
const note = ref('');
const error = ref('');
const busy = ref(false);
const amountInput = ref<HTMLInputElement | null>(null);

watch(
  () => props.defaultDate,
  (d) => (date.value = d),
);

async function submit() {
  error.value = '';
  const minor = parseMoney(amount.value);
  if (!minor) {
    error.value = 'Enter an amount greater than zero';
    return;
  }
  busy.value = true;
  try {
    const { expense } = await api<{ expense: Expense }>('POST', '/api/expenses', {
      amount: minor,
      category: category.value,
      date: date.value,
      note: note.value,
    });
    toast.show(`Added ${money(expense.amount, user.value.currency)}`);
    amount.value = '';
    note.value = '';
    amountInput.value?.focus();
    changed();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <div class="add-form">
      <label class="field">
        Amount
        <input ref="amountInput" v-model="amount" name="amount" inputmode="decimal" placeholder="0.00" required autocomplete="off" />
      </label>
      <label class="field">
        Category
        <select v-model="category" name="category">
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label class="field">
        Date
        <input v-model="date" name="date" type="date" :max="today()" required />
      </label>
      <label class="field">
        Note (optional)
        <input v-model="note" name="note" maxlength="140" placeholder="e.g. lunch with Sam" />
      </label>
      <button class="btn primary" type="submit" :disabled="busy"><Icon name="plus" :size="16" /> Add expense</button>
    </div>
    <div class="error" role="alert">{{ error }}</div>
  </form>
</template>
