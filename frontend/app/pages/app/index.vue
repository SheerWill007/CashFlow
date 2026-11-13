<script setup lang="ts">
import { dailyAllowance, monthlyBudget } from '~/lib/budget';
import { byCategory } from '~/lib/categories';
import { dayOf, daysIn, monthName, thisMonth, today } from '~/lib/dates';
import { money, plural, sum } from '~/lib/format';

definePageMeta({ layout: 'dashboard' });
useHead({ title: 'Today' });

const { user } = useApp();
const month = thisMonth();
const date = today();
const { expenses, error } = useExpenses(() => month);

const fmt = (v: number) => money(v, user.value.currency);
const firstName = computed(() => user.value.name.split(' ')[0] ?? '');

const view = computed(() => {
  const list = expenses.value;
  if (!list) return null;
  const budget = monthlyBudget(user.value);
  const day = dayOf(date);
  const total = daysIn(month);
  const daysLeft = total - day + 1;
  const todays = list.filter((e) => e.date === date);
  const spentToday = sum(todays);
  const spentMonth = sum(list);
  const allowance = dailyAllowance(budget, spentMonth - spentToday, daysLeft);
  return {
    budget,
    hasBudget: budget > 0,
    day,
    total,
    daysLeft,
    todays,
    spentToday,
    spentMonth,
    allowance,
    leftToday: allowance - spentToday,
    leftMonth: budget - spentMonth,
    paceDiff: Math.round((budget * day) / total) - spentMonth,
    slices: byCategory(list),
    count: list.length,
  };
});
const monthLabel = monthName(month, { month: 'long' });
</script>

<template>
  <div>
    <PageHead :title="`Hi, ${firstName}`" />
    <AppCard v-if="error"><p class="error">{{ error }}</p></AppCard>
    <div v-else-if="!view" class="hero"><SkeletonRows :rows="3" /></div>
    <div v-else class="stack">
      <section class="hero">
        <div class="label">
          {{ !view.hasBudget ? 'Spent today' : view.leftToday >= 0 ? 'Left to spend today' : 'Over today’s allowance by' }}
        </div>
        <div class="figure" :class="{ over: view.hasBudget && view.leftToday < 0 }">
          {{ fmt(view.hasBudget ? Math.abs(view.leftToday) : view.spentToday) }}
        </div>
        <div class="sub">
          {{
            view.hasBudget
              ? `${fmt(view.allowance)} allowance for today · ${plural(view.daysLeft, 'day')} left in ${monthLabel}`
              : 'Add your income in Settings to get a daily allowance.'
          }}
        </div>
      </section>

      <div v-if="!view.hasBudget" class="notice">
        <span>
          {{
            user.income > 0
              ? 'Your fixed bills and savings use up all of your income, so there is nothing left to budget.'
              : 'Tell Cashflow your monthly income to see how much you have per day.'
          }}
        </span>
        <NuxtLink class="btn primary" to="/app/settings">Set up budget</NuxtLink>
      </div>

      <div class="tiles">
        <StatTile label="Spent today" :value="fmt(view.spentToday)" :detail="plural(view.todays.length, 'expense')" />
        <StatTile label="Spent this month" :value="fmt(view.spentMonth)" :detail="`${fmt(Math.round(view.spentMonth / view.day))} a day so far`" />
        <StatTile
          :label="view.leftMonth >= 0 ? 'Left this month' : 'Over budget by'"
          :value="view.hasBudget ? fmt(Math.abs(view.leftMonth)) : '—'"
          :detail="view.hasBudget ? `of ${fmt(view.budget)}` : 'No budget set'"
        />
        <StatTile
          label="Per day from tomorrow"
          :value="view.hasBudget && view.daysLeft > 1 ? fmt(Math.max(0, Math.round(view.leftMonth / (view.daysLeft - 1)))) : '—'"
          :detail="view.daysLeft > 1 ? `${plural(view.daysLeft - 1, 'day')} after today` : 'Last day of the month'"
        />
      </div>

      <div :class="{ cols: view.hasBudget }">
        <AppCard v-if="view.hasBudget" :title="`${monthLabel} budget`">
          <BudgetMeter :spent="view.spentMonth" :budget="view.budget" :pace="(view.day / view.total) * 100" />
          <div class="meter-legend">
            <span>{{ fmt(view.spentMonth) }} of {{ fmt(view.budget) }} spent</span>
            <span>{{ view.paceDiff >= 0 ? `${fmt(view.paceDiff)} under an even pace` : `${fmt(-view.paceDiff)} over an even pace` }}</span>
          </div>
          <p class="muted small" style="margin-top: 14px">The marker shows where an even pace would put you today.</p>
        </AppCard>
        <AppCard title="Statistic · this month">
          <Donut v-if="view.count" :parts="view.slices" :currency="user.currency" />
          <p v-else class="empty">Add an expense to see where your money goes.</p>
        </AppCard>
      </div>

      <AppCard title="Add an expense">
        <ExpenseForm :default-date="date" />
      </AppCard>

      <AppCard title="Today">
        <div v-if="view.todays.length" class="list">
          <ExpenseRow v-for="e in view.todays" :key="e.id" :expense="e" />
        </div>
        <p v-else class="empty">Nothing spent yet today.</p>
      </AppCard>
    </div>
  </div>
</template>
