<script setup lang="ts">
import { api, errorMessage } from '~/lib/api';
import { colorOf } from '~/lib/categories';
import { dayLabel } from '~/lib/dates';
import { money } from '~/lib/format';
import type { Expense } from '~/lib/types';

const props = withDefaults(defineProps<{ expense: Expense; showDate?: boolean }>(), { showDate: false });

const { user, changed } = useApp();
const toast = useToast();

const sub = computed(() =>
  [props.expense.note ? props.expense.category : null, props.showDate ? dayLabel(props.expense.date) : null]
    .filter(Boolean)
    .join(' · '),
);

async function remove() {
  const e = props.expense;
  if (!window.confirm(`Delete ${money(e.amount, user.value.currency)} · ${e.category}?`)) return;
  try {
    await api('DELETE', `/api/expenses/${e.id}`);
    toast.show('Expense deleted');
    changed();
  } catch (err) {
    toast.show(errorMessage(err));
  }
}
</script>

<template>
  <div class="row">
    <span class="dot" :style="{ background: colorOf(expense.category) }" />
    <div class="what">
      <div>{{ expense.note || expense.category }}</div>
      <div v-if="sub" class="muted small">{{ sub }}</div>
    </div>
    <span class="amt">{{ money(expense.amount, user.currency) }}</span>
    <button class="del" :aria-label="`Delete ${expense.note || expense.category}`" title="Delete" @click="remove">
      <Icon name="close" :size="15" />
    </button>
  </div>
</template>
