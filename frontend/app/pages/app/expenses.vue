<script setup lang="ts">
import { dayLabel, monthName, thisMonth, today } from '~/lib/dates';
import { money, plural, sum } from '~/lib/format';
import type { Expense } from '~/lib/types';

definePageMeta({ layout: 'dashboard' });
useHead({ title: 'Expenses' });

const { user, month } = useApp();
const { expenses, error } = useExpenses(() => month.value);
const defaultDate = computed(() => (month.value === thisMonth() ? today() : `${month.value}-01`));

const days = computed(() => {
  const byDay = new Map<string, Expense[]>();
  for (const e of expenses.value ?? []) {
    const list = byDay.get(e.date) ?? [];
    list.push(e);
    byDay.set(e.date, list);
  }
  return [...byDay].map(([date, items]) => ({ date, items, total: sum(items) }));
});
</script>

<template>
  <div>
    <PageHead title="Expenses"><MonthSwitch /></PageHead>
    <div class="stack">
      <AppCard title="Add an expense">
        <ExpenseForm :default-date="defaultDate" />
      </AppCard>
      <AppCard v-if="error"><p class="error">{{ error }}</p></AppCard>
      <AppCard v-else-if="!expenses"><SkeletonRows :rows="4" /></AppCard>
      <AppCard v-else :title="`${plural(expenses.length, 'expense')} · ${money(sum(expenses), user.currency)}`">
        <template v-if="expenses.length" #actions>
          <a class="btn" :href="`/api/export.csv?month=${month}`"><Icon name="download" :size="16" /> Export CSV</a>
        </template>
        <div v-if="expenses.length" class="list">
          <template v-for="d in days" :key="d.date">
            <div class="day-head">
              <span>{{ dayLabel(d.date) }}</span>
              <span>{{ money(d.total, user.currency) }}</span>
            </div>
            <ExpenseRow v-for="e in d.items" :key="e.id" :expense="e" />
          </template>
        </div>
        <p v-else class="empty">No expenses in {{ monthName(month) }}.</p>
      </AppCard>
    </div>
  </div>
</template>
